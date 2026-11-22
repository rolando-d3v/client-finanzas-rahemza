import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Skeleton from "../../../../../components/ui/Skeleton/Skeleton";
import { useFlujoCajaAnual } from "../../hooks/useDashboard";
import styles from "./FlujoCajaChart.module.css";

// Colores idénticos a la imagen: verde claro para ingresos, verde oscuro para gastos
const COLORS = {
  ingresos: "#1a3a2a",
  gastos: "#a3e635",
};

// ── Nombres de meses completos para el tooltip ──
const MESES_COMPLETOS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const formatCurrencySoles = (value) =>
  `S/ ${Number(value).toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// ── Formatear valores del eje Y (ej: 4000 → 4K) ──
const formatYAxis = (value) => {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1000) return `${value < 0 ? "-" : ""}${abs / 1000}K`;
  return value.toString();
};

// ── Tooltip personalizado ──
const CustomTooltip = ({ active, payload, label, year }) => {
  if (!active || !payload?.length) return null;

  const mesData = payload[0]?.payload;
  const mesIndex = mesData?.mes_numero ? mesData.mes_numero - 1 : 0;
  const mesCompleto = MESES_COMPLETOS[mesIndex] || label;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>
        {mesCompleto} {year}
      </p>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>Ingresos</span>
        <span className={styles.tooltipValue} style={{ color: COLORS.ingresos }}>
          {formatCurrencySoles(mesData?.ingresos || 0)}
        </span>
      </div>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>Gastos</span>
        <span className={styles.tooltipValue} style={{ color: COLORS.gastos }}>
          {formatCurrencySoles(mesData?.gastos || 0)}
        </span>
      </div>
    </div>
  );
};

/**
 * FlujoCajaChart
 *
 * Recibe `initialData` del summary (carga inicial) y solo hace fetch propio
 * cuando el usuario cambia el año en el selector.
 *
 * @param {{ initialData?: object }} props
 */
const FlujoCajaChart = ({ initialData }) => {
  const currentYear = new Date().getFullYear();
  const initialYear = initialData?.year || currentYear;
  const [selectedYear, setSelectedYear] = useState(initialYear);

  // Solo fetch independiente si el usuario cambió el año respecto al initial
  const hasChangedYear = selectedYear !== initialYear;
  const { data: fetchedData, isLoading: isFetchingYear } = useFlujoCajaAnual(selectedYear, {
    enabled: hasChangedYear,
  });

  // Usar datos del fetch independiente si el año cambió, si no usar initialData
  const response = hasChangedYear ? fetchedData : initialData;
  const isLoading = !response && (hasChangedYear ? isFetchingYear : false);

  // Transformar datos: gastos como valores negativos para barras hacia abajo
  const chartData = useMemo(() => {
    if (!response?.data) return [];
    return response.data.map((item) => ({
      ...item,
      gastosNeg: -item.gastos,
    }));
  }, [response]);

  const availableYears = response?.available_years || [currentYear];
  const flujoNeto = response?.flujo_neto || 0;

  if (isLoading || !response) {
    return (
      <div className={styles.container}>
        <Skeleton variant="rect" width="100%" height="40px" />
        <Skeleton variant="rect" width="100%" height="300px" />
      </div>
    );
  }

  const maxDomain = Math.ceil(flujoNeto / 1000) * 1000;

  return (
    <div className={styles.container}>
      {/* Header: Título + Flujo de Caja + Select */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Flujo de Caja</h3>
          <span className={styles.subtitleLabel}>Flujo de Caja</span>
          <span className={styles.flujoValue}>{formatCurrencySoles(flujoNeto)}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
          <select
            className={styles.yearSelect}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year === currentYear ? `Este Año` : year}
              </option>
            ))}
          </select>
          <div className={styles.legendContainer}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: COLORS.ingresos }} />
              Ingresos
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: COLORS.gastos }} />
              Gastos
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de barras */}

      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        
          barGap={20}
          barSize={-20}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-borde-suave)" />

          {/* Línea de cero bien marcada */}
          <ReferenceLine y={0} stroke="var(--color-borde)" strokeWidth={1} />

          <XAxis
            dataKey="mes"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "var(--color-texto-secundario)" }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "var(--color-texto-secundario)" }}
            tickFormatter={formatYAxis}
            domain={[-maxDomain, maxDomain]}
          />

          <Tooltip content={<CustomTooltip year={selectedYear} />} cursor={{ fill: "rgba(0,0,0,0.04)", radius: 4 }} />

          {/* Barras de Ingresos (positivas - color oscuro) */}
          <Bar
            dataKey="ingresos"
            name="Ingresos"
            fill={COLORS.ingresos} // negro/gris muy oscuro como en la imagen
            radius={[4, 4, 0, 0]} // redondeado solo arriba
            maxBarSize={26}
          />

          {/* Barras de Gastos (negativas - verde) */}
          <Bar
            dataKey="gastosNeg"
            name="Gastos"
            fill={COLORS.gastos} // verde lima brillante como en la imagen
            radius={[0, 0, 4, 4]} // redondeado solo abajo
            maxBarSize={26}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FlujoCajaChart;
