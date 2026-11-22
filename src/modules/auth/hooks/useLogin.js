import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyAuthService, loginService } from "../services/authService";
import { setCredentials } from "../../../redux/slices/authSlice";
import { getPostLoginRoute, NO_SUBSCRIPTION_ROUTE, FRONTEND_URL } from "../../../config/constants";
import { toast } from "sonner";
import { authClient } from "../../../config/authClient";

/**
 * Hook para manejar el flujo de login con Better Auth (Email y Google OAuth)
 *
 * ⚡ OPTIMIZADO (Google):
 * - Marca `pappuk_google_pending` en sessionStorage ANTES de redirigir a Google.
 *   GoogleCallbackPage lo lee para limpiar el flag al terminar.
 * - El flag sirve también para que futuros estados de carga sean más descriptivos.
 */
export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      // 1. Intentar iniciar sesión con Better Auth
      const res = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
      });

      if (res?.error) {
        // Fallback a customAuth service si Better Auth retorna error
        try {
          const customData = await loginService(credentials);
          return customData;
        } catch (customErr) {
          const status = customErr.response?.status;
          const errorMessage =
            customErr.response?.data?.message ||
            res.error?.message ||
            "Credenciales incorrectas";

          // Si es 403, propagar el mensaje del server (usuario bloqueado por plan / inactivo)
          const err = new Error(errorMessage);
          err.status = status;
          throw err;
        }
      }

      // 2. Si Better Auth autenticó con éxito, obtener datos completos
      const authData = await verifyAuthService();

      // 3. Si verifyAuth retorna null, puede ser por usuario bloqueado por plan
      if (!authData) {
        // Intentar login custom para obtener el mensaje específico de bloqueo
        try {
          await loginService(credentials);
        } catch (customErr) {
          const status = customErr.response?.status;
          const errorMessage =
            customErr.response?.data?.message ||
            "Tu sesión no es válida. Puede que tu cuenta esté bloqueada por el plan actual de tu empresa.";
          const err = new Error(errorMessage);
          err.status = status;
          throw err;
        }
        // Si loginService tampoco lanza error pero verifyAuth dio null
        throw new Error("No se pudo verificar tu sesión. Contacta al administrador.");
      }

      return authData;
    },

    onSuccess: async (data) => {
      if (data) {
        if (!data.empresa) {
          toast.error("No puedes iniciar sesión porque no tienes una empresa asignada.");
          return;
        }

        dispatch(setCredentials(data));
        queryClient.setQueryData(["auth", "verify"], data);
        try {
          localStorage.setItem("pappuk_auth_cache", JSON.stringify(data));
        } catch {}

        const redirectPath = getPostLoginRoute(data);

        if (redirectPath === NO_SUBSCRIPTION_ROUTE) {
          toast.info("Selecciona un plan para activar tu cuenta.", { duration: 5000 });
        } else {
          sessionStorage.removeItem("pending_plan_id");
          toast.success(`¡Bienvenido, ${data.user?.name || ""}!`);
        }
        navigate(redirectPath, { replace: true });
      }
    },

    onError: (error) => {
      const message = error.message || "Credenciales incorrectas";

      // Si es un error 403 (bloqueado por plan o inactivo), usar toast.warning con icono 🔒
      if (error.status === 403) {
        toast.error(`🔒 ${message}`, { duration: 6000 });
      } else {
        toast.error(message);
      }
    },
  });

  const handleLogin = (credentials) => {
    loginMutation.mutate(credentials);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);

      // ⚡ Marcar en sessionStorage que hay un flujo de Google en curso.
      // GoogleCallbackPage lo limpia al completar el proceso.
      // Esto permite mostrar un estado de carga específico al volver del callback.
      sessionStorage.setItem("pappuk_google_pending", Date.now().toString());

      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${FRONTEND_URL}/auth/callback`,
      });

      // Better-Auth retorna { error } en vez de lanzar excepciones
      if (res?.error) {
        sessionStorage.removeItem("pappuk_google_pending");
        toast.error(res.error.message || "Error al iniciar sesión con Google");
      }
      // Nota: si no hay error, la página se redirige a Google y el componente se desmonta.
      // El flag en sessionStorage persiste durante la redirección.
    } catch (error) {
      sessionStorage.removeItem("pappuk_google_pending");
      toast.error("Error de conexión al iniciar sesión con Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    handleLogin,
    handleGoogleLogin,
    isLoading: loginMutation.isPending || isGoogleLoading,
    error: loginMutation.error,
  };
};
