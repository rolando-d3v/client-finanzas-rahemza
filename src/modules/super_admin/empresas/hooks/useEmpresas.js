import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as empresasService from "../services/empresasService";

export const useEmpresas = (params, options) =>
  useQuery({ 
    queryKey: ["empresas", params], 
    queryFn: () => empresasService.getEmpresas(params),
    ...options 
  });

export const useEmpresaById = (id) =>
  useQuery({ queryKey: ["empresas", id], queryFn: () => empresasService.getEmpresaById(id), enabled: !!id });

export const useCreateEmpresa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: empresasService.createEmpresa,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear empresa"),
  });
};

export const useUpdateEmpresa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: empresasService.updateEmpresa,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar empresa"),
  });
};

export const useDeleteEmpresa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: empresasService.deleteEmpresa,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al eliminar empresa"),
  });
};
