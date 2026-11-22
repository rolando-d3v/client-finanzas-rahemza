import axios from "axios";
import { API_URL_GASTOS } from "./constants";
import { store } from "../redux/store";

const api = axios.create({
  baseURL: API_URL_GASTOS,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ← envía cookies HttpOnly en cada petición
});

// Interceptor de peticiones para adjuntar la empresa activa si existe (para super_admin)
api.interceptors.request.use(
  (config) => {
    try {
      const state = store.getState();
      const empresa = state.Auth?.empresa;
      if (empresa?.id) {
        config.headers["X-Empresa-Id"] = empresa.id;
      }
    } catch (e) {
      console.error("Error al obtener la empresa de Redux", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Response interceptor: maneja 401 (sesión expirada) ─────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir al login solo si no estamos ya en rutas de autenticación/registro/callback
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const isAuthRoute =
        path.startsWith("/login") ||
        path.startsWith("/register") ||
        path.startsWith("/auth/callback");

      if (!isAuthRoute) {
        localStorage.removeItem("pappuk_auth_cache");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
