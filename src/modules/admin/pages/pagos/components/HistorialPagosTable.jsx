import { useState } from "react";
import {
  FiCheckCircle,
  FiFileText,
  FiPrinter,
  FiSmartphone,
  FiCreditCard,
  FiDollarSign,
} from "react-icons/fi";
import { formatCalendarDate, formatDateTime } from "../../../../../utils/dateUtils";
import Modal from "../../../../../components/ui/Modal/Modal";
import EmptyState from "../../../../../components/ui/EmptyState/EmptyState";
import styles from "./HistorialPagosTable.module.css";

/**
 * Retorna el estilo visual y el icono adecuado según el método de pago registrado
 */
const getMetodoBadge = (metodo) => {
  const m = (metodo || "").toLowerCase();
  if (m.includes("yape")) {
    return {
      className: styles.metodoYape,
      label: "Yape",
      icon: <FiSmartphone size={13} />,
    };
  }
  if (m.includes("plin")) {
    return {
      className: styles.metodoPlin,
      label: "Plin",
      icon: <FiSmartphone size={13} />,
    };
  }
  if (m.includes("transfer") || m.includes("banco") || m.includes("bcp") || m.includes("bbva")) {
    return {
      className: styles.metodoTransferencia,
      label: "Transferencia",
      icon: <FiCreditCard size={13} />,
    };
  }
  if (m.includes("efectivo")) {
    return {
      className: styles.metodoEfectivo,
      label: "Efectivo",
      icon: <FiDollarSign size={13} />,
    };
  }
  return {
    className: styles.metodoOtro,
    label: metodo || "Manual",
    icon: <FiCheckCircle size={13} />,
  };
};

/**
 * Tabla de Historial de Pagos de Suscripción (`sub_pagos`)
 */
export default function HistorialPagosTable({
  pagos = [],
  isLoading = false,
  showRegistradoPor = false,
  empresaInfo = null,
  emptyTitle = "Sin pagos registrados",
  emptyDescription = "Aún no hay registros de pagos de suscripción para esta empresa.",
}) {
  const [selectedPago, setSelectedPago] = useState(null);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.tableCard} style={{ padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 48,
                  borderRadius: 10,
                  background: "var(--color-fondo-skeleton)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!pagos || pagos.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon="💳"
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h4 className={styles.title}>Historial de Pagos</h4>
          <span className={styles.countBadge}>
            {pagos.length} {pagos.length === 1 ? "cobro" : "cobros"}
          </span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Plan</th>
                <th>Ciclo</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Estado</th>
                {showRegistradoPor && <th>Validado por</th>}
                <th style={{ textAlign: "right" }}>Recibo</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => {
                const metodoBadge = getMetodoBadge(pago.metodo_pago);
                const montoNum = Number(pago.monto) || 0;

                return (
                  <tr key={pago.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {formatCalendarDate(pago.fecha_pago, "DD [de] MMM, YYYY")}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--color-texto-muted)" }}>
                        {formatDateTime(pago.fecha_pago, undefined, "hh:mm A")}
                      </div>
                    </td>
                    <td>
                      <span className={styles.badgePlan}>
                        {pago.plan_nombre || `Plan #${pago.plan_id}`}
                      </span>
                    </td>
                    <td>
                      <span className={styles.badgeCiclo}>
                        {pago.ciclo_facturacion === "anual" ? "Anual (12m)" : "Mensual (1m)"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.montoHighlight}>
                        S/ {montoNum.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badgeMetodo} ${metodoBadge.className}`}>
                        {metodoBadge.icon}
                        {metodoBadge.label}
                      </span>
                    </td>
                    <td>
                      <span className={styles.badgeEstado}>
                        <FiCheckCircle size={12} />
                        Confirmado
                      </span>
                    </td>
                    {showRegistradoPor && (
                      <td style={{ fontSize: 12.5, color: "var(--color-texto-secundario)" }}>
                        {pago.registrado_por_nombre || pago.registrado_por_user_id || "Super Admin"}
                      </td>
                    )}
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className={styles.btnRecibo}
                        onClick={() => setSelectedPago(pago)}
                        title="Ver Comprobante Digital"
                      >
                        <FiFileText size={14} />
                        <span>Recibo</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal de Recibo Digital ────────────────────────────── */}
      <Modal
        isOpen={Boolean(selectedPago)}
        onClose={() => setSelectedPago(null)}
        title="Constancia de Suscripción"
        size="md"
      >
        {selectedPago && (
          <div className={styles.reciboContainer}>
            <div className={styles.reciboHeader}>
              <div className={styles.reciboLogoSection}>
                <h4>Pappuk</h4>
                <p className={styles.reciboSubtitle}>
                  Plataforma de Gestión Financiera Empresarial
                </p>
              </div>
              <div className={styles.reciboFolio}>
                <span className={styles.reciboFolioLabel}>N° de Transacción</span>
                <span className={styles.reciboFolioNum}>
                  #SUB-{String(selectedPago.id).padStart(6, "0")}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={styles.badgeEstado} style={{ fontSize: 13, padding: "5px 12px" }}>
                <FiCheckCircle size={15} />
                Pago Validado & Activado
              </span>
            </div>

            <div className={styles.reciboDetailsGrid}>
              <div className={styles.reciboDetailItem}>
                <label>Empresa Beneficiaria</label>
                <span>
                  {selectedPago.empresa_nombre_comercial ||
                    selectedPago.empresa_razon_social ||
                    empresaInfo?.nombre_comercial ||
                    empresaInfo?.razon_social ||
                    "Empresa Afiliada"}
                </span>
              </div>

              {(selectedPago.empresa_ruc || empresaInfo?.ruc) && (
                <div className={styles.reciboDetailItem}>
                  <label>RUC</label>
                  <span>{selectedPago.empresa_ruc || empresaInfo?.ruc}</span>
                </div>
              )}

              <div className={styles.reciboDetailItem}>
                <label>Plan Adquirido</label>
                <span>{selectedPago.plan_nombre || `Plan #${selectedPago.plan_id}`}</span>
              </div>

              <div className={styles.reciboDetailItem}>
                <label>Modalidad de Facturación</label>
                <span>
                  {selectedPago.ciclo_facturacion === "anual"
                    ? "Anual (12 Meses)"
                    : "Mensual (1 Mes)"}
                </span>
              </div>

              <div className={styles.reciboDetailItem}>
                <label>Fecha de Validación</label>
                <span>
                  {formatCalendarDate(selectedPago.fecha_pago, "DD [de] MMMM [de] YYYY")}
                </span>
              </div>

              <div className={styles.reciboDetailItem}>
                <label>Canal / Método</label>
                <span style={{ textTransform: "capitalize" }}>
                  {selectedPago.metodo_pago}
                </span>
              </div>
            </div>

            <div className={styles.reciboAmountBox}>
              <span className={styles.reciboAmountLabel}>Monto Cancelado</span>
              <span className={styles.reciboAmountValue}>
                S/ {Number(selectedPago.monto || 0).toFixed(2)}
              </span>
            </div>

            <p className={styles.reciboFooterNote}>
              Este documento certifica que el pago de la suscripción fue recibido y procesado
              correctamente en la infraestructura de Pappuk.
            </p>

            <div className={styles.reciboActions}>
              <button
                type="button"
                className={styles.btnClose}
                onClick={() => setSelectedPago(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className={styles.btnPrint}
                onClick={handlePrint}
              >
                <FiPrinter size={15} />
                Imprimir Recibo
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
