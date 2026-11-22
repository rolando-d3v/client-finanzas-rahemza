import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../../auth/hooks/useAuth";
import { getMisPagos } from "../../../../../components/planes/services/suscripcionSelfService";

/**
 * Hook para consultar el historial de pagos de suscripción de la empresa del usuario
 * Endpoint: /api/suscripciones/mis-pagos
 */
export const useMisPagos = () => {
  const { isAuthenticated, empresa, isSuperAdmin } = useAuth();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["suscripcion", "mis-pagos", empresa?.id],
    queryFn: getMisPagos,
    enabled: Boolean(isAuthenticated && empresa?.id && !isSuperAdmin),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
  });

  const pagos = data?.pagos || [];

  return {
    pagos,
    isLoading,
    isError,
    refetch,
  };
};
