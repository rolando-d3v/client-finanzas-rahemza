import Breadcrumb from "../Breadcrumb/Breadcrumb";
import EmptyState from "../EmptyState/EmptyState";

const ComingSoonPage = ({ title, breadcrumbs = [], icon = "🚧" }) => {
  return (
    <div style={{ padding: "4px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <Breadcrumb items={breadcrumbs} />
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-texto-heading)", margin: "8px 0 0" }}>{title}</h1>
      </div>
      <div style={{
        backgroundColor: "var(--color-fondo-card)",
        borderRadius: "20px",
        padding: "48px",
        boxShadow: "var(--sombra-card)",
        border: "1px solid var(--color-borde-suave)",
      }}>
        <EmptyState
          title="En desarrollo"
          description="Esta sección se está construyendo. Pronto estará disponible."
          icon={icon}
        />
      </div>
    </div>
  );
};

export default ComingSoonPage;
