import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../modules/auth/hooks/useAuth";
import { getMiSuscripcion } from "../services/suscripcionSelfService";
import { useMemo } from "react";
import { calcPeriodInfo } from "../../../utils/dateUtils";

/**
 * Hook para consultar y calcular en tiempo real el estado de la suscripción
 * y los días restantes del período de prueba de la empresa del usuario.
 */
export const useMiSuscripcion = () => {
  const { isAuthenticated, empresa, suscripcion: authSuscripcion, plan: authPlan, isSuperAdmin } = useAuth();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["suscripcion", "mi-suscripcion", empresa?.id],
    queryFn: getMiSuscripcion,
    enabled: Boolean(isAuthenticated && empresa?.id && !isSuperAdmin),
    staleTime: 1000 * 60 * 5, // 5 minutos de frescura
    refetchOnWindowFocus: true,
  });

  // Suscripción y plan activos (dando prioridad a la consulta fresca, con fallback a Redux)
  const activeSuscripcion = data?.suscripcion || authSuscripcion || null;
  const activePlan = data?.plan || authPlan || null;
  const serverPrueba = data?.prueba || null;

  const trialInfo = useMemo(() => {
    // Si no hay suscripción o no es prueba
    if (!activeSuscripcion) {
      return {
        esPrueba: false,
        diasTotales: 0,
        diasRestantes: 0,
        porcentajeTranscurrido: 0,
        vencido: false,
        nivelUrgencia: "normal",
        planNombre: activePlan?.nombre || "Sin plan",
      };
    }

    const esPrueba = activeSuscripcion.estado === "prueba";
    if (!esPrueba) {
      return {
        esPrueba: false,
        estado: activeSuscripcion.estado,
        diasTotales: 0,
        diasRestantes: 0,
        porcentajeTranscurrido: 0,
        vencido: false,
        nivelUrgencia: "normal",
        planNombre: activePlan?.nombre || "Plan Activo",
      };
    }

    // Si el servidor ya calculó las métricas, usarlas
    if (serverPrueba) {
      const diasRestantes = serverPrueba.dias_restantes ?? 0;
      const vencido = serverPrueba.vencido || diasRestantes <= 0;
      let nivelUrgencia = "normal";
      if (vencido || diasRestantes <= 2) {
        nivelUrgencia = "danger";
      } else if (diasRestantes <= 5) {
        nivelUrgencia = "warning";
      }

      return {
        esPrueba: true,
        estado: activeSuscripcion.estado,
        diasTotales: serverPrueba.dias_totales || 60,
        diasRestantes,
        porcentajeTranscurrido: serverPrueba.porcentaje_transcurrido ?? 0,
        vencido,
        nivelUrgencia,
        planNombre: activePlan?.nombre || "Plan Pro",
        fechaFin: serverPrueba.fecha_fin,
      };
    }

    // Fallback: cálculo local en el cliente inmune a husos horarios
    let diasTotales = Number(activePlan?.dias_prueba) || 60;
    let diasRestantes = 0;
    let porcentajeTranscurrido = 0;
    let vencido = false;

    if (activeSuscripcion.fecha_fin) {
      const period = calcPeriodInfo(activeSuscripcion.fecha_fin, activeSuscripcion.fecha_inicio);
      diasTotales = period.diasTotales || diasTotales;
      diasRestantes = period.diasRestantes;
      porcentajeTranscurrido = period.porcentajeTranscurrido;
      vencido = period.vencido;
    }

    let nivelUrgencia = "normal";
    if (vencido || diasRestantes <= 2) {
      nivelUrgencia = "danger";
    } else if (diasRestantes <= 5) {
      nivelUrgencia = "warning";
    }

    return {
      esPrueba: true,
      estado: activeSuscripcion.estado,
      diasTotales,
      diasRestantes,
      porcentajeTranscurrido,
      vencido,
      nivelUrgencia,
      planNombre: activePlan?.nombre || "Plan Pro",
      fechaFin: activeSuscripcion.fecha_fin,
    };
  }, [activeSuscripcion, activePlan, serverPrueba]);

  const { user, roles, activeRole, isAdmin } = useAuth();

  const usuarioProviderId = data?.usuario_provider_id || user?.provider_id || null;
  const isGoogleUser = Boolean(
    usuarioProviderId === "google" ||
    user?.provider_id === "google" ||
    (typeof user?.image === "string" && user.image.includes("googleusercontent.com"))
  );
  const isUserAdmin = Boolean(
    isAdmin ||
    roles?.includes("admin") ||
    roles?.includes("ADMIN") ||
    activeRole === "admin" ||
    activeRole?.nombre === "admin"
  );

  const vencimientoInfo = data?.vencimiento_info || null;
  const alerta = data?.alerta || null;

  return {
    suscripcion: activeSuscripcion,
    plan: activePlan,
    trialInfo,
    vencimientoInfo,
    alerta,
    isLoading,
    isError,
    refetch,
    isSuperAdmin,
    isGoogleUser,
    isAdmin: isUserAdmin,
    usuarioProviderId,
    user,
  };
};

