import styles from "./KpiCard.module.css";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

/**
 * Tarjeta KPI premium para dashboards financieros.
 * @param {string} label - Título del KPI
 * @param {string|number} value - Valor principal formateado
 * @param {string} icon - Componente icono de react-icons
 * @param {number} variation - Porcentaje de variación vs periodo anterior
 * @param {string} variationLabel - Texto de la variación (ej: "vs mes anterior")
 * @param {string} color - Color semántico: "primary" | "success" | "warning" | "error" | "info"
 */
const KpiCard = ({ label, value, icon: Icon, variation, variationLabel, color = "primary", bg_principal = null }) => {
  const isPositive = variation >= 0;


  console.log(bg_principal);

  return (
    <div className={`${styles.card} ${styles[color]} ${styles[bg_principal]}   `}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {Icon && (
          <div className={styles.iconWrapper}>
            <Icon />
          </div>
        )}
      </div>

      <div className={styles.value}>{value}</div>

      {variation !== undefined && (
        <div className={styles.footer}>
          <span className={`${styles.variation} ${isPositive ? styles.positive : styles.negative}`}>
            {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
            {isPositive ? "+" : ""}{variation}%
          </span>
          {variationLabel && (
            <span className={styles.variationLabel}>{variationLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default KpiCard;
