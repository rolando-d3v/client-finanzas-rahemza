import api from "../../../../config/axios";

export const getPresupuestos = (params) =>
  api.get("/api/presupuestos", { params }).then((res) => res.data);

export const createPresupuesto = (data) =>
  api.post("/api/presupuestos", data).then((res) => res.data);

export const updatePresupuesto = ({ id, ...data }) =>
  api.put(`/api/presupuestos/${id}`, data).then((res) => res.data);

export const deletePresupuesto = (id) =>
  api.delete(`/api/presupuestos/${id}`).then((res) => res.data);
