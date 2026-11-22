import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div style={{
      background: "var(--color-fondo-card)",
      border: "1px solid var(--color-borde)",
      borderRadius: "12px",
      padding: "12px 16px",
      boxShadow: "var(--sombra-dropdown)",
    }}>
      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-texto-heading)", margin: "0 0 4px" }}>
        {item.categoria_nombre || "General"}
      </p>
      <p style={{ fontSize: "13px", color: "var(--color-exito)", margin: "2px 0" }}>
        Límite: S/ {Number(item.monto_limite).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
      </p>
      <p style={{ fontSize: "13px", color: item.porcentaje > 90 ? "var(--color-error)" : "var(--color-info)", margin: "2px 0" }}>
        Consumido: S/ {Number(item.consumido).toLocaleString("es-PE", { minimumFractionDigits: 2 })} ({item.porcentaje}%)
      </p>
    </div>
  );
};

const PresupuestoChart = ({ data }) => {
  if (!data?.length) return <p style={{ color: "var(--color-texto-placeholder)", textAlign: "center", padding: "60px 0" }}>Sin presupuestos activos</p>;

  const chartData = data.map((item) => ({
    ...item,
    name: item.categoria_nombre || "General",
    limite: Number(item.monto_limite),
    consumido_valor: Number(item.consumido),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 60, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-borde-suave)" />
        <XAxis type="number" tick={{ fontSize: 12, fill: "var(--color-texto-secundario)" }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "var(--color-texto-secundario)" }} width={80} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="limite" fill="var(--color-fondo-skeleton)" radius={[0, 4, 4, 0]} barSize={20} />
        <Bar dataKey="consumido_valor" radius={[0, 4, 4, 0]} barSize={20}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.porcentaje > 90 ? "#f87171" : entry.porcentaje > 70 ? "#fbbf24" : "#34d399"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PresupuestoChart;
