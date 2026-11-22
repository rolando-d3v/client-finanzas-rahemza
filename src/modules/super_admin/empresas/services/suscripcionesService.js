import api from "../../../../config/axios";

/**
 * Obtiene la información de suscripción activa y el historial de planes de una empresa.
 * @param {string} empresaId - ID de la empresa.
 * @returns {Promise<Object>} Promesa que resuelve a { suscripcion: Object|null, historial: Array<Object> }.
 */
export const getSuscripcionByEmpresa = (empresaId) =>
  api.get(`/api/suscripciones/empresa/${empresaId}`).then((res) => res.data);

/**
 * Actualiza o crea la suscripción de una empresa y guarda el registro en el historial de planes.
 * @param {Object} params - Objeto con `empresaId` y los datos del plan ({ empresaId, plan_id, estado, ciclo_facturacion, fecha_inicio, fecha_fin, auto_renovar, motivo }).
 * @returns {Promise<Object>} Promesa que resuelve a { msj: string, suscripcion: Object }.
 */
export const updateSuscripcion = ({ empresaId, ...data }) =>
  api.put(`/api/suscripciones/empresa/${empresaId}`, data).then((res) => res.data);

/**
 * Amplía (renueva) la suscripción de una empresa manualmente.
 * @param {Object} params - { empresaId, ciclo_facturacion: "mensual"|"anual", activacion?: "inmediata"|"al_fin_prueba" }
 * @returns {Promise<Object>} Promesa que resuelve a { msj: string, suscripcion: Object }.
 */
export const ampliarSuscripcion = ({ empresaId, ...data }) =>
  api.post(`/api/suscripciones/empresa/${empresaId}/ampliar`, data).then((res) => res.data);
