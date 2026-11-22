// import { useRef, useEffect, useLayoutEffect } from "react";
// import styles from "./Hero.module.css";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import ScrollScrubVideo2 from "../video/Video2";
// import ScrollScrubVideo from "../video/Video";
// import InventorySection from "../InventorySection/InventorySection";

// // 1. registerPlugin: Obligatoria para usar ScrollTrigger. Le dice a GSAP que cargue esta funcionalidad.
// gsap.registerPlugin(ScrollTrigger);

// // Definimos las 4 etapas como PORCENTAJES del alto total de contentMaskRef.
// // Formato GSAP: "valor_punto_del_elemento valor_punto_del_viewport"
// // Ej: "25% top" = cuando el punto al 25% de la altura del elemento toca el borde superior (top) de la pantalla.
// const STAGES = {
//   logo: { start: "top top", end: "25% top" },       // 0%   -> 25% del scroll
//   video1: { start: "25% top", end: "50% top" },     // 25%  -> 50% del scroll
//   final: { start: "50% top", end: "65% top" },      // 50%  -> 75% del scroll (ajustado visualmente)
//   video2: { start: "65% top", end: "bottom bottom" }, // 75% -> 100% del scroll
//   fadeOutFinal: { start: "90% top", end: "bottom bottom" },
// };

// const Hero = () => {
//   // 2. useRef: Creamos referencias a los nodos del DOM para que GSAP pueda interactuar con ellos de forma segura en React.
//   const containerRef = useRef(null);      // Contenedor principal (ámbito de gsap.context)
//   const contentMaskRef = useRef(null);    // El elemento que actuará como "trigger" principal del scroll
//   const video1Ref = useRef(null);         // Referencia al contenedor del video 1
//   const video2Ref = useRef(null);         // Referencia al contenedor del video 2

//   // 3. useEffect: Ejecuta el código después de que el componente se monta en el DOM.
//   // (Nota: En GSAP + React, a veces se prefiere useLayoutEffect para evitar parpadeos iniciales, pero useEffect es válido).
//   useLayoutEffect(() => {
//   // useEffect(() => {
//     // Cálculo dinámico basado en el ancho de la ventana (podría necesitar un event listener de resize si es responsivo)
//     const size_scream = window.innerWidth * 5;

//     // 4. gsap.set: Aplica estilos CSS de forma INMEDIATA, sin animación. Es como establecer el estado inicial.
//     gsap.set("#logo-mask2", {
//       maskSize: `clamp(${size_scream}vh, 3600%, 0vh)`,
//       webkitMaskSize: `clamp(${size_scream}vh, 3600%, 0vh)`, // Prefijo para compatibilidad con Safari
//     });

//     // Inicializamos las escenas que NO deben verse al principio con opacidad 0.
//     // El selector de array aplica la propiedad a todos los elementos coincidentes.
//     gsap.set(["#video-scene-1", "#final-scene", "#video-scene-2"], { opacity: 0 });

//     // 5. gsap.context: La MEJOR PRÁCTICA en React. Agrupa todas las animaciones y Selectors dentro de containerRef.
//     // Esto permite que ctx.revert() limpie TODO al desmontar el componente, evitando fugas de memoria.
//     const ctx = gsap.context(() => {

//       // ==========================================
//       // ETAPA 0: Animación del Logo vinculada al scroll (scrub)
//       // ==========================================
//       // 6. gsap.timeline: Crea una secuencia de animaciones.
//       const tlLogo = gsap.timeline({
//         scrollTrigger: {
//           trigger: contentMaskRef.current, // El elemento que observamos al hacer scroll
//           start: STAGES.logo.start,        // Punto de inicio ("top top")
//           end: STAGES.logo.end,            // Punto de fin ("25% top")
//           scrub: 1,                        // Vincula la animación al scroll. El '1' añade 1 segundo de suavizado (lerp) para que no sea brusco.
//         },
//       });

//       // 7. .to(): Anima desde el estado actual hacia los nuevos valores.
//       // El tercer parámetro (ej. 0.4) es la "posición" en la timeline (segundos de retraso o superposición).
//       tlLogo
//         .to("#logo-mask2", { maskSize: "clamp(120vh, 25%, 30vh)" }, 0.4) // Reduce el tamaño de la máscara
//         .to("#image-xava", { opacity: 0, duration: 0.3 }, 0.6)            // Desvanece la imagen interna
//         .to("#logo-mask2", { autoAlpha: 0, duration: 0.3 })               // 8. autoAlpha: Anima opacidad y pone visibility: hidden al llegar a 0.
//         .to("#video-scene-1", { opacity: 1, duration: 0.2 });             // Hace visible la escena del video 1

//       // ==========================================
//       // ETAPA 1 -> 2: Crossfade (Desvanecimiento cruzado) entre Video 1 e Imagen Final
//       // ==========================================
//       // 9. paused: true: Crea la timeline pero NO la reproduce. Espera a que se llame a .play() manualmente.
//       const crossfade1 = gsap.timeline({ paused: true });
//       crossfade1
//         // 10. ease: Controla la curva de velocidad. "power2.inOut" empieza suave, acelera y frena suavemente.
//         // El '0' al final superpone ambas animaciones para que ocurran exactamente al mismo tiempo.
//         .to("#video-scene-1", { opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
//         .to("#final-scene", { opacity: 1, duration: 1, ease: "power2.inOut" }, 0);

//       // 11. ScrollTrigger.create: Crea un trigger independiente (sin timeline). Ideal para lógica condicional o callbacks.
//       ScrollTrigger.create({
//         trigger: contentMaskRef.current,
//         start: STAGES.video1.end, // Se activa al llegar al 50% ("50% top")
//         // markers: true, // Descomentar para ver líneas de depuración en pantalla
//         onEnter: () => crossfade1.play(),    // 12. onEnter: Al hacer scroll hacia abajo y cruzar el 'start', reproduce la animación.
//         onLeaveBack: () => crossfade1.reverse(), // 13. onLeaveBack: Al hacer scroll hacia arriba y volver a cruzar el 'start', revierte la animación.
//       });

//       // ==========================================
//       // ETAPA 2 -> 3: Crossfade entre Imagen Final y Video 2
//       // ==========================================
//       const crossfade2 = gsap.timeline({ paused: true });
//       crossfade2
//         .to("#final-scene", { opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
//         .to("#video-scene-2", { opacity: 1, duration: 1, ease: "power2.inOut" }, 0);

//       ScrollTrigger.create({
//         trigger: contentMaskRef.current,
//         start: STAGES.final.end, // Se activa al llegar al 65% (ajustado para dar espacio a InventorySection)
//         onEnter: () => crossfade2.play(),
//         onLeaveBack: () => crossfade2.reverse(),
//       });

//        // ==========================================
//       // ETAPA 4: Fade-out final del video 2 (vinculado al scroll)
//       // ==========================================
//        const tlFadeOutVideo2 = gsap.timeline({
//         scrollTrigger: {
//           trigger: contentMaskRef.current,
//           start: STAGES.fadeOutFinal.start, // ej: "90% top"
//           end: STAGES.fadeOutFinal.end,     // "bottom bottom"
//           scrub: 1,
//           // markers: true, // descomenta para depurar visualmente
//         },
//       });

//       tlFadeOutVideo2.to("#video-scene-2", {
//         opacity: 0,
//         ease: "power1.out",
//       });

//     }, containerRef); // El segundo argumento limita las búsquedas de selectores (ej: "#logo-mask2") solo dentro de containerRef

//     // 14. Función de limpieza (Cleanup): Se ejecuta cuando el componente se desmonta.
//     // ctx.revert() elimina TODAS las animaciones, timelines y ScrollTriggers creados dentro del contexto.
//     return () => ctx.revert();
//   }, []); // El array vacío [] asegura que esto solo se ejecute una vez al montar el componente.

//   return (
//     <div ref={containerRef} className={styles.container}>
//       <div ref={contentMaskRef} className={styles.content_mask}>

//         {/* ETAPA 0: Logo y fondo inicial */}
//         <div id="logo-mask2" className={styles.logo_mask}>
//           <div id="flash-effect" className={styles.flash_effect}></div>
//           <div id="image-xava" className={styles.container_home}>
//             <img
//               className={styles.image}
//               src="https://res.cloudinary.com/perusap/image/upload/v1629824743/EXAM/wall_ghyhf4.jpg"
//               alt="Background"
//             />
//             <div className={styles.sombra_image}></div>
//           </div>
//         </div>

//         {/* ETAPA 1: Primer video. Su lógica interna de scrub está acotada a STAGES.video1.start y end */}
//         <div ref={video1Ref} className={styles.logox} id="video-scene-1">
//           <ScrollScrubVideo2
//             triggerRef={contentMaskRef}
//             start={STAGES.video1.start}
//             end={STAGES.video1.end}
//           />
//         </div>

//         {/* ETAPA 2: Sección final estática (sin animación de scroll propia, solo el crossfade de opacidad) */}
//         <div id="final-scene" className={styles.logox}>
//           <InventorySection />
//         </div>

//         {/* ETAPA 3: Segundo video. Su lógica interna de scrub está acotada a STAGES.video2.start y end */}
//         <div ref={video2Ref} className={styles.logox} id="video-scene-2">
//           <ScrollScrubVideo2
//             triggerRef={contentMaskRef}
//             start={STAGES.video2.start}
//             end={STAGES.video2.end}
//           />
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Hero;

///no borrar :

// import { useRef, useEffect, useLayoutEffect } from "react";
// import styles from "./Hero.module.css";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import ScrollScrubVideo2 from "../video/Video2";
// import ScrollScrubVideo from "../video/Video";
// import InventorySection from "../InventorySection/InventorySection";

// // 1. registerPlugin: Obligatoria para usar ScrollTrigger. Le dice a GSAP que cargue esta funcionalidad.
// gsap.registerPlugin(ScrollTrigger);

// // Definimos las 4 etapas como PORCENTAJES del alto total de contentMaskRef.
// // Formato GSAP: "valor_punto_del_elemento valor_punto_del_viewport"
// // Ej: "25% top" = cuando el punto al 25% de la altura del elemento toca el borde superior (top) de la pantalla.
// const STAGES = {
//   logo: { start: "top top", end: "30% top" }, // 0%   -> 25% del scroll
//   video1: { start: "30% top", end: "50% top" }, // 25%  -> 50% del scroll
//   final: { start: "50% top", end: "65% top" }, // 50%  -> 75% del scroll (ajustado visualmente)
//   video2: { start: "65% top", end: "bottom bottom" }, // 75% -> 100% del scroll
//   fadeOutFinal: { start: "90% top", end: "bottom bottom" },
// };

// const Hero = () => {
//   // 2. useRef: Creamos referencias a los nodos del DOM para que GSAP pueda interactuar con ellos de forma segura en React.
//   const containerRef = useRef(null); // Contenedor principal (ámbito de gsap.context)
//   const contentMaskRef = useRef(null); // El elemento que actuará como "trigger" principal del scroll
//   const video1Ref = useRef(null); // Referencia al contenedor del video 1
//   const video2Ref = useRef(null); // Referencia al contenedor del video 2

//   // 3. useEffect: Ejecuta el código después de que el componente se monta en el DOM.
//   // (Nota: En GSAP + React, a veces se prefiere useLayoutEffect para evitar parpadeos iniciales, pero useEffect es válido).
//   useLayoutEffect(() => {
//     // useEffect(() => {
//     // Cálculo dinámico basado en el ancho de la ventana (podría necesitar un event listener de resize si es responsivo)
//     const size_scream = window.innerWidth * 5;

//     // 4. gsap.set: Aplica estilos CSS de forma INMEDIATA, sin animación. Es como establecer el estado inicial.
//     gsap.set("#logo-mask2", {
//       maskSize: `clamp(${size_scream}vh, 3600%, 0vh)`,
//       webkitMaskSize: `clamp(${size_scream}vh, 3600%, 0vh)`, // Prefijo para compatibilidad con Safari
//     });

//     // Inicializamos las escenas que NO deben verse al principio con opacidad 0.
//     // El selector de array aplica la propiedad a todos los elementos coincidentes.
//     gsap.set(["#video-scene-1", "#final-scene", "#video-scene-2"], { opacity: 0 });

//     // 5. gsap.context: La MEJOR PRÁCTICA en React. Agrupa todas las animaciones y Selectors dentro de containerRef.
//     // Esto permite que ctx.revert() limpie TODO al desmontar el componente, evitando fugas de memoria.
//     const ctx = gsap.context(() => {
//       // ==========================================
//       // ETAPA 0: Animación del Logo vinculada al scroll (scrub)
//       // ==========================================
//       // 6. gsap.timeline: Crea una secuencia de animaciones.
//       const tlLogo = gsap.timeline({
//         scrollTrigger: {
//           trigger: contentMaskRef.current, // El elemento que observamos al hacer scroll
//           start: STAGES.logo.start, // Punto de inicio ("top top")
//           end: STAGES.logo.end, // Punto de fin ("25% top")
//           scrub: 1, // Vincula la animación al scroll. El '1' añade 1 segundo de suavizado (lerp) para que no sea brusco.
//         },
//       });

//       // 7. .to(): Anima desde el estado actual hacia los nuevos valores.
//       // El tercer parámetro (ej. 0.4) es la "posición" en la timeline (segundos de retraso o superposición).

//       tlLogo
//         .to("#logo-mask2", { maskSize: "clamp(120vh, 25%, 30vh)", duration: 3 }, 3) // Reduce el tamaño de la máscara
//         .to("#image-xava", { opacity: 0, duration: 3 }, 3) // Desvanece la ima3en interna
//         .to("#logo-mask2", { autoAlpha: 0, duration: 3 }) // 8. autoAlpha: Anima opacidad y pone visibility: hidden al llegar a 0.
//         .to(video1Ref.current, { opacity: 1, duration: 0.2 }); // Hace visible la escena del video 1

//       // ==========================================
//       // ETAPA 1 -> 2: Crossfade (Desvanecimiento cruzado) entre Video 1 e Imagen Final
//       // ==========================================
//       // 9. paused: true: Crea la timeline pero NO la reproduce. Espera a que se llame a .play() manualmente.
//       const crossfade1 = gsap.timeline({ paused: true });
//       crossfade1
//         // 10. ease: Controla la curva de velocidad. "power2.inOut" empieza suave, acelera y frena suavemente.
//         // El '0' al final superpone ambas animaciones para que ocurran exactamente al mismo tiempo.
//         .to(video1Ref.current, { opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
//         .to("#final-scene", { opacity: 1, duration: 1, ease: "power2.inOut" }, 0);

//       // 11. ScrollTrigger.create: Crea un trigger independiente (sin timeline). Ideal para lógica condicional o callbacks.
//       ScrollTrigger.create({
//         trigger: contentMaskRef.current,
//         start: STAGES.video1.end, // Se activa al llegar al 50% ("50% top")
//         // markers: true, // Descomentar para ver líneas de depuración en pantalla
//         onEnter: () => crossfade1.play(), // 12. onEnter: Al hacer scroll hacia abajo y cruzar el 'start', reproduce la animación.
//         onLeaveBack: () => crossfade1.reverse(), // 13. onLeaveBack: Al hacer scroll hacia arriba y volver a cruzar el 'start', revierte la animación.
//       });

//       // ==========================================
//       // ETAPA 2 -> 3: Crossfade entre Imagen Final y Video 2
//       // ==========================================
//       const crossfade2 = gsap.timeline({ paused: true });
//       crossfade2
//         .to("#final-scene", { opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
//         .to(video2Ref.current, { opacity: 1, duration: 1, ease: "power2.inOut" }, 0);

//       // const crossfade2 = gsap.timeline({ paused: true });
//       // crossfade2
//       //   .to("#final-scene", { opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
//       //   .to("#video-scene-2", { opacity: 1, duration: 1, ease: "power2.inOut" }, 0);

//       ScrollTrigger.create({
//         trigger: contentMaskRef.current,
//         start: STAGES.final.end, // Se activa al llegar al 65% (ajustado para dar espacio a InventorySection)
//         onEnter: () => crossfade2.play(),
//         onLeaveBack: () => crossfade2.reverse(),
//       });

//       // ==========================================
//       // ETAPA 4: Fade-out final del video 2 (vinculado al scroll)
//       // ==========================================
//       const opacityVideo2 = gsap.timeline({
//         scrollTrigger: {
//           trigger: contentMaskRef.current,
//           start: STAGES.fadeOutFinal.start, // ej: "90% top"
//           end: STAGES.fadeOutFinal.end, // "bottom bottom"
//           scrub: 1,
//           // markers: true, // descomenta para depurar visualmente
//         },
//       });

//       opacityVideo2.to(video2Ref.current, { opacity: 0, ease: "power1.out" });
//     }, containerRef); // El segundo argumento limita las búsquedas de selectores (ej: "#logo-mask2") solo dentro de containerRef

//     // 14. Función de limpieza (Cleanup): Se ejecuta cuando el componente se desmonta.
//     // ctx.revert() elimina TODAS las animaciones, timelines y ScrollTriggers creados dentro del contexto.
//     return () => ctx.revert();
//   }, []); // El array vacío [] asegura que esto solo se ejecute una vez al montar el componente.

//   return (
//         <div ref={containerRef} className={styles.container}>
//       <div ref={contentMaskRef} className={styles.content_mask}>
//         {/* ETAPA 1: Primer video */}
//         <div ref={video1Ref} className={styles.logox} id="video-scene-1">
//           <ScrollScrubVideo2 triggerRef={contentMaskRef} start={STAGES.video1.start} end={STAGES.video1.end} />
//         </div>

//         {/* ETAPA 0: Logo y fondo inicial */}
//         <div id="logo-mask2" className={styles.logo_mask}>
//           <div id="flash-effect" className={styles.flash_effect}></div>
//           <div id="image-xava" className={styles.container_home}>
//             <ScrollScrubVideo2 triggerRef={contentMaskRef} start={STAGES.logo.start} end={STAGES.logo.end} />
//             <div className={styles.sombra_image}></div>
//           </div>
//         </div>

//         {/* ETAPA 2: Sección final estática (crossfade de opacidad) */}
//         <div id="final-scene" className={styles.logox}>
//           <InventorySection />
//         </div>

//         {/* ETAPA 3: Segundo video */}
//         <div ref={video2Ref} className={styles.logox} id="video-scene-2">
//           <ScrollScrubVideo2 triggerRef={contentMaskRef} start={STAGES.video2.start} end={STAGES.video2.end} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Hero;

// import { useRef, useEffect, useLayoutEffect } from "react";
// import styles from "./Hero.module.css";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import ScrollScrubVideo2 from "../video/Video2";
// import ScrollScrubVideo from "../video/Video";
// import InventorySection from "../InventorySection/InventorySection";

// gsap.registerPlugin(ScrollTrigger);

// const STAGES = {
//   logo: { start: "top top", end: "25% top" },
//   video1: { start: "25% top", end: "50% top" },
//   final: { start: "50% top", end: "65% top" },
//   video2: { start: "65% top", end: "bottom bottom" },
//   fadeOutFinal: { start: "90% top", end: "bottom bottom" },
// };

// const Hero = () => {
//   const containerRef = useRef(null);
//   const contentMaskRef = useRef(null);
//   const video1Ref = useRef(null);
//   const video2Ref = useRef(null);
//   const videoXavaRef = useRef(null); // NUEVO: ref para el wrapper del video de fondo (antes #image-xava)

//   useLayoutEffect(() => {
//     const size_scream = window.innerWidth * 5;

//     gsap.set("#logo-mask2", {
//       maskSize: `clamp(${size_scream}vh, 3600%, 0vh)`,
//       webkitMaskSize: `clamp(${size_scream}vh, 3600%, 0vh)`,
//     });

//     gsap.set(["#video-scene-1", "#final-scene", "#video-scene-2"], { opacity: 0 });

//     // NUEVO: estado inicial del zoom del video de fondo.
//     // scale 1.15 -> luego lo reducimos a 1 mientras se hace scroll (efecto "Ken Burns" clásico).
//     gsap.set(videoXavaRef.current, { scale: 1.15, transformOrigin: "center center" });

//     const ctx = gsap.context(() => {
//       const tlLogo = gsap.timeline({
//         scrollTrigger: {
//           trigger: contentMaskRef.current,
//           start: STAGES.logo.start,
//           end: STAGES.logo.end,
//           scrub: 1,
//         },
//       });

//       tlLogo
//         .to("#logo-mask2", { maskSize: "clamp(120vh, 25%, 30vh)" }, 0.4)
//         // NUEVO: el video hace zoom-out (de 1.15 a 1) en paralelo al encogimiento de la máscara.
//         .to(videoXavaRef.current, { scale: 1, ease: "none" }, 0)
//         .to("#image-xava", { opacity: 0, duration: 0.3 }, 0.6)
//         .to("#logo-mask2", { autoAlpha: 0, duration: 0.3 })
//         .to(video1Ref.current, { opacity: 1, duration: 0.2 });

//       const crossfade1 = gsap.timeline({ paused: true });
//       crossfade1
//         .to(video1Ref.current, { opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
//         .to("#final-scene", { opacity: 1, duration: 1, ease: "power2.inOut" }, 0);

//       ScrollTrigger.create({
//         trigger: contentMaskRef.current,
//         start: STAGES.video1.end,
//         onEnter: () => crossfade1.play(),
//         onLeaveBack: () => crossfade1.reverse(),
//       });

//       const crossfade2 = gsap.timeline({ paused: true });
//       crossfade2
//         .to("#final-scene", { opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
//         .to(video2Ref.current, { opacity: 1, duration: 1, ease: "power2.inOut" }, 0);

//       ScrollTrigger.create({
//         trigger: contentMaskRef.current,
//         start: STAGES.final.end,
//         onEnter: () => crossfade2.play(),
//         onLeaveBack: () => crossfade2.reverse(),
//       });

//       const opacityVideo2 = gsap.timeline({
//         scrollTrigger: {
//           trigger: contentMaskRef.current,
//           start: STAGES.fadeOutFinal.start,
//           end: STAGES.fadeOutFinal.end,
//           scrub: 1,
//         },
//       });

//       opacityVideo2.to(video2Ref.current, { opacity: 0, ease: "power1.out" });
//     }, containerRef);

//     return () => ctx.revert();
//   }, []);

//   return (
//     <div ref={containerRef} className={styles.container}>
//       <div ref={contentMaskRef} className={styles.content_mask}>
//         {/* ETAPA 0: Logo y video de fondo inicial (antes era imagen estática) */}
//         <div id="logo-mask2" className={styles.logo_mask}>
//           <div id="flash-effect" className={styles.flash_effect}></div>
//           <div id="image-xava" className={styles.container_home}>
//             <ScrollScrubVideo2 triggerRef={contentMaskRef} start={STAGES.logo.start} end={STAGES.logo.end} />
//             <div className={styles.sombra_image}></div>
//           </div>
//         </div>

//         <div ref={video1Ref} className={styles.logox} id="video-scene-1">
//           <ScrollScrubVideo2 triggerRef={contentMaskRef} start={STAGES.video1.start} end={STAGES.video1.end} />
//         </div>

//         <div id="final-scene" className={styles.logox}>
//           <InventorySection />
//         </div>

//         <div ref={video2Ref} className={styles.logox} id="video-scene-2">
//           <ScrollScrubVideo2 triggerRef={contentMaskRef} start={STAGES.video2.start} end={STAGES.video2.end} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Hero;

import { useRef, useLayoutEffect } from "react";
import styles from "./Hero.module.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollScrubVideo2 from "../video/Video2";

gsap.registerPlugin(ScrollTrigger);

// Orden de etapas: video1 -> logo -> video2
const STAGES = {
  video1: { start: "top top", end: "20% top" },
  video1ToLogo: { start: "20% top", end: "30% top" }, // rango corto para el crossfade
  logo: { start: "30% top", end: "50% top" },
  logoToVideo2: { start: "50% top", end: "70% top" }, // rango corto para el crossfade
  video2: { start: "70% top", end: "bottom bottom" },
  fadeOutFinal: { start: "90% top", end: "bottom bottom" },
};

const Hero = () => {
  const containerRef = useRef(null);
  const contentMaskRef = useRef(null);
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);

  useLayoutEffect(() => {
    const size_scream = window.innerWidth * 5;

    gsap.set("#logo-mask2", {
      maskSize: `clamp(${size_scream}vh, 3600%, 0vh)`,
      webkitMaskSize: `clamp(${size_scream}vh, 3600%, 0vh)`,
    });

    gsap.set(video1Ref.current, { opacity: 1 });
    gsap.set(["#logo-mask2", "#video-scene-2"], { opacity: 0 });

    const ctx = gsap.context(() => {
      // ==========================================
      // VIDEO1 -> LOGO (crossfade ligado al scroll)
      // ==========================================
      gsap
        .timeline({
          scrollTrigger: {
            trigger: contentMaskRef.current,
            start: STAGES.video1ToLogo.start,
            end: STAGES.video1ToLogo.end,
            scrub: 1,
          },
        })
        .to(video1Ref.current, { opacity: 0, ease: "power2.inOut", duration: 1 }, 0.3)
        .to("#logo-mask2", { opacity: 1, ease: "power2.inOut" }, 0.5);

      // ==========================================
      // LOGO: animación de máscara (scrub)
      // ==========================================
      gsap
        .timeline({
          scrollTrigger: {
            trigger: contentMaskRef.current,
            start: STAGES.logo.start,
            end: STAGES.logo.end,
            scrub: 1,
          },
        })
        .to("#logo-mask2", { maskSize: "clamp(120vh, 25%, 30vh)", duration: 1.7 })
        .to("#image-xava", { opacity: 0, duration: 1.5 },0.5)
        ;
        
        // ==========================================
      // LOGO -> VIDEO2 (crossfade ligado al scroll)
      // ==========================================
      gsap
        .timeline({
          scrollTrigger: {
            trigger: contentMaskRef.current,
            start: STAGES.logoToVideo2.start,
            end: STAGES.logoToVideo2.end,
            scrub: 1,
          },
        })
        // .to("#image-xava", { opacity: 0, duration: 0.3 }, 0.6)
        // .to("#logo-mask2", { autoAlpha: 1 })
        // .to(video2Ref.current, { opacity: 1, ease: "power2.inOut" }, 0);
        
        
        
        
        // .to("#logo-mask2", { maskSize: "clamp(120vh, 25%, 30vh)" }, 0.4) // Reduce el tamaño de la máscara
        // Desvanece la imagen interna
        // .to("#image-xava", { opacity: 0, duration: 1 })  
        .to("#logo-mask2", { autoAlpha: 0, duration: 1 })               // 8. autoAlpha: Anima opacidad y pone visibility: hidden al llegar a 0.
        .to(video2Ref.current, { opacity: 1, duration: 1 });   

      // ==========================================
      // FADE OUT FINAL del video2 (scrub)
      // ==========================================
      gsap
        .timeline({
          scrollTrigger: {
            trigger: contentMaskRef.current,
            start: STAGES.fadeOutFinal.start,
            end: STAGES.fadeOutFinal.end,
            scrub: 1,
          },
        })
        .to(video2Ref.current, { opacity: 0, ease: "power1.out" });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div ref={contentMaskRef} className={styles.content_mask}>
        <div ref={video1Ref} className={styles.logox} id="video-scene-1">
          <ScrollScrubVideo2 triggerRef={contentMaskRef} start={STAGES.video1.start} end={STAGES.video1.end} />
        </div>

        {/* <div id="logo-mask2" className={styles.logo_mask}>
          <div id="flash-effect" className={styles.flash_effect}></div>
          <div id="image-xava" className={styles.container_home}>
            <img
              className={styles.image}
              src="https://res.cloudinary.com/perusap/image/upload/v1629824743/EXAM/wall_ghyhf4.jpg"
              alt="Background"
            />
          </div>
        </div> */}

        <div id="logo-mask2" className={styles.logo_mask}>
          
          <div id="flash-effect" className={styles.flash_effect}></div>
          <div id="image-xava" className={styles.container_home}>
         
            <img
              className={styles.image}
              src="https://res.cloudinary.com/perusap/image/upload/v1629824743/EXAM/wall_ghyhf4.jpg"
              alt="Background"
            />
            <div className={styles.sombra_image}></div>
          </div>
        </div>

        <div ref={video2Ref} className={styles.logox} id="video-scene-2">
          <ScrollScrubVideo2 triggerRef={contentMaskRef} start={STAGES.video2.start} end={STAGES.video2.end} />
        </div>
      </div>
    </div>
  );
};

export default Hero;
