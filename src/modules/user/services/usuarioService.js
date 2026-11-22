import api from "../../../config/axios";

// ─── Admin (usuarios de su empresa) ─────────────────────────
export const getUsuarios = () =>
  api.get("/api/users").then((res) => res.data);

export const createUsuario = (data) =>
  api.post("/api/users", data).then((res) => res.data);

export const updateUsuario = ({ id, ...data }) =>
  api.put(`/api/users/${id}`, data).then((res) => res.data);

export const deleteUsuario = (id) =>
  api.delete(`/api/users/${id}`).then((res) => res.data);

// ─── Módulos por usuario ────────────────────────────────────
export const getUserModulos = (userId) =>
  api.get(`/api/users/${userId}/modulos`).then((res) => res.data);

export const updateUserModulos = ({ userId, modulos }) =>
  api.put(`/api/users/${userId}/modulos`, { modulos }).then((res) => res.data);

// ─── Super Admin (usuarios globales) ────────────────────────
export const getAllUsuarios = () =>
  api.get("/api/users/all").then((res) => res.data);

export const createUsuarioSuperAdmin = (data) =>
  api.post("/api/users/super", data).then((res) => res.data);

export const updateUsuarioSuperAdmin = ({ id, ...data }) =>
  api.put(`/api/users/super/${id}`, data).then((res) => res.data);
