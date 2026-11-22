import { useQuery } from "@tanstack/react-query";
import * as dashboardService from "../services/dashboardService";

/**
 * Hook principal: obtiene todo el dashboard en una sola petición.
 * Params opcionales: { year, fecha_inicio, fecha_fin }
 *
 * Retorna: { kpis, flujo_caja_anual, gastos_por_categoria, saldos_por_cuenta,
 *            presupuestos_resumen, metas_resumen, ultimas_transacciones }
 */
export const useDashboardSummary = (params = {}) =>
  useQuery({
    queryKey: ["dashboard", "summary", params],
    queryFn: () => dashboardService.getDashboardSummary(params),
  });

/**
 * Hook independiente para cuando el usuario cambia el año en FlujoCajaChart.
 * Solo se activa cuando el año es diferente al que ya vino en el summary.
 */
export const useFlujoCajaAnual = (year, { enabled = true } = {}) =>
  useQuery({
    queryKey: ["dashboard", "flujo-caja-anual", year],
    queryFn: () => dashboardService.getFlujoCajaAnual(year),
    enabled,
  });
