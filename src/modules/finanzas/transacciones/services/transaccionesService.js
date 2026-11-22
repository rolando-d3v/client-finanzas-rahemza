import api from "../../../../config/axios";

export const getTransacciones = (params) =>
  api.get("/api/transacciones", { params }).then((res) => res.data);

// Query separada para KPIs — se cachea más tiempo en el frontend (staleTime: 5 min)
export const getTransaccionesTotals = (params) =>
  api.get("/api/transacciones/totals", { params }).then((res) => res.data);

export const getTransaccionById = (id) =>
  api.get(`/api/transacciones/${id}`).then((res) => res.data);

export const createTransaccion = (data) =>
  api.post("/api/transacciones", data).then((res) => res.data);

export const updateTransaccion = ({ id, ...data }) =>
  api.put(`/api/transacciones/${id}`, data).then((res) => res.data);

export const anularTransaccion = (id) =>
  api.patch(`/api/transacciones/${id}/anular`).then((res) => res.data);

export const deleteTransaccion = (id) =>
  api.delete(`/api/transacciones/${id}`).then((res) => res.data);
