import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { verifyAuthService } from "../../services/authService";
import { setCredentials, logout } from "../../../../redux/slices/authSlice";
import styles from "./AuthInitializer.module.css";

const AUTH_CACHE_KEY = "pappuk_auth_cache";

/**
 * Componente que verifica la sesión (cookie HttpOnly) al iniciar la app.
 * Debe envolver al RouterProvider para que se ejecute antes del routing.
 *
 * Flujo optimizado:
 * 1. Si hay cache en localStorage → inicializa Redux inmediatamente (renderizado optimista)
 * 2. GET /api/custom-auth/verify-auth → valida la sesión real en segundo plano
 *    - Si hay sesión válida → actualiza Redux y cache
 *    - Si no hay sesión → limpia Redux y cache
 *
 * ⚡ OPTIMIZACIÓN vs versión anterior:
 * - `staleTime: 15 min` — si GoogleCallbackPage ya hizo setQueryData, AuthInitializer
 *   NO re-fetcha (la data es fresh). Elimina el doble-fetch post-callback.
 * - `gcTime: 20 min` — mantiene el cache en memoria suficiente tiempo para
 *   que no se descarte entre navegaciones rápidas.
 * - `refetchOnWindowFocus: false` — evita re-verificar al volver al tab
 *   (el cache del servidor ya cubre este caso con 30s TTL).
 */
export const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.Auth);
  const hasRestoredCache = useRef(false);

  // ─── Renderizado optimista: restaurar cache al montar ─────
  useEffect(() => {
    if (hasRestoredCache.current) return;
    hasRestoredCache.current = true;

    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (cached) {
        const authData = JSON.parse(cached);
        if (authData?.user && authData?.empresa) {
          dispatch(setCredentials(authData));
        }
      }
    } catch {
      localStorage.removeItem(AUTH_CACHE_KEY);
    }
  }, [dispatch]);

  // ─── Verificación real de sesión en segundo plano ─────────
  // ⚡ En /auth/callback, GoogleCallbackPage es el encargado exclusivo de verificar
  // la sesión y redirigir. Desactivamos la query aquí para evitar peticiones duplicadas en paralelo.
  const isCallbackPage = typeof window !== "undefined" && window.location.pathname.startsWith("/auth/callback");

  const {
    data: authData,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["auth", "verify"],
    queryFn: () => {
      const pendingEmpresa = sessionStorage.getItem("pending_empresa_nombre");
      return verifyAuthService(pendingEmpresa);
    },
    enabled: !isCallbackPage,
    retry: false,
    // ⚡ 15 minutos de staleTime: si GoogleCallbackPage ya hizo setQueryData con
    // los datos del login, esta query NO se vuelve a ejecutar. Elimina el doble-fetch.
    staleTime: 1000 * 60 * 15,
    // ⚡ 20 minutos de gcTime: mantiene el cache entre navegaciones para que
    // el renderizado optimista sea instantáneo en toda la sesión.
    gcTime: 1000 * 60 * 20,
    // ⚡ No re-fetchar al enfocar la ventana: el TTL de 30s del servidor
    // garantiza consistencia sin necesidad de re-verificar en cada focus.
    refetchOnWindowFocus: false,
    // Re-verificar al reconectar a internet (importante para usuarios móviles)
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (isSuccess && !isCallbackPage) {
      if (authData && authData.user && authData.empresa) {
        // Sesión válida y con empresa asignada: guardar user, roles y empresa en Redux
        dispatch(setCredentials(authData));
        // Actualizar cache para próximas cargas
        try {
          localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(authData));
        } catch { /* localStorage lleno, no es crítico */ }
      } else {
        // No hay sesión o no tiene empresa asignada: limpiar estado y cache
        dispatch(logout());
        localStorage.removeItem(AUTH_CACHE_KEY);
      }
    }
  }, [isSuccess, authData, dispatch, isCallbackPage]);

  // Mostrar loading SOLO si no hay cache previo y la petición aún está en curso
  // Si estamos en /auth/callback, GoogleCallbackPage muestra su propio loader
  if (!isInitialized && isLoading && !isCallbackPage) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner} />
        <p className={styles.text}>Cargando Sistema de Gastos...</p>
      </div>
    );
  }

  // Si no hay cache y la petición terminó sin datos válidos, esperar a que Redux se inicialice
  if (!isInitialized && isSuccess && authData && authData.user && authData.empresa) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner} />
        <p className={styles.text}>Cargando Sistema de Gastos...</p>
      </div>
    );
  }

  return children;
};
