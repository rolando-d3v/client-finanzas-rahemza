import { useQuery } from "@tanstack/react-query";
import * as auditoriaService from "../services/auditoriaService";

export const useAuditoria = (params) =>
  useQuery({ queryKey: ["auditoria", params], queryFn: () => auditoriaService.getAuditoria(params) });
