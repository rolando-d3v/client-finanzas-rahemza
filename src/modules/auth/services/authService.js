import api from "../../../config/axios";
import { authClient } from "../../../config/authClient";

// ─── Sign In (Login con email y password) ───────────────────
// Retorna: { user, roles, empresa }
export const loginService = ({ email, password }) =>
  api.post("/api/custom-auth/sign-in/email", { email, password }).then((res) => res.data);

// ─── Verificar sesión y obtener datos del usuario ───────────
// Retorna: { user, roles, empresa } o null si no hay sesión
export const verifyAuthService = (empresaNombre = null) => {
  const url = empresaNombre
    ? `/api/custom-auth/verify-auth?empresa_nombre=${encodeURIComponent(empresaNombre)}`
    : "/api/custom-auth/verify-auth";
  return api.get(url).then((res) => res.data);
};

// ─── Cerrar sesión en el backend y Better Auth ──────────────
export const logoutService = async () => {
  try {
    await authClient.signOut();
  } catch (error) {
    console.error("[BetterAuth] Error al cerrar sesión:", error);
  }
  return api.post("/api/custom-auth/sign-out").then((res) => res.data);
};

// ─── Registro (solo admins crean usuarios) ──────────────────
export const registerService = ({ name, email, password, empresa_id }) =>
  api.post("/api/custom-auth/sign-up/email", { name, email, password, empresa_id }).then((res) => res.data);

// ─── Cambiar contraseña (autenticado) ───────────────────────
export const changePasswordService = ({ currentPassword, newPassword }) =>
  api.post("/api/custom-auth/change-password", { currentPassword, newPassword }).then((res) => res.data);
