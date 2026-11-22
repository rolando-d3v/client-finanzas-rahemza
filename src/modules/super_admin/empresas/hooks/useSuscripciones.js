import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as suscripcionesService from "../services/suscripcionesService";

export const useSuscripcionByEmpresa = (empresaId) =>
  useQuery({
    queryKey: ["suscripciones", empresaId],
    queryFn: () => suscripcionesService.getSuscripcionByEmpresa(empresaId),
    enabled: !!empresaId,
    staleTime: 1000 * 60 * 2,  // 2 min: el modal re-abre sin parpadeo de "Cargando..."
    gcTime:    1000 * 60 * 10, // 10 min: mantiene en caché aunque se cierre el modal
  });


export const useUpdateSuscripcion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suscripcionesService.updateSuscripcion,
    onSuccess: (data, variables) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["suscripciones", variables.empresaId] });
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar suscripción"),
  });
};

export const useAmpliarSuscripcion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suscripcionesService.ampliarSuscripcion,
    onSuccess: (data, variables) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["suscripciones", variables.empresaId] });
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al ampliar suscripción"),
  });
};
