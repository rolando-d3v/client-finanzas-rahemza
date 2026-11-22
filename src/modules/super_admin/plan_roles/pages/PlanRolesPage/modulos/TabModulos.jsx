import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight } from "react-icons/fi";
import {
  useCreateModulo,
  useUpdateModulo,
  useToggleModulo,
  useDeleteModulo,
} from "../../../hooks/usePlanRoles";
import KpiCard from "../../../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../../../components/ui/Skeleton/Skeleton";
import Modal from "../../../../../../components/ui/Modal/Modal";
import DynamicIcon from "../../../../../../layouts/Sidebar/DynamicIcon";
import styles from "./modulos.module.css";

const TabModulos = ({ modulosFlat, modulosTree, isLoading }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const createMut = useCreateModulo();
  const updateMut = useUpdateModulo();
  const toggleMut = useToggleModulo();
  const deleteMut = useDeleteModulo();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const kpis = useMemo(() => {
    const total = modulosFlat.length;
    const activos = modulosFlat.filter((m) => m.activo).length;
    const enSidebar = modulosFlat.filter((m) => m.mostrar_en_sidebar !== false).length;
    const padres = modulosFlat.filter((m) => !m.parent_id).length;
    const hijos = modulosFlat.filter((m) => m.parent_id).length;
    return { total, activos, enSidebar, padres, hijos };
  }, [modulosFlat]);

  const handleToggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCreate = (parentId = null) => {
    setEditing(null);
    reset({ codigo: "", nombre: "", icono: "", ruta: "", orden: 0, parent_id: parentId || "", depende_de_plan: true, mostrar_en_sidebar: true });
    setModalOpen(true);
  };

  const handleEdit = (modulo) => {
    setEditing(modulo);
    reset({
      codigo: modulo.codigo,
      nombre: modulo.nombre,
      icono: modulo.icono || "",
      ruta: modulo.ruta || "",
      orden: modulo.orden || 0,
      parent_id: modulo.parent_id || "",
      depende_de_plan: modulo.depende_de_plan,
      mostrar_en_sidebar: modulo.mostrar_en_sidebar !== false,
    });
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      parent_id: data.parent_id || null,
      orden: Number(data.orden) || 0,
      mostrar_en_sidebar: data.mostrar_en_sidebar !== false,
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMut.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteMut.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) });
    }
  };

  // Recursive render
  const renderTreeRows = (nodes, depth = 0) => {
    const rows = [];
    nodes.forEach((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = Boolean(expanded[node.id]); // default collapsed

      rows.push(
        <tr key={node.id} className={styles.treeRow}>
          <td>
            <div className={styles.treeIndent}>
              {Array.from({ length: depth }).map((_, i) => (
                <span key={i} className={styles.treeSpacer} />
              ))}
              {depth > 0 && <span className={styles.treeConnector} />}
              {hasChildren ? (
                <button className={styles.treeToggle} onClick={() => handleToggleExpand(node.id)}>
                  {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                </button>
              ) : (
                <span className={styles.treeSpacer} style={{ width: 24 }} />
              )}
              <span className={styles.treeIcon}><DynamicIcon name={node.icono} /></span>
              <span className={styles.treeName}>{node.nombre}</span>
            </div>
          </td>
          <td><span className={styles.treeCode}>{node.codigo}</span></td>
          <td>{node.ruta || "—"}</td>
          <td>{node.orden}</td>
          <td>
            <button
              className={`${styles.toggleSwitch} ${node.activo ? styles.toggleSwitchOn : styles.toggleSwitchOff}`}
              onClick={() => toggleMut.mutate(node.id)}
              title={node.activo ? "Desactivar" : "Activar"}
            >
              <span className={`${styles.toggleKnob} ${node.activo ? styles.toggleKnobOn : styles.toggleKnobOff}`} />
            </button>
          </td>
          <td>
            <span
              className={`${styles.sidebarBadge} ${node.mostrar_en_sidebar !== false ? styles.sidebarBadgeOn : styles.sidebarBadgeOff}`}
              title={node.mostrar_en_sidebar !== false ? "Visible en sidebar" : "Oculto en sidebar"}
            >
              {node.mostrar_en_sidebar !== false ? "Visible" : "Oculto"}
            </span>
          </td>
          <td>
            <div className={styles.treeActions}>
              {!node.parent_id && (
                <button className={styles.iconBtn} onClick={() => handleOpenCreate(node.id)} title="Añadir sub-módulo">
                  <FiPlus />
                </button>
              )}
              <button className={styles.iconBtn} onClick={() => handleEdit(node)} title="Editar">
                <FiEdit2 />
              </button>
              <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setConfirmDelete(node)} title="Eliminar">
                <FiTrash2 />
              </button>
            </div>
          </td>
        </tr>
      );

      if (hasChildren && isExpanded) {
        rows.push(...renderTreeRows(node.children, depth + 1));
      }
    });
    return rows;
  };

  return (
    <>
      <div className={styles.kpiGrid}>
        {isLoading ? (
          <><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /></>
        ) : (
          <>
            <KpiCard label="Total Módulos" value={kpis.total} color="primary" />
            <KpiCard label="Activos" value={kpis.activos} color="success" />
            <KpiCard label="En Sidebar" value={kpis.enSidebar} color="info" />
            <KpiCard label="Módulos Padre" value={kpis.padres} color="primary" />
            <KpiCard label="Sub-módulos" value={kpis.hijos} color="primary" />
          </>
        )}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft} />
        <button className={styles.primaryBtn} onClick={() => handleOpenCreate()}>
          <FiPlus /> Nuevo Módulo
        </button>
      </div>

      <div className={styles.tableCard}>
        {!isLoading && modulosFlat.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📦</span>
            <h3 className={styles.emptyTitle}>Sin módulos</h3>
            <p className={styles.emptyText}>No hay módulos registrados. Crea el primer módulo para comenzar.</p>
            <button className={styles.primaryBtn} onClick={() => handleOpenCreate()}>
              <FiPlus /> Crear primer módulo
            </button>
          </div>
        ) : (
          <table className={styles.treeTable}>
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Código</th>
                <th>Ruta</th>
                <th>Orden</th>
                <th>Estado</th>
                <th>Sidebar</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>{renderTreeRows(modulosTree)}</tbody>
          </table>
        )}
      </div>

      {/* Modal Crear/Editar Módulo */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Módulo" : "Nuevo Módulo"} size="md"
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className={styles.primaryBtn} onClick={handleSubmit(onSubmit)} disabled={createMut.isPending || updateMut.isPending}>
              {editing ? "Guardar Cambios" : "Crear Módulo"}
            </button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Código *</label>
              <input className={styles.formInput} {...register("codigo", { required: "Requerido" })} placeholder="Ej: dashboard_finanza" />
              {errors.codigo && <span className={styles.formError}>{errors.codigo.message}</span>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre *</label>
              <input className={styles.formInput} {...register("nombre", { required: "Requerido" })} placeholder="Ej: Dashboard Finanzas" />
              {errors.nombre && <span className={styles.formError}>{errors.nombre.message}</span>}
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Icono (emoji)</label>
              <input className={styles.formInput} {...register("icono")} placeholder="Ej: 📊" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ruta</label>
              <input className={styles.formInput} {...register("ruta")} placeholder="Ej: /dashboard" />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Orden</label>
              <input className={styles.formInput} type="number" {...register("orden")} placeholder="0" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Módulo Padre</label>
              <select className={styles.formInput} {...register("parent_id")}>
                <option value="">— Ninguno (raíz) —</option>
                {modulosFlat.filter((m) => !m.parent_id).map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" {...register("depende_de_plan")} style={{ width: 16, height: 16, accentColor: "var(--color-primario)" }} />
              Depende del plan de suscripción
            </label>
            <span className={styles.formHint}>Si está activo, este módulo solo estará disponible según el plan contratado</span>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" {...register("mostrar_en_sidebar")} style={{ width: 16, height: 16, accentColor: "var(--color-primario)" }} />
              Mostrar en el Sidebar
            </label>
            <span className={styles.formHint}>Si está activo, el módulo aparecerá en el menú lateral. Desactívalo para rutas internas que no necesitan entrada desde el sidebar (ej: formularios de detalle)</span>
          </div>
        </form>
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
          <h4 className={styles.confirmTitle}>¿Eliminar "{confirmDelete?.nombre}"?</h4>
          <p className={styles.confirmText}>
            Esta acción es permanente. Se eliminarán también las asignaciones a planes y roles.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default TabModulos;
