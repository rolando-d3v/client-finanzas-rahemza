// ─── API Base URL ───────────────────────────────────────────
export const API_URL_GASTOS =
  import.meta.env.VITE_BACKEND_URL_GASTOS || "http://localhost:4000";




export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";




// ─── Roles del sistema ──────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
};

// ─── Mapeo de roles → rutas por defecto después del login ───
export const DEFAULT_ROUTES = {
  [ROLES.SUPER_ADMIN]: "/dashboard",
  [ROLES.ADMIN]: "/dashboard",
  [ROLES.USER]: "/dashboard",
};

// ─── Ruta de fallback cuando no hay suscripción activa ──────
export const NO_SUBSCRIPTION_ROUTE = "/admin/planes";

/**
 * Determina la ruta post-login según el estado de suscripción.
 * - Super Admins siempre van a su ruta por defecto (no requieren suscripción).
 * - Los demás roles requieren una suscripción con estado "activa" o "prueba".
 *
 * @param {{ roles: string[], suscripcion: object | null }} authData
 * @returns {string} La ruta de destino.
 */
export const getPostLoginRoute = (authData) => {
  const primaryRole = authData.roles?.[0];
  const isSuperAdmin = authData.roles?.includes(ROLES.SUPER_ADMIN);

  // Super Admin no necesita validar suscripción
  if (isSuperAdmin) {
    return DEFAULT_ROUTES[primaryRole] || "/dashboard";
  }

  // Verificar suscripción activa o en período de prueba
  const suscripcion = authData.suscripcion;
  const tieneSuscripcionActiva = Boolean(
    suscripcion &&
      (suscripcion.estado === "activa" || suscripcion.estado === "prueba")
  );

  if (!tieneSuscripcionActiva) {
    return NO_SUBSCRIPTION_ROUTE;
  }

  return DEFAULT_ROUTES[primaryRole] || "/dashboard";
};

// ─── Paginación por defecto ─────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
