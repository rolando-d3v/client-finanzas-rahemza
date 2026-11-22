import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as cuentasService from "../services/cuentasService";

// Hook-query para obtener el listado de cuentas y la información del plan
export const useCuentas = (params) =>
  useQuery({
    queryKey: ["cuentas", params],
    queryFn: () => cuentasService.getCuentas(params),
    select: (response) => ({
      cuentas: response?.data || response || [],
      plan_info: response?.plan_info || null,
    }),
  });

// Hook-query para obtener una cuenta por su ID
export const useCuentaById = (id) =>
  useQuery({ queryKey: ["cuentas", id], queryFn: () => cuentasService.getCuentaById(id), enabled: !!id });

// Hook-query para crear una nueva cuenta
export const useCreateCuenta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cuentasService.createCuenta,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["cuentas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear cuenta"),
  });
};

// Hook-query para actualizar una cuenta existente
export const useUpdateCuenta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cuentasService.updateCuenta,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["cuentas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar cuenta"),
  });
};

// Hook-query para eliminar una cuenta
export const useDeleteCuenta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cuentasService.deleteCuenta,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["cuentas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al eliminar cuenta"),
  });
};
