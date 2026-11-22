import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiPlus } from "react-icons/fi";
import Modal from "../../../../../components/ui/Modal/Modal";
import CategoriaTreeSelect from "../../../../../components/ui/CategoriaTreeSelect/CategoriaTreeSelect";
import {
  useCreateTransaccion,
  useUpdateTransaccion,
} from "../../hooks/useTransacciones";
import { useCuentas } from "../../../cuentas/hooks/useCuentas";
import { useCategorias } from "../../../categorias/hooks/useCategorias";
import {
  useEtiquetas,
  useCreateEtiqueta,
} from "../../../etiquetas/hooks/useEtiquetas";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import styles from "./modal_trans.module.css";

dayjs.extend(utc);

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

export default function ModalTransaccion({ isOpen, onClose, editingTx = null }) {
  const { data: cuentasData } = useCuentas();
  const cuentas = cuentasData?.cuentas || [];

  const { data: categoriasData } = useCategorias();
  const categorias = categoriasData?.flat || [];
  const categoriasTree = categoriasData?.tree || [];

  const { data: etiquetas } = useEtiquetas();

  const createMutation = useCreateTransaccion();
  const updateMutation = useUpdateTransaccion();
  const createEtiquetaMutation = useCreateEtiqueta();

  const [selectedEtiquetas, setSelectedEtiquetas] = useState([]);
  const [showCreateEtiqueta, setShowCreateEtiqueta] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const watchedCategoriaId = watch("categoria_id", "");

  // Formulario independiente para crear etiquetas inline (sin anidar <form>)
  const {
    register: registerEtiqueta,
    handleSubmit: handleSubmitEtiqueta,
    reset: resetEtiqueta,
    watch: watchEtiqueta,
    setValue: setValueEtiqueta,
    formState: { errors: etiquetaErrors },
  } = useForm({
    defaultValues: {
      nombre: "",
      color: PALETTE_COLORS[0],
    },
  });

  const etiquetaColor = watchEtiqueta("color") || PALETTE_COLORS[0];

  useEffect(() => {
    if (!isOpen) return;

    setShowCreateEtiqueta(false);
    resetEtiqueta({ nombre: "", color: PALETTE_COLORS[0] });

    if (editingTx) {
      setSelectedEtiquetas((editingTx.etiquetas || []).map((e) => e.id));
      reset({
        cuenta_id: editingTx.cuenta_id ? String(editingTx.cuenta_id) : "",
        categoria_id: editingTx.categoria_id || "",
        tipo: editingTx.tipo || "salida",
        monto: editingTx.monto != null ? editingTx.monto : "",
        fecha: editingTx.fecha
          ? dayjs.utc(editingTx.fecha).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        descripcion: editingTx.descripcion || "",
        notas: editingTx.notas || "",
        estado: editingTx.estado || "confirmado",
      });
    } else {
      setSelectedEtiquetas([]);
      const principalCuenta =
        (cuentas || []).find((c) => c.es_principal) || (cuentas || [])[0];
      reset({
        cuenta_id: principalCuenta ? String(principalCuenta.id) : "",
        categoria_id: "",
        tipo: "salida",
        monto: "",
        fecha: dayjs().format("YYYY-MM-DD"),
        descripcion: "",
        notas: "",
        estado: "confirmado",
      });
    }
  }, [isOpen, editingTx, reset, resetEtiqueta, cuentas]);

  const toggleEtiqueta = (etiquetaId) => {
    setSelectedEtiquetas((prev) =>
      prev.includes(etiquetaId)
        ? prev.filter((id) => id !== etiquetaId)
        : [...prev, etiquetaId]
    );
  };

  const handleToggleCreateEtiqueta = () => {
    if (!showCreateEtiqueta) {
      resetEtiqueta({ nombre: "", color: PALETTE_COLORS[0] });
    }
    setShowCreateEtiqueta((prev) => !prev);
  };

  const handleEtiquetaEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmitEtiqueta(onSubmitEtiqueta)();
    }
  };

  const onSubmitEtiqueta = (data) => {
    createEtiquetaMutation.mutate(data, {
      onSuccess: (res) => {
        const newEtiqueta = res?.data || res;
        if (newEtiqueta?.id) {
          setSelectedEtiquetas((prev) =>
            prev.includes(newEtiqueta.id) ? prev : [...prev, newEtiqueta.id]
          );
        }
        resetEtiqueta({ nombre: "", color: PALETTE_COLORS[0] });
        setShowCreateEtiqueta(false);
      },
    });
  };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      categoria_id: data.categoria_id || null,
      monto: Number(data.monto),
      etiquetas: selectedEtiquetas,
    };
    if (editingTx) {
      updateMutation.mutate(
        { id: editingTx.id, ...payload },
        { onSuccess: () => onClose() }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onClose() });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      size="xl"
      onClose={onClose}
      title={editingTx ? "Editar Transacción" : "Nueva Transacción"}
      footer={
        <>
          <button type="button" className={styles.secondaryBtn} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleSubmit(onSubmit)}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingTx ? "Guardar Cambios" : "Crear Transacción"}
          </button>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formColumn}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tipo *</label>
              <select
                className={styles.formInput}
                {...register("tipo", { required: "El tipo es requerido" })}
              >
                <option value="salida">Salida</option>
                <option value="ingreso">Ingreso</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Monto *</label>
              <input
                className={styles.formInput}
                type="number"
                step="0.01"
                {...register("monto", {
                  required: "El monto es requerido",
                  min: { value: 0.01, message: "Monto debe ser mayor a 0" },
                })}
                placeholder="0.00"
              />
              {errors.monto && (
                <span className={styles.formError}>{errors.monto.message}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Cuenta *</label>
            <select
              className={styles.formInput}
              {...register("cuenta_id", { required: "La cuenta es requerida" })}
            >
              <option value="">Seleccionar cuenta</option>
              {(cuentas || []).map((c) => (
                <option key={c.id} value={c.id} disabled={c.bloqueada_por_plan}>
                  {c.bloqueada_por_plan ? "🔒 " : ""}
                  {c.nombre} {c.es_principal ? "⭐ (Principal)" : ""}
                  {c.bloqueada_por_plan ? " (Bloqueada)" : ""}
                </option>
              ))}
            </select>
            {errors.cuenta_id && (
              <span className={styles.formError}>
                {errors.cuenta_id.message}
              </span>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha</label>
              <input
                className={styles.formInput}
                type="date"
                {...register("fecha")}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Estado</label>
              <select className={styles.formInput} {...register("estado")}>
                <option value="confirmado">Confirmado</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripción</label>
            <input
              className={styles.formInput}
              {...register("descripcion")}
              placeholder="Descripción breve..."
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Notas</label>
            <textarea
              className={styles.formTextarea}
              {...register("notas")}
              placeholder="Notas adicionales..."
            />
          </div>
        </div>

        <div className={styles.formColumn}>
          {/* Etiquetas Checkboxes */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Etiquetas</label>
            {(etiquetas || []).length > 0 ? (
              <div className={styles.etiquetasGrid}>
                {(etiquetas || []).map((et) => (
                  <label key={et.id} className={styles.etiquetaLabel}>
                    <input
                      type="checkbox"
                      className={styles.etiquetaCheckbox}
                      checked={selectedEtiquetas.includes(et.id)}
                      onChange={() => toggleEtiqueta(et.id)}
                    />
                    <span className={styles.etiquetaTag}>
                      <span
                        className={styles.etiquetaDot}
                        style={{ backgroundColor: et.color || "#888" }}
                      />
                      {et.nombre}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <span className={styles.noTagsText}>
                No hay etiquetas creadas. Crea una nueva con el botón de abajo.
              </span>
            )}

            <button
              type="button"
              className={styles.addEtiquetaBtn}
              onClick={handleToggleCreateEtiqueta}
              aria-expanded={showCreateEtiqueta}
            >
              <FiPlus />{" "}
              {showCreateEtiqueta
                ? "Ocultar formulario"
                : "Crear nueva etiqueta"}
            </button>

            {showCreateEtiqueta && (
              <div className={styles.createEtiquetaPanel}>
                <span className={styles.createEtiquetaTitle}>
                  Nueva etiqueta
                </span>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nombre *</label>
                  <input
                    className={styles.formInput}
                    {...registerEtiqueta("nombre", {
                      required: "El nombre es requerido",
                    })}
                    placeholder="Ej: Urgente"
                    autoFocus
                    onKeyDown={handleEtiquetaEnter}
                  />
                  {etiquetaErrors.nombre && (
                    <span className={styles.formError}>
                      {etiquetaErrors.nombre.message}
                    </span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Color</label>
                  <div className={styles.paletteGrid}>
                    {PALETTE_COLORS.map((hex) => {
                      const isSelected =
                        (etiquetaColor || "").toLowerCase() === hex.toLowerCase();
                      return (
                        <button
                          key={hex}
                          type="button"
                          className={`${styles.colorCircle} ${
                            isSelected ? styles.colorCircleActive : ""
                          }`}
                          style={{ backgroundColor: hex }}
                          onClick={() =>
                            setValueEtiqueta("color", hex, {
                              shouldValidate: true,
                            })
                          }
                          title={hex}
                          aria-label={`Seleccionar color ${hex}`}
                          aria-pressed={isSelected}
                        >
                          {isSelected && (
                            <span className={styles.checkMark}>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <input type="hidden" {...registerEtiqueta("color")} />
                </div>
                <div className={styles.createEtiquetaActions}>
                  <button
                    type="button"
                    className={styles.cancelEtiquetaBtn}
                    onClick={() => setShowCreateEtiqueta(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={styles.saveEtiquetaBtn}
                    onClick={handleSubmitEtiqueta(onSubmitEtiqueta)}
                    disabled={createEtiquetaMutation.isPending}
                  >
                    <FiPlus /> Guardar etiqueta
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Categoría</label>
            <CategoriaTreeSelect
              treeData={categoriasTree}
              flatData={categorias}
              value={watchedCategoriaId}
              onChange={(val) =>
                setValue("categoria_id", val, { shouldValidate: true })
              }
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
