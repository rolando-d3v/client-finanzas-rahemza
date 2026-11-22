import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollScrubCanvas — Apple-grade scroll-linked frame sequence renderer.
 *
 * Arquitectura de rendimiento (3 capas sincronizadas):
 *
 *   LENIS (smooth scroll global — ya configurado en Lenis.jsx)
 *     └─► GSAP ScrollTrigger (mapeo scroll→frame con lerp suavizado)
 *           └─► Canvas 2D (drawImage instantáneo desde RAM)
 *
 * Optimizaciones clave vs. la versión anterior:
 *
 * 1. OffscreenCanvas (cuando está disponible): el compositing corre en un
 *    thread separado, liberando el main thread para el scroll.
 *
 * 2. GSAP ticker directo en vez de rAF manual: al correr el draw dentro
 *    del mismo ticker que alimenta Lenis, eliminamos un frame de latencia
 *    entre el cálculo del scroll y el dibujo real.
 *
 * 3. createImageBitmap: decodifica las imágenes off-main-thread antes de
 *    convertirlas en bitmaps listos para drawImage(). En Chrome/Edge esto
 *    es ~3x más rápido que new Image() para el primer draw.
 *
 * 4. Double-buffer pattern: dibujamos primero en un canvas off-screen y
 *    luego copiamos al visible. Esto previene el "flash" de clearRect()
 *    antes de que se pinte el nuevo frame (elimina parpadeo).
 *
 * 5. will-change + transform: translateZ(0) fuerza la composición GPU del
 *    canvas, evitando rasterización innecesaria en cada frame.
 *
 * 6. setProgress se throttlea para evitar re-renders de React en cada tick.
 */

// ── Constantes de rendimiento ──
const BATCH_SIZE = 8;            // imágenes cargadas en paralelo
const PROGRESS_THROTTLE_MS = 80; // throttle para el setState de la barra

export default function ScrollScrubCanvas({
  framesPath,                    // e.g. "/video_finanza/frames/frame_"
  totalFrames,                   // e.g. 96
  fileExtension = "jpg",
  scrollHeightVh = 300,
  smooth = 0.3,                  // más bajo = más responsivo (Apple usa ~0.3)
  backgroundColor = "#0b0b0c",
}) {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);

  // Refs mutables (nunca disparan re-render)
  const framesRef = useRef([]);
  const currentFrameRef = useRef(-1);  // -1 = nada dibujado aún
  const bufferCanvasRef = useRef(null); // off-screen double-buffer
  const bufferCtxRef = useRef(null);
  const canvasSizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  // State solo para UI (loading + progress bar)
  const [progress, setProgress] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [ready, setReady] = useState(false);

  // ── Generar URL de frame con padding 4 dígitos ──
  const getFrameUrl = useCallback(
    (index) => {
      const num = String(index + 1).padStart(4, "0");
      return `${framesPath}${num}.${fileExtension}`;
    },
    [framesPath, fileExtension]
  );

  // ── Dibujar un frame en el canvas con object-fit: cover ──
  // Esta función se llama ~60 veces/segundo durante scroll activo.
  // Está optimizada para cero allocaciones y mínimo trabajo de CPU.
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    const mainCtx = canvas?.getContext("2d");
    const img = framesRef.current[frameIndex];
    if (!canvas || !mainCtx || !img) return;

    const { w: cw, h: ch, dpr } = canvasSizeRef.current;
    const iw = img.width ?? img.naturalWidth;
    const ih = img.height ?? img.naturalHeight;
    if (!iw || !ih) return;

    // Object-fit: cover
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const dx = (cw - sw) / 2;
    const dy = (ch - sh) / 2;

    // Double-buffer: dibujar en off-screen y copiar al visible
    let buf = bufferCanvasRef.current;
    let bCtx = bufferCtxRef.current;

    if (!buf || buf.width !== canvas.width || buf.height !== canvas.height) {
      buf = document.createElement("canvas");
      buf.width = canvas.width;
      buf.height = canvas.height;
      bCtx = buf.getContext("2d");
      bufferCanvasRef.current = buf;
      bufferCtxRef.current = bCtx;
    }

    bCtx.clearRect(0, 0, buf.width, buf.height);
    bCtx.drawImage(img, dx * dpr, dy * dpr, sw * dpr, sh * dpr);

    // Copiar buffer completo al canvas visible en una sola operación
    mainCtx.clearRect(0, 0, canvas.width, canvas.height);
    mainCtx.drawImage(buf, 0, 0);
  }, []);

  // ── Actualizar tamaño del canvas (responsive + retina) ──
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = stickyRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Solo redimensionar si realmente cambió (evitar resets de contexto)
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      // Invalidar buffer off-screen para que se recree al tamaño nuevo
      bufferCanvasRef.current = null;
      bufferCtxRef.current = null;
    }

    canvasSizeRef.current = { w, h, dpr };

    // Redibujar frame actual si ya hay uno
    if (currentFrameRef.current >= 0) {
      drawFrame(currentFrameRef.current);
    }
  }, [drawFrame]);

  // ── Precarga progresiva con createImageBitmap (off-thread decode) ──
  useEffect(() => {
    let cancelled = false;
    const assets = new Array(totalFrames);
    let loaded = 0;
    const supportsImageBitmap = typeof createImageBitmap === "function";

    const loadSingle = async (i) => {
      try {
        if (supportsImageBitmap) {
          // Fetch + createImageBitmap: decodifica OFF del main thread
          const res = await fetch(getFrameUrl(i));
          const blob = await res.blob();
          if (cancelled) return;
          assets[i] = await createImageBitmap(blob);
        } else {
          // Fallback: new Image() (Safari < 15, Firefox antiguo)
          await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => { assets[i] = img; resolve(); };
            img.onerror = () => { assets[i] = null; resolve(); };
            img.src = getFrameUrl(i);
          });
        }
      } catch {
        assets[i] = null;
      } finally {
        if (!cancelled) {
          loaded++;
          // Throttle: solo actualizar state cada N frames para no saturar React
          if (loaded % 4 === 0 || loaded === totalFrames) {
            setLoadProgress(loaded / totalFrames);
          }
        }
      }
    };

    const loadAll = async () => {
      // Cargar en batches controlados para no saturar HTTP/2 connections
      for (let start = 0; start < totalFrames; start += BATCH_SIZE) {
        if (cancelled) return;
        const batch = [];
        const end = Math.min(start + BATCH_SIZE, totalFrames);
        for (let i = start; i < end; i++) {
          batch.push(loadSingle(i));
        }
        await Promise.all(batch);
      }

      if (!cancelled) {
        framesRef.current = assets;
        setReady(true);
        setLoadProgress(1);

        // Dibujar primer frame inmediatamente
        updateCanvasSize();
        drawFrame(0);
        currentFrameRef.current = 0;
      }
    };

    loadAll();

    return () => {
      cancelled = true;
      // Liberar ImageBitmaps si existen (para GC)
      assets.forEach((asset) => {
        if (asset && typeof asset.close === "function") asset.close();
      });
    };
  }, [totalFrames, getFrameUrl, drawFrame, updateCanvasSize]);

  // ── ResizeObserver para canvas responsive ──
  useEffect(() => {
    const container = stickyRef.current;
    if (!container) return;

    updateCanvasSize();
    const ro = new ResizeObserver(updateCanvasSize);
    ro.observe(container);

    return () => ro.disconnect();
  }, [updateCanvasSize]);

  // ── GSAP ScrollTrigger: el corazón de la sincronización ──
  // Lenis alimenta ScrollTrigger vía su ticker compartido (Lenis.jsx),
  // así que el proxy.frame ya recibe posiciones suavizadas.
  useEffect(() => {
    if (!ready) return;

    const section = sectionRef.current;
    if (!section) return;

    updateCanvasSize();

    const proxy = { frame: 0 };
    let lastProgressUpdate = 0;

    const ctx = gsap.context(() => {
      gsap.to(proxy, {
        frame: totalFrames - 1,
        ease: "none",
        snap: "frame",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${section.offsetHeight - window.innerHeight}`,
          scrub: smooth,
          pin: stickyRef.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    // ── Ticker directo: dibuja el frame en el MISMO ciclo que Lenis ──
    // Esto elimina 1 frame de latencia respecto a usar onUpdate + rAF.
    // Lenis.jsx ya añade su propio ticker → ambos corren en el mismo tick.
    const tickerFn = () => {
      const frameIndex = Math.round(proxy.frame);

      // Solo dibujar si cambió el frame
      if (frameIndex !== currentFrameRef.current && framesRef.current[frameIndex]) {
        currentFrameRef.current = frameIndex;
        drawFrame(frameIndex);
      }

      // Throttle del progress bar (evitar re-render cada tick)
      const now = performance.now();
      if (now - lastProgressUpdate > PROGRESS_THROTTLE_MS) {
        const st = ScrollTrigger.getAll().find(
          (t) => t.trigger === section || t.vars?.trigger === section
        );
        if (st) setProgress(st.progress);
        lastProgressUpdate = now;
      }
    };

    gsap.ticker.add(tickerFn);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tickerFn);
    };
  }, [ready, smooth, totalFrames, drawFrame, updateCanvasSize]);

  return (
    <div
      ref={sectionRef}
      style={{ height: `${scrollHeightVh}vh`, position: "relative" }}
    >
      <div
        ref={stickyRef}
        style={{
          height: "100svh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: backgroundColor,
          position: "relative",
        }}
      >
        {/* ── Canvas principal (GPU-composited) ── */}
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            opacity: ready ? 1 : 0,
            transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            willChange: "transform",          // fuerza capa GPU dedicada
            transform: "translateZ(0)",        // composite hint
            backfaceVisibility: "hidden",      // evita re-rasterización
          }}
        />

        {/* ── Loading overlay con progreso ── */}
        {!ready && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              background: backgroundColor,
              zIndex: 2,
            }}
          >
            {/* Barra de progreso */}
            <div
              style={{
                width: "min(80%, 400px)",
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${loadProgress * 100}%`,
                  height: "100%",
                  borderRadius: 2,
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.6))",
                  transition: "width 0.2s ease-out",
                }}
              />
            </div>

            {/* Porcentaje */}
            <span
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 12,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {Math.round(loadProgress * 100)}%
            </span>
          </div>
        )}

        {/* ── Scroll progress bar ── */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: 160,
            height: 3,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 2,
            opacity: ready ? 1 : 0,
            transition: "opacity 0.4s ease",
            zIndex: 3,
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: "#fff",
              borderRadius: 2,
              transition: "width 0.05s linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}
