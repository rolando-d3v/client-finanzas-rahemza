import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSettings,
  FiLayers,
  FiInfo,
  FiDollarSign,
  FiSliders,
  FiClock,
  FiCheck,
  FiX,
  FiToggleRight,
  FiList,
  FiCode,
  FiArrowUp,
  FiArrowDown,
  FiCopy,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import {
  useCreatePlan,
  useUpdatePlan,
  useTogglePlan,
  useDeletePlan,
  useSyncModulosPlan,
} from "../../../hooks/usePlanRoles";
import KpiCard from "../../../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../../../components/ui/Skeleton/Skeleton";
import Modal from "../../../../../../components/ui/Modal/Modal";
import DynamicIcon from "../../../../../../layouts/Sidebar/DynamicIcon";
import styles from "./planes.module.css";

const TabPlanes = ({ planes, modulosTree, modulosFlat, isLoading }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modulosModalOpen, setModulosModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedModulos, setSelectedModulos] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Estado para gestión dinámica de características (array jsonb)
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [featureTab, setFeatureTab] = useState("visual"); // "visual" | "json"
  const [rawJson, setRawJson] = useState("[]");
  const [jsonError, setJsonError] = useState(null);
  const [draggedIdx, setDraggedIdx] = useState(null);

  const createMut = useCreatePlan();
  const updateMut = useUpdatePlan();
  const toggleMut = useTogglePlan();
  const deleteMut = useDeletePlan();
  const syncMut = useSyncModulosPlan();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      precio_mensual: "",
      precio_anual: "",
      dias_prueba: 0,
      max_cuentas: 1,
      max_usuarios: 0,
      max_sucursales: 0,
      max_almacenes: 0,
      disponible: true,
      activo: true,
    },
  });

  const watchDisponible = watch("disponible", true);
  const watchActivo = watch("activo", true);

  const kpis = useMemo(() => ({
    total: planes.length,
    activos: planes.filter((p) => p.activo).length,
    inactivos: planes.filter((p) => !p.activo).length,
  }), [planes]);

  const getFeatures = (plan) => {
    if (Array.isArray(plan?.caracteristicas)) return plan.caracteristicas;
    try {
      return JSON.parse(plan?.caracteristicas || "[]");
    } catch {
      return [];
    }
  };

  // ── Handlers de Características (Lista Visual) ──
  const handleAddFeature = (e) => {
    e?.preventDefault();
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    setCaracteristicas((prev) => {
      const next = [...prev, trimmed];
      setRawJson(JSON.stringify(next, null, 2));
      setJsonError(null);
      return next;
    });
    setNewFeatureText("");
  };

  const handleRemoveFeature = (idx) => {
    setCaracteristicas((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setRawJson(JSON.stringify(next, null, 2));
      setJsonError(null);
      return next;
    });
    if (editingIndex === idx) {
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    setCaracteristicas((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      setRawJson(JSON.stringify(next, null, 2));
      setJsonError(null);
      return next;
    });
  };

  const handleMoveDown = (index) => {
    if (index >= caracteristicas.length - 1) return;
    setCaracteristicas((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      setRawJson(JSON.stringify(next, null, 2));
      setJsonError(null);
      return next;
    });
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditingValue(caracteristicas[index] || "");
  };

  const handleSaveEdit = (index) => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    setCaracteristicas((prev) => {
      const next = [...prev];
      next[index] = trimmed;
      setRawJson(JSON.stringify(next, null, 2));
      setJsonError(null);
      return next;
    });
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  // ── Drag & Drop Handlers ──
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    setCaracteristicas((prev) => {
      const next = [...prev];
      const [movedItem] = next.splice(draggedIdx, 1);
      next.splice(targetIdx, 0, movedItem);
      setRawJson(JSON.stringify(next, null, 2));
      setJsonError(null);
      return next;
    });
    setDraggedIdx(null);
  };

  // ── Handlers de Editor JSON ──
  const handleRawJsonChange = (val) => {
    setRawJson(val);
    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed)) {
        setJsonError("El JSON debe ser un arreglo de textos: [\"Característica 1\", \"Característica 2\"]");
        return;
      }
      setCaracteristicas(parsed.map((item) => String(item)));
      setJsonError(null);
    } catch (err) {
      setJsonError(err.message);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setRawJson(formatted);
      setJsonError(null);
      toast.success("JSON formateado correctamente ✔️");
    } catch (err) {
      toast.error("No se puede formatear: error de sintaxis JSON");
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(rawJson);
    toast.success("JSON copiado al portapapeles 📋");
  };

  const handleLoadTemplate = () => {
    const template = [
      "Gestión de finanzas e ingresos",
      "Facturación electrónica ilimitada",
      "Control de stock e inventario",
      "Reportes ejecutivos en tiempo real",
      "Soporte técnico prioritario 24/7",
    ];
    setCaracteristicas(template);
    setRawJson(JSON.stringify(template, null, 2));
    setJsonError(null);
    toast.success("Plantilla de características cargada ✔️");
  };

  // ── Apertura y Edición de Modal ──
  const handleOpenCreate = () => {
    setEditing(null);
    setCaracteristicas([]);
    setNewFeatureText("");
    setEditingIndex(null);
    setEditingValue("");
    setFeatureTab("visual");
    setRawJson("[]");
    setJsonError(null);
    reset({
      codigo: "",
      nombre: "",
      descripcion: "",
      precio_mensual: "",
      precio_anual: "",
      dias_prueba: 0,
      max_cuentas: 1,
      max_usuarios: 0,
      max_sucursales: 0,
      max_almacenes: 0,
      disponible: true,
      activo: true,
    });
    setModalOpen(true);
  };

  const handleEdit = (plan) => {
    setEditing(plan);
    const feats = getFeatures(plan);
    setCaracteristicas(feats);
    setNewFeatureText("");
    setEditingIndex(null);
    setEditingValue("");
    setFeatureTab("visual");
    setRawJson(JSON.stringify(feats, null, 2));
    setJsonError(null);
    reset({
      codigo: plan.codigo,
      nombre: plan.nombre,
      descripcion: plan.descripcion || "",
      precio_mensual: plan.precio_mensual,
      precio_anual: plan.precio_anual ?? "",
      dias_prueba: plan.dias_prueba ?? 0,
      max_cuentas: plan.max_cuentas ?? 1,
      max_usuarios: plan.max_usuarios ?? 0,
      max_sucursales: plan.max_sucursales ?? 0,
      max_almacenes: plan.max_almacenes ?? 0,
      disponible: plan.disponible !== false,
      activo: plan.activo !== false,
    });
    setModalOpen(true);
  };

  const parseLimit = (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    const parsed = Number(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  const onSubmit = (data) => {
    if (featureTab === "json" && jsonError) {
      toast.error("Corrige los errores en el JSON de características antes de guardar");
      return;
    }

    const payload = {
      codigo: data.codigo.trim(),
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null,
      precio_mensual: Number(data.precio_mensual),
      precio_anual:
        data.precio_anual !== "" && data.precio_anual !== null && data.precio_anual !== undefined
          ? Number(data.precio_anual)
          : null,
      dias_prueba: Number(data.dias_prueba) || 0,
      max_cuentas: parseLimit(data.max_cuentas) || 1,
      max_usuarios: parseLimit(data.max_usuarios),
      max_sucursales: parseLimit(data.max_sucursales),
      max_almacenes: parseLimit(data.max_almacenes),
      disponible: Boolean(data.disponible),
      activo: Boolean(data.activo),
      caracteristicas,
    };

    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMut.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  const handleOpenModulos = (plan) => {
    setSelectedPlan(plan);
    setSelectedModulos(plan.modulos?.map((m) => m.modulo_id) || []);
    setModulosModalOpen(true);
  };

  const handleToggleModulo = (moduloId) => {
    setSelectedModulos((prev) =>
      prev.includes(moduloId) ? prev.filter((id) => id !== moduloId) : [...prev, moduloId]
    );
  };

  const handleSelectAll = () => {
    if (selectedModulos.length === modulosFlat.length) {
      setSelectedModulos([]);
    } else {
      setSelectedModulos(modulosFlat.map((m) => m.id));
    }
  };

  const handleSaveModulos = () => {
    syncMut.mutate({ id: selectedPlan.id, modulo_ids: selectedModulos }, { onSuccess: () => setModulosModalOpen(false) });
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteMut.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) });
    }
  };

  const formatLimit = (val) => (val === null || val === undefined ? 0 : val);

  return (
    <>
      <div className={styles.kpiGrid}>
        {isLoading ? (
          <><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /></>
        ) : (
          <>
            <KpiCard label="Total Planes" value={kpis.total} color="primary" />
            <KpiCard label="Activos" value={kpis.activos} color="success" />
            <KpiCard label="Inactivos" value={kpis.inactivos} color="error" />
          </>
        )}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft} />
        <button className={styles.primaryBtn} onClick={handleOpenCreate}>
          <FiPlus /> Nuevo Plan
        </button>
      </div>

      {!isLoading && planes.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>💳</span>
            <h3 className={styles.emptyTitle}>Sin planes</h3>
            <p className={styles.emptyText}>No hay planes registrados. Crea el primer plan de suscripción.</p>
            <button className={styles.primaryBtn} onClick={handleOpenCreate}><FiPlus /> Crear primer plan</button>
          </div>
        </div>
      ) : (
        <div className={styles.plansGrid}>
          {planes.map((plan) => {
            const planFeatures = getFeatures(plan);
            return (
              <div key={plan.id} className={`${styles.planCard} ${!plan.activo ? styles.planCardInactive : ""}`}>
                <div className={styles.planHeader}>
                  <div className={styles.planInfo}>
                    <h3 className={styles.planName}>{plan.nombre}</h3>
                    <span className={styles.planCode}>{plan.codigo}</span>
                  </div>
                  <div className={styles.planBadges}>
                    <span className={`${styles.badge} ${plan.activo ? styles.badgeActive : styles.badgeInactive}`}>
                      {plan.activo ? "Activo" : "Inactivo"}
                    </span>
                    <span className={`${styles.badge} ${plan.disponible !== false ? styles.badgeDisponible : styles.badgeNoDisponible}`}>
                      {plan.disponible !== false ? "Disponible" : "Próximamente"}
                    </span>
                  </div>
                </div>

                {plan.descripcion && <p className={styles.planDesc}>{plan.descripcion}</p>}

                <div className={styles.planPricing}>
                  <span className={styles.planPrice}>S/ {plan.precio_mensual}</span>
                  <span className={styles.planPeriod}>/mes</span>
                </div>
                {plan.precio_anual && (
                  <p className={styles.planPriceAnnual}>S/ {plan.precio_anual} /año</p>
                )}

                <div className={styles.planLimits}>
                  <span className={styles.planLimitChip}>
                    🏦 {formatLimit(plan.max_cuentas)} cuentas
                  </span>
                  <span className={styles.planLimitChip}>
                    👥 {formatLimit(plan.max_usuarios)} usuarios
                  </span>
                  <span className={styles.planLimitChip}>
                    🏢 {formatLimit(plan.max_sucursales)} sucursales
                  </span>
                  <span className={styles.planLimitChip}>
                    📦 {formatLimit(plan.max_almacenes)} almacenes
                  </span>
                  {Number(plan.dias_prueba) > 0 && (
                    <span className={styles.planLimitChip}>
                      ⏱️ {plan.dias_prueba} días prueba
                    </span>
                  )}
                </div>

                {planFeatures.length > 0 && (
                  <div className={styles.planFeaturesPreview}>
                    <span className={styles.planFeaturesTitle}>
                      <FiCheck size={12} /> {planFeatures.length} características incluidas
                    </span>
                    <ul className={styles.planFeaturesList}>
                      {planFeatures.slice(0, 3).map((feat, i) => (
                        <li key={i} className={styles.planFeatureItem}>• {feat}</li>
                      ))}
                      {planFeatures.length > 3 && (
                        <li className={styles.planFeatureMore}>+{planFeatures.length - 3} más...</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className={styles.planModuleCount}>
                  <FiLayers /> <strong>{plan.modulos?.length || 0}</strong> módulos asignados
                </div>

                <div className={styles.planActions}>
                  <button className={styles.iconBtn} onClick={() => handleOpenModulos(plan)} title="Configurar módulos">
                    <FiSettings />
                  </button>
                  <button className={styles.iconBtn} onClick={() => handleEdit(plan)} title="Editar">
                    <FiEdit2 />
                  </button>
                  <button
                    className={`${styles.toggleSwitch} ${plan.activo ? styles.toggleSwitchOn : styles.toggleSwitchOff}`}
                    onClick={() => toggleMut.mutate(plan.id)}
                    title={plan.activo ? "Desactivar" : "Activar"}
                  >
                    <span className={`${styles.toggleKnob} ${plan.activo ? styles.toggleKnobOn : styles.toggleKnobOff}`} />
                  </button>
                  <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setConfirmDelete(plan)} title="Eliminar">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear/Editar Plan */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Editar Plan: ${editing.nombre}` : "Nuevo Plan de Suscripción"}
        size="lg"
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className={styles.primaryBtn} onClick={handleSubmit(onSubmit)} disabled={createMut.isPending || updateMut.isPending}>
              {editing ? "Guardar Cambios" : "Crear Plan"}
            </button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          {/* SECCIÓN 1: Información Básica */}
          <div className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <span className={styles.formSectionIcon}><FiInfo /></span>
              <span>Información Básica del Plan</span>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Código *</label>
                <input
                  className={styles.formInput}
                  {...register("codigo", { required: "El código es requerido" })}
                  placeholder="Ej: BAS, PRO, FIN, CORP"
                />
                {errors.codigo && <span className={styles.formError}>{errors.codigo.message}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre del Plan *</label>
                <input
                  className={styles.formInput}
                  {...register("nombre", { required: "El nombre es requerido" })}
                  placeholder="Ej: Básico, Profesional, Corporativo"
                />
                {errors.nombre && <span className={styles.formError}>{errors.nombre.message}</span>}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Descripción</label>
              <textarea
                className={styles.formTextarea}
                {...register("descripcion")}
                placeholder="Describe el enfoque, ventajas o público objetivo de este plan..."
              />
            </div>
          </div>

          {/* SECCIÓN 2: Precios y Período de Prueba */}
          <div className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <span className={styles.formSectionIcon}><FiDollarSign /></span>
              <span>Precios y Período de Prueba</span>
            </div>
            <div className={styles.formRow3}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Precio Mensual (S/) *</label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputPrefix}>S/</span>
                  <input
                    className={styles.formInput}
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("precio_mensual", { required: "El precio mensual es requerido" })}
                    placeholder="0.00"
                  />
                </div>
                {errors.precio_mensual && <span className={styles.formError}>{errors.precio_mensual.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Precio Anual (S/)</label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputPrefix}>S/</span>
                  <input
                    className={styles.formInput}
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("precio_anual")}
                    placeholder="0.00"
                  />
                </div>
                <span className={styles.formHint}>Opcional (con descuento anual)</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Días de Prueba Gratis</label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputPrefix}><FiClock size={14} /></span>
                  <input
                    className={styles.formInput}
                    type="number"
                    min="0"
                    step="1"
                    {...register("dias_prueba")}
                    placeholder="0"
                  />
                </div>
                <span className={styles.formHint}>0 = Sin prueba (ej: 14 o 30 días)</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Límites de Uso */}
          <div className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <span className={styles.formSectionIcon}><FiSliders /></span>
              <span>Límites de Capacidad (0 = Ilimitado)</span>
            </div>
            <div className={styles.formRow2x2}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Máx. Cuentas Financieras</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  {...register("max_cuentas")}
                  placeholder="1"
                />
                <span className={styles.formHint}>Default: 1 cuenta bancaria/caja</span>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Máx. Usuarios</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  {...register("max_usuarios")}
                  placeholder="0"
                />
                <span className={styles.formHint}>0 = Sin límite de usuarios</span>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Máx. Sucursales</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  {...register("max_sucursales")}
                  placeholder="0"
                />
                <span className={styles.formHint}>0 = Sin límite de sucursales</span>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Máx. Almacenes</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  {...register("max_almacenes")}
                  placeholder="0"
                />
                <span className={styles.formHint}>0 = Sin límite de almacenes</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: Disponibilidad y Estado (Switches Booleanos) */}
          <div className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <span className={styles.formSectionIcon}><FiToggleRight /></span>
              <span>Disponibilidad y Estado del Plan</span>
            </div>

            {/* Toggle Disponible */}
            <div className={styles.toggleItemRow}>
              <div className={styles.toggleItemInfo}>
                <span className={styles.toggleItemTitle}>Disponible para Contratación (Público)</span>
                <span className={styles.toggleItemDesc}>
                  {watchDisponible
                    ? "Visible y habilitado para que los usuarios puedan suscribirse o cambiar a este plan."
                    : "No disponible públicamente. Se mostrará con la etiqueta 'Próximamente' y botón deshabilitado."}
                </span>
              </div>
              <button
                type="button"
                className={`${styles.toggleSwitch} ${watchDisponible ? styles.toggleSwitchOn : styles.toggleSwitchOff}`}
                onClick={() => setValue("disponible", !watchDisponible, { shouldDirty: true })}
                title={watchDisponible ? "Habilitado" : "Deshabilitado"}
              >
                <span className={`${styles.toggleKnob} ${watchDisponible ? styles.toggleKnobOn : styles.toggleKnobOff}`} />
              </button>
            </div>

            {/* Toggle Activo */}
            <div className={styles.toggleItemRow}>
              <div className={styles.toggleItemInfo}>
                <span className={styles.toggleItemTitle}>Plan Activo en el Sistema</span>
                <span className={styles.toggleItemDesc}>
                  {watchActivo
                    ? "El plan se encuentra activo y reconocido por el sistema."
                    : "El plan está suspendido temporalmente."}
                </span>
              </div>
              <button
                type="button"
                className={`${styles.toggleSwitch} ${watchActivo ? styles.toggleSwitchOn : styles.toggleSwitchOff}`}
                onClick={() => setValue("activo", !watchActivo, { shouldDirty: true })}
                title={watchActivo ? "Activo" : "Inactivo"}
              >
                <span className={`${styles.toggleKnob} ${watchActivo ? styles.toggleKnobOn : styles.toggleKnobOff}`} />
              </button>
            </div>
          </div>

          {/* SECCIÓN 5: Características del Plan (jsonb) */}
          <div className={styles.formSection}>
            <div className={styles.formSectionHeader}>
              <span className={styles.formSectionIcon}><FiList /></span>
              <span>Características y Beneficios del Plan</span>
            </div>

            {/* Selector de Modo: Lista Visual vs Editor JSON */}
            <div className={styles.featureEditorTabs}>
              <div className={styles.featureTabsLeft}>
                <button
                  type="button"
                  className={`${styles.featureTabBtn} ${featureTab === "visual" ? styles.featureTabBtnActive : ""}`}
                  onClick={() => {
                    setFeatureTab("visual");
                    setEditingIndex(null);
                  }}
                >
                  <FiList size={14} />
                  <span>Lista Interactiva</span>
                  <span className={styles.featureCounterBadge}>{caracteristicas.length}</span>
                </button>

                <button
                  type="button"
                  className={`${styles.featureTabBtn} ${featureTab === "json" ? styles.featureTabBtnActive : ""}`}
                  onClick={() => {
                    setRawJson(JSON.stringify(caracteristicas, null, 2));
                    setJsonError(null);
                    setFeatureTab("json");
                  }}
                >
                  <FiCode size={14} />
                  <span>Editor JSON</span>
                </button>
              </div>

              <span className={styles.featureQuickHelp}>
                {featureTab === "visual"
                  ? "Arrastra o usa las flechas ↑↓ para ordenar. Clic en el lápiz para editar."
                  : "Arreglo JSON de strings. Compatible con copiar y pegar."}
              </span>
            </div>

            {featureTab === "visual" ? (
              <div className={styles.featureEditor}>
                {/* Barra para agregar nueva característica */}
                <div className={styles.featureAddBar}>
                  <input
                    className={styles.featureAddInput}
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Escribe una nueva característica (ej: Reportes en PDF ilimitados)..."
                  />
                  <button
                    type="button"
                    className={styles.featureAddBtn}
                    onClick={handleAddFeature}
                    disabled={!newFeatureText.trim()}
                  >
                    <FiPlus /> Agregar
                  </button>
                </div>

                {/* Lista de características ordenables y editables */}
                {caracteristicas.length === 0 ? (
                  <div className={styles.featureEmptyState}>
                    <p className={styles.featureEmptyText}>
                      Aún no hay características en este plan.
                    </p>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      style={{ height: 32, fontSize: 12, padding: "0 12px" }}
                      onClick={handleLoadTemplate}
                    >
                      + Cargar plantilla de ejemplo
                    </button>
                  </div>
                ) : (
                  <div className={styles.featureListContainer}>
                    {caracteristicas.map((item, idx) => {
                      const isEditingThis = editingIndex === idx;
                      return (
                        <div
                          key={idx}
                          className={`${styles.featureItemRow} ${draggedIdx === idx ? styles.featureItemRowDragging : ""}`}
                          draggable={!isEditingThis}
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, idx)}
                        >
                          <div className={styles.featureItemLeft}>
                            <span className={styles.dragHandle} title="Arrastrar para ordenar">
                              ⋮⋮
                            </span>
                            <span className={styles.itemOrderBadge}>#{idx + 1}</span>

                            {isEditingThis ? (
                              <div className={styles.inlineEditWrapper}>
                                <input
                                  className={styles.inlineEditInput}
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleSaveEdit(idx);
                                    } else if (e.key === "Escape") {
                                      e.preventDefault();
                                      handleCancelEdit();
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  className={`${styles.inlineActionBtn} ${styles.inlineSaveBtn}`}
                                  onClick={() => handleSaveEdit(idx)}
                                  title="Guardar cambio (Enter)"
                                >
                                  <FiCheck />
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.inlineActionBtn} ${styles.inlineCancelBtn}`}
                                  onClick={handleCancelEdit}
                                  title="Cancelar (Esc)"
                                >
                                  <FiX />
                                </button>
                              </div>
                            ) : (
                              <span
                                className={styles.itemText}
                                onDoubleClick={() => handleStartEdit(idx)}
                                title="Doble clic para editar texto"
                              >
                                {item}
                              </span>
                            )}
                          </div>

                          {!isEditingThis && (
                            <div className={styles.featureItemActions}>
                              <button
                                type="button"
                                className={styles.featureActionIconBtn}
                                onClick={() => handleMoveUp(idx)}
                                disabled={idx === 0}
                                title="Mover arriba"
                              >
                                <FiArrowUp />
                              </button>
                              <button
                                type="button"
                                className={styles.featureActionIconBtn}
                                onClick={() => handleMoveDown(idx)}
                                disabled={idx === caracteristicas.length - 1}
                                title="Mover abajo"
                              >
                                <FiArrowDown />
                              </button>
                              <button
                                type="button"
                                className={styles.featureActionIconBtn}
                                onClick={() => handleStartEdit(idx)}
                                title="Editar característica"
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                type="button"
                                className={`${styles.featureActionIconBtn} ${styles.featureDeleteBtn}`}
                                onClick={() => handleRemoveFeature(idx)}
                                title="Eliminar"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Modo Editor JSON */
              <div className={styles.jsonEditorWrapper}>
                <div className={styles.jsonEditorToolbar}>
                  <div>
                    {jsonError ? (
                      <span className={styles.jsonStatusInvalid}>
                        <FiAlertCircle size={14} /> Sintaxis JSON con errores
                      </span>
                    ) : (
                      <span className={styles.jsonStatusValid}>
                        <FiCheckCircle size={14} /> JSON Válido ({caracteristicas.length} elementos)
                      </span>
                    )}
                  </div>

                  <div className={styles.jsonToolbarActions}>
                    <button
                      type="button"
                      className={styles.jsonMiniBtn}
                      onClick={handleFormatJson}
                      title="Formatear e indentar JSON"
                    >
                      <FiCheck size={12} /> Formatear
                    </button>
                    <button
                      type="button"
                      className={styles.jsonMiniBtn}
                      onClick={handleCopyJson}
                      title="Copiar JSON al portapapeles"
                    >
                      <FiCopy size={12} /> Copiar
                    </button>
                    <button
                      type="button"
                      className={styles.jsonMiniBtn}
                      onClick={handleLoadTemplate}
                      title="Cargar plantilla de ejemplo"
                    >
                      + Plantilla
                    </button>
                  </div>
                </div>

                <textarea
                  className={`${styles.jsonTextarea} ${jsonError ? styles.jsonTextareaError : ""}`}
                  value={rawJson}
                  onChange={(e) => handleRawJsonChange(e.target.value)}
                  placeholder={`[\n  "Característica 1",\n  "Característica 2"\n]`}
                  spellCheck={false}
                />

                {jsonError && (
                  <div className={styles.jsonErrorBanner}>
                    <FiAlertCircle size={15} />
                    <span>{jsonError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Modal Asignar Módulos al Plan */}
      <Modal isOpen={modulosModalOpen} onClose={() => setModulosModalOpen(false)} title={`Módulos del plan: ${selectedPlan?.nombre || ""}`} size="md"
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setModulosModalOpen(false)}>Cancelar</button>
            <button className={styles.primaryBtn} onClick={handleSaveModulos} disabled={syncMut.isPending}>
              Guardar Módulos
            </button>
          </>
        }
      >
        <div className={styles.selectAllBar}>
          <span className={styles.selectAllLabel}>
            {selectedModulos.length} de {modulosFlat.length} módulos seleccionados
          </span>
          <button className={styles.secondaryBtn} onClick={handleSelectAll} style={{ height: 32, fontSize: 12, padding: "0 12px" }}>
            {selectedModulos.length === modulosFlat.length ? "Deseleccionar todo" : "Seleccionar todo"}
          </button>
        </div>
        <div className={styles.moduleChecklist}>
          {modulosTree.map((parent) => (
            <div key={parent.id}>
              <div
                className={styles.moduleCheckItem}
                onClick={() => handleToggleModulo(parent.id)}
              >
                <button
                  type="button"
                  className={`${styles.checkbox} ${selectedModulos.includes(parent.id) ? styles.checkboxChecked : ""}`}
                  onClick={(e) => { e.stopPropagation(); handleToggleModulo(parent.id); }}
                >
                  {selectedModulos.includes(parent.id) && <span className={styles.checkMark}>✓</span>}
                </button>
                <span className={styles.moduleCheckParent} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <DynamicIcon name={parent.icono} /> {parent.nombre}
                </span>
              </div>
              {parent.children?.map((child) => (
                <div
                  key={child.id}
                  className={`${styles.moduleCheckItem} ${styles.moduleCheckItemChild}`}
                  onClick={() => handleToggleModulo(child.id)}
                >
                  <button
                    type="button"
                    className={`${styles.checkbox} ${selectedModulos.includes(child.id) ? styles.checkboxChecked : ""}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleModulo(child.id); }}
                  >
                    {selectedModulos.includes(child.id) && <span className={styles.checkMark}>✓</span>}
                  </button>
                  <span className={styles.moduleCheckLabel} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <DynamicIcon name={child.icono} /> {child.nombre}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar Eliminación" size="sm"
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setConfirmDelete(null)}>Cancelar</button>
            <button className={styles.dangerBtn} onClick={handleDelete} disabled={deleteMut.isPending}>
              <FiTrash2 /> Eliminar
            </button>
          </>
        }
      >
        <div className={styles.confirmBody}>
          <div className={styles.confirmIcon}>⚠️</div>
          <h4 className={styles.confirmTitle}>¿Eliminar plan "{confirmDelete?.nombre}"?</h4>
          <p className={styles.confirmText}>
            Esta acción es permanente. No se podrá eliminar si hay empresas con este plan asignado.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default TabPlanes;
