import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  usePresupuestos,
  useCreatePresupuesto,
  useUpdatePresupuesto,
  useDeletePresupuesto,
} from "../../hooks/usePresupuestos";
import { useCategorias } from "../../../categorias/hooks/useCategorias";
import CategoriaIcons from "../../../categorias/components/categoria_icons/CategoriaIcons";
import CategoriaTreeSelect from "../../../../../components/ui/CategoriaTreeSelect/CategoriaTreeSelect";
import KpiCard from "../../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../../components/ui/Skeleton/Skeleton";
import Modal from "../../../../../components/ui/Modal/Modal";
import Badge from "../../../../../components/ui/Badge/Badge";
import EmptyState from "../../../../../components/ui/EmptyState/EmptyState";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import styles from "./PresupuestosPage.module.css";

dayjs.extend(utc);

ModuleRegistry.registerModules([AllCommunityModule]);

const formatCurrency = (v) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(v || 0);

const PERIODOS = [
  { value: "diario", label: "Diario" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
  { value: "anual", label: "Anual" },
];

const PresupuestosPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPresupuesto, setEditingPresupuesto] = useState(null);

  const { data: presupuestos, isLoading } = usePresupuestos();
  const { data: categoriasData } = useCategorias({ tipo: "salida" });
  const categorias = categoriasData?.flat || [];
  const categoriasTree = categoriasData?.tree || [];

  const createMutation = useCreatePresupuesto();
  const updateMutation = useUpdatePresupuesto();
  const deleteMutation = useDeletePresupuesto();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const watchedCategoriaId = watch("categoria_id");

  // KPIs
  const kpis = useMemo(() => {
    if (!presupuestos?.length) return { total: 0, asignado: 0, consumido: 0, promedio: 0 };
    const asignado = presupuestos.reduce((a, p) => a + Number(p.monto_limite), 0);
    const consumido = presupuestos.reduce((a, p) => a + Number(p.monto_consumido), 0);
    const promedio = Math.round(
      presupuestos.reduce((a, p) => a + (p.porcentaje_consumido || 0), 0) / presupuestos.length,
    );
    return { total: presupuestos.length, asignado, consumido, promedio };
  }, [presupuestos]);

  const getProgressClass = (pct) => {
    if (pct >= 100) return styles.danger;
    if (pct >= 80) return styles.warning;
    return "";
  };

  // AG Grid columns
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Categoría",
        field: "categoria_nombre",
        flex: 1.2,
        filter: true,
        minWidth: 150,
        sortable: true,
        cellRenderer: (p) => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {p.data.categoria_icono ? (
              <span style={{ display: "flex", alignItems: "center", color: p.data.categoria_color || "inherit" }}>
                <CategoriaIcons name={p.data.categoria_icono} />
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", color: "var(--color-texto-muted)" }}>
                <CategoriaIcons name="FaFolder" />
              </span>
            )}
            {p.data.categoria_color && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: p.data.categoria_color,
                  flexShrink: 0,
                }}
              />
            )}
            <span>{p.value || "General (todas)"}</span>
          </div>
        ),
      },
      {
        headerName: "Periodo",
        field: "periodo",
        flex: 0.7,
        minWidth: 120,
        cellRenderer: (p) => <Badge label={p.value} variant="info" />,
      },
      { headerName: "Límite", field: "monto_limite", flex: 0.8, minWidth: 120, valueFormatter: (p) => formatCurrency(p.value) },
      {
        headerName: "Consumido",
        field: "monto_consumido",
        flex: 0.8,
        minWidth: 120,
        cellStyle: (p) => ({
          color: Number(p.value) > Number(p.data.monto_limite) ? "var(--color-error)" : "var(--color-texto-body)",
          fontWeight: 600,
        }),
        valueFormatter: (p) => formatCurrency(p.value),
      },
      {
        headerName: "Progreso",
        flex: 1.2,
        minWidth: 140,
        cellRenderer: (p) => {
          const pct = p.data.porcentaje_consumido || 0;
          return (
            <div className={styles.progressWrapper}>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${getProgressClass(pct)}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span className={styles.progressPercent}>{pct}%</span>
            </div>
          );
        },
      },
      { headerName: "Restante", field: "monto_restante", flex: 0.8, minWidth: 120, valueFormatter: (p) => formatCurrency(p.value) },
      {
        headerName: "Periodo",
        flex: 0.8,
        minWidth: 140,
        valueGetter: (p) =>
          `${dayjs.utc(p.data.fecha_inicio).format("DD/MM")} - ${p.data.fecha_fin ? dayjs.utc(p.data.fecha_fin).format("DD/MM") : "∞"}`,
      },
      {
        headerName: "Acciones",
        flex: 0.7,
        sortable: false,
        filter: false,
        minWidth: 120,
        cellRenderer: (p) => (
          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={() => handleEdit(p.data)} title="Editar">
              <FiEdit2 />
            </button>
            <button
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              onClick={() => handleDelete(p.data.id)}
              title="Eliminar"
            >
              <FiTrash2 />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const defaultColDef = useMemo(() => ({ resizable: true }), []);

  const handleEdit = (presupuesto) => {
    setEditingPresupuesto(presupuesto);
    reset({
      categoria_id: presupuesto.categoria_id || "",
      monto_limite: presupuesto.monto_limite,
      periodo: presupuesto.periodo,
      fecha_inicio: dayjs.utc(presupuesto.fecha_inicio).format("YYYY-MM-DD"),
      fecha_fin: presupuesto.fecha_fin ? dayjs.utc(presupuesto.fecha_fin).format("YYYY-MM-DD") : "",
    });
    setModalOpen(true);
  };

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("¿Estás seguro de eliminar este presupuesto?")) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation],
  );

  const handleOpenCreate = () => {
    setEditingPresupuesto(null);
    reset({
      categoria_id: "",
      monto_limite: "",
      periodo: "mensual",
      fecha_inicio: dayjs().startOf("month").format("YYYY-MM-DD"),
      fecha_fin: "",
    });
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      categoria_id: data.categoria_id || null,
      monto_limite: Number(data.monto_limite),
      fecha_fin: data.fecha_fin || null,
    };
    if (editingPresupuesto) {
      updateMutation.mutate({ id: editingPresupuesto.id, ...payload }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Presupuestos</h1>
            <p className={styles.pageSubtitle}>Controla el gasto por categoría con límites presupuestarios</p>
          </div>
          <button className={styles.primaryBtn} onClick={handleOpenCreate}>
            <FiPlus /> Nuevo Presupuesto
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
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard label="Total Presupuestos" value={kpis.total} color="primary" />
            <KpiCard label="Total Asignado" value={formatCurrency(kpis.asignado)} color="info" />
            <KpiCard
              label="Total Consumido"
              value={formatCurrency(kpis.consumido)}
              color={kpis.promedio >= 80 ? "error" : "warning"}
            />
            <KpiCard
              label="% Promedio Uso"
              value={`${kpis.promedio}%`}
              color={kpis.promedio >= 80 ? "error" : "success"}
            />
          </>
        )}
      </div>

      {/* AG Grid Table */}
      <div className={styles.tableCard}>
        {!isLoading && (!presupuestos || presupuestos.length === 0) ? (
          <EmptyState
            title="Sin presupuestos"
            description="Crea presupuestos para controlar tus gastos por categoría."
            icon="📊"
            action={
              <button className={styles.primaryBtn} onClick={handleOpenCreate}>
                <FiPlus /> Crear primer presupuesto
              </button>
            }
          />
        ) : (
          <div className={styles.gridContainer}>
            <AgGridReact
              rowData={presupuestos || []}
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

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPresupuesto ? "Editar Presupuesto" : "Nuevo Presupuesto"}
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button
              className={styles.primaryBtn}
              onClick={handleSubmit(onSubmit)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingPresupuesto ? "Guardar Cambios" : "Crear Presupuesto"}
            </button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Categoría (salida)</label>
            <CategoriaTreeSelect
              treeData={categoriasTree}
              flatData={categorias}
              value={watchedCategoriaId}
              onChange={(val) => setValue("categoria_id", val, { shouldValidate: true })}
              placeholder="General (todas las categorías)"
            />
            <input type="hidden" {...register("categoria_id")} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Monto Límite *</label>
              <input
                className={styles.formInput}
                type="number"
                step="0.01"
                {...register("monto_limite", {
                  required: "El monto límite es requerido",
                  min: { value: 0.01, message: "Debe ser mayor a 0" },
                })}
                placeholder="0.00"
              />
              {errors.monto_limite && <span className={styles.formError}>{errors.monto_limite.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Periodo *</label>
              <select className={styles.formInput} {...register("periodo", { required: "El periodo es requerido" })}>
                {PERIODOS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha Inicio *</label>
              <input
                className={styles.formInput}
                type="date"
                {...register("fecha_inicio", { required: "La fecha inicio es requerida" })}
              />
              {errors.fecha_inicio && <span className={styles.formError}>{errors.fecha_inicio.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha Fin (opcional)</label>
              <input className={styles.formInput} type="date" {...register("fecha_fin")} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PresupuestosPage;
