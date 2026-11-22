import api from "../../../../config/axios";

export const getEtiquetas = () =>
  api.get("/api/etiquetas").then((res) => res.data);

export const createEtiqueta = (data) =>
  api.post("/api/etiquetas", data).then((res) => res.data);

export const updateEtiqueta = ({ id, ...data }) =>
  api.put(`/api/etiquetas/${id}`, data).then((res) => res.data);

export const deleteEtiqueta = (id) =>
  api.delete(`/api/etiquetas/${id}`).then((res) => res.data);
