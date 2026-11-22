import api from "../../../../config/axios";

export const inventarioService = {
  // ─── Productos ───────────────────────────────────────────────
  getProductos: async (params = {}) => {
    const res = await api.get("/api/inventario/productos", { params });
    return res.data;
  },

  getProductoById: async (id) => {
    const res = await api.get(`/api/inventario/productos/${id}`);
    return res.data;
  },

  createProducto: async (data) => {
    const res = await api.post("/api/inventario/productos", data);
    return res.data;
  },

  updateProducto: async (id, data) => {
    const res = await api.put(`/api/inventario/productos/${id}`, data);
    return res.data;
  },

  deleteProducto: async (id) => {
    const res = await api.delete(`/api/inventario/productos/${id}`);
    return res.data;
  },

  // ─── Marcas ──────────────────────────────────────────────────
  getMarcas: async () => {
    const res = await api.get("/api/inventario/marcas");
    return res.data;
  },

  createMarca: async (data) => {
    const res = await api.post("/api/inventario/marcas", data);
    return res.data;
  },

  // ─── Categorías de Producto ──────────────────────────────────
  getCategorias: async () => {
    const res = await api.get("/api/inventario/categorias");
    return res.data;
  },

  createCategoria: async (data) => {
    const res = await api.post("/api/inventario/categorias", data);
    return res.data;
  },
};
