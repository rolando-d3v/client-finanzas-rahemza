import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import styles from "./Modal.module.css";

/**
 * Modal genérico reutilizable.
 * @param {boolean} isOpen - Estado de visibilidad
 * @param {function} onClose - Callback al cerrar
 * @param {string} title - Título del modal
 * @param {string} size - "sm" | "md" | "lg" | "xl"
 * @param {ReactNode} children - Contenido
 * @param {ReactNode} footer - Contenido del footer (botones)
 */
const Modal = ({ isOpen, onClose, title, size = "md", children, footer }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${styles[size]}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <FiX />
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
