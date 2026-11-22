import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useAllUsuarios, useRoles, useCreateUsuarioSuperAdmin, useUpdateUsuarioSuperAdmin, useDeleteUsuario } from "../../user/hooks/useUsuarios";
import { useEmpresas } from "../empresas/hooks/useEmpresas";
import KpiCard from "../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../components/ui/Skeleton/Skeleton";
import Modal from "../../../components/ui/Modal/Modal";
import Breadcrumb from "../../../components/ui/Breadcrumb/Breadcrumb";
import Badge from "../../../components/ui/Badge/Badge";
import EmptyState from "../../../components/ui/EmptyState/EmptyState";
import dayjs from "dayjs";
import styles from "./UserSuperAdminPage.module.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const UsuarioSuperAdminPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);

  const { data: usuarios, isLoading: loadingUsers } = useAllUsuarios();
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const { data: empresas } = useEmpresas({ activo: true });

  const createMutation = useCreateUsuarioSuperAdmin();
  const updateMutation = useUpdateUsuarioSuperAdmin();
  const deleteMutation = useDeleteUsuario();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Opciones de empresa para el select del modal
  const empresasOptions = useMemo(() => {
    return (empresas || []).map((emp) => ({
      value: emp.id,
      label: emp.nombre_comercial || emp.razon_social,
    }));
  }, [empresas]);

  // KPIs
  const kpis = useMemo(() => {
    if (!usuarios?.length) return { total: 0, activos: 0, inactivos: 0 };
    return {
      total: usuarios.length,
      activos: usuarios.filter((u) => u.is_active).length,
      inactivos: usuarios.filter((u) => !u.is_active).length,
    };
  }, [usuarios]);

  const handleEdit = useCallback((user) => {
    setEditingUsuario(user);
    const userRoleIds = (user.roles || []).map((r) => Number(r.id));
    setSelectedRoles(userRoleIds);
    reset({
      name: user.name,
      email: user.email,
      is_active: String(user.is_active),
      password: "",
      empresa_id: user.empresa_id || "",
    });
    setModalOpen(true);
  }, [reset]);

  const handleDelete = useCallback((id) => {
    if (window.confirm("¿Estás seguro de desactivar a este usuario? Ya no podrá iniciar sesión.")) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const columnDefs = useMemo(() => [
    { headerName: "Nombre", field: "name", flex: 1.2, filter: true, sortable: true },
    { headerName: "Email", field: "email", flex: 1.3, filter: true, sortable: true },
    {
      headerName: "Empresa", field: "empresa_display", flex: 1.2, filter: true, sortable: true,
      cellRenderer: (p) => (
        <span style={{ color: p.value === "Sin empresa" ? "var(--color-texto-secundario)" : "inherit" }}>
          {p.value}
        </span>
      ),
    },
    {
      headerName: "Roles", field: "roles", flex: 1.2,
      cellRenderer: (p) => (
        <div className={styles.rolesBadgeContainer}>
          {(p.value || []).map((r) => (
            <Badge
              key={r.id}
              label={r.name}
              variant={r.name === "super_admin" ? "warning" : r.name === "admin" ? "error" : "primary"}
            />
          ))}
        </div>
      ),
    },
    {
      headerName: "Estado", field: "is_active", flex: 0.7,
      cellRenderer: (p) => <Badge label={p.value ? "Activo" : "Inactivo"} variant={p.value ? "success" : "error"} />,
    },
    {
      headerName: "Fecha Registro", field: "created_at", flex: 0.9, sortable: true,
      valueFormatter: (p) => p.value ? dayjs(p.value).format("DD/MM/YYYY HH:mm:ss") : "—",
    },
    {
      headerName: "Acciones", flex: 0.7, sortable: false, filter: false,
      cellRenderer: (p) => (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => handleEdit(p.data)} title="Editar"><FiEdit2 /></button>
          {p.data.is_active && (
            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(p.data.id)} title="Desactivar"><FiTrash2 /></button>
          )}
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  const defaultColDef = useMemo(() => ({ resizable: true }), []);

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    setSelectedRoles([]);
    reset({ name: "", email: "", is_active: "true", password: "", empresa_id: "" });
    setModalOpen(true);
  };

  const toggleRole = (roleId) => {
    const numId = Number(roleId);
    setSelectedRoles((prev) =>
      prev.includes(numId)
        ? prev.filter((id) => id !== numId)
        : [...prev, numId]
    );
  };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      is_active: data.is_active === "true" || data.is_active === true,
      role_ids: selectedRoles
    };
    if (editingUsuario) {
      updateMutation.mutate({ id: editingUsuario.id, ...payload }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  const isLoading = loadingUsers || loadingRoles;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Breadcrumb items={[{ label: "Dashboard", path: "/dashboard" }, { label: "Super Admin" }, { label: "Usuarios" }]} />
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Super Admin — Usuarios</h1>
            <p className={styles.pageSubtitle}>Gestión global de todas las cuentas de usuario del sistema</p>
          </div>
          <button className={styles.primaryBtn} onClick={handleOpenCreate}>
            <FiPlus /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {isLoading ? (
          <><KpiCardSkeleton /><KpiCardSkeleton /><KpiCardSkeleton /></>
        ) : (
          <>
            <KpiCard label="Total Usuarios" value={kpis.total} color="primary" />
            <KpiCard label="Activos" value={kpis.activos} color="success" />
            <KpiCard label="Inactivos" value={kpis.inactivos} color="error" />
          </>
        )}
      </div>

      {/* Grid container */}
      <div className={styles.tableCard}>
        {!isLoading && (!usuarios || usuarios.length === 0) ? (
          <EmptyState
            title="Sin usuarios"
            description="No hay usuarios registrados en el sistema."
            icon="👥"
            action={<button className={styles.primaryBtn} onClick={handleOpenCreate}><FiPlus /> Crear usuario</button>}
          />
        ) : (
          <div className={styles.gridContainer}>
            <AgGridReact
              rowData={usuarios || []}
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

      {/* CRUD Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className={styles.primaryBtn} onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingUsuario ? "Guardar" : "Crear"}
            </button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre *</label>
            <input className={styles.formInput} {...register("name", { required: "El nombre es requerido" })} placeholder="Ej: Juan Pérez" />
            {errors.name && <span className={styles.formError}>{errors.name.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email *</label>
            <input className={styles.formInput} type="email" {...register("email", { required: "El email es requerido" })} placeholder="juan@empresa.com" />
            {errors.email && <span className={styles.formError}>{errors.email.message}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{editingUsuario ? "Contraseña (opcional)" : "Contraseña *"}</label>
              <input className={styles.formInput} type="password" {...register("password", { required: !editingUsuario ? "La contraseña es requerida" : false })} placeholder="••••••••" />
              {errors.password && <span className={styles.formError}>{errors.password.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Estado</label>
              <select className={styles.formInput} {...register("is_active")}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Empresa selector */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Empresa *</label>
            <select
              className={styles.formInput}
              {...register("empresa_id", { required: "La empresa es requerida" })}
            >
              <option value="">Seleccionar empresa...</option>
              {empresasOptions.map((emp) => (
                <option key={emp.value} value={emp.value}>{emp.label}</option>
              ))}
            </select>
            {errors.empresa_id && <span className={styles.formError}>{errors.empresa_id.message}</span>}
          </div>

          {/* Roles Checkboxes - Todos los roles (user, admin, super_admin) */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Asignar Roles</label>
            <div className={styles.checkboxGrid}>
              {(roles || []).map((role) => (
                <label key={role.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={selectedRoles.includes(Number(role.id))}
                    onChange={() => toggleRole(role.id)}
                  />
                  <span>{role.name} — <small style={{ color: "var(--color-texto-secundario)" }}>{role.description}</small></span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsuarioSuperAdminPage;
