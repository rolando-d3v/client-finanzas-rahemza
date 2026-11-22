import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extender plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const DEFAULT_TIMEZONE = "America/Lima";

/**
 * Parsea una fecha pura de calendario (YYYY-MM-DD o ISO) de forma inmune
 * a la zona horaria local del navegador.
 * Evita el clásico error donde "2026-09-15" se renderiza como "14 de septiembre" en América.
 */
export const parseCalendarDate = (dateVal) => {
  if (!dateVal) return null;
  if (typeof dateVal === "string") {
    // Si viene como "2026-09-15" o "2026-09-15T00:00:00.000Z", extraer YYYY-MM-DD
    const cleanDate = dateVal.split("T")[0];
    const [year, month, day] = cleanDate.split("-").map(Number);
    if (year && month && day) {
      return dayjs.utc().year(year).month(month - 1).date(day).startOf("day");
    }
  }
  return dayjs.utc(dateVal);
};

/**
 * Formatea una fecha de calendario (ej: "2026-09-15") a formato estándar.
 * Garantiza que el día 15 se muestre como 15 en cualquier país del mundo.
 * Ejemplos de formato: "DD/MM/YYYY", "DD MMM YYYY", "DD [de] MMMM [de] YYYY".
 */
export const formatCalendarDate = (dateVal, formatPattern = "DD/MM/YYYY") => {
  if (!dateVal) return "—";
  try {
    const d = parseCalendarDate(dateVal);
    if (!d || !d.isValid()) return String(dateVal);
    return d.format(formatPattern);
  } catch {
    return String(dateVal);
  }
};

/**
 * Formateo legible y elegante para suscripciones y membresías (ej: "15 sep. 2026").
 */
export const formatFriendlyDate = (dateVal) => {
  if (!dateVal) return "Indefinido";
  return formatCalendarDate(dateVal, "DD MMM YYYY");
};

/**
 * Formatea una marca de tiempo exacta (ej: created_at, logs de auditoría)
 * convirtiéndola a la zona horaria especificada (o zona local del usuario).
 */
export const formatDateTime = (
  isoStr,
  tz = DEFAULT_TIMEZONE,
  formatPattern = "DD/MM/YYYY HH:mm"
) => {
  if (!isoStr) return "—";
  try {
    const d = dayjs(isoStr);
    if (!d.isValid()) return String(isoStr);
    return d.tz(tz || DEFAULT_TIMEZONE).format(formatPattern);
  } catch {
    return String(isoStr);
  }
};

/**
 * Calcula con precisión los días restantes y totales de un período (ej: prueba o plan),
 * eliminando desfasajes de medianoche UTC vs Local.
 */
export const calcPeriodInfo = (fechaFinVal, fechaInicioVal = null) => {
  if (!fechaFinVal) {
    return { diasTotales: 0, diasRestantes: 0, vencido: false, porcentajeTranscurrido: 0 };
  }

  const fin = parseCalendarDate(fechaFinVal);
  if (!fin || !fin.isValid()) {
    return { diasTotales: 0, diasRestantes: 0, vencido: false, porcentajeTranscurrido: 0 };
  }

  // Hoy en UTC para comparar en igualdad de condiciones calendario
  const hoyStr = dayjs().format("YYYY-MM-DD");
  const hoy = parseCalendarDate(hoyStr);

  const inicio = fechaInicioVal
    ? parseCalendarDate(fechaInicioVal)
    : hoy;

  const diffTotal = Math.max(1, fin.diff(inicio, "day"));
  const diffRestante = fin.diff(hoy, "day");

  const vencido = diffRestante <= 0;
  const diasRestantes = Math.max(0, diffRestante);

  let porcentajeTranscurrido = 0;
  if (diffTotal > 0) {
    const diasPasados = diffTotal - diasRestantes;
    porcentajeTranscurrido = Math.min(100, Math.max(0, Math.round((diasPasados / diffTotal) * 100)));
  }

  return {
    diasTotales: diffTotal,
    diasRestantes,
    vencido,
    porcentajeTranscurrido: vencido ? 100 : porcentajeTranscurrido,
  };
};

/**
 * Retorna la fecha de hoy en formato "YYYY-MM-DD" para inputs HTML de tipo date.
 */
export const getTodayInputDate = (tz = DEFAULT_TIMEZONE) => {
  try {
    return dayjs().tz(tz || DEFAULT_TIMEZONE).format("YYYY-MM-DD");
  } catch {
    return dayjs().format("YYYY-MM-DD");
  }
};

export default dayjs;
