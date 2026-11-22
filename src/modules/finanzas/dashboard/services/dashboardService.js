import api from "../../../../config/axios";

// ⚡ Endpoint consolidado: retorna todo el dashboard en una sola petición
// Params opcionales: { year, fecha_inicio, fecha_fin }
export const getDashboardSummary = (params) =>
  api.get("/api/dashboard/summary", { params }).then((res) => res.data);

// Endpoint independiente para cambio de año en gráfico de flujo de caja
// (evita recargar todo el summary solo por cambiar el año)
export const getFlujoCajaAnual = (year) =>
  api.get("/api/dashboard/flujo-caja-anual", { params: { year } }).then((res) => res.data);
