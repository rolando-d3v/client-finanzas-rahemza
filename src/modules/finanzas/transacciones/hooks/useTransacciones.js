import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import * as transaccionesService from "../services/transaccionesService";

// Hook principal — paginación con cursor (keyset).
// staleTime: 30s → las páginas ya cargadas no se refetchean inmediatamente al volver.
export const useTransacciones = (params) =>
  useQuery({
    queryKey: ["transacciones", params],
    queryFn: () => transaccionesService.getTransacciones(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000, // 30 segundos
  });

// Hook de KPIs/totales — query separada del paginador.
// staleTime: 5 min → no recalcula COUNT+SUM en cada cambio de página.
// Solo se invalida cuando se crea/edita/elimina una transacción.
export const useTransaccionesTotals = (filters) =>
  useQuery({
    queryKey: ["transacciones-totals", filters],
    queryFn: () => transaccionesService.getTransaccionesTotals(filters),
    staleTime: 5 * 60_000, // 5 minutos
    placeholderData: keepPreviousData,
  });

export const useTransaccionById = (id) =>
  useQuery({
    queryKey: ["transacciones", id],
    queryFn: () => transaccionesService.getTransaccionById(id),
    enabled: !!id,
  });

export const useCreateTransaccion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transaccionesService.createTransaccion,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["transacciones"] });
      queryClient.invalidateQueries({ queryKey: ["transacciones-totals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["cuentas"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear transacción"),
  });
};

export const useUpdateTransaccion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transaccionesService.updateTransaccion,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["transacciones"] });
      queryClient.invalidateQueries({ queryKey: ["transacciones-totals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["cuentas"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar transacción"),
  });
};

export const useAnularTransaccion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transaccionesService.anularTransaccion,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["transacciones"] });
      queryClient.invalidateQueries({ queryKey: ["transacciones-totals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al anular transacción"),
  });
};

export const useDeleteTransaccion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transaccionesService.deleteTransaccion,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["transacciones"] });
      queryClient.invalidateQueries({ queryKey: ["transacciones-totals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al eliminar transacción"),
  });
};
