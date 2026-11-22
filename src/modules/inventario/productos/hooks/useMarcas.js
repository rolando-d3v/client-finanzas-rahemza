import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventarioService } from "../services/inventarioService";
import { INVENTARIO_KEYS } from "./useProductos";
import { toast } from "sonner";

export const useMarcas = () => {
  return useQuery({
    queryKey: INVENTARIO_KEYS.marcas,
    queryFn: () => inventarioService.getMarcas(),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });
};

export const useCreateMarca = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => inventarioService.createMarca(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVENTARIO_KEYS.marcas });
      toast.success("Marca creada exitosamente");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Error al crear marca");
    },
  });
};

export const useCategoriasProductos = () => {
  return useQuery({
    queryKey: INVENTARIO_KEYS.categorias,
    queryFn: () => inventarioService.getCategorias(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateCategoriaProducto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => inventarioService.createCategoria(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVENTARIO_KEYS.categorias });
      toast.success("Categoría creada exitosamente");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Error al crear categoría");
    },
  });
};
