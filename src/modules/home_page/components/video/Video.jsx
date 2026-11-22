import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(ScrollTrigger);

/**
 * Replica el efecto "hero scroll-scrub" de mercury.com usando GSAP + ScrollTrigger.
 *
 * Por qué esta versión se siente más "profesional" que un scroll listener a mano:
 *
 * 1. scrub: 0.5 → GSAP no salta el video 1:1 con el scroll, lo interpola
 *    (lerp) con ~0.5s de suavizado. Es la diferencia entre "el video salta
 *    con cada pixel" y "el video fluye". Mercury usa exactamente este tipo
 *    de easing en el scrub.
 *
 * 2. pin: true → GSAP fija el elemento en pantalla por ti. Ya no hace falta
 *    position: sticky ni calcular getBoundingClientRect a mano.
 *
 * 3. Un solo timeline controla un objeto proxy { time: 0 } que va de 0 a
 *    video.duration; en onUpdate asignamos video.currentTime = t.
 *    Esto es más barato que forzar un setState de React en cada frame
 *    de scroll (tu versión anterior re-renderizaba el componente para
 *    mover la barra de progreso en cada pixel).
 *
 * 4. anticipatePin + invalidateOnRefresh evitan el "salto" típico al
 *    hacer resize o cuando el video carga después del layout inicial.
 */
export default function ScrollScrubVideo({
  // src = "/ok2.mp4",
  src = "/inventario.mp4",
  // src = "/pappuk.mp4",
  poster = "/wall.png",
  // poster = "https://res.cloudinary.com/perusap/image/upload/v1629824743/EXAM/wall_ghyhf4.jpg",
  scrollHeightVh = 300, // qué tan "larga" es la zona de scroll (más alto = scrub más lento)
  smooth = 0.5, // segundos de suavizado del scrub (0 = 1:1 con el scroll, sin lerp)
  preloadAsBlob = true, // descarga el video completo antes de activar el scrub (elimina jank de red)
  frameRate = 30, // fps reales del video; ajusta el umbral mínimo de seek (ver más abajo)
}) {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [videoSrc, setVideoSrc] = useState(preloadAsBlob ? null : src);


  // Config inicial del <video> para permitir seek programático en iOS/Safari
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
  }, []);

  // Precarga el video entero como Blob. Esto es clave para un scrub 100% fluido:
  // así el <video> nunca depende de la red mientras el usuario scrollea, y no
  // importa si el servidor/CDN no soporta bien "Range requests".
  useEffect(() => {
    if (!preloadAsBlob) return;
    let objectUrl;
    let cancelled = false;

    fetch(src)
      .then((res) => res.blob())
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setVideoSrc(objectUrl);
      })
      .catch(() => {
        // fallback: si falla el fetch (ej. CORS), usa el src normal igual
        if (!cancelled) setVideoSrc(src);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, preloadAsBlob]);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    // esperamos a que haya un src real (el blob precargado, o el src directo
    // si preloadAsBlob=false). Sin esto, el ScrollTrigger se monta contra un
    // video sin duration y el scrub simplemente no hace nada.
    if (!video || !section || !videoSrc) return;

    let ctx; // gsap context, para limpiar todo de una sola vez
    let tickerFn; // función registrada en gsap.ticker, para poder removerla

    // Umbral mínimo de seek: no tiene sentido pedirle al video un cambio
    // menor a la duración de medio frame real, solo generaría trabajo extra.
    const epsilon = 1 / (frameRate * 2);

    const setupScrollTrigger = () => {
      // proxy.time se actualiza en CADA frame de scroll (barato: un número).
      // La aplicación real al <video> vive aparte, en el ticker de abajo,
      // así el cálculo de scroll nunca se bloquea esperando al video.
      const proxy = { time: 0 };

      ctx = gsap.context(() => {
        gsap.to(proxy, {
          time: video.duration,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `+=${section.offsetHeight - window.innerHeight}`,
            scrub: smooth,
            pin: stickyRef.current,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setProgress(self.progress),
          },
          // Ya NO tocamos video.currentTime aquí — ver ticker más abajo.
        });
      }, section);

      // Loop continuo a 60fps (mismo reloj interno que usa ScrollTrigger).
      // En cada tick mira el valor MÁS RECIENTE de proxy.time — nunca uno
      // viejo en cola — y solo actúa si el video está libre para recibirlo.
      tickerFn = () => {
        if (video.seeking) return; // ocupado: esperamos al próximo tick, sin encolar

        const delta = proxy.time - video.currentTime;
        if (Math.abs(delta) > epsilon) {
          // fastSeek (Firefox/Safari) es más liviano que currentTime cuando
          // existe: no exige precisión de frame exacto, ideal para scrub.
          if (typeof video.fastSeek === "function") {
            video.fastSeek(proxy.time);
          } else {
            video.currentTime = proxy.time;
          }
        }
      };

      gsap.ticker.add(tickerFn);
    };

    if (video.readyState >= 1 && video.duration) {
      setReady(true);
      setupScrollTrigger();
    } else {
      const onLoaded = () => {
        setReady(true);
        setupScrollTrigger();
        ScrollTrigger.refresh();
      };
      video.addEventListener("loadedmetadata", onLoaded, { once: true });
      return () => video.removeEventListener("loadedmetadata", onLoaded);
    }

    return () => {
      ctx && ctx.revert();
      tickerFn && gsap.ticker.remove(tickerFn);
    };
  }, [smooth, videoSrc, frameRate]);

  return (
    // Zona alta (300vh): el "espacio" de scroll que el usuario recorre
    // mientras el video hace scrub. GSAP pinea el hijo `stickyRef` dentro
    // de esta zona en lugar de usar position: sticky manual.
    <div   ref={sectionRef}  style={{ height: `${scrollHeightVh}vh`, position: "relative" }}>
      <div
        ref={stickyRef}
        style={{
          height: "100svh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b0c",
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc || undefined}
          poster={poster}
          muted
          playsInline
          preload="auto"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: ready ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Barra de progreso, solo para visualizar el % de scrub (opcional) */}
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
