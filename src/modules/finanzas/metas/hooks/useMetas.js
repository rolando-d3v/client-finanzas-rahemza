import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as metasService from "../services/metasService";

export const useMetas = (params) =>
  useQuery({ queryKey: ["metas", params], queryFn: () => metasService.getMetas(params) });

export const useCreateMeta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: metasService.createMeta,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear meta"),
  });
};

export const useUpdateMeta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: metasService.updateMeta,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar meta"),
  });
};

export const useAbonarMeta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: metasService.abonarMeta,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al abonar a meta"),
  });
};

export const useUpdateMetaEstado = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: metasService.updateMetaEstado,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al cambiar estado de meta"),
  });
};

export const useDeleteMeta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: metasService.deleteMeta,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al cancelar meta"),
  });
};
