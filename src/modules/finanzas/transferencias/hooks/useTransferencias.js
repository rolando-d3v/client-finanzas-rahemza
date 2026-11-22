import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as transferenciasService from "../services/transferenciasService";

export const useTransferencias = (params) =>
  useQuery({ queryKey: ["transferencias", params], queryFn: () => transferenciasService.getTransferencias(params) });

export const useCreateTransferencia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transferenciasService.createTransferencia,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["transferencias"] });
      queryClient.invalidateQueries({ queryKey: ["cuentas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear transferencia"),
  });
};

export const useDeleteTransferencia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transferenciasService.deleteTransferencia,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["transferencias"] });
      queryClient.invalidateQueries({ queryKey: ["cuentas"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al eliminar transferencia"),
  });
};
