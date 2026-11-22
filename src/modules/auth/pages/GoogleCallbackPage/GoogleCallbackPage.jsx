import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { verifyAuthService, logoutService } from "../../services/authService";
import { setCredentials, logout as logoutAction } from "../../../../redux/slices/authSlice";
import { getPostLoginRoute, NO_SUBSCRIPTION_ROUTE } from "../../../../config/constants";
import { toast } from "sonner";
import styles from "../../components/AuthInitializer/AuthInitializer.module.css";

/**
 * Página intermedia que recibe la redirección de Google OAuth.
 * Distingue entre flujo de LOGIN (sin empresa pendiente) y REGISTRO (con empresa pendiente).
 *
 * - LOGIN: verifyAuth valida que el usuario ya tenga empresa y rol.
 *          Si no tiene → retorna { error: "NO_ACCOUNT" } → redirige a /registrar.
 * - REGISTRO: verifyAuth crea la empresa, asigna rol y continúa.
 *
 * ⚡ OPTIMIZADO:
 * - queryClient.invalidateQueries corre en background (sin await) — no bloquea a verifyAuthService.
 * - El resultado de verifyAuth se pre-carga en React Query cache con setQueryData
 *   para que AuthInitializer no vuelva a hacer fetch al montar las rutas privadas.
 */
const GoogleCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        // ⚡ Fire-and-forget: invalidar caché previa sin bloquear la llamada principal.
        // No necesitamos await aquí porque verifyAuthService siempre hace una petición fresca.
        queryClient.invalidateQueries({ queryKey: ["auth", "verify"] });

        // Si viene del registro, habrá un empresa_nombre en sessionStorage
        const pendingEmpresa = sessionStorage.getItem("pending_empresa_nombre");

        // ⚡ Llamar a verify-auth inmediatamente (en paralelo con invalidateQueries)
        const authData = await verifyAuthService(pendingEmpresa);
        sessionStorage.removeItem("pending_empresa_nombre");
        // Limpiar el flag de google pending si estaba seteado
        sessionStorage.removeItem("pappuk_google_pending");

        // ── Manejar error NO_ACCOUNT (usuario sin empresa/registro) ──
        if (authData?.error === "NO_ACCOUNT") {
          try {
            await logoutService();
          } catch (_) {}
          dispatch(logoutAction());
          queryClient.removeQueries({ queryKey: ["auth"] });
          localStorage.removeItem("pappuk_auth_cache");

          toast.error(
            authData.message || "No tienes una empresa registrada. Por favor regístrate indicando el nombre de tu empresa.",
            { duration: 6000 }
          );
          navigate("/register", { replace: true });
          return;
        }

        if (authData && authData.user) {
          // 🔥 VALIDACIÓN: El usuario DEBE tener una empresa asignada
          if (!authData.empresa) {
            try {
              await logoutService();
            } catch (_) {}
            dispatch(logoutAction());
            queryClient.removeQueries({ queryKey: ["auth"] });
            localStorage.removeItem("pappuk_auth_cache");

            toast.error(
              "No tienes una empresa asignada. Por favor regístrate indicando el nombre de tu empresa.",
              { duration: 6000 }
            );
            navigate("/register", { replace: true });
            return;
          }

          // ⚡ Pre-popular Redux y React Query cache ANTES de navegar.
          // Esto evita que AuthInitializer haga un fetch adicional al montar las rutas privadas.
          dispatch(setCredentials(authData));
          queryClient.setQueryData(["auth", "verify"], authData);
          try {
            localStorage.setItem("pappuk_auth_cache", JSON.stringify(authData));
          } catch {}

          let redirectPath = getPostLoginRoute(authData);

          // Si hay un plan pendiente de selección (viene del registro) y va a planes, preservar el plan seleccionado
          const pendingPlanId = sessionStorage.getItem("pending_plan_id");
          if (redirectPath === NO_SUBSCRIPTION_ROUTE && pendingPlanId) {
            // El sessionStorage ya lo tiene, PlanesComponent lo leerá automáticamente
            toast.info("Confirma el plan que seleccionaste para activar tu cuenta.", { duration: 5000 });
          } else if (redirectPath === NO_SUBSCRIPTION_ROUTE) {
            toast.info("Selecciona un plan para activar tu cuenta.", { duration: 5000 });
          } else {
            sessionStorage.removeItem("pending_plan_id");
            toast.success(`¡Bienvenido, ${authData.user?.name || ""}!`);
          }
          navigate(redirectPath, { replace: true });
        } else {
          try {
            await logoutService();
          } catch (_) {}
          dispatch(logoutAction());
          queryClient.removeQueries({ queryKey: ["auth"] });
          localStorage.removeItem("pappuk_auth_cache");

          toast.error("No tienes una cuenta registrada. Por favor regístrate primero con el nombre de tu empresa.", { duration: 6000 });
          navigate("/register", { replace: true });
        }
      } catch (error) {
        console.error("[GoogleCallback]", error);
        const serverError = error?.response?.data?.error;
        const serverMsg = error?.response?.data?.message;

        try {
          await logoutService();
        } catch (_) {}
        dispatch(logoutAction());
        queryClient.removeQueries({ queryKey: ["auth"] });
        localStorage.removeItem("pappuk_auth_cache");

        if (serverError === "NO_ACCOUNT") {
          toast.error(serverMsg || "No tienes una empresa registrada. Por favor regístrate indicando el nombre de tu empresa.", { duration: 6000 });
          navigate("/register", { replace: true });
        } else {
          toast.error("Error al iniciar sesión con Google");
          navigate("/login", { replace: true });
        }
      }
    };

    fetchAuthData();
  }, [dispatch, navigate, queryClient]);

  return (
    <div className={styles.loader}>
      <div className={styles.spinner} />
      <p className={styles.text}>Verificando sesión de Google...</p>
    </div>
  );
};

export default GoogleCallbackPage;
