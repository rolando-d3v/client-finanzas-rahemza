import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as etiquetasService from "../services/etiquetasService";

export const useEtiquetas = () =>
  useQuery({ queryKey: ["etiquetas"], queryFn: etiquetasService.getEtiquetas });

export const useCreateEtiqueta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: etiquetasService.createEtiqueta,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["etiquetas"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear etiqueta"),
  });
};

export const useUpdateEtiqueta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: etiquetasService.updateEtiqueta,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["etiquetas"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar etiqueta"),
  });
};

export const useDeleteEtiqueta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: etiquetasService.deleteEtiqueta,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["etiquetas"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al eliminar etiqueta"),
  });
};
