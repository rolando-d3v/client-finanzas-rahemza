import api from "../../../../config/axios";

export const getMetas = (params) =>
  api.get("/api/metas", { params }).then((res) => res.data);

export const createMeta = (data) =>
  api.post("/api/metas", data).then((res) => res.data);

export const updateMeta = ({ id, ...data }) =>
  api.put(`/api/metas/${id}`, data).then((res) => res.data);

export const abonarMeta = ({ id, monto }) =>
  api.patch(`/api/metas/${id}/abonar`, { monto }).then((res) => res.data);

export const updateMetaEstado = ({ id, estado }) =>
  api.patch(`/api/metas/${id}/estado`, { estado }).then((res) => res.data);

export const deleteMeta = (id) =>
  api.delete(`/api/metas/${id}`).then((res) => res.data);
