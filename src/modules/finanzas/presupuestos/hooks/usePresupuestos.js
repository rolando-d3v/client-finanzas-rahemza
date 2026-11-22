import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as presupuestosService from "../services/presupuestosService";

export const usePresupuestos = (params) =>
  useQuery({ queryKey: ["presupuestos", params], queryFn: () => presupuestosService.getPresupuestos(params) });

export const useCreatePresupuesto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: presupuestosService.createPresupuesto,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["presupuestos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear presupuesto"),
  });
};

export const useUpdatePresupuesto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: presupuestosService.updatePresupuesto,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["presupuestos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar presupuesto"),
  });
};

export const useDeletePresupuesto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: presupuestosService.deletePresupuesto,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["presupuestos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al eliminar presupuesto"),
  });
};
