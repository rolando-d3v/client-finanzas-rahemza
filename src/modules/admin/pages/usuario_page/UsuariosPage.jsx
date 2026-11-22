import { useState, useMemo, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle, FiLock, FiAlertTriangle, FiGrid } from "react-icons/fi";
import {
  useUsuarios,
  useRoles,
  useCreateUsuario,
  useUpdateUsuario,
  useDeleteUsuario,
  useUserModulos,
  useUpdateUserModulos,
} from "../../../user/hooks/useUsuarios";
import { useAuth } from "../../../auth/hooks/useAuth";
import KpiCard from "../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../components/ui/Skeleton/Skeleton";
import Modal from "../../../../components/ui/Modal/Modal";
import Badge from "../../../../components/ui/Badge/Badge";
import EmptyState from "../../../../components/ui/EmptyState/EmptyState";
import dayjs from "dayjs";
import styles from "./UsuariosPage.module.css";

ModuleRegistry.registerModules([AllCommunityModule]);

// Roles permitidos para admin: solo user y admin
const ALLOWED_ROLE_NAMES = ["user", "admin"];

const UsuariosPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);

  // ─── Estado para modal de módulos ─────────────────────────
  const [modulosModalOpen, setModulosModalOpen] = useState(false);
  const [modulosUser, setModulosUser] = useState(null);
  // Mapa: { [modulo_id]: { puede_ver, puede_crear, puede_editar, puede_eliminar } }
  const [moduloPermisos, setModuloPermisos] = useState({});

  const { empresa } = useAuth();

  const { data: usuariosData, isLoading: loadingUsers } = useUsuarios();
  const { data: roles, isLoading: loadingRoles } = useRoles();

  // Extraer usuarios (Array) y planInfo (Objeto)
  const usuarios = usuariosData?.usuarios || [];
  const planInfo = usuariosData?.plan_info || null;

  // Filtrar roles: admin solo puede asignar "user" y "admin"
  const filteredRoles = useMemo(() => {
    return (roles || []).filter((r) => ALLOWED_ROLE_NAMES.includes(r.name));
  }, [roles]);

  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();
  const deleteMutation = useDeleteUsuario();
  const updateModulosMutation = useUpdateUserModulos();

  // Query para módulos del usuario seleccionado
  const { data: modulosData, isLoading: loadingModulos } = useUserModulos(modulosUser?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Determinar si el usuario en edición es de Google
  const isGoogleUser = editingUsuario?.provider_id === "google";

  // Verificar si alcanzó el límite del plan de usuarios credential
  const limitReached = planInfo ? planInfo.usuarios_credential >= planInfo.max_usuarios : false;

  // KPIs
  const kpis = useMemo(() => {
    if (!usuarios?.length) return { total: 0, activos: 0, inactivos: 0, bloqueados: 0 };
    return {
      total: usuarios.length,
      activos: usuarios.filter((u) => u.is_active && !u.bloqueado_por_plan).length,
      inactivos: usuarios.filter((u) => !u.is_active && !u.bloqueado_por_plan).length,
      bloqueados: usuarios.filter((u) => u.bloqueado_por_plan).length,
    };
  }, [usuarios]);

  const handleEdit = useCallback(
    (user) => {
      // Impedir edición de usuarios bloqueados por plan
      if (user.bloqueado_por_plan) {
        return;
      }
      setEditingUsuario(user);
      // Solo incluir roles permitidos
      const userRoleIds = (user.roles || [])
        .filter((r) => ALLOWED_ROLE_NAMES.includes(r.name))
        .map((r) => Number(r.id));
      setSelectedRoles(userRoleIds);
      reset({
        name: user.name,
        email: user.email,
        is_active: String(user.is_active),
        password: "",
      });
      setModalOpen(true);
    },
    [reset],
  );

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("¿Estás seguro de desactivar a este usuario? Ya no podrá iniciar sesión.")) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation],
  );

  // ─── Módulos Modal handlers ───────────────────────────────
  const handleOpenModulos = useCallback((user) => {
    setModulosUser(user);
    setModulosModalOpen(true);
  }, []);

  // Sincronizar permisos cuando llegan los datos del backend
  useEffect(() => {
    if (modulosData && modulosModalOpen) {
      const permisos = {};
      if (modulosData.has_custom_assignment && modulosData.user_permisos) {
        // Cargar permisos existentes del usuario
        const allMods = modulosData.plan_modulos || [];
        allMods.forEach((m) => {
          const up = modulosData.user_permisos[m.id];
          if (up) {
            permisos[m.id] = { ...up };
          }
          // Si no tiene asignación, no lo incluimos (no seleccionado)
        });
      } else {
        // Sin asignación personalizada = todos los módulos con solo Ver
        const allMods = modulosData.plan_modulos || [];
        allMods.forEach((m) => {
          permisos[m.id] = { puede_ver: true, puede_crear: false, puede_editar: false, puede_eliminar: false };
        });
      }
      setModuloPermisos(permisos);
    }
  }, [modulosData, modulosModalOpen]);

  // Toggle un módulo completo (activar/desactivar)
  const toggleModuloVer = useCallback((moduloId) => {
    setModuloPermisos((prev) => {
      const newPermisos = { ...prev };
      if (newPermisos[moduloId]) {
        // Desactivar: quitar del mapa
        delete newPermisos[moduloId];
      } else {
        // Activar: solo Ver por defecto
        newPermisos[moduloId] = { puede_ver: true, puede_crear: false, puede_editar: false, puede_eliminar: false };
      }
      return newPermisos;
    });
  }, []);

  // Toggle un permiso específico (crear/editar/eliminar) de un módulo
  const togglePermiso = useCallback((moduloId, permiso) => {
    setModuloPermisos((prev) => {
      const current = prev[moduloId];
      if (!current) return prev;
      return {
        ...prev,
        [moduloId]: { ...current, [permiso]: !current[permiso] },
      };
    });
  }, []);

  const handleSaveModulos = useCallback(() => {
    if (!modulosUser) return;
    // Convertir el mapa de permisos a array para el backend
    const modulos = Object.entries(moduloPermisos).map(([id, perms]) => ({
      modulo_id: Number(id),
      puede_ver: perms.puede_ver,
      puede_crear: perms.puede_crear,
      puede_editar: perms.puede_editar,
      puede_eliminar: perms.puede_eliminar,
    }));
    updateModulosMutation.mutate({ userId: modulosUser.id, modulos }, { onSuccess: () => setModulosModalOpen(false) });
  }, [modulosUser, moduloPermisos, updateModulosMutation]);

  // Agrupar módulos del plan por padre para el modal
  const groupedModulos = useMemo(() => {
    if (!modulosData?.plan_modulos) return [];
    const mods = modulosData.plan_modulos;
    const parents = mods.filter((m) => !m.parent_id);
    return parents.map((parent) => ({
      ...parent,
      children: mods.filter((m) => m.parent_id === parent.id),
    }));
  }, [modulosData]);

  // Verificar si un usuario tiene role "user" (no admin)
  const isUserRole = useCallback((user) => {
    const roleNames = (user.roles || []).map((r) => r.name);
    return roleNames.includes("user") && !roleNames.includes("admin") && !roleNames.includes("super_admin");
  }, []);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Nombre",
        field: "name",
        flex: 1.5,
        filter: true,
        minWidth:200,
        sortable: true,
        cellRenderer: (p) => (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {p.data.bloqueado_por_plan && (
              <FiLock style={{ color: "var(--color-warning, #f59e0b)", fontSize: "14px" }} />
            )}
            <span style={{ opacity: p.data.bloqueado_por_plan ? 0.5 : 1 }}>{p.value}</span>
            {p.data.bloqueado_por_plan && <Badge label="Bloqueado por plan" variant="warning" />}
          </div>
        ),
      },
      { headerName: "Email", field: "email", flex: 1.5, filter: true, minWidth:200, sortable: true },
      {
        headerName: "Proveedor",
        field: "provider_id",
        flex: 0.8,
        minWidth:120,
        cellRenderer: (p) => (
          <Badge
            label={p.value === "google" ? "Google" : "Credential"}
            variant={p.value === "google" ? "info" : "primary"}
          />
        ),
      },
      {
        headerName: "Roles",
        field: "roles",
        minWidth:200,
        flex: 1.5,
        cellRenderer: (p) => (
          <div className={styles.rolesBadgeContainer}>
            {(p.value || []).map((r) => (
              <Badge key={r.id} label={r.name} variant={r.name === "admin" ? "error" : "primary"} />
            ))}
          </div>
        ),
      },
      {
        headerName: "Estado",
        field: "is_active",
        minWidth:100,
        flex: 0.8,
        cellRenderer: (p) => {
          if (p.data.bloqueado_por_plan) {
            return <Badge label="Bloqueado" variant="warning" />;
          }
          return <Badge label={p.value ? "Activo" : "Inactivo"} variant={p.value ? "success" : "error"} />;
        },
      },
      {
        headerName: "Fecha Registro",
        field: "created_at",
        minWidth:120,
        flex: 1,
        sortable: true,
        valueFormatter: (p) => (p.value ? dayjs(p.value).format("DD/MM/YYYY") : "—"),
      },
      {
        headerName: "Acciones",
        minWidth:130,
        flex: 1,
        sortable: false,
        filter: false,
        cellRenderer: (p) => {
          const isBloqueado = p.data.bloqueado_por_plan;
          const showModulosBtn = isUserRole(p.data) && !isBloqueado;
          return (
            <div className={styles.actions}>
              <button
                className={`${styles.actionBtn} ${isBloqueado ? styles.actionBtnDisabled : ""}`}
                onClick={() => !isBloqueado && handleEdit(p.data)}
                title={isBloqueado ? "Usuario bloqueado por plan" : "Editar"}
                disabled={isBloqueado}
              >
                {isBloqueado ? <FiLock /> : <FiEdit2 />}
              </button>
              {showModulosBtn && (
                <button
                  className={`${styles.actionBtn} ${styles.modulosBtn}`}
                  onClick={() => handleOpenModulos(p.data)}
                  title="Asignar Módulos"
                >
                  <FiGrid />
                </button>
              )}
              {p.data.is_active && !isBloqueado && (
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDelete(p.data.id)}
                  title="Desactivar"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleEdit, handleDelete, handleOpenModulos, isUserRole],
  );

  const defaultColDef = useMemo(() => ({ resizable: true }), []);

  const getRowStyle = useCallback((params) => {
    if (params.data?.bloqueado_por_plan) {
      return {
        backgroundColor: "var(--color-fondo-blocked, rgba(255,193,7,0.05))",
        borderLeft: "3px solid var(--color-warning, #ffc107)",
      };
    }
    return undefined;
  }, []);

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    setSelectedRoles([]);
    reset({ name: "", email: "", is_active: "true", password: "" });
    setModalOpen(true);
  };

  const toggleRole = (roleId) => {
    const numId = Number(roleId);
    setSelectedRoles((prev) => (prev.includes(numId) ? prev.filter((id) => id !== numId) : [...prev, numId]));
  };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      is_active: data.is_active === "true" || data.is_active === true,
      role_ids: selectedRoles,
    };

    // Si es Google en edición, no enviar email ni password
    if (editingUsuario && isGoogleUser) {
      delete payload.email;
      delete payload.password;
    }

    if (editingUsuario) {
      updateMutation.mutate({ id: editingUsuario.id, ...payload }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  const isLoading = loadingUsers || loadingRoles;

  // Nombre de la empresa actual para el subtítulo
  const empresaName = empresa?.nombre_comercial || empresa?.razon_social || "";

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Usuarios</h1>
            <p className={styles.pageSubtitle}>
              Administra las cuentas de usuario y sus roles
              {empresaName && (
                <>
                  {" "}
                  — <strong>{empresaName}</strong>
                </>
              )}
            </p>
          </div>
          <button
            className={`${styles.primaryBtn} ${limitReached ? styles.disabledBtn : ""}`}
            onClick={handleOpenCreate}
            disabled={limitReached}
            title={
              limitReached ? `Tu plan "${planInfo?.plan_nombre}" solo permite ${planInfo?.max_usuarios} usuario(s)` : ""
            }
          >
            <FiPlus /> {limitReached ? "Límite alcanzado" : "Nuevo Usuario"}
          </button>
        </div>
      </div>

      {/* Banner Límite del plan */}
      {limitReached && (
        <div className={styles.upgradeBanner}>
          <FiAlertTriangle className={styles.upgradeBannerIcon} />
          <div>
            <strong>Has alcanzado el límite de usuarios de tu plan "{planInfo?.plan_nombre}"</strong>
            <p>
              Tu plan permite {planInfo?.max_usuarios} usuario(s) adicional(es). Actualiza tu suscripción para invitar a
              más usuarios.
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
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
            <KpiCard label="Total Usuarios" value={kpis.total} color="primary" />
            <KpiCard label="Activos" value={kpis.activos} color="success" />
            <KpiCard label="Inactivos" value={kpis.inactivos} color="error" />
            <KpiCard label="Bloqueados por Plan" value={kpis.bloqueados} color="warning" />
            <KpiCard
              label="Límite del Plan"
              value={`${planInfo?.usuarios_credential || 0} / ${planInfo?.max_usuarios ?? "0"}`}
              color={limitReached ? "warning" : "info"}
            />
          </>
        )}
      </div>

      {/* Grid container */}
      <div className={styles.tableCard}>
        {!isLoading && (!usuarios || usuarios.length === 0) ? (
          <EmptyState
            title="Sin usuarios"
            description="Crea la primera cuenta de usuario para tu empresa."
            icon="👥"
            action={
              <button className={styles.primaryBtn} onClick={handleOpenCreate}>
                <FiPlus /> Crear usuario
              </button>
            }
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
              getRowStyle={getRowStyle}
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
            <button className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button
              className={styles.primaryBtn}
              onClick={handleSubmit(onSubmit)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingUsuario ? "Guardar" : "Crear"}
            </button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          {/* Aviso cuenta Google */}
          {editingUsuario && isGoogleUser && (
            <div className={styles.googleNotice}>
              <FiAlertCircle size={16} />
              <span>Cuenta vinculada con Google — el email y la contraseña no se pueden modificar.</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre *</label>
            <input
              className={styles.formInput}
              {...register("name", { required: "El nombre es requerido" })}
              placeholder="Ej: Juan Pérez"
            />
            {errors.name && <span className={styles.formError}>{errors.name.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email *</label>
            <input
              className={styles.formInput}
              type="email"
              {...register("email", {
                required: isGoogleUser ? false : "El email es requerido",
                validate: (value) => {
                  if (isGoogleUser) return true;
                  if (!value?.toLowerCase().endsWith("@pappuk.com")) {
                    return "El correo debe terminar en @pappuk.com";
                  }
                  return true;
                },
              })}
              placeholder="usuario@pappuk.com"
              disabled={isGoogleUser}
            />
            {errors.email && <span className={styles.formError}>{errors.email.message}</span>}
            {!editingUsuario && <small className={styles.formHint}>El correo debe usar el dominio @pappuk.com</small>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{editingUsuario ? "Contraseña (opcional)" : "Contraseña *"}</label>
              <input
                className={styles.formInput}
                type="password"
                {...register("password", { required: !editingUsuario ? "La contraseña es requerida" : false })}
                placeholder="••••••••"
                disabled={isGoogleUser}
              />
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

          {/* Roles Checkboxes - Solo user y admin */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Asignar Roles</label>
            <div className={styles.checkboxGrid}>
              {filteredRoles.map((role) => (
                <label key={role.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={selectedRoles.includes(Number(role.id))}
                    onChange={() => toggleRole(role.id)}
                  />
                  <span>
                    {role.name} — <small style={{ color: "var(--color-texto-secundario)" }}>{role.description}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Modal Asignar Módulos y Permisos ──────────────── */}
      <Modal
        isOpen={modulosModalOpen}
        onClose={() => setModulosModalOpen(false)}
        title={`Asignar Módulos — ${modulosUser?.name || ""}`}
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setModulosModalOpen(false)}>
              Cancelar
            </button>
            <button
              className={styles.primaryBtn}
              onClick={handleSaveModulos}
              disabled={updateModulosMutation.isPending}
            >
              {updateModulosMutation.isPending ? "Guardando..." : "Guardar Módulos"}
            </button>
          </>
        }
      >
        <div className={styles.modulosForm}>
          {/* Info banner */}
          <div className={styles.googleNotice}>
            <FiAlertCircle size={16} />
            <span>
              Configura los módulos y permisos de este usuario. Plan: <strong>{modulosData?.plan_nombre}</strong>
            </span>
          </div>

          {loadingModulos ? (
            <p style={{ textAlign: "center", color: "var(--color-texto-secundario)" }}>Cargando módulos...</p>
          ) : (
            <div className={styles.modulosGrid}>
              {groupedModulos.map((parent) => (
                <div key={parent.id} className={styles.moduloGroup}>
                  {/* Padre (categoría) — toggle Ver */}
                  <label className={styles.moduloParentLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={!!moduloPermisos[parent.id]}
                      onChange={() => toggleModuloVer(parent.id)}
                    />
                    <span className={styles.moduloParentName}>{parent.nombre}</span>
                  </label>

                  {/* Hijos con permisos granulares */}
                  {parent.children.length > 0 && (
                    <div className={styles.moduloChildren}>
                      {parent.children.map((child) => {
                        const perms = moduloPermisos[child.id];
                        const isActive = !!perms;
                        return (
                          <div key={child.id} className={styles.moduloChildRow}>
                            {/* Checkbox Ver (activar módulo) */}
                            <label className={styles.moduloChildLabel}>
                              <input
                                type="checkbox"
                                className={styles.checkboxInput}
                                checked={isActive}
                                onChange={() => toggleModuloVer(child.id)}
                              />
                              <span>{child.nombre}</span>
                            </label>

                            {/* Permisos granulares (solo si el módulo está activo) */}
                            {isActive && (
                              <div className={styles.permisosRow}>
                                <label className={styles.permisoLabel}>
                                  <input
                                    type="checkbox"
                                    className={styles.permisoCheckbox}
                                    checked={perms.puede_crear}
                                    onChange={() => togglePermiso(child.id, "puede_crear")}
                                  />
                                  <span>Crear</span>
                                </label>
                                <label className={styles.permisoLabel}>
                                  <input
                                    type="checkbox"
                                    className={styles.permisoCheckbox}
                                    checked={perms.puede_editar}
                                    onChange={() => togglePermiso(child.id, "puede_editar")}
                                  />
                                  <span>Editar</span>
                                </label>
                                <label className={styles.permisoLabel}>
                                  <input
                                    type="checkbox"
                                    className={styles.permisoCheckbox}
                                    checked={perms.puede_eliminar}
                                    onChange={() => togglePermiso(child.id, "puede_eliminar")}
                                  />
                                  <span>Eliminar</span>
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UsuariosPage;
