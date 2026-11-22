import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  logout as logoutAction,
  setActiveRole,
  setEmpresa,
} from "../../../redux/slices/authSlice";
import { logoutService } from "../services/authService";
import { ROLES } from "../../../config/constants";

/**
 * Hook centralizado para acceder al estado de autenticación
 * y ejecutar acciones comunes (logout, cambiar rol, etc.)
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { user, roles, activeRole, empresa, suscripcion, plan, modulos, isAuthenticated, error } =
    useSelector((state) => state.Auth);

  // ─── Logout con mutation (limpia sesión en backend) ─────
  const logoutMutation = useMutation({
    mutationFn: logoutService,
    onSettled: () => {
      // Siempre limpiar estado local, incluso si falla el backend
      dispatch(logoutAction());
      queryClient.removeQueries({ queryKey: ["auth"] });
      localStorage.removeItem("pappuk_auth_cache");
    },
  });

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  // ─── Cambiar rol activo ─────────────────────────────────
  const handleSetActiveRole = useCallback(
    (role) => {
      dispatch(setActiveRole(role));
    },
    [dispatch]
  );

  // ─── Seleccionar empresa ────────────────────────────────
  const handleSetEmpresa = useCallback(
    (empresaData) => {
      dispatch(setEmpresa(empresaData));
    },
    [dispatch]
  );

  // ─── Helpers de roles ───────────────────────────────────
  const hasRole = useCallback(
    (role) => roles.includes(role),
    [roles]
  );

  const hasAnyRole = useCallback(
    (checkRoles) => checkRoles.some((role) => roles.includes(role)),
    [roles]
  );

  const isSuperAdmin = roles.includes(ROLES.SUPER_ADMIN);
  const isAdmin = roles.includes(ROLES.ADMIN);
  const isUser = roles.includes(ROLES.USER);

  return {
    // Estado
    user,
    roles,
    activeRole,
    empresa,
    suscripcion,
    plan,
    modulos,
    isAuthenticated,
    isLoggingOut: logoutMutation.isPending,
    error,

    // Acciones
    handleLogout,
    handleSetActiveRole,
    handleSetEmpresa,

    // Helpers
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAdmin,
    isUser,
  };
};
