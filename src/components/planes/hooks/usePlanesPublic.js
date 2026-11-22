import { useQuery } from "@tanstack/react-query";
import { getPublicPlanes } from "../services/planesPublicService";

/**
 * Hook para obtener los planes públicos activos desde la BD.
 * Se puede usar tanto en contexto público (sin auth) como privado.
 * staleTime de 5 minutos para evitar refetch innecesario.
 */
export const usePlanesPublic = () =>
  useQuery({
    queryKey: ["planes-publicos"],
    queryFn: getPublicPlanes,
    staleTime: 5 * 60 * 1000,
  });
