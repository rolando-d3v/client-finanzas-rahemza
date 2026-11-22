import api from "../../../../config/axios";

/**
 * Obtiene el listado de todas las empresas.
 * @param {Object} [params] - Parámetros de filtro opcionales (ej: { activo: "true" | "false" }).
 * @returns {Promise<Array<Object>>} Promesa que resuelve al listado de empresas con su suscripción y plan actual.
 */
export const getEmpresas = (params) =>
  api.get("/api/empresas", { params }).then((res) => res.data);

/**
 * Obtiene los detalles de una empresa por su ID.
 * @param {string} id - ID de la empresa.
 * @returns {Promise<Object>} Promesa que resuelve a los datos de la empresa especificada.
 */
export const getEmpresaById = (id) =>
  api.get(`/api/empresas/${id}`).then((res) => res.data);

/**
 * Registra una nueva empresa en el sistema.
 * @param {Object} data - Datos de la empresa ({ ruc, razon_social, nombre_comercial, direccion, telefono, email, website }).
 * @returns {Promise<Object>} Promesa que resuelve con { msj: string, empresa: Object }.
 */
export const createEmpresa = (data) =>
  api.post("/api/empresas", data).then((res) => res.data);

/**
 * Actualiza los datos de una empresa existente.
 * @param {Object} params - Objeto con el `id` de la empresa y los datos a actualizar ({ id, ruc, razon_social, nombre_comercial, ... }).
 * @returns {Promise<Object>} Promesa que resuelve con { msj: string, empresa: Object }.
 */
export const updateEmpresa = ({ id, ...data }) =>
  api.put(`/api/empresas/${id}`, data).then((res) => res.data);

/**
 * Realiza un borrado lógico (desactivación) de una empresa.
 * @param {string} id - ID de la empresa a eliminar.
 * @returns {Promise<Object>} Promesa que resuelve con { msj: string, empresa: Object }.
 */
export const deleteEmpresa = (id) =>
  api.delete(`/api/empresas/${id}`).then((res) => res.data);
