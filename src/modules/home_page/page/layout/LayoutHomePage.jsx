import React, { useCallback, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./LayoutHomePage.module.css";
import SmoothScrollProvider from "../../../../config/Lenis";
import { useLenis } from "lenis/react";
import { Outlet, useLocation } from "react-router";

// Componente interno que tiene acceso al contexto de Lenis
function HomeContent() {
  const lenis = useLenis();
  const { pathname } = useLocation();

  // ⚡ Scroll al inicio cada vez que cambia la ruta
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  const handleNavigate = useCallback(
    (href) => {
      if (lenis) {
        lenis.scrollTo(href, { offset: 0, duration: 1.2 });
      } else {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    },
    [lenis],
  );

  return (
    <div className={styles.layout}>
      <Navbar onNavigate={handleNavigate} />
      <Outlet />
      <Footer />
    </div>
  );
}

// Componente exportado que provee el contexto de Lenis
export default function LayoutHomePage() {
  return (
    <SmoothScrollProvider>
      <HomeContent />
    </SmoothScrollProvider>
  );
}
