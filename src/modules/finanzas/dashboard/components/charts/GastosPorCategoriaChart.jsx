import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const CHART_COLORS = [
  "#7b61ff", "#0ab39c", "#f47c3c", "#2d88ff", "#f59e0b",
  "#e84040", "#1aad6b", "#a294f9", "#f9a76a", "#60a5fa",
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];

  return (
    <div style={{
      background: "var(--color-fondo-card)",
      border: "1px solid var(--color-borde)",
      borderRadius: "12px",
      padding: "12px 16px",
      boxShadow: "var(--sombra-dropdown)",
    }}>
      <p style={{ fontSize: "14px", fontWeight: 600, color: item.payload.color || "var(--color-texto-heading)", margin: "0 0 4px" }}>
        {item.name}
      </p>
      <p style={{ fontSize: "14px", color: "var(--color-texto-body)", margin: 0 }}>
        S/ {Number(item.value).toLocaleString("es-PE", { minimumFractionDigits: 2 })} ({item.payload.cantidad} transacciones)
      </p>
    </div>
  );
};

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const GastosPorCategoriaChart = ({ data }) => {
  if (!data?.length) return <p style={{ color: "var(--color-texto-placeholder)", textAlign: "center", padding: "60px 0" }}>Sin gastos este mes</p>;

  const chartData = data.map((item, i) => ({
    name: item.categoria,
    value: Number(item.total),
    color: item.color || CHART_COLORS[i % CHART_COLORS.length],
    cantidad: item.cantidad,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={110}
          innerRadius={55}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default GastosPorCategoriaChart;
