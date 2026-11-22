import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { registerService } from "../services/authService";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { authClient } from "../../../config/authClient";
import { FRONTEND_URL } from "../../../config/constants";

/**
 * Hook para manejar el flujo de registro con React Query y Google OAuth
 */
export const useRegister = () => {
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const registerMutation = useMutation({
    mutationFn: registerService,

    onSuccess: () => {
      toast.success("¡Registro exitoso! Empresa creada. Ahora puedes iniciar sesión.");
      navigate("/login", { replace: true });
    },

    onError: (error) => {
      const message =
        error.response?.data?.message || "Error al registrar usuario";
      toast.error(message);
    },
  });

  const handleRegister = (userData) => {
    registerMutation.mutate(userData);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${FRONTEND_URL}/auth/callback`,
      });

      // Better-Auth retorna { error } en vez de lanzar excepciones
      if (res?.error) {
        toast.error(res.error.message || "Error al registrarse con Google");
      }
    } catch (error) {
      console.error("Error en Google Sign Up:", error);
      toast.error("Error de conexión al registrarse con Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    handleRegister,
    handleGoogleLogin,
    isLoading: registerMutation.isPending || isGoogleLoading,
    error: registerMutation.error,
  };
};
