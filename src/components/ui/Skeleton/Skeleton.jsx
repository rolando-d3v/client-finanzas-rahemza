import styles from "./Skeleton.module.css";

/**
 * Skeleton loader animado.
 * @param {string} variant - "text" | "card" | "circle" | "rect"
 * @param {string} width - Ancho (ej: "100%", "200px")
 * @param {string} height - Alto (ej: "20px", "200px")
 * @param {number} count - Número de líneas (para variant="text")
 */
const Skeleton = ({ variant = "rect", width, height, count = 1 }) => {
  if (variant === "text" && count > 1) {
    return (
      <div className={styles.textGroup}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${styles.skeleton} ${styles.text}`}
            style={{ width: i === count - 1 ? "60%" : width || "100%" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]}`}
      style={{ width, height }}
    />
  );
};

/**
 * Skeleton para KPI Card
 */
export const KpiCardSkeleton = () => (
  <div className={styles.kpiCard}>
    <div className={styles.kpiHeader}>
      <Skeleton variant="text" width="80px" height="12px" />
      <Skeleton variant="circle" width="40px" height="40px" />
    </div>
    <Skeleton variant="text" width="140px" height="28px" />
    <Skeleton variant="text" width="100px" height="14px" />
  </div>
);

/**
 * Skeleton para tabla
 */
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className={styles.tableContainer}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={styles.tableRow}>
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} variant="text" width={`${Math.random() * 40 + 60}%`} height="16px" />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
