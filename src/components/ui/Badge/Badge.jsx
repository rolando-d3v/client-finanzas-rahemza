import styles from "./Badge.module.css";

/**
 * Badge/Tag con colores semánticos.
 * @param {string} label - Texto del badge
 * @param {string} variant - "primary" | "success" | "warning" | "error" | "info" | "neutral"
 * @param {string} size - "sm" | "md"
 * @param {string} customColor - Color hex personalizado (para etiquetas)
 */
const Badge = ({ label, variant = "neutral", size = "sm", customColor }) => {
  const customStyle = customColor ? {
    backgroundColor: `${customColor}22`,
    color: customColor,
    borderColor: `${customColor}44`,
  } : {};

  return (
    <span
      className={`${styles.badge} ${styles[variant]} ${styles[size]}`}
      style={customStyle}
    >
      {label}
    </span>
  );
};

export default Badge;
