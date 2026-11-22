import { useState } from "react";
import { useNavigate } from "react-router";
import { FiAlertTriangle, FiClock, FiX, FiArrowRight } from "react-icons/fi";
import { useMiSuscripcion } from "../../planes/hooks/useMiSuscripcion";
import styles from "./SubscriptionAlertBanner.module.css";

/**
 * RN-12 + RN-13: Banner de notificación in-app para alertar sobre vencimiento próximo (<= 7 días)
 * o período de gracia activo (4 días).
 */
export default function SubscriptionAlertBanner() {
  const navigate = useNavigate();
  const { alerta, suscripcion, isSuperAdmin } = useMiSuscripcion();
  const [dismissed, setDismissed] = useState(false);

  // Si no hay alerta, es super admin o fue descartado en esta sesión (solo warnings no críticos)
  if (!alerta || isSuperAdmin || dismissed) {
    return null;
  }

  const isDanger = alerta.tipo === "danger";

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleGoToPlanes = () => {
    navigate("/admin/planes");
  };

  return (
    <div className={`${styles.banner} ${isDanger ? styles.bannerDanger : styles.bannerWarning}`}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          {isDanger ? (
            <FiAlertTriangle className={styles.iconDanger} />
          ) : (
            <FiClock className={styles.iconWarning} />
          )}
        </div>

        <div className={styles.textWrapper}>
          <span className={styles.badge}>
            {alerta.en_gracia ? "PERÍODO DE GRACIA" : isDanger ? "SUSCRIPCIÓN VENCIDA" : "VENCIMIENTO PRÓXIMO"}
          </span>
          <p className={styles.mensaje}>{alerta.mensaje}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleGoToPlanes}
          className={`${styles.actionBtn} ${isDanger ? styles.actionBtnDanger : styles.actionBtnWarning}`}
        >
          <span>Renovar Plan</span>
          <FiArrowRight />
        </button>

        {!isDanger && (
          <button
            type="button"
            onClick={handleDismiss}
            className={styles.closeBtn}
            title="Cerrar notificación"
            aria-label="Cerrar"
          >
            <FiX />
          </button>
        )}
      </div>
    </div>
  );
}
