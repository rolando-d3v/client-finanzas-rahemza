import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { FiPlus } from "react-icons/fi";
import { useCategorias, useCreateCategoria, useUpdateCategoria, useDeleteCategoria } from "../../hooks/useCategorias";
import KpiCard from "../../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../../components/ui/Skeleton/Skeleton";
import Modal from "../../../../../components/ui/Modal/Modal";
import Breadcrumb from "../../../../../components/ui/Breadcrumb/Breadcrumb";
import EmptyState from "../../../../../components/ui/EmptyState/EmptyState";
import CategoriaTree from "../../components/CategoriaTree/CategoriaTree";
import CategoriaIcons, { ICON_OPTIONS, ICON_CAT, getIcon } from "../../components/categoria_icons/CategoriaIcons";
import Select from "react-select";
import styles from "./CategoriasPage.module.css";

const formatOptionLabel = ({ label, iconName }) => {
  const IconComp = getIcon(iconName);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <IconComp style={{ fontSize: "1.1rem", color: "var(--color-primario-texto)" }} />
      <span>{label}</span>
    </div>
  );
};

const customSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    height: "48px",
    borderRadius: "14px",
    border: state.isFocused ? "1px solid var(--color-borde-focus)" : "1px solid var(--color-borde)",
    backgroundColor: "var(--color-fondo-input)",
    boxShadow: state.isFocused ? "var(--focus-ring)" : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    "&:hover": {
      borderColor: "var(--color-primario)",
    },
  }),
  valueContainer: (baseStyles) => ({
    ...baseStyles,
    padding: "0 16px",
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: "var(--color-texto-body)",
    fontSize: "14px",
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: "var(--color-texto-placeholder)",
    fontSize: "14px",
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: "var(--color-fondo-elevado)",
    borderRadius: "14px",
    border: "1px solid var(--color-borde)",
    boxShadow: "var(--sombra-dropdown)",
    overflow: "hidden",
    zIndex: 9999,
  }),
  menuList: (baseStyles) => ({
    ...baseStyles,
    padding: "6px",
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "14px",
    cursor: "pointer",
    color: state.isSelected ? "#ffffff" : "var(--color-texto-body)",
    backgroundColor: state.isSelected
      ? "var(--color-primario)"
      : state.isFocused
        ? "var(--color-fondo-hover)"
        : "transparent",
    "&:active": {
      backgroundColor: "var(--color-primario-activo)",
    },
  }),
  input: (baseStyles) => ({
    ...baseStyles,
    color: "var(--color-texto-body)",
  }),
  menuPortal: (baseStyles) => ({
    ...baseStyles,
    zIndex: 9999,
  }),
};

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

const TIPOS = [
  { value: "ingreso", label: "Ingreso" },
  { value: "salida", label: "Salida" },
];

const CategoriasPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("");

  const { data: categoriasData, isLoading } = useCategorias(filtroTipo ? { tipo: filtroTipo } : undefined);
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();
  const deleteMutation = useDeleteCategoria();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const watchedColor = watch("color", PALETTE_COLORS[0]);
  const watchedIcono = watch("icono", "");

  // Use flat list for KPIs, tree for the component
  const categorias = categoriasData?.flat || [];
  const categoriasTree = categoriasData?.tree || [];

  // KPIs
  const kpis = useMemo(() => {
    if (!categorias?.length) return { total: 0, ingresos: 0, salida: 0, sistema: 0, personalizadas: 0 };
    return {
      total: categorias.length,
      ingresos: categorias.filter((c) => c.tipo === "ingreso").length,
      salida: categorias.filter((c) => c.tipo === "salida").length,
      sistema: categorias.filter((c) => c.es_sistema === true).length,
      personalizadas: categorias.filter((c) => !c.es_sistema).length,
    };
  }, [categorias]);

  // Parent categories for select
  const parentOptions = useMemo(() => {
    return categorias.filter((c) => !c.parent_id);
  }, [categorias]);

  const handleEdit = (categoria) => {
    if (categoria.es_sistema) return;
    setEditingCategoria(categoria);
    reset({
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      color: categoria.color || PALETTE_COLORS[0],
      icono: categoria.icono || "",
      parent_id: categoria.parent_id || "",
    });
    setModalOpen(true);
  };

  const handleDelete = useCallback(
    (id) => {
      const cat = categorias.find((c) => c.id === id);
      if (cat?.es_sistema) return;
      if (window.confirm("¿Estás seguro de eliminar esta categoría?")) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation, categorias],
  );

  const handleOpenCreate = () => {
    setEditingCategoria(null);
    reset({ nombre: "", tipo: "salida", color: PALETTE_COLORS[0], icono: "", parent_id: "" });
    setModalOpen(true);
  };

  const handleAddChild = (parentCategory) => {
    setEditingCategoria(null);
    reset({ nombre: "", tipo: parentCategory.tipo, color: PALETTE_COLORS[0], icono: "", parent_id: parentCategory.id });
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      color: data.color || PALETTE_COLORS[0],
      parent_id: data.parent_id || null,
    };
    if (editingCategoria) {
      updateMutation.mutate({ id: editingCategoria.id, ...payload }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
       
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Categorías</h1>
            <p className={styles.pageSubtitle}>Administra las categorías de ingresos y salidas</p>
          </div>
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
            <KpiCard label="Total Categorías" value={kpis.total} color="primary" />
            <KpiCard label="Del Sistema" value={kpis.sistema} color="info" />
            <KpiCard label="Personalizadas" value={kpis.personalizadas} color="success" />
            <KpiCard label="Ingresos" value={kpis.ingresos} color="primary" />
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <select className={styles.filterSelect} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tree Table */}
      <div className={styles.tableCard}>
        {!isLoading && (!categorias || categorias.length === 0) ? (
          <EmptyState
            title="Sin categorías"
            description="Aún no tienes categorías registradas. Crea tu primera categoría para comenzar."
            icon="📂"
            action={
              <button className={styles.primaryBtn} onClick={handleOpenCreate}>
                <FiPlus /> Crear primera categoría
              </button>
            }
          />
        ) : (
          <CategoriaTree
            data={categoriasTree}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
            onAddParent={handleOpenCreate}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
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
              {editingCategoria ? "Guardar Cambios" : "Crear Categoría"}
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
              placeholder="Ej: Alimentación"
            />
            {errors.nombre && <span className={styles.formError}>{errors.nombre.message}</span>}
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tipo *</label>
              <select className={styles.formInput} {...register("tipo", { required: "El tipo es requerido" })}>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Icono (FontAwesome)</label>
            <Select
              options={ICON_OPTIONS}
              styles={customSelectStyles}
              placeholder="Selecciona un icono..."
              formatOptionLabel={formatOptionLabel}
              value={
                ICON_OPTIONS.find((opt) => opt.value === watchedIcono) ||
                (watchedIcono ? { value: watchedIcono, label: watchedIcono, iconName: watchedIcono } : null)
              }
              onChange={(option) => setValue("icono", option ? option.value : "")}
              isClearable
              menuPortalTarget={document.body}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Color</label>
            <div className={styles.paletteGrid}>
              {PALETTE_COLORS.map((hex) => {
                const isSelected = (watchedColor || "").toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    className={`${styles.colorCircle} ${isSelected ? styles.colorCircleActive : ""}`}
                    style={{ backgroundColor: hex }}
                    onClick={() => setValue("color", hex, { shouldValidate: true })}
                    title={hex}
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

export default CategoriasPage;

