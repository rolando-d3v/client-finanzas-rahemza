import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../../modules/auth/hooks/useAuth";

const checkModuleAccess = (modulos, path) => {
  if (!modulos || !Array.isArray(modulos)) return false;
  for (const mod of modulos) {
    const ruta = mod.path || mod.ruta;
    if (ruta) {
      // Coincidencia exacta o sub-ruta (ej: /inventario/productos/nuevo)
      if (path === ruta || path.startsWith(ruta + "/")) return true;
    }
    if (mod.children && mod.children.length > 0) {
      if (checkModuleAccess(mod.children, path)) return true;
    }
  }
  return false;
};

/**
 * Comprueba si la suscripción está vencida basándose en fecha_fin y estado.
 * La suscripción está vencida si:
 *  - El estado es 'vencida' o 'cancelada'
 *  - O el estado es 'prueba' y fecha_fin < HOY
 */
const isSuscripcionVencida = (suscripcion) => {
  if (!suscripcion) return false; // Sin suscripción → lo maneja otro guard
  if (suscripcion.estado === "vencida" || suscripcion.estado === "cancelada") return true;
  if (suscripcion.fecha_fin) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaFin = new Date(suscripcion.fecha_fin);
    fechaFin.setHours(0, 0, 0, 0);
    return fechaFin < hoy;
  }
  return false;
};

/**
 * Protege rutas que requieren autenticación.
 * - Si no está autenticado → redirige a /login
 * - Si la suscripción está vencida → solo permite /admin/planes
 *   (admin) o muestra bloqueo total (usuarios secundarios)
 *
 * @param {string[]} allowedRoles - Roles permitidos (opcional).
 * @param {boolean} requireModule - Si es true, verifica que la ruta esté en los modulos del usuario.
 */
const PrivateRoute = ({ allowedRoles, requireModule = false }) => {
  const { isAuthenticated, roles, modulos, isSuperAdmin, suscripcion } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ─── CU-05: Bloqueo por vencimiento de suscripción ───────────────────────────
  // Super Admin nunca es bloqueado por suscripción
  if (!isSuperAdmin && isSuscripcionVencida(suscripcion)) {
    const isAdmin = roles.includes("admin");
    const currentPath = location.pathname;

    if (isAdmin) {
      // El admin solo puede ir a /admin/planes para renovar
      if (currentPath !== "/admin/planes") {
        return <Navigate to="/admin/planes" replace />;
      }
    } else {
      // Usuarios secundarios (colaboradores) quedan bloqueados completamente
      if (currentPath !== "/suscripcion-vencida") {
        return <Navigate to="/suscripcion-vencida" replace />;
      }
    }
  }

  // Si hay restricción de roles, verificar
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some((role) => roles.includes(role));
    if (!hasPermission) {
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  // Si requiere acceso a módulo por BD
  if (requireModule && !isSuperAdmin) {
    const alwaysAllowed = ["/", "/dashboard", "/perfil", "/admin/planes"];
    if (!alwaysAllowed.includes(location.pathname)) {
      const hasModule = checkModuleAccess(modulos, location.pathname);
      if (!hasModule) {
        return <Navigate to="/no-autorizado" replace />;
      }
    }
  }

  return <Outlet />;
};

export default PrivateRoute;

