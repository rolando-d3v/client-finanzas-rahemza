import { NavLink } from "react-router";
import { FiZap, FiClock, FiArrowRight, FiAlertTriangle } from "react-icons/fi";
import { useMiSuscripcion } from "../../components/planes/hooks/useMiSuscripcion";
import { useLayout } from "../../hooks/useLayout";
import styles from "./TrialSidebarWidget.module.css";

/**
 * Widget elegante para mostrar los días restantes del período de prueba en el Sidebar.
 * Se ubica justo encima del botón de cerrar sesión.
 * Soporta modo expandido y colapsado.
 */
export default function TrialSidebarWidget() {
  const { estado_sidebar } = useLayout();
  const { trialInfo, isSuperAdmin } = useMiSuscripcion();

  // No mostrar a super_admin ni a usuarios que no estén en período de prueba
  if (isSuperAdmin || !trialInfo?.esPrueba) {
    return null;
  }

  const {
    planNombre,
    diasRestantes,
    diasTotales,
    porcentajeTranscurrido,
    vencido,
    nivelUrgencia,
  } = trialInfo;

  // Clases dinámicas según nivel de urgencia
  const cardUrgencyClass =
    nivelUrgencia === "danger"
      ? styles.trialCardDanger
      : nivelUrgencia === "warning"
      ? styles.trialCardWarning
      : "";

  const badgeUrgencyClass =
    nivelUrgencia === "danger"
      ? styles.trialBadgeDanger
      : nivelUrgencia === "warning"
      ? styles.trialBadgeWarning
      : "";

  const barUrgencyClass =
    nivelUrgencia === "danger"
      ? styles.barDanger
      : nivelUrgencia === "warning"
      ? styles.barWarning
      : styles.barNormal;

  const btnUrgencyClass =
    nivelUrgencia === "danger"
      ? styles.ctaBtnDanger
      : nivelUrgencia === "warning"
      ? styles.ctaBtnWarning
      : "";

  const pillUrgencyClass =
    nivelUrgencia === "danger"
      ? styles.collapsedPillDanger
      : nivelUrgencia === "warning"
      ? styles.collapsedPillWarning
      : "";

  // ─── Estado Colapsado (Sidebar Mini) ─────────────────────────
  if (!estado_sidebar) {
    const tooltipText = vencido
      ? `Prueba finalizada (${planNombre}) - Clic para activar plan`
      : `Prueba: ${diasRestantes} ${diasRestantes === 1 ? "día restante" : "días restantes"} (${planNombre}) - Clic para ver planes`;

    return (
      <div className={styles.collapsedContainer}>
        <NavLink
          to="/admin/planes"
          className={`${styles.collapsedPill} ${pillUrgencyClass}`}
          title={tooltipText}
        >
          {vencido ? (
            <FiAlertTriangle size={18} />
          ) : (
            <FiClock size={16} />
          )}
          <span className={styles.collapsedCount}>
            {vencido ? "0d" : `${diasRestantes}d`}
          </span>
          {nivelUrgencia === "danger" && <span className={styles.pulseDot} />}
        </NavLink>
      </div>
    );
  }

  // ─── Estado Expandido (Tarjeta Completa) ─────────────────────
  return (
    <div className={styles.trialContainer}>
      <div className={`${styles.trialCard} ${cardUrgencyClass}`}>
        {/* Cabecera: Plan y Badge de Prueba */}
        <div className={styles.cardHeader}>
          <div className={styles.planTag} title={planNombre}>
            <FiZap className={styles.planIcon} />
            <span>{planNombre}</span>
          </div>
          <span className={`${styles.trialBadge} ${badgeUrgencyClass}`}>
            {vencido ? "Vencido" : "Prueba"}
          </span>
        </div>

        {/* Estado de días restantes */}
        <div className={styles.statusSection}>
          <div className={styles.daysMain}>
            {vencido ? (
              <>
                <FiAlertTriangle style={{ color: "#ef4444", flexShrink: 0 }} />
                <span>¡Prueba finalizada!</span>
              </>
            ) : diasRestantes === 1 ? (
              <>
                <FiClock style={{ color: "#f59e0b", flexShrink: 0 }} />
                <span>¡Último día de prueba!</span>
              </>
            ) : (
              <span>Quedan {diasRestantes} días</span>
            )}
          </div>
          <span className={styles.daysSub}>
            {vencido
              ? "Actualiza tu plan para no perder acceso"
              : `de ${diasTotales} días de prueba gratuita`}
          </span>
        </div>

        {/* Barra de progreso de tiempo consumido */}
        <div className={styles.progressTrack} title={`${porcentajeTranscurrido}% del periodo completado`}>
          <div
            className={`${styles.progressBar} ${barUrgencyClass}`}
            style={{ width: `${Math.min(100, Math.max(5, porcentajeTranscurrido))}%` }}
          />
        </div>

        {/* Botón hacia la pantalla de selección de planes */}
        <NavLink
          to="/admin/planes"
          className={`${styles.ctaBtn} ${btnUrgencyClass}`}
          title="Ver todos los planes disponibles"
        >
          <span>{vencido ? "Activar Plan" : "Mejorar Plan"}</span>
          <FiArrowRight className={styles.ctaIcon} />
        </NavLink>
      </div>
    </div>
  );
}
