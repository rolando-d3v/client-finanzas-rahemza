import api from "../../../../config/axios";

export const getTransferencias = (params) =>
  api.get("/api/transferencias", { params }).then((res) => res.data);

export const createTransferencia = (data) =>
  api.post("/api/transferencias", data).then((res) => res.data);

export const deleteTransferencia = (id) =>
  api.delete(`/api/transferencias/${id}`).then((res) => res.data);
