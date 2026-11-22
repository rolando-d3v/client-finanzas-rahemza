import { FiCreditCard, FiCheckCircle, FiDollarSign, FiBriefcase } from "react-icons/fi";
import { useAuth } from "../../../auth/hooks/useAuth";
import { useMisPagos } from "./hooks/useMisPagos";
import HistorialPagosTable from "./components/HistorialPagosTable";
import { formatCalendarDate } from "../../../../utils/dateUtils";
import styles from "./pagos.module.css";

export default function PagosAdmin() {
  const { suscripcion, empresa, plan } = useAuth();
  const { pagos, isLoading } = useMisPagos();

  // Métricas calculadas
  const totalInvertido = pagos.reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
  const ultimoPago = pagos.length > 0 ? pagos[0] : null;

  return (
    <div className={styles.container}>
      {/* ── Encabezado Principal ─────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>Historial de Pagos y Facturación</h2>
          <p className={styles.subtitle}>
            Consulta y descarga tus comprobantes digitales y el historial de pagos de suscripción de tu empresa.
          </p>
        </div>

        {empresa && (
          <div className={styles.badgeEmpresa}>
            <FiBriefcase size={14} />
            <span>{empresa.nombre_comercial || empresa.razon_social || "Mi Empresa"}</span>
          </div>
        )}
      </div>

      {/* ── Métricas / KPI Cards ─────────────────────────── */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <FiCheckCircle />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Plan Actual</span>
            <span className={styles.kpiValue}>
              {plan?.nombre || suscripcion?.plan_nombre || "Plan Activo"}
            </span>
            <span className={styles.kpiSub}>
              Estado: {suscripcion?.estado ? suscripcion.estado.toUpperCase() : "ACTIVO"}
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <FiCreditCard />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Último Pago</span>
            <span className={styles.kpiValue}>
              {ultimoPago ? `S/ ${Number(ultimoPago.monto).toFixed(2)}` : "—"}
            </span>
            <span className={styles.kpiSub}>
              {ultimoPago
                ? formatCalendarDate(ultimoPago.fecha_pago, "DD [de] MMMM [de] YYYY")
                : "Sin registros"}
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <FiDollarSign />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Pagado</span>
            <span className={styles.kpiValue}>S/ {totalInvertido.toFixed(2)}</span>
            <span className={styles.kpiSub}>
              {pagos.length} {pagos.length === 1 ? "comprobante" : "comprobantes"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabla de Pagos y Recibos ─────────────────────── */}
      <div className={styles.content}>
        <HistorialPagosTable
          pagos={pagos}
          isLoading={isLoading}
          empresaInfo={empresa}
          emptyTitle="Sin pagos registrados todavía"
          emptyDescription="Cuando contrates o renueves tu suscripción con nosotros (Yape, Plin o Transferencia), aquí aparecerán todas tus constancias y recibos digitales."
        />
      </div>
    </div>
  );
}
