import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard, FiTarget, FiActivity } from "react-icons/fi";
import CategoriaIcons from "../../../categorias/components/categoria_icons/CategoriaIcons";
import { useDashboardSummary } from "../../hooks/useDashboard";
import KpiCard from "../../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../../components/ui/Skeleton/Skeleton";
import Badge from "../../../../../components/ui/Badge/Badge";
import FlujoCajaChart from "../../components/charts/FlujoCajaChart";
import GastosPorCategoriaChart from "../../components/charts/GastosPorCategoriaChart";
import SaldosPorCuentaChart from "../../components/charts/SaldosPorCuentaChart";
import PresupuestoChart from "../../components/charts/PresupuestoChart";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import styles from "./DashboardPage.module.css";

dayjs.extend(utc);

const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value || 0);
};

const DashboardPage = () => {
  // ⚡ Una sola petición para todo el dashboard
  const { data: summary, isLoading } = useDashboardSummary();

  const kpis = summary?.kpis;
  const gastosPorCategoria = summary?.gastos_por_categoria;
  const ultimasTransacciones = summary?.ultimas_transacciones;
  const saldosPorCuenta = summary?.saldos_por_cuenta;
  const presupuestosResumen = summary?.presupuestos_resumen;
  const metasResumen = summary?.metas_resumen;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard Financiero</h1>
        <p className={styles.pageSubtitle}>Resumen general de tu situación financiera</p>
      </div>

      {/* ── KPI Cards ────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        {isLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              label="Saldo Total"
              value={formatCurrency(kpis?.saldo_total)}
              icon={FiDollarSign}
              color="primary"
              bg_principal="bg_principal"
            />
            <KpiCard
              label="Ingresos del Mes"
              value={formatCurrency(kpis?.ingresos_mes)}
              icon={FiTrendingUp}
              variation={kpis?.variacion_ingresos}
              variationLabel="vs mes anterior"
              color="success"
            />
            <KpiCard
              label="Gastos del Mes"
              value={formatCurrency(kpis?.gastos_mes)}
              icon={FiTrendingDown}
              variation={kpis?.variacion_gastos}
              variationLabel="vs mes anterior"
              color="error"
            />
            <KpiCard
              label="Balance"
              value={formatCurrency(kpis?.balance)}
              icon={FiActivity}
              color={kpis?.balance >= 0 ? "success" : "error"}
            />
            <KpiCard
              label="Cuentas Activas"
              value={kpis?.total_cuentas}
              icon={FiCreditCard}
              color="info"
            />
            <KpiCard
              label="Ahorro Total"
              value={formatCurrency(kpis?.ahorro_total)}
              icon={FiTarget}
              color="warning"
            />
          </>
        )}
      </div>

      {/* ── Charts Row 1 ─────────────────────────────────── */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <FlujoCajaChart initialData={summary?.flujo_caja_anual} />
        </div>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Gastos por Categoría</h3>
          <p className={styles.chartSubtitle}>Mes actual</p>
          <GastosPorCategoriaChart data={gastosPorCategoria} />
        </div>
      </div>

      {/* ── Charts Row 2 ─────────────────────────────────── */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Saldos por Cuenta</h3>
          <SaldosPorCuentaChart data={saldosPorCuenta} />
        </div>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Presupuestos</h3>
          <p className={styles.chartSubtitle}>Consumo vs Límite</p>
          <PresupuestoChart data={presupuestosResumen} />
        </div>
      </div>

      {/* ── Bottom Row: Últimas Transacciones + Metas ────── */}
      <div className={styles.bottomRow}>
        {/* Últimas Transacciones */}
        <div className={styles.tableCard}>
          <h3 className={styles.chartTitle}>Últimas Transacciones</h3>
          <div className={styles.transactionList}>
            {ultimasTransacciones?.length > 0 ? (
              ultimasTransacciones.map((t) => (
                <div key={t.id} className={styles.transactionItem}>
                  <div className={styles.transactionIcon} style={{ backgroundColor: t.categoria_color ? `${t.categoria_color}22` : undefined }}>
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <CategoriaIcons name={t.categoria_icono || (t.tipo === "ingreso" ? "FaChartLine" : "FaMoneyBillWave")} />
                    </span>
                  </div>
                  <div className={styles.transactionInfo}>
                    <span className={styles.transactionDesc}>
                      {t.descripcion || t.categoria_nombre || t.tipo}
                    </span>
                    <span className={styles.transactionMeta}>
                      {t.cuenta_nombre} • {dayjs.utc(t.fecha).format("DD MMM")}
                    </span>
                  </div>
                  <div className={styles.transactionAmount}>
                    <span className={t.tipo === "ingreso" ? styles.income : styles.expense}>
                      {t.tipo === "ingreso" ? "+" : "-"}{formatCurrency(t.monto)}
                    </span>
                    <Badge
                      label={t.estado}
                      variant={t.estado === "confirmado" ? "success" : t.estado === "pendiente" ? "warning" : "error"}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>No hay transacciones recientes</p>
            )}
          </div>
        </div>

        {/* Metas de Ahorro */}
        <div className={styles.tableCard}>
          <h3 className={styles.chartTitle}>Metas de Ahorro</h3>
          <div className={styles.metasList}>
            {metasResumen?.length > 0 ? (
              metasResumen.map((m) => (
                <div key={m.id} className={styles.metaItem}>
                  <div className={styles.metaHeader}>
                    <span className={styles.metaName}>{m.nombre}</span>
                    <span className={styles.metaPercent}>{Number(m.porcentaje)}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${Math.min(Number(m.porcentaje), 100)}%` }}
                    />
                  </div>
                  <div className={styles.metaFooter}>
                    <span>{formatCurrency(m.monto_actual)} / {formatCurrency(m.monto_objetivo)}</span>
                    {m.fecha_objetivo && (
                      <span className={styles.metaDate}>{dayjs.utc(m.fecha_objetivo).format("DD MMM YYYY")}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>No hay metas activas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
