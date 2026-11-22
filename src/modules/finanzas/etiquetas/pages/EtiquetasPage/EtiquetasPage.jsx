import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useEtiquetas, useCreateEtiqueta, useUpdateEtiqueta, useDeleteEtiqueta } from "../../hooks/useEtiquetas";
import KpiCard from "../../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../../components/ui/Skeleton/Skeleton";
import Modal from "../../../../../components/ui/Modal/Modal";
import Breadcrumb from "../../../../../components/ui/Breadcrumb/Breadcrumb";
import EmptyState from "../../../../../components/ui/EmptyState/EmptyState";
import styles from "./EtiquetasPage.module.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const PALETTE_COLORS = [
  "#97E3C5",
  "#F99EB7",
  "#99BAFF",
  "#FDE199",
  "#67bb6a",
  "#C6A4FF",
  "#F3CBA9",
  "#FFA399",
  "#BFF996",
  "#CEE4FF",
];

const EtiquetasPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEtiqueta, setEditingEtiqueta] = useState(null);

  const { data: etiquetas, isLoading } = useEtiquetas();
  const createMutation = useCreateEtiqueta();
  const updateMutation = useUpdateEtiqueta();
  const deleteMutation = useDeleteEtiqueta();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const colorVal = watch("color") || PALETTE_COLORS[0];

  // KPIs
  const kpis = useMemo(() => {
    if (!etiquetas?.length) return { total: 0, masUsada: "—" };
    const sorted = [...etiquetas].sort((a, b) => (b.total_transacciones || 0) - (a.total_transacciones || 0));
    return {
      total: etiquetas.length,
      masUsada: sorted[0]?.nombre || "—",
      totalTransacciones: etiquetas.reduce((acc, e) => acc + (e.total_transacciones || 0), 0),
    };
  }, [etiquetas]);

  // AG Grid columns
  const columnDefs = useMemo(
    () => [
      { headerName: "Nombre", field: "nombre", flex: 2, filter: true, sortable: true, minWidth: 130 },
      {
        headerName: "Color",
        field: "color",
        flex: 1,
        minWidth: 100,
        cellRenderer: (params) => (
          <div className={styles.colorCell}>
            <span className={styles.colorDot} style={{ backgroundColor: params.value }} />
            <span>{params.value}</span>
          </div>
        ),
      },
      {
        headerName: "Transacciones",
        field: "total_transacciones",
        flex: 1,
        minWidth: 120,
        sortable: true,
        cellStyle: { textAlign: "center", justifyContent: "center" },
        valueFormatter: (params) => params.value || 0,
      },
      {
        headerName: "Acciones",
        flex: 0.8,
        sortable: false,
        minWidth: 120,
        filter: false,
        cellRenderer: (params) => (
          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={() => handleEdit(params.data)} title="Editar">
              <FiEdit2 />
            </button>
            <button
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              onClick={() => handleDelete(params.data.id)}
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

  const handleEdit = (etiqueta) => {
    setEditingEtiqueta(etiqueta);
    reset({ nombre: etiqueta.nombre, color: etiqueta.color || PALETTE_COLORS[0] });
    setModalOpen(true);
  };

  const handleDelete = useCallback(
    (id) => {
      if (
        window.confirm(
          "¿Estás seguro de eliminar esta etiqueta? Se eliminarán también las relaciones con transacciones.",
        )
      ) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation],
  );

  const handleOpenCreate = () => {
    setEditingEtiqueta(null);
    reset({ nombre: "", color: PALETTE_COLORS[0] });
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingEtiqueta) {
      updateMutation.mutate({ id: editingEtiqueta.id, ...data }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(data, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Etiquetas</h1>
            <p className={styles.pageSubtitle}>Administra las etiquetas para clasificar transacciones</p>
          </div>
          <button className={styles.primaryBtn} onClick={handleOpenCreate}>
            <FiPlus /> Nueva Etiqueta
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
            <KpiCard label="Total Etiquetas" value={kpis.total} color="primary" />
            <KpiCard label="Más Usada" value={kpis.masUsada} color="info" />
            <KpiCard label="Total Asociaciones" value={kpis.totalTransacciones} color="success" />
          </>
        )}
      </div>

      {/* AG Grid Table */}
      <div className={styles.tableCard}>
        {!isLoading && (!etiquetas || etiquetas.length === 0) ? (
          <EmptyState
            title="Sin etiquetas"
            description="Aún no tienes etiquetas registradas. Crea tu primera etiqueta para clasificar transacciones."
            icon="🏷️"
            action={
              <button className={styles.primaryBtn} onClick={handleOpenCreate}>
                <FiPlus /> Crear primera etiqueta
              </button>
            }
          />
        ) : (
          <div className={styles.gridContainer}>
            <AgGridReact
              rowData={etiquetas || []}
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
        title={editingEtiqueta ? "Editar Etiqueta" : "Nueva Etiqueta"}
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
              {editingEtiqueta ? "Guardar Cambios" : "Crear Etiqueta"}
            </button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre *</label>
            <input
              className={styles.formInput}
              {...register("nombre", { required: "El nombre es requerido" })}
              placeholder="Ej: Urgente"
            />
            {errors.nombre && <span className={styles.formError}>{errors.nombre.message}</span>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Color</label>
            <div className={styles.paletteGrid}>
              {PALETTE_COLORS.map((hex) => {
                const isSelected = (colorVal || "").toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    className={`${styles.colorCircle} ${isSelected ? styles.colorCircleActive : ""}`}
                    style={{ backgroundColor: hex }}
                    onClick={() => setValue("color", hex, { shouldValidate: true })}
                    title={hex}
                    aria-label={`Seleccionar color ${hex}`}
                    aria-pressed={isSelected}
                  >
                    {isSelected && <span className={styles.checkMark}>✓</span>}
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register("color")} />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EtiquetasPage;
