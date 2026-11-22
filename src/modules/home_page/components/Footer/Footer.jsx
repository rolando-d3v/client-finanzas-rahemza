import React from 'react';
import { FiArrowUp, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';
import { TbLayersIntersect } from 'react-icons/tb';
import styles from './Footer.module.css';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const el = document.querySelector(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <a href="#hero" onClick={(e) => handleNavClick(e, '#hero')} className={styles.brand}>
              <div className={styles.logoBadge}>
                <TbLayersIntersect />
              </div>
              <span className={styles.brandName}>Rahemza OS</span>
            </a>
            <p className={styles.brandDesc}>
              El sistema inteligente integrado para la gestión de finanzas, inventarios, facturación electrónica e inteligencia empresarial.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <FiTwitter />
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <FiLinkedin />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <FiInstagram />
              </a>
            </div>
          </div>

          <div className={styles.navCol}>
            <h4 className={styles.colTitle}>Módulos</h4>
            <a href="#finanzas" onClick={(e) => handleNavClick(e, '#finanzas')} className={styles.footerLink}>
              Finanzas & Flujo de Caja
            </a>
            <a href="#inventario" onClick={(e) => handleNavClick(e, '#inventario')} className={styles.footerLink}>
              Inventario & Kardex
            </a>
            <a href="#empresa" onClick={(e) => handleNavClick(e, '#empresa')} className={styles.footerLink}>
              Facturación Electrónica
            </a>
            <a href="#empresa" onClick={(e) => handleNavClick(e, '#empresa')} className={styles.footerLink}>
              Integración IA & Anomalías
            </a>
          </div>

          <div className={styles.navCol}>
            <h4 className={styles.colTitle}>Planes & Recursos</h4>
            <a href="#planes" onClick={(e) => handleNavClick(e, '#planes')} className={styles.footerLink}>
              Planes y Tarifas
            </a>
            <a href="#finanzas" onClick={(e) => handleNavClick(e, '#finanzas')} className={styles.footerLink}>
              Presupuestos & Metas
            </a>
            <a href="#empresa" onClick={(e) => handleNavClick(e, '#empresa')} className={styles.footerLink}>
              Flujos de Aprobación
            </a>
            <a href="#empresa" onClick={(e) => handleNavClick(e, '#empresa')} className={styles.footerLink}>
              API Keys & Web
            </a>
          </div>

          <div className={styles.navCol}>
            <h4 className={styles.colTitle}>Compañía</h4>
            <a href="#hero" onClick={(e) => handleNavClick(e, '#hero')} className={styles.footerLink}>
              Sobre Rahemza
            </a>
            <a href="#hero" onClick={(e) => handleNavClick(e, '#hero')} className={styles.footerLink}>
              Seguridad & Auditoría
            </a>
            <a href="#hero" onClick={(e) => handleNavClick(e, '#hero')} className={styles.footerLink}>
              Términos de Servicio
            </a>
            <a href="#hero" onClick={(e) => handleNavClick(e, '#hero')} className={styles.footerLink}>
              Políticas de Privacidad
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <div>© {new Date().getFullYear()} Rahemza OS. Todos los derechos reservados.</div>
          <div className={styles.bottomLinks}>
            <button
              onClick={scrollToTop}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem'
              }}
              aria-label="Volver arriba"
            >
              Volver arriba <FiArrowUp />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
