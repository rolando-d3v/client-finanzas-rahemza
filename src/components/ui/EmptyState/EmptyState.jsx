import styles from "./EmptyState.module.css";

/**
 * Estado vacío reutilizable.
 * @param {string} title - Título
 * @param {string} description - Descripción
 * @param {string} icon - Emoji o componente icono
 * @param {ReactNode} action - Botón o acción
 */
const EmptyState = ({ title = "Sin datos", description, icon = "📭", action }) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

export default EmptyState;
