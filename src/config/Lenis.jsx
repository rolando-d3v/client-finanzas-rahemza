import { useEffect, useLayoutEffect, useRef } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SmoothScrollProvider = ({ children }) => {
  const lenisRef = useRef(null);

  
useEffect(() => {
    let hasBoundScroll = false;
    function update(time) {
      const lenis = lenisRef.current?.lenis;
      if (lenis) {
        // 1. Vincula ScrollTrigger tan pronto la instancia de Lenis está disponible en el DOM
        if (!hasBoundScroll) {
          lenis.on("scroll", ScrollTrigger.update);
          hasBoundScroll = true;
        }
        // 2. Ejecuta el loop de animación de Lenis alimentado por el reloj de GSAP (en ms)
        lenis.raf(time * 1000);
      }
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      const lenis = lenisRef.current?.lenis;
      if (lenis && hasBoundScroll) {
        lenis.off("scroll", ScrollTrigger.update);
      }
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,           // El ciclo RAF es controlado por gsap.ticker
        lerp: 0.06,               // Interpolación ultra-suave (Apple usa ~0.05-0.07)
        duration: 1.2,            // Duración base de la inercia del scroll (segundos)
        smoothWheel: true,        // Smooth scroll con mouse wheel
        smoothTouch: false,       // Mantener scroll nativo en touch (mejor UX móvil)
        wheelMultiplier: 0.8,     // Reducir velocidad del wheel → más control, menos brusco
        touchMultiplier: 1.5,     // Multiplicador para touch devices
        infinite: false,          // No scroll infinito
      }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  );
};

export default SmoothScrollProvider;
