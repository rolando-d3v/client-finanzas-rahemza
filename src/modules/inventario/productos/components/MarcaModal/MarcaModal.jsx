import { useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import styles from "./MarcaModal.module.css";
import { useCreateMarca } from "../../hooks/useMarcas";

const MarcaModal = ({ isOpen, onClose, onMarcaCreated }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const createMarcaMutation = useCreateMarca();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      const res = await createMarcaMutation.mutateAsync({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
      });

      if (res?.data) {
        onMarcaCreated?.(res.data);
      }
      setNombre("");
      setDescripcion("");
      onClose();
    } catch (err) {
      // toast ya se maneja en el hook
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Nueva Marca</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="marca-nombre">Nombre de la Marca *</label>
            <input
              id="marca-nombre"
              type="text"
              placeholder="Ej. Nike, Samsung, Sony..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="marca-desc">Descripción (opcional)</label>
            <textarea
              id="marca-desc"
              rows={3}
              placeholder="Breve descripción o notas sobre la marca..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={createMarcaMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!nombre.trim() || createMarcaMutation.isPending}
            >
              <FiCheck size={16} />
              {createMarcaMutation.isPending ? "Guardando..." : "Guardar Marca"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarcaModal;
