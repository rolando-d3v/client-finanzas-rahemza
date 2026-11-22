import api from "../../../../config/axios";

export const getCategorias = (params) =>
  api.get("/api/categorias", { params }).then((res) => res.data);

export const createCategoria = (data) =>
  api.post("/api/categorias", data).then((res) => res.data);

export const updateCategoria = ({ id, ...data }) =>
  api.put(`/api/categorias/${id}`, data).then((res) => res.data);

export const deleteCategoria = (id) =>
  api.delete(`/api/categorias/${id}`).then((res) => res.data);
