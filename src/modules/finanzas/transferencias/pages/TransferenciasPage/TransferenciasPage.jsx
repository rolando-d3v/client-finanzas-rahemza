import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useTransferencias, useCreateTransferencia, useDeleteTransferencia } from "../../hooks/useTransferencias";
import { useCuentas } from "../../../cuentas/hooks/useCuentas";
import KpiCard from "../../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../../components/ui/Skeleton/Skeleton";
import Modal from "../../../../../components/ui/Modal/Modal";
import EmptyState from "../../../../../components/ui/EmptyState/EmptyState";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import styles from "./TransferenciasPage.module.css";

dayjs.extend(utc);

ModuleRegistry.registerModules([AllCommunityModule]);

const formatCurrency = (v) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(v || 0);

const TransferenciasPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: txData, isLoading } = useTransferencias({ page, limit: 20 });
  const { data: cuentasData } = useCuentas();
  const cuentas = cuentasData?.cuentas || [];
  const createMutation = useCreateTransferencia();
  const deleteMutation = useDeleteTransferencia();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const transferencias = txData?.data || [];
  const pagination = txData?.pagination || { total: 0, page: 1, totalPages: 1 };

  // KPIs
  const kpis = useMemo(() => {
    const total = pagination.total;
    const montoTotal = transferencias.reduce((a, t) => a + Number(t.monto), 0);
    return { total, montoTotal };
  }, [transferencias, pagination]);

  // AG Grid columns
  const columnDefs = useMemo(() => [
    { headerName: "Fecha", field: "fecha", flex: 0.8, sortable: true, valueFormatter: (p) => p.value ? dayjs.utc(p.value).format("DD/MM/YYYY") : "—" },
    { headerName: "Cuenta Origen", field: "cuenta_origen_nombre", flex: 1.2 },
    {
      headerName: "", flex: 0.3, sortable: false, filter: false,
      cellRenderer: () => <span className={styles.transferArrow}>→</span>,
    },
    { headerName: "Cuenta Destino", field: "cuenta_destino_nombre", flex: 1.2 },
    { headerName: "Monto", field: "monto", flex: 0.8, sortable: true, valueFormatter: (p) => formatCurrency(p.value) },
    { headerName: "Usuario", field: "usuario_nombre", flex: 0.8, valueFormatter: (p) => p.value || "—" },
    { headerName: "Descripción", field: "descripcion", flex: 1.2, valueFormatter: (p) => p.value || "—" },
    {
      headerName: "Acciones", flex: 0.5, sortable: false, filter: false,
      cellRenderer: (p) => (
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(p.data.id)} title="Eliminar"><FiTrash2 /></button>
        </div>
      ),
    },
  ], []);

  const defaultColDef = useMemo(() => ({ resizable: true }), []);

  const handleDelete = useCallback((id) => {
    if (window.confirm("¿Estás seguro de eliminar esta transferencia?")) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleOpenCreate = () => {
    const principalCuenta = (cuentas || []).find((c) => c.es_principal) || (cuentas || [])[0];
    reset({
      cuenta_origen_id: principalCuenta ? principalCuenta.id : "",
      cuenta_destino_id: "",
      monto: "",
      fecha: dayjs().format("YYYY-MM-DD"),
      descripcion: "",
    });
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    createMutation.mutate({ ...data, monto: Number(data.monto) }, { onSuccess: () => setModalOpen(false) });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Transferencias</h1>
            <p className={styles.pageSubtitle}>Registra transferencias de dinero entre tus cuentas</p>
          </div>
          <button className={styles.primaryBtn} onClick={handleOpenCreate}>
            <FiPlus /> Nueva Transferencia
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {isLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard label="Total Transferencias" value={kpis.total} color="info" />
            <KpiCard label="Monto Total Movido" value={formatCurrency(kpis.montoTotal)} color="primary" />
            <KpiCard label="Este Mes" value={formatCurrency(kpis.montoMes)} color="success" />
          </>
        )}
      </div>

      {/* AG Grid Table */}
      <div className={styles.tableCard}>
        {!isLoading && (!transferencias || transferencias.length === 0) ? (
          <EmptyState
            title="Sin transferencias"
            description="Aún no tienes transferencias registradas. Crea tu primera transferencia para mover dinero entre cuentas."
            icon="🔄"
            action={
              <button className={styles.primaryBtn} onClick={handleOpenCreate}>
                <FiPlus /> Crear primera transferencia
              </button>
            }
          />
        ) : (
          <div className={styles.gridContainer}>
            <AgGridReact
              rowData={transferencias || []}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              domLayout="autoHeight"
              pagination={true}
              paginationPageSize={10}
              animateRows={true}
              rowSelection="single"
              suppressCellFocus={true}
              loading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Modal Crear */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva Transferencia"
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button className={styles.primaryBtn} onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending}>
              Realizar Transferencia
            </button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Cuenta Origen *</label>
              <select className={styles.formInput} {...register("cuenta_origen_id", { required: "Selecciona cuenta origen" })}>
                <option value="">Seleccionar...</option>
                {(cuentas || []).map((c) => (
                  <option key={c.id} value={c.id} disabled={c.bloqueada_por_plan}>
                    {c.bloqueada_por_plan ? "🔒 " : ""}{c.nombre} {c.es_principal ? "⭐ (Principal)" : ""}{c.bloqueada_por_plan ? " (Bloqueada)" : ""}
                  </option>
                ))}
              </select>
              {errors.cuenta_origen_id && <span className={styles.formError}>{errors.cuenta_origen_id.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Cuenta Destino *</label>
              <select className={styles.formInput} {...register("cuenta_destino_id", { required: "Selecciona cuenta destino" })}>
                <option value="">Seleccionar...</option>
                {(cuentas || []).map((c) => (
                  <option key={c.id} value={c.id} disabled={c.bloqueada_por_plan}>
                    {c.bloqueada_por_plan ? "🔒 " : ""}{c.nombre} {c.es_principal ? "⭐ (Principal)" : ""}{c.bloqueada_por_plan ? " (Bloqueada)" : ""}
                  </option>
                ))}
              </select>
              {errors.cuenta_destino_id && <span className={styles.formError}>{errors.cuenta_destino_id.message}</span>}
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Monto *</label>
              <input className={styles.formInput} type="number" step="0.01" {...register("monto", { required: "El monto es requerido", min: { value: 0.01, message: "Monto debe ser mayor a 0" } })} placeholder="0.00" />
              {errors.monto && <span className={styles.formError}>{errors.monto.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha</label>
              <input className={styles.formInput} type="date" {...register("fecha")} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripción</label>
            <input className={styles.formInput} {...register("descripcion")} placeholder="Motivo de la transferencia..." />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TransferenciasPage;
