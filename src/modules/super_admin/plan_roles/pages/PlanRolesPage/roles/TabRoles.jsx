import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiEdit2, FiTrash2, FiSettings } from "react-icons/fi";
import {
  useCreateRole,
  useUpdateRole,
  useToggleRole,
  useDeleteRole,
  useSyncModulosRol,
} from "../../../hooks/usePlanRoles";
import KpiCard from "../../../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../../../components/ui/Skeleton/Skeleton";
import Modal from "../../../../../../components/ui/Modal/Modal";
import DynamicIcon from "../../../../../../layouts/Sidebar/DynamicIcon";
import styles from "./roles.module.css";

const TabRoles = ({ roles, modulosTree, modulosFlat, isLoading }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permisos, setPermisos] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const createMut = useCreateRole();
  const updateMut = useUpdateRole();
  const toggleMut = useToggleRole();
  const deleteMut = useDeleteRole();
  const syncMut = useSyncModulosRol();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const ROLE_ICONS = { super_admin: "👑", admin: "🛡️", user: "👤" };
  const SYSTEM_ROLES = [1, 2, 3];

  const kpis = useMemo(() => ({
    total: roles.length,
    activos: roles.filter((r) => r.is_active).length,
    sistema: roles.filter((r) => SYSTEM_ROLES.includes(r.id)).length,
    custom: roles.filter((r) => !SYSTEM_ROLES.includes(r.id)).length,
  }), [roles]);

  const handleOpenCreate = () => {
    setEditing(null);
    reset({ name: "", description: "" });
    setModalOpen(true);
  };

  const handleEdit = (role) => {
    setEditing(role);
    reset({ name: role.name, description: role.description || "" });
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, ...data }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMut.mutate(data, { onSuccess: () => setModalOpen(false) });
    }
  };

  const handleOpenPermisos = (role) => {
    setSelectedRole(role);
    const permMap = {};
    role.permisos?.forEach((p) => {
      permMap[p.modulo_id] = {
        puede_ver: p.puede_ver,
        puede_crear: p.puede_crear,
        puede_editar: p.puede_editar,
        puede_eliminar: p.puede_eliminar,
      };
    });
    setPermisos(permMap);
    setPermModalOpen(true);
  };

  const handleTogglePerm = (moduloId, campo) => {
    setPermisos((prev) => {
      const current = prev[moduloId] || { puede_ver: false, puede_crear: false, puede_editar: false, puede_eliminar: false };
      return { ...prev, [moduloId]: { ...current, [campo]: !current[campo] } };
    });
  };

  const handleSelectAllPerms = () => {
    const allSet = modulosFlat.every((m) => {
      const p = permisos[m.id];
      return p && p.puede_ver && p.puede_crear && p.puede_editar && p.puede_eliminar;
    });

    if (allSet) {
      setPermisos({});
    } else {
      const newPerms = {};
      modulosFlat.forEach((m) => {
        newPerms[m.id] = { puede_ver: true, puede_crear: true, puede_editar: true, puede_eliminar: true };
      });
      setPermisos(newPerms);
    }
  };

  const handleSavePermisos = () => {
    const permArray = Object.entries(permisos)
      .filter(([, p]) => p.puede_ver || p.puede_crear || p.puede_editar || p.puede_eliminar)
      .map(([moduloId, p]) => ({
        modulo_id: Number(moduloId),
        ...p,
      }));

    syncMut.mutate({ id: selectedRole.id, permisos: permArray }, { onSuccess: () => setPermModalOpen(false) });
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteMut.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) });
    }
  };

  const getPerm = (moduloId, campo) => permisos[moduloId]?.[campo] || false;

  return (
    <>
      <div className={styles.kpiGrid}>
        {isLoading ? (
          <><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /></>
        ) : (
          <>
            <KpiCard label="Total Roles" value={kpis.total} color="primary" />
            <KpiCard label="Activos" value={kpis.activos} color="success" />
            <KpiCard label="Del Sistema" value={kpis.sistema} color="info" />
            <KpiCard label="Personalizados" value={kpis.custom} color="primary" />
          </>
        )}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft} />
        <button className={styles.primaryBtn} onClick={handleOpenCreate}>
          <FiPlus /> Nuevo Rol
        </button>
      </div>

      <div className={styles.tableCard}>
        {!isLoading && roles.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔐</span>
            <h3 className={styles.emptyTitle}>Sin roles</h3>
            <p className={styles.emptyText}>No hay roles registrados.</p>
            <button className={styles.primaryBtn} onClick={handleOpenCreate}><FiPlus /> Crear primer rol</button>
          </div>
        ) : (
          <table className={styles.rolesTable}>
            <thead>
              <tr>
                <th>Rol</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Permisos</th>
                <th>Estado</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <div className={styles.roleNameCell}>
                      <span className={styles.roleAvatar}>{ROLE_ICONS[role.name] || "🔑"}</span>
                      <span className={styles.roleName}>{role.name}</span>
                    </div>
                  </td>
                  <td><span className={styles.roleDesc}>{role.description || "—"}</span></td>
                  <td>
                    <span className={`${styles.badge} ${SYSTEM_ROLES.includes(role.id) ? styles.badgeSystem : styles.badgeActive}`}>
                      {SYSTEM_ROLES.includes(role.id) ? "Sistema" : "Custom"}
                    </span>
                  </td>
                  <td>
                    <span className={styles.planLimitChip}>
                      {role.permisos?.length || 0} módulos
                    </span>
                  </td>
                  <td>
                    <button
                      className={`${styles.toggleSwitch} ${role.is_active ? styles.toggleSwitchOn : styles.toggleSwitchOff}`}
                      onClick={() => toggleMut.mutate(role.id)}
                      title={role.is_active ? "Desactivar" : "Activar"}
                    >
                      <span className={`${styles.toggleKnob} ${role.is_active ? styles.toggleKnobOn : styles.toggleKnobOff}`} />
                    </button>
                  </td>
                  <td>
                    <div className={styles.treeActions}>
                      <button className={`${styles.iconBtn} ${styles.iconBtnSuccess}`} onClick={() => handleOpenPermisos(role)} title="Configurar permisos">
                        <FiSettings />
                      </button>
                      <button className={styles.iconBtn} onClick={() => handleEdit(role)} title="Editar">
                        <FiEdit2 />
                      </button>
                      {!SYSTEM_ROLES.includes(role.id) && (
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setConfirmDelete(role)} title="Eliminar">
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Crear/Editar Rol */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Rol" : "Nuevo Rol"} size="sm"
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className={styles.primaryBtn} onClick={handleSubmit(onSubmit)} disabled={createMut.isPending || updateMut.isPending}>
              {editing ? "Guardar Cambios" : "Crear Rol"}
            </button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre *</label>
            <input className={styles.formInput} {...register("name", { required: "Requerido" })} placeholder="Ej: supervisor" />
            {errors.name && <span className={styles.formError}>{errors.name.message}</span>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripción</label>
            <textarea className={styles.formTextarea} {...register("description")} placeholder="Describe las responsabilidades del rol..." />
          </div>
        </form>
      </Modal>

      {/* Modal Permisos por Módulo */}
      <Modal isOpen={permModalOpen} onClose={() => setPermModalOpen(false)} title={`Permisos: ${selectedRole?.name || ""}`} size="lg"
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setPermModalOpen(false)}>Cancelar</button>
            <button className={styles.primaryBtn} onClick={handleSavePermisos} disabled={syncMut.isPending}>
              Guardar Permisos
            </button>
          </>
        }
      >
        <div className={styles.selectAllBar}>
          <span className={styles.selectAllLabel}>Permisos por módulo</span>
          <button className={styles.secondaryBtn} onClick={handleSelectAllPerms} style={{ height: 32, fontSize: 12, padding: "0 12px" }}>
            Alternar todos
          </button>
        </div>
        <div className={styles.permScrollContainer}>
          <table className={styles.permTable}>
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Ver</th>
                <th>Crear</th>
                <th>Editar</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {modulosTree.map((parent) => (
                <tr key={`parent-group-${parent.id}`} style={{ display: "contents" }}>
                  <tr key={`p-${parent.id}`} className={styles.permParentRow}>
                    <td>
                      <div className={styles.permModuleName}>
                        <span className={styles.permModuleIcon} style={{ display: "flex", alignItems: "center" }}><DynamicIcon name={parent.icono} /></span>
                        {parent.nombre}
                      </div>
                    </td>
                    {["puede_ver", "puede_crear", "puede_editar", "puede_eliminar"].map((campo) => (
                      <td key={campo}>
                        <button
                          type="button"
                          className={`${styles.checkbox} ${getPerm(parent.id, campo) ? styles.checkboxChecked : ""}`}
                          onClick={() => handleTogglePerm(parent.id, campo)}
                        >
                          {getPerm(parent.id, campo) && <span className={styles.checkMark}>✓</span>}
                        </button>
                      </td>
                    ))}
                  </tr>
                  {parent.children?.map((child) => (
                    <tr key={`c-${child.id}`} className={styles.permChildRow}>
                      <td>
                        <div className={styles.permModuleName}>
                          <span className={styles.permModuleIcon} style={{ display: "flex", alignItems: "center" }}><DynamicIcon name={child.icono} /></span>
                          {child.nombre}
                        </div>
                      </td>
                      {["puede_ver", "puede_crear", "puede_editar", "puede_eliminar"].map((campo) => (
                        <td key={campo}>
                          <button
                            type="button"
                            className={`${styles.checkbox} ${getPerm(child.id, campo) ? styles.checkboxChecked : ""}`}
                            onClick={() => handleTogglePerm(child.id, campo)}
                          >
                            {getPerm(child.id, campo) && <span className={styles.checkMark}>✓</span>}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
          <h4 className={styles.confirmTitle}>¿Eliminar rol "{confirmDelete?.name}"?</h4>
          <p className={styles.confirmText}>
            Esta acción es permanente. No se podrá eliminar si hay usuarios asignados.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default TabRoles;
