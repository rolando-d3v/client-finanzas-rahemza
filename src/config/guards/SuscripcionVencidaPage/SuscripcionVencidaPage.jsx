import { FiLock, FiAlertTriangle, FiLogOut } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "../../../modules/auth/hooks/useAuth";
import styles from "./SuscripcionVencidaPage.module.css";

/**
 * SuscripcionVencidaPage
 *
 * CU-05: Pantalla de bloqueo para usuarios SECUNDARIOS (colaboradores/empleados)
 * cuando la suscripción de la empresa ha vencido.
 * Los admins son redirigidos a /admin/planes, no a esta página.
 */
export default function SuscripcionVencidaPage() {
  const { handleLogout, empresa, user } = useAuth();

  const handleWhatsApp = () => {
    const lineas = [
      `👋 Hola, trabajo en ${empresa?.razon_social || "una empresa"} y necesito que reactiven mi cuenta en Pappuk.`,
      "",
      `👤 Mi contacto: ${user?.name || ""} (${user?.email || ""})`,
      "",
      "Por favor, indiquen cómo proceder para renovar la suscripción. ¡Gracias! 🙏"
    ];
    const msg = encodeURIComponent(lineas.join("\n"));
    window.open(`https://api.whatsapp.com/send/?phone=51985503581&text=${msg}`, "_blank");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Ícono */}
        <div className={styles.iconWrapper}>
          <FiLock className={styles.lockIcon} />
        </div>

        {/* Título */}
        <h1 className={styles.title}>Acceso suspendido</h1>
        <p className={styles.subtitle}>
          La suscripción de <strong>{empresa?.razon_social || "tu empresa"}</strong> ha vencido.
        </p>

        {/* Alerta */}
        <div className={styles.alert}>
          <FiAlertTriangle className={styles.alertIcon} />
          <p>
            Tu cuenta de usuario ha sido temporalmente bloqueada porque el
            período de suscripción de la empresa ha finalizado. Comunícate
            con el administrador de tu empresa para que renueve el plan.
          </p>
        </div>

        {/* Acciones */}
        <div className={styles.actions}>
          <button className={styles.btnWhatsapp} onClick={handleWhatsApp}>
            <FaWhatsapp size={20} />
            Notificar al soporte por WhatsApp
          </button>
          <button className={styles.btnLogout} onClick={handleLogout}>
            <FiLogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
