import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as categoriasService from "../services/categoriasService";



// obtener categorias
// obtener categorias en formato arbol
export const useCategorias = (params) =>
  useQuery({ queryKey: ["categorias", params], queryFn: () => categoriasService.getCategorias(params) });

// crear categoria
export const useCreateCategoria = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriasService.createCategoria,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear categoría"),
  });
};

// actualizar categoria
export const useUpdateCategoria = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriasService.updateCategoria,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar categoría"),
  });
};

// eliminar categoria
export const useDeleteCategoria = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriasService.deleteCategoria,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al eliminar categoría"),
  });
};
