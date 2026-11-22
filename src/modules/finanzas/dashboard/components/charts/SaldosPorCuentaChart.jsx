import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = {
  efectivo: "#7b61ff",
  banco: "#0ab39c",
  tarjeta_credito: "#f47c3c",
  tarjeta_debito: "#2d88ff",
  otro: "#f59e0b",
};

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
        {item.nombre}
      </p>
      <p style={{ fontSize: "13px", color: "var(--color-texto-secundario)", margin: "0 0 4px" }}>
        Tipo: {item.tipo}
      </p>
      <p style={{ fontSize: "14px", color: "var(--color-texto-body)", margin: 0 }}>
        Saldo: S/ {Number(item.saldo).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

const SaldosPorCuentaChart = ({ data }) => {
  if (!data?.length) return <p style={{ color: "var(--color-texto-placeholder)", textAlign: "center", padding: "60px 0" }}>Sin cuentas</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-borde-suave)" />
        <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: "var(--color-texto-secundario)" }} />
        <YAxis tick={{ fontSize: 12, fill: "var(--color-texto-secundario)" }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="saldo" radius={[8, 8, 0, 0]} animationDuration={800}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.tipo] || "#7b61ff"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SaldosPorCuentaChart;
