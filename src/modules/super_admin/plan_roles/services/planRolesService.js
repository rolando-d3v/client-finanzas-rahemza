import api from "../../../../config/axios";

// ═══════════════════════════════════════════════════════════════
//  MÓDULOS
// ═══════════════════════════════════════════════════════════════
export const getModulos = () =>
  api.get("/api/planes-roles/modulos").then((res) => res.data);

export const createModulo = (data) =>
  api.post("/api/planes-roles/modulos", data).then((res) => res.data);

export const updateModulo = ({ id, ...data }) =>
  api.put(`/api/planes-roles/modulos/${id}`, data).then((res) => res.data);

export const toggleModulo = (id) =>
  api.patch(`/api/planes-roles/modulos/${id}/toggle`).then((res) => res.data);

export const deleteModulo = (id) =>
  api.delete(`/api/planes-roles/modulos/${id}`).then((res) => res.data);

// ═══════════════════════════════════════════════════════════════
//  PLANES
// ═══════════════════════════════════════════════════════════════
export const getPlanes = () =>
  api.get("/api/planes-roles/planes").then((res) => res.data);

export const createPlan = (data) =>
  api.post("/api/planes-roles/planes", data).then((res) => res.data);

export const updatePlan = ({ id, ...data }) =>
  api.put(`/api/planes-roles/planes/${id}`, data).then((res) => res.data);

export const togglePlan = (id) =>
  api.patch(`/api/planes-roles/planes/${id}/toggle`).then((res) => res.data);

export const deletePlan = (id) =>
  api.delete(`/api/planes-roles/planes/${id}`).then((res) => res.data);

export const syncModulosPlan = ({ id, modulo_ids }) =>
  api.put(`/api/planes-roles/planes/${id}/modulos`, { modulo_ids }).then((res) => res.data);

// ═══════════════════════════════════════════════════════════════
//  ROLES
// ═══════════════════════════════════════════════════════════════
export const getRoles = () =>
  api.get("/api/planes-roles/roles").then((res) => res.data);

export const createRole = (data) =>
  api.post("/api/planes-roles/roles", data).then((res) => res.data);

export const updateRole = ({ id, ...data }) =>
  api.put(`/api/planes-roles/roles/${id}`, data).then((res) => res.data);

export const toggleRole = (id) =>
  api.patch(`/api/planes-roles/roles/${id}/toggle`).then((res) => res.data);

export const deleteRole = (id) =>
  api.delete(`/api/planes-roles/roles/${id}`).then((res) => res.data);

export const syncModulosRol = ({ id, permisos }) =>
  api.put(`/api/planes-roles/roles/${id}/modulos`, { permisos }).then((res) => res.data);
