import { useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useAuditoria } from "../../hooks/useAuditoria";
import Breadcrumb from "../../../../../components/ui/Breadcrumb/Breadcrumb";
import Badge from "../../../../../components/ui/Badge/Badge";
import EmptyState from "../../../../../components/ui/EmptyState/EmptyState";
import dayjs from "dayjs";
import styles from "./AuditoriaPage.module.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const AuditoriaPage = () => {
  const [page, setPage] = useState(1);
  const [filtroTabla, setFiltroTabla] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("");

  const params = useMemo(() => {
    const p = { page, limit: 30 };
    if (filtroTabla) p.tabla = filtroTabla;
    if (filtroAccion) p.accion = filtroAccion;
    return p;
  }, [page, filtroTabla, filtroAccion]);

  const { data: auditData, isLoading } = useAuditoria(params);
  const registros = auditData?.data || [];
  const pagination = auditData?.pagination || { total: 0, page: 1, totalPages: 1 };

  const columnDefs = useMemo(() => [
    {
      headerName: "Fecha", field: "created_at", flex: 1, sortable: true,
      valueFormatter: (p) => dayjs(p.value).format("DD/MM/YYYY HH:mm"),
    },
    { headerName: "Usuario", field: "usuario_nombre", flex: 0.8, valueFormatter: (p) => p.value || "Sistema" },
    {
      headerName: "Tabla", field: "tabla", flex: 0.7,
      cellRenderer: (p) => <Badge label={p.value} variant="info" />,
    },
    {
      headerName: "Acción", field: "accion", flex: 0.6,
      cellRenderer: (p) => {
        const v = p.value === "INSERT" ? "success" : p.value === "DELETE" ? "error" : "warning";
        return <Badge label={p.value} variant={v} />;
      },
    },
    {
      headerName: "Datos Anteriores", field: "datos_anteriores", flex: 1.2,
      cellRenderer: (p) => (
        <span className={styles.jsonCell} title={p.value ? JSON.stringify(p.value) : "—"}>
          {p.value ? JSON.stringify(p.value) : "—"}
        </span>
      ),
    },
    {
      headerName: "Datos Nuevos", field: "datos_nuevos", flex: 1.2,
      cellRenderer: (p) => (
        <span className={styles.jsonCell} title={p.value ? JSON.stringify(p.value) : "—"}>
          {p.value ? JSON.stringify(p.value) : "—"}
        </span>
      ),
    },
  ], []);

  const defaultColDef = useMemo(() => ({ resizable: true }), []);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Breadcrumb items={[{ label: "Dashboard", path: "/dashboard" }, { label: "Admin" }, { label: "Auditoría" }]} />
        <h1 className={styles.pageTitle}>Auditoría</h1>
        <p className={styles.pageSubtitle}>Registro de todas las acciones realizadas en el sistema</p>
      </div>

      <div className={styles.toolbar}>
        <select className={styles.filterSelect} value={filtroTabla} onChange={(e) => { setFiltroTabla(e.target.value); setPage(1); }}>
          <option value="">Todas las tablas</option>
          <option value="transacciones">Transacciones</option>
          <option value="cuentas">Cuentas</option>
          <option value="categorias">Categorías</option>
          <option value="transferencias">Transferencias</option>
          <option value="presupuestos">Presupuestos</option>
          <option value="metas_ahorro">Metas</option>
          <option value="etiquetas">Etiquetas</option>
          <option value="empresas">Empresas</option>
        </select>
        <select className={styles.filterSelect} value={filtroAccion} onChange={(e) => { setFiltroAccion(e.target.value); setPage(1); }}>
          <option value="">Todas las acciones</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {!isLoading && registros.length === 0 ? (
          <EmptyState title="Sin registros" description="No hay registros de auditoría con los filtros seleccionados." icon="📋" />
        ) : (
          <>
            <div className={styles.gridContainer}>
              <AgGridReact
                rowData={registros}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                domLayout="autoHeight"
                animateRows={true}
                suppressCellFocus={true}
                loading={isLoading}
              />
            </div>
            <div className={styles.paginationInfo}>
              <span>Mostrando {registros.length} de {pagination.total} — Página {pagination.page} de {pagination.totalPages}</span>
              <div className={styles.paginationBtns}>
                <button className={styles.paginationBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Anterior</button>
                <button className={styles.paginationBtn} disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente →</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuditoriaPage;
