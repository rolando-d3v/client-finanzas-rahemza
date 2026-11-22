import api from "../../../config/axios";

/**
 * Auto-suscripción: permite a un usuario autenticado sin suscripción
 * adquirir un plan directamente.
 * Endpoint: POST /api/suscripciones/self-subscribe
 */
export const selfSubscribe = ({ plan_id, ciclo_facturacion }) =>
  api
    .post("/api/suscripciones/self-subscribe", { plan_id, ciclo_facturacion })
    .then((res) => res.data);

/**
 * Obtiene la suscripción actual de la empresa del usuario autenticado,
 * incluyendo estado, plan y métricas del periodo de prueba.
 * Endpoint: GET /api/suscripciones/mi-suscripcion
 */
export const getMiSuscripcion = () =>
  api.get("/api/suscripciones/mi-suscripcion").then((res) => res.data);

/**
 * Obtiene el historial de pagos de suscripción de la empresa del usuario autenticado.
 * Endpoint: GET /api/suscripciones/mis-pagos
 */
export const getMisPagos = () =>
  api.get("/api/suscripciones/mis-pagos").then((res) => res.data);

