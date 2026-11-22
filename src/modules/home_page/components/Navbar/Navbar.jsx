import React, { useEffect, useState } from "react";
import { FiArrowRight, FiMenu, FiX, FiLogIn, FiChevronRight } from "react-icons/fi";
import logo from "../../../../assets/logos/rahemza.png";
import styles from "./Navbar.module.css";
import { Link, useLocation, useNavigate } from "react-router";

const NAV_ITEMS = [
  { label: "Finanzas", href: "/finanzas" },
  { label: "Inventario", href: "/inventario" },
  { label: "Empresa", href: "/home#empresa", isAnchor: true },
  { label: "Planes", href: "/planes" },
];

/**
 * Componente unificado para los enlaces de navegación (Desktop & Mobile)
 */
function NavLinksList({ isMobile = false, onItemClick, currentPath }) {
  return (
    <ul className={isMobile ? styles.mobileNavLinks : styles.navLinks} role="menubar">
      {NAV_ITEMS.map((item) => {
        const isActive = currentPath === item.href;
        return (
          <li key={item.label} className={isMobile ? styles.mobileNavItem : styles.navItem} role="none">
            <Link
              to={item.href}
              onClick={(e) => onItemClick(e, item)}
              className={`${isMobile ? styles.mobileNavLink : styles.navLink} ${
                isActive ? (isMobile ? styles.mobileNavLinkActive : styles.navLinkActive) : ""
              }`}
              role="menuitem"
              aria-current={isActive ? "page" : undefined}
            >
              <span>{item.label}</span>
              {isMobile && <FiChevronRight className={styles.mobileLinkArrow} />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Componente unificado para botones de acción (Desktop, Barra Móvil y Drawer)
 */
function NavActions({ variant = "desktop", onActionClick }) {
  if (variant === "mobileBar") {
    return (
      <Link to="/login" className={styles.mobileBarLogin} aria-label="Iniciar Sesión">
        <FiLogIn className={styles.mobileBarLoginIcon} />
        <span className={styles.mobileBarLoginText}>Entrar</span>
      </Link>
    );
  }

  const isDrawer = variant === "drawer";

  return (
    <div className={isDrawer ? styles.drawerActions : styles.actions}>
      <Link to="/login" onClick={onActionClick} className={styles.actionLink}>
        <button className={isDrawer ? styles.btnDrawerSecondary : styles.btnSecondary}>
          Iniciar Sesión
        </button>
      </Link>
      <Link to="/planes" onClick={onActionClick} className={styles.actionLink}>
        <button className={styles.btnPrimary}>
          Empezar Gratis
          <FiArrowRight />
        </button>
      </Link>
    </div>
  );
}

export default function Navbar({ onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bloquear scroll de la página cuando el menú móvil esté abierto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Cerrar menú con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLinkClick = (e, item) => {
    setMobileOpen(false);

    if (item.isAnchor) {
      const isHome = location.pathname === "/home" || location.pathname === "/";
      if (isHome) {
        e.preventDefault();
        const target = document.querySelector("#empresa");
        if (target) {
          if (onNavigate) {
            onNavigate("#empresa");
          } else {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }
      } else {
        // Navegar a home y luego scrollear al ancla
        navigate("/home#empresa");
      }
    }
  };

  return (
    <>
      <header
        className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""} ${
          mobileOpen ? styles.headerMobileActive : ""
        }`}
      >
        <div className={styles.container}>
          {/* Marca / Logo */}
          <Link to="/home" className={styles.brand} onClick={() => setMobileOpen(false)}>
            <div className={styles.logoBadge}>
              <img src={logo} alt="Logo de Pappuk" className={styles.img_logo} loading="eager" decoding="async" />
            </div>
            <span className={styles.brandName}>
              Pappuk
              <span className={styles.tagLive}>OS v2.0</span>
            </span>
          </Link>

          {/* Navegación Desktop */}
          <nav aria-label="Navegación principal" className={styles.desktopNav}>
            <NavLinksList onItemClick={handleLinkClick} currentPath={location.pathname} />
          </nav>

          {/* Acciones Desktop */}
          <NavActions variant="desktop" />

          {/* Controles Móviles: Botón rápido de Login + Menú Hamburguesa */}
          <div className={styles.mobileControls}>
            <NavActions variant="mobileBar" />
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Drawer Móvil Desplegable */}
        {mobileOpen && (
          <div className={`${styles.mobileDrawer} ${styles.mobileDrawerOpen}`}>
            <nav aria-label="Navegación móvil" className={styles.mobileNavContainer}>
              <NavLinksList isMobile onItemClick={handleLinkClick} currentPath={location.pathname} />
            </nav>

            <div className={styles.mobileDrawerDivider} />

            {/* Acciones dentro del menú móvil */}
            <NavActions variant="drawer" onActionClick={() => setMobileOpen(false)} />
          </div>
        )}
      </header>

      {/* Overlay oscuro al abrir el menú móvil para cerrar al hacer clic afuera */}
      {mobileOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
