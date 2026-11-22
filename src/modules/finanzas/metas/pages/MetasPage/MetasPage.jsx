import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign } from "react-icons/fi";
import { useMetas, useCreateMeta, useUpdateMeta, useAbonarMeta, useUpdateMetaEstado, useDeleteMeta } from "../../hooks/useMetas";
import KpiCard from "../../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../../components/ui/Skeleton/Skeleton";
import Modal from "../../../../../components/ui/Modal/Modal";
import Badge from "../../../../../components/ui/Badge/Badge";
import EmptyState from "../../../../../components/ui/EmptyState/EmptyState";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import styles from "./MetasPage.module.css";

dayjs.extend(utc);

const formatCurrency = (v) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(v || 0);

const ESTADOS_META = [
  { value: "en_progreso", label: "En progreso" },
  { value: "cumplida", label: "Cumplida" },
  { value: "pausada", label: "Pausada" },
  { value: "cancelada", label: "Cancelada" },
];

const getEstadoLabel = (estado) => {
  const found = ESTADOS_META.find((e) => e.value === estado);
  return found ? found.label : estado;
};

const getEstadoBadgeVariant = (estado) => {
  switch (estado) {
    case "en_progreso": return "primary";
    case "cumplida": return "success";
    case "pausada": return "warning";
    case "cancelada": return "error";
    default: return "info";
  }
};

const MetasPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [abonarModal, setAbonarModal] = useState(null); // meta to abonar
  const [editingMeta, setEditingMeta] = useState(null);

  const { data: metas, isLoading } = useMetas();
  const createMutation = useCreateMeta();
  const updateMutation = useUpdateMeta();
  const abonarMutation = useAbonarMeta();
  const updateEstadoMutation = useUpdateMetaEstado();
  const deleteMutation = useDeleteMeta();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: regAbonar, handleSubmit: submitAbonar, reset: resetAbonar, formState: { errors: errAbonar } } = useForm();

  // KPIs
  const kpis = useMemo(() => {
    if (!metas?.length) return { activas: 0, cumplidas: 0, pausadas: 0, ahorroTotal: 0 };
    return {
      activas: metas.filter((m) => m.estado === "en_progreso").length,
      cumplidas: metas.filter((m) => m.estado === "cumplida").length,
      pausadas: metas.filter((m) => m.estado === "pausada").length,
      ahorroTotal: metas.filter((m) => m.estado === "en_progreso").reduce((a, m) => a + Number(m.monto_actual), 0),
    };
  }, [metas]);

  const handleEdit = (meta) => {
    setEditingMeta(meta);
    reset({
      nombre: meta.nombre,
      monto_objetivo: meta.monto_objetivo,
      fecha_objetivo: meta.fecha_objetivo ? dayjs.utc(meta.fecha_objetivo).format("YYYY-MM-DD") : "",
      estado: meta.estado,
    });
    setModalOpen(true);
  };

  const handleDelete = useCallback((id) => {
    if (window.confirm("¿Estás seguro de cancelar esta meta?")) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleOpenCreate = () => {
    setEditingMeta(null);
    reset({ nombre: "", monto_objetivo: "", fecha_objetivo: "", estado: "en_progreso" });
    setModalOpen(true);
  };

  const handleOpenAbonar = (meta) => {
    setAbonarModal(meta);
    resetAbonar({ monto: "" });
  };

  const onSubmit = (data) => {
    const { estado, ...rest } = data;
    const payload = { ...rest, monto_objetivo: Number(rest.monto_objetivo), fecha_objetivo: rest.fecha_objetivo || null };

    if (editingMeta) {
      // Update meta data
      updateMutation.mutate({ id: editingMeta.id, ...payload }, {
        onSuccess: () => {
          // If estado changed, update it separately
          if (estado && estado !== editingMeta.estado) {
            updateEstadoMutation.mutate({ id: editingMeta.id, estado }, {
              onSuccess: () => setModalOpen(false),
            });
          } else {
            setModalOpen(false);
          }
        },
      });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  const onAbonar = (data) => {
    abonarMutation.mutate({ id: abonarModal.id, monto: Number(data.monto) }, { onSuccess: () => setAbonarModal(null) });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Metas de Ahorro</h1>
            <p className={styles.pageSubtitle}>Define y alcanza tus objetivos de ahorro</p>
          </div>
          <button className={styles.primaryBtn} onClick={handleOpenCreate}>
            <FiPlus /> Nueva Meta
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {isLoading ? (
          <><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /></>
        ) : (
          <>
            <KpiCard label="Metas Activas" value={kpis.activas} color="primary" />
            <KpiCard label="Metas Cumplidas" value={kpis.cumplidas} color="success" />
            <KpiCard label="Pausadas" value={kpis.pausadas} color="warning" />
            <KpiCard label="Ahorro Total" value={formatCurrency(kpis.ahorroTotal)} color="info" />
          </>
        )}
      </div>

      {/* Metas Cards Grid */}
      {!isLoading && (!metas || metas.length === 0) ? (
        <div className={styles.emptyWrapper}>
          <EmptyState
            title="Sin metas de ahorro"
            description="Define tu primera meta para empezar a ahorrar."
            icon="🎯"
            action={<button className={styles.primaryBtn} onClick={handleOpenCreate}><FiPlus /> Crear primera meta</button>}
          />
        </div>
      ) : (
        <div className={styles.metasGrid}>
          {(metas || []).map((meta) => (
            <div key={meta.id} className={`${styles.metaCard} ${meta.estado === "pausada" ? styles.metaCardPaused : ""}`}>
              <div className={styles.metaCardHeader}>
                <div>
                  <h3 className={styles.metaName}>{meta.nombre}</h3>
                  <Badge
                    label={getEstadoLabel(meta.estado)}
                    variant={getEstadoBadgeVariant(meta.estado)}
                  />
                </div>
                <div className={styles.metaCardActions}>
                  <button className={styles.metaCardBtn} onClick={() => handleEdit(meta)} title="Editar"><FiEdit2 /></button>
                  {meta.estado === "en_progreso" && (
                    <button className={`${styles.metaCardBtn} ${styles.metaCardBtnDanger}`} onClick={() => handleDelete(meta.id)} title="Cancelar"><FiTrash2 /></button>
                  )}
                </div>
              </div>

              <div className={styles.metaProgress}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressPercent}>{meta.porcentaje}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={`${styles.progressFill} ${meta.estado === "pausada" ? styles.progressFillPaused : ""}`} style={{ width: `${Math.min(meta.porcentaje, 100)}%` }} />
                </div>
                <div className={styles.progressAmounts}>
                  <span><strong>{formatCurrency(meta.monto_actual)}</strong> ahorrado</span>
                  <span>Objetivo: <strong>{formatCurrency(meta.monto_objetivo)}</strong></span>
                </div>
              </div>

              <div className={styles.metaFooter}>
                <div>
                  {meta.fecha_objetivo && (
                    <span className={styles.metaDate}>📅 {dayjs.utc(meta.fecha_objetivo).format("DD MMM YYYY")}</span>
                  )}
                  {meta.monto_faltante > 0 && (
                    <span className={styles.metaFaltante}> — Faltan {formatCurrency(meta.monto_faltante)}</span>
                  )}
                </div>
                {meta.estado === "en_progreso" && (
                  <button className={styles.abonarBtn} onClick={() => handleOpenAbonar(meta)}>
                    <FiDollarSign /> Abonar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMeta ? "Editar Meta" : "Nueva Meta"}
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className={styles.primaryBtn} onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending || updateMutation.isPending || updateEstadoMutation.isPending}>
              {editingMeta ? "Guardar Cambios" : "Crear Meta"}
            </button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre *</label>
            <input className={styles.formInput} {...register("nombre", { required: "El nombre es requerido" })} placeholder="Ej: Fondo de emergencia" />
            {errors.nombre && <span className={styles.formError}>{errors.nombre.message}</span>}
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Monto Objetivo *</label>
              <input className={styles.formInput} type="number" step="0.01" {...register("monto_objetivo", { required: "El monto es requerido", min: { value: 1, message: "Debe ser mayor a 0" } })} placeholder="0.00" />
              {errors.monto_objetivo && <span className={styles.formError}>{errors.monto_objetivo.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha Objetivo</label>
              <input className={styles.formInput} type="date" {...register("fecha_objetivo")} />
            </div>
          </div>
          {editingMeta && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Estado</label>
              <select className={styles.formInput} {...register("estado")}>
                {ESTADOS_META.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
          )}
        </form>
      </Modal>

      {/* Modal Abonar */}
      <Modal
        isOpen={!!abonarModal}
        onClose={() => setAbonarModal(null)}
        title={`Abonar a: ${abonarModal?.nombre || ""}`}
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setAbonarModal(null)}>Cancelar</button>
            <button className={styles.primaryBtn} onClick={submitAbonar(onAbonar)} disabled={abonarMutation.isPending}>
              Registrar Abono
            </button>
          </>
        }
      >
        <form className={styles.form} onSubmit={submitAbonar(onAbonar)}>
          {abonarModal && (
            <p style={{ color: "var(--color-texto-secundario)", fontSize: 14, margin: 0 }}>
              Progreso actual: {formatCurrency(abonarModal.monto_actual)} / {formatCurrency(abonarModal.monto_objetivo)} ({abonarModal.porcentaje}%)
            </p>
          )}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Monto a Abonar *</label>
            <input className={styles.formInput} type="number" step="0.01" {...regAbonar("monto", { required: "El monto es requerido", min: { value: 0.01, message: "Debe ser mayor a 0" } })} placeholder="0.00" />
            {errAbonar.monto && <span className={styles.formError}>{errAbonar.monto.message}</span>}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MetasPage;
