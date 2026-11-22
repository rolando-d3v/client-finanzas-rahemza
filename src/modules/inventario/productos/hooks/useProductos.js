import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventarioService } from "../services/inventarioService";
import { toast } from "sonner";

export const INVENTARIO_KEYS = {
  productos: ["inventario", "productos"],
  producto: (id) => ["inventario", "producto", id],
  marcas: ["inventario", "marcas"],
  categorias: ["inventario", "categorias"],
};

export const useProductos = (filters = {}) => {
  return useQuery({
    queryKey: [...INVENTARIO_KEYS.productos, filters],
    queryFn: () => inventarioService.getProductos(filters),
    placeholderData: (prev) => prev,
  });
};

export const useProducto = (id) => {
  return useQuery({
    queryKey: INVENTARIO_KEYS.producto(id),
    queryFn: () => inventarioService.getProductoById(id),
    enabled: Boolean(id),
  });
};

export const useCreateProducto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => inventarioService.createProducto(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVENTARIO_KEYS.productos });
      toast.success("Producto creado con éxito");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Error al crear producto");
    },
  });
};

export const useUpdateProducto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => inventarioService.updateProducto(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: INVENTARIO_KEYS.productos });
      qc.invalidateQueries({ queryKey: INVENTARIO_KEYS.producto(variables.id) });
      toast.success("Producto actualizado con éxito");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Error al actualizar producto");
    },
  });
};

export const useDeleteProducto = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => inventarioService.deleteProducto(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INVENTARIO_KEYS.productos });
      toast.success("Producto eliminado");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Error al eliminar producto");
    },
  });
};
