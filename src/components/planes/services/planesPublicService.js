import axios from "axios";
import { API_URL_GASTOS } from "../../../config/constants";

/**
 * Obtiene los planes públicos activos desde la BD (sin autenticación).
 * Endpoint: GET /api/suscripciones/planes-publicos
 */
export const getPublicPlanes = () =>
  axios
    .get(`${API_URL_GASTOS}/api/suscripciones/planes-publicos`)
    .then((res) => res.data);
