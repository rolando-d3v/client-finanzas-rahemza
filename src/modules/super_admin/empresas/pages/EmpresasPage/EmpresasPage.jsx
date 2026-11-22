import { useState, useMemo, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { FiPlus, FiEdit2, FiTrash2, FiSettings, FiFileText, FiRefreshCw, FiCalendar, FiZap, FiClock, FiArrowRight, FiCreditCard, FiAlertTriangle, FiXCircle, FiPauseCircle } from "react-icons/fi";
import { useEmpresas, useCreateEmpresa, useUpdateEmpresa, useDeleteEmpresa } from "../../hooks/useEmpresas";
import { useSuscripcionByEmpresa, useUpdateSuscripcion, useAmpliarSuscripcion } from "../../hooks/useSuscripciones";
import { usePlanes } from "../../../plan_roles/hooks/usePlanRoles";
import KpiCard from "../../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../../components/ui/Skeleton/Skeleton";
import Modal from "../../../../../components/ui/Modal/Modal";
import EmptyState from "../../../../../components/ui/EmptyState/EmptyState";
import { formatCalendarDate } from "../../../../../utils/dateUtils";
import styles from "./EmpresasPage.module.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const MOTIVO_OPTIONS = [
  { value: "Upgrade / Crecimiento de empresa", label: "Upgrade / Crecimiento de empresa" },
  { value: "Downgrade / Reducción de costos", label: "Downgrade / Reducción de costos" },
  { value: "Cambio de necesidades operativas", label: "Cambio de necesidades operativas" },
  { value: "Promoción / Oferta especial", label: "Promoción / Oferta especial" },
  { value: "Solicitud del cliente", label: "Solicitud del cliente" },
  { value: "Ajuste administrativo", label: "Ajuste administrativo" },
  { value: "Fin de período de prueba", label: "Fin de período de prueba" },
  { value: "Otro motivo", label: "Otro motivo" },
];

const customSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    height: "48px",
    borderRadius: "14px",
    border: state.isFocused ? "1px solid var(--color-borde-focus)" : "1px solid var(--color-borde)",
    backgroundColor: "var(--color-fondo-input)",
    boxShadow: state.isFocused ? "var(--focus-ring)" : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    "&:hover": {
      borderColor: "var(--color-primario)",
    },
  }),
  valueContainer: (baseStyles) => ({
    ...baseStyles,
    padding: "0 16px",
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: "var(--color-texto-body)",
    fontSize: "14px",
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: "var(--color-texto-placeholder)",
    fontSize: "14px",
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: "var(--color-fondo-elevado)",
    borderRadius: "14px",
    border: "1px solid var(--color-borde)",
    boxShadow: "var(--sombra-dropdown)",
    overflow: "hidden",
    zIndex: 99999,
  }),
  menuPortal: (baseStyles) => ({
    ...baseStyles,
    zIndex: 99999,
  }),
  menuList: (baseStyles) => ({
    ...baseStyles,
    padding: "6px",
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "14px",
    cursor: "pointer",
    color: state.isSelected ? "#ffffff" : "var(--color-texto-body)",
    backgroundColor: state.isSelected
      ? "var(--color-primario)"
      : state.isFocused
        ? "var(--color-fondo-hover)"
        : "transparent",
    "&:active": {
      backgroundColor: "var(--color-primario-activo)",
    },
  }),
  input: (baseStyles) => ({
    ...baseStyles,
    color: "var(--color-texto-body)",
  }),
};

// ─── COMPONENTE AMPLIAR PLAN SECTION ─────────────────────────────────────
const AmpliarPlanSection = ({ empresaId, suscripcion, planes }) => {
  const [modalidad, setModalidad] = useState(suscripcion?.ciclo_facturacion || "mensual");
  const [activacion, setActivacion] = useState("inmediata");
  const [isExpanded, setIsExpanded] = useState(false);
  // RN-04: Plan que se va a asignar (puede ser distinto al actual para upgrade/downgrade)
  const [planId, setPlanId] = useState(String(suscripcion?.plan_id || ""));
  // RN-05: Datos de pago manual para sub_pagos
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState("yape");
  const ampliarMut = useAmpliarSuscripcion();

  const estado = suscripcion?.estado;
  const esPrueba = estado === "prueba";
  const esActiva = estado === "activa";
  const esVencidaOCancelada = estado === "vencida" || estado === "cancelada";

  // Obtener plan actual y el plan seleccionado (pueden ser distintos si es upgrade)
  const planActual = planes.find((p) => String(p.id) === String(suscripcion?.plan_id));
  const planSeleccionado = planes.find((p) => String(p.id) === planId) || planActual;
  const precioMensual = planSeleccionado?.precio_mensual ? Number(planSeleccionado.precio_mensual) : 0;
  const precioAnual = planSeleccionado?.precio_anual ? Number(planSeleccionado.precio_anual) : 0;
  const isUpgrade = planId && String(planId) !== String(suscripcion?.plan_id);

  // Calcular fechas preview
  const calcularFechasPreview = () => {
    const meses = modalidad === "anual" ? 12 : 1;
    let fechaBase;
    let nuevaFechaInicio;

    if (esPrueba && activacion === "al_fin_prueba" && suscripcion?.fecha_fin) {
      fechaBase = new Date(suscripcion.fecha_fin);
      nuevaFechaInicio = new Date(suscripcion.fecha_fin);
    } else if (esActiva && suscripcion?.fecha_fin) {
      fechaBase = new Date(suscripcion.fecha_fin);
      nuevaFechaInicio = suscripcion.fecha_inicio ? new Date(suscripcion.fecha_inicio) : new Date();
    } else {
      fechaBase = new Date();
      nuevaFechaInicio = new Date();
    }

    const nuevaFechaFin = new Date(fechaBase);
    nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + meses);

    return {
      inicio: nuevaFechaInicio,
      fin: nuevaFechaFin,
      base: fechaBase,
    };
  };

  const preview = calcularFechasPreview();
  const formatPreviewDate = (d) => d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });

  // Calcular días restantes de prueba
  const diasRestantesPrueba = useMemo(() => {
    if (!esPrueba || !suscripcion?.fecha_fin) return 0;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fin = new Date(suscripcion.fecha_fin);
    fin.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24)));
  }, [esPrueba, suscripcion]);

  const handleAmpliar = () => {
    const payload = {
      empresaId,
      ciclo_facturacion: modalidad,
      ...(esPrueba ? { activacion } : {}),
      // RN-04: si el plan cambió, se envía el nuevo plan_id
      ...(isUpgrade ? { plan_id: Number(planId) } : {}),
      // RN-05: datos de pago para registrar en sub_pagos
      ...(monto ? { monto: Number(monto) } : {}),
      ...(metodoPago ? { metodo_pago: metodoPago } : {}),
    };
    ampliarMut.mutate(payload, {
      onSuccess: () => {
        setIsExpanded(false);
        setMonto("");
      },
    });
  };

  // Estado visual — tokens del design system (light/dark)
  const estadoConfig = {
    prueba: { label: "En Prueba", color: "var(--color-advertencia, #f59e0b)", icon: <FiClock /> },
    activa: { label: "Activa", color: "var(--color-exito, #05ca79)", icon: <FiZap /> },
    vencida: { label: "Vencida", color: "var(--color-error, #ff5252)", icon: <FiClock /> },
    cancelada: { label: "Cancelada", color: "var(--color-texto-secundario, #94a3b8)", icon: <FiClock /> },
  };
  const cfg = estadoConfig[estado] || estadoConfig.cancelada;

  return (
    <div className={styles.ampliarSection}>
      <button
        type="button"
        className={`${styles.ampliarHeader} ${isExpanded ? styles.ampliarHeaderOpen : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.ampliarHeaderLeft}>
          <FiRefreshCw className={styles.ampliarHeaderIcon} />
          <span>Ampliar Plan</span>
        </div>
        <FiArrowRight className={`${styles.ampliarChevron} ${isExpanded ? styles.ampliarChevronOpen : ""}`} />
      </button>

      {isExpanded && (
        <div className={styles.ampliarBody}>
          {/* Estado actual */}
          <div className={styles.ampliarEstadoActual}>
            <div className={styles.ampliarEstadoBadge} style={{ borderColor: cfg.color, color: cfg.color }}>
              {cfg.icon}
              <span>{cfg.label}</span>
            </div>
            {suscripcion?.fecha_fin && (
              <span className={styles.ampliarFechaInfo}>
                <FiCalendar />
                {esActiva ? "Vence" : esPrueba ? "Prueba finaliza" : "Venció"}: {formatPreviewDate(new Date(suscripcion.fecha_fin))}
              </span>
            )}
            {planActual && (
              <span className={styles.ampliarPlanInfo}>
                Plan: <strong>{planActual.nombre}</strong>
              </span>
            )}
          </div>

          {/* Selector de Plan (RN-04: Upgrade/Downgrade) */}
          <div className={styles.ampliarFieldGroup}>
            <label className={styles.ampliarFieldLabel}>
              Plan a asignar {isUpgrade && <span style={{ color: "var(--color-advertencia)", fontSize: 12, fontWeight: 600, marginLeft: 6 }}>⬆ Upgrade/Downgrade</span>}
            </label>
            <select
              className={styles.formInput}
              value={planId}
              onChange={e => setPlanId(e.target.value)}
              style={{ height: 44, borderRadius: 12, border: "1px solid var(--color-borde)", background: "var(--color-fondo-input)", color: "var(--color-texto-body)", padding: "0 14px", fontSize: 14 }}
            >
              <option value="">— Mismo plan actual —</option>
              {planes.map(p => (
                <option key={p.id} value={String(p.id)}>
                  {p.nombre} {String(p.id) === String(suscripcion?.plan_id) ? "(actual)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Modalidad */}
          <div className={styles.ampliarFieldGroup}>
            <label className={styles.ampliarFieldLabel}>Modalidad de pago</label>
            <div className={styles.modalidadCards}>
              <button
                type="button"
                className={`${styles.modalidadCard} ${modalidad === "mensual" ? styles.modalidadCardSelected : ""}`}
                onClick={() => setModalidad("mensual")}
              >
                <div className={styles.modalidadRadio}>
                  <div className={`${styles.modalidadRadioDot} ${modalidad === "mensual" ? styles.modalidadRadioDotActive : ""}`} />
                </div>
                <div className={styles.modalidadContent}>
                  <span className={styles.modalidadTitle}>Mensual</span>
                  <span className={styles.modalidadPrice}>S/ {precioMensual.toFixed(2)} /mes</span>
                </div>
              </button>
              <button
                type="button"
                className={`${styles.modalidadCard} ${modalidad === "anual" ? styles.modalidadCardSelected : ""}`}
                onClick={() => setModalidad("anual")}
              >
                <div className={styles.modalidadRadio}>
                  <div className={`${styles.modalidadRadioDot} ${modalidad === "anual" ? styles.modalidadRadioDotActive : ""}`} />
                </div>
                <div className={styles.modalidadContent}>
                  <span className={styles.modalidadTitle}>Anual</span>
                  <span className={styles.modalidadPrice}>S/ {precioAnual > 0 ? precioAnual.toFixed(2) : (precioMensual * 12).toFixed(2)} /año</span>
                  {precioAnual > 0 && precioAnual < precioMensual * 12 && (
                    <span className={styles.modalidadSavings}>
                      Ahorra S/ {(precioMensual * 12 - precioAnual).toFixed(2)}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Activación (solo para prueba) */}
          {esPrueba && (
            <div className={styles.ampliarFieldGroup}>
              <label className={styles.ampliarFieldLabel}>Activación</label>
              <div className={styles.activacionGroup}>
                <label className={`${styles.radioOption} ${activacion === "inmediata" ? styles.radioOptionSelected : ""}`}>
                  <input
                    type="radio"
                    name="activacion"
                    value="inmediata"
                    checked={activacion === "inmediata"}
                    onChange={() => setActivacion("inmediata")}
                    className={styles.radioInput}
                  />
                  <div className={styles.radioContent}>
                    <FiZap className={styles.radioIcon} />
                    <div>
                      <span className={styles.radioTitle}>Inmediatamente</span>
                      <span className={styles.radioDesc}>La suscripción se activa ahora mismo</span>
                    </div>
                  </div>
                </label>
                <label className={`${styles.radioOption} ${activacion === "al_fin_prueba" ? styles.radioOptionSelected : ""}`}>
                  <input
                    type="radio"
                    name="activacion"
                    value="al_fin_prueba"
                    checked={activacion === "al_fin_prueba"}
                    onChange={() => setActivacion("al_fin_prueba")}
                    className={styles.radioInput}
                  />
                  <div className={styles.radioContent}>
                    <FiClock className={styles.radioIcon} />
                    <div>
                      <span className={styles.radioTitle}>Al finalizar período de prueba</span>
                      <span className={styles.radioDesc}>
                        {diasRestantesPrueba > 0
                          ? `Faltan ${diasRestantesPrueba} día${diasRestantesPrueba !== 1 ? "s" : ""} de prueba`
                          : "El período de prueba ya finalizó"}
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Resumen */}
          <div className={styles.ampliarResumen}>
            <div className={styles.ampliarResumenTitle}>Resumen</div>
            <div className={styles.ampliarResumenRow}>
              <span>Nuevo período:</span>
              <strong>
                {esActiva ? formatPreviewDate(preview.base) : formatPreviewDate(preview.inicio)}
                {" → "}
                {formatPreviewDate(preview.fin)}
              </strong>
            </div>
            <div className={styles.ampliarResumenRow}>
              <span>Ciclo:</span>
              <strong>{modalidad === "anual" ? "Anual (12 meses)" : "Mensual (1 mes)"}</strong>
            </div>
            {esVencidaOCancelada && (
              <div className={styles.ampliarResumenNote}>
                💡 La facturación comenzará desde hoy (fecha del pago)
              </div>
            )}
            {esPrueba && activacion === "al_fin_prueba" && (
              <div className={styles.ampliarResumenNote}>
                💡 La facturación comenzará cuando finalice el período de prueba
              </div>
            )}
          </div>

          {/* Datos de pago manual (RN-05) */}
          <div className={styles.ampliarFieldGroup}>
            <label className={styles.ampliarFieldLabel}>Datos del pago recibido <span style={{ color: "var(--color-texto-muted)", fontWeight: 400, fontSize: 12 }}>(opcional)</span></label>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--color-texto-secundario)", display: "block", marginBottom: 4 }}>Monto cobrado (S/)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 39.90"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  style={{ width: "100%", height: 40, borderRadius: 10, border: "1px solid var(--color-borde)", background: "var(--color-fondo-input)", color: "var(--color-texto-body)", padding: "0 12px", fontSize: 14 }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--color-texto-secundario)", display: "block", marginBottom: 4 }}>Método de pago</label>
                <select
                  value={metodoPago}
                  onChange={e => setMetodoPago(e.target.value)}
                  style={{ width: "100%", height: 40, borderRadius: 10, border: "1px solid var(--color-borde)", background: "var(--color-fondo-input)", color: "var(--color-texto-body)", padding: "0 10px", fontSize: 14 }}
                >
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botón */}
          <button
            type="button"
            className={styles.ampliarBtn}
            onClick={handleAmpliar}
            disabled={ampliarMut.isPending}
          >
            <FiRefreshCw className={ampliarMut.isPending ? styles.ampliarBtnSpinning : ""} />
            {ampliarMut.isPending ? "Ampliando..." : "Confirmar y Ampliar"}
          </button>
        </div>
      )}
    </div>
  );
};


// ─── COMPONENTE SUSCRIPCIÓN TAB ──────────────────────────────────────────
const SuscripcionTab = ({ empresaId }) => {
  const { data, isLoading } = useSuscripcionByEmpresa(empresaId);
  const updateMut = useUpdateSuscripcion();
  const { data: planesData } = usePlanes();
  
  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm();
  const planes = planesData || [];

  const watchedPlanId = watch("plan_id");
  const initialPlanId = data?.suscripcion?.plan_id;
  const isPlanChanged = Boolean(
    watchedPlanId &&
    initialPlanId &&
    String(watchedPlanId) !== String(initialPlanId)
  );

  // Reset form when data arrives
  useEffect(() => {
    if (data?.suscripcion) {
      reset({
        plan_id: data.suscripcion.plan_id ? String(data.suscripcion.plan_id) : "",
        estado: data.suscripcion.estado || "prueba",
        ciclo_facturacion: data.suscripcion.ciclo_facturacion || "mensual",
        fecha_inicio: data.suscripcion.fecha_inicio ? data.suscripcion.fecha_inicio.split('T')[0] : "",
        fecha_fin: data.suscripcion.fecha_fin ? data.suscripcion.fecha_fin.split('T')[0] : "",
        auto_renovar: data.suscripcion.auto_renovar,
        motivo: null,
      });
    }
  }, [data, reset]);

  const onSubmit = (formData) => {
    const motivoText = formData.motivo?.value || (typeof formData.motivo === "string" ? formData.motivo : null);
    const payload = {
      ...formData,
      empresaId,
      motivo: isPlanChanged ? motivoText : null,
    };
    updateMut.mutate(payload);
  };

  if (isLoading) return (
    <div className={styles.suscripcionForm}>
      {/* Skeleton del formulario — mantiene la estructura del modal mientras carga */}
      <div className={styles.form} style={{ gap: 16 }}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <div className={styles.formLabel} style={{ height: 14, width: 40, background: "var(--color-fondo-skeleton)", borderRadius: 6 }} />
            <div style={{ height: 48, borderRadius: 14, background: "var(--color-fondo-skeleton)", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
          <div className={styles.formGroup}>
            <div className={styles.formLabel} style={{ height: 14, width: 50, background: "var(--color-fondo-skeleton)", borderRadius: 6 }} />
            <div style={{ height: 48, borderRadius: 14, background: "var(--color-fondo-skeleton)", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        </div>
        <div className={styles.formRow}>
          {[1, 2].map(i => (
            <div key={i} className={styles.formGroup}>
              <div style={{ height: 14, width: 80, background: "var(--color-fondo-skeleton)", borderRadius: 6 }} />
              <div style={{ height: 48, borderRadius: 14, background: "var(--color-fondo-skeleton)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
            </div>
          ))}
        </div>
        <div className={styles.formRow}>
          {[1, 2].map(i => (
            <div key={i} className={styles.formGroup}>
              <div style={{ height: 14, width: 70, background: "var(--color-fondo-skeleton)", borderRadius: 6 }} />
              <div style={{ height: 48, borderRadius: 14, background: "var(--color-fondo-skeleton)", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.suscripcionForm}>
       <form id="form-suscripcion" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
         <div className={styles.formRow}>
           <div className={styles.formGroup}>
             <label className={styles.formLabel}>Plan</label>
             <select className={styles.formInput} {...register("plan_id", { required: true })}>
               <option value="">Seleccione un plan</option>
               {planes.map(p => <option key={p.id} value={String(p.id)}>{p.nombre}</option>)}
             </select>
           </div>
           <div className={styles.formGroup}>
             <label className={styles.formLabel}>Estado</label>
             <select className={styles.formInput} {...register("estado")}>
               <option value="prueba">Prueba</option>
               <option value="activa">Activa</option>
               <option value="cancelada">Cancelada</option>
               <option value="vencida">Vencida</option>
             </select>
           </div>
         </div>

         {isPlanChanged && (
           <div className={styles.formGroup}>
             <label className={styles.formLabel}>Motivo del cambio de plan *</label>
             <Controller
               name="motivo"
               control={control}
               rules={{ required: "Debe seleccionar un motivo para el cambio de plan" }}
               render={({ field }) => (
                 <Select
                   {...field}
                   options={MOTIVO_OPTIONS}
                   placeholder="Seleccione el motivo del cambio..."
                   styles={customSelectStyles}
                   isClearable
                   menuPortalTarget={document.body}
                 />
               )}
             />
             {errors.motivo && <span className={styles.formError}>{errors.motivo.message}</span>}
           </div>
         )}

         <div className={styles.formRow}>
           <div className={styles.formGroup}>
             <label className={styles.formLabel}>Ciclo Facturación</label>
             <select className={styles.formInput} {...register("ciclo_facturacion")}>
               <option value="mensual">Mensual</option>
               <option value="anual">Anual</option>
             </select>
           </div>
           <div className={styles.formGroup}>
             <label className={styles.formLabel}>Auto-Renovar</label>
             <div style={{ marginTop: 10 }}>
               <input type="checkbox" {...register("auto_renovar")} style={{ accentColor: "var(--color-primario)", width: 18, height: 18 }} />
             </div>
           </div>
         </div>
         <div className={styles.formRow}>
           <div className={styles.formGroup}>
             <label className={styles.formLabel}>Fecha Inicio</label>
             <input type="date" className={styles.formInput} {...register("fecha_inicio")} />
           </div>
           <div className={styles.formGroup}>
             <label className={styles.formLabel}>Fecha Fin</label>
             <input type="date" className={styles.formInput} {...register("fecha_fin")} />
           </div>
         </div>
         <button type="submit" style={{ display: "none" }} id="submit-suscripcion"></button>
       </form>

       {/* ── Sección Ampliar Plan ──────────────────────── */}
       {data?.suscripcion && (
         <AmpliarPlanSection
           empresaId={empresaId}
           suscripcion={data.suscripcion}
           planes={planes}
         />
       )}
       
       <h4 className={styles.sectionTitle}>Historial de Planes</h4>
       {data?.historial?.length > 0 ? (
         <div className={styles.historyWrapper}>
           <table className={styles.historyTable}>
             <thead>
               <tr>
                 <th>Fecha</th>
                 <th>Plan Anterior</th>
                 <th>Plan Nuevo</th>
                 <th>Motivo</th>
               </tr>
             </thead>
             <tbody>
               {data.historial.map(h => (
                 <tr key={h.id}>
                   <td data-label="Fecha">{formatCalendarDate(h.created_at)}</td>
                   <td data-label="Plan Anterior">
                      {h.plan_anterior_nombre ? (
                        <span className={`${styles.badgePlan} ${getPlanBadgeClass(h.plan_anterior_nombre)}`}>
                          {h.plan_anterior_nombre}
                        </span>
                      ) : (
                        "—"
                      )}
                   </td>
                   <td data-label="Plan Nuevo">
                      <span className={`${styles.badgePlan} ${getPlanBadgeClass(h.plan_nuevo_nombre)}`}>
                        {h.plan_nuevo_nombre}
                      </span>
                   </td>
                   <td data-label="Motivo" title={h.motivo}>{h.motivo}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       ) : (
         <p style={{ fontSize: 13, color: "var(--color-texto-secundario)" }}>No hay historial registrado.</p>
       )}
     </div>
  );
};

// ─── Helper de UX: Colores por Tipo / Tier de Plan ───────────
const getPlanBadgeClass = (planNombre, planCodigo) => {
  const name = (planNombre || "").toLowerCase();
  const code = (planCodigo || "").toLowerCase();

  // 1. Básico / Freemium / Gratis: Slate Neutro Elegante
  if (
    name.includes("básico") ||
    name.includes("basico") ||
    name.includes("gratis") ||
    name.includes("free") ||
    code.includes("basico") ||
    code.includes("free")
  ) {
    return styles.badgePlanBasico;
  }

  // 2. Empresa ERP / Premium / Enterprise: Púrpura Imperial
  if (
    name.includes("erp") ||
    name.includes("empresa") ||
    name.includes("premium") ||
    code.includes("erp") ||
    code.includes("premium")
  ) {
    return styles.badgePlanEmpresa;
  }

  // 3. Inventario / Comercio Pro: Azul Operativo (Info)
  if (
    name.includes("inventario") ||
    name.includes("comercio") ||
    name.includes("almacen") ||
    code.includes("inventario") ||
    code.includes("comercio")
  ) {
    return styles.badgePlanInventario;
  }

  // 4. Finanzas Pro / Pro: Verde Lima / Identidad Central
  if (
    name.includes("pro") ||
    name.includes("finanza") ||
    code.includes("pro") ||
    code.includes("finanzas")
  ) {
    return styles.badgePlanPro;
  }

  // 5. Fallback para otros planes: Ámbar
  return styles.badgePlanDefault;
};

const EmpresasPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [suscripcionModalOpen, setSuscripcionModalOpen] = useState(false);
  const [suscripcionEmpresa, setSuscripcionEmpresa] = useState(null);

  const { data: empresas, isLoading } = useEmpresas();
  const createMutation = useCreateEmpresa();
  const updateMutation = useUpdateEmpresa();
  const deleteMutation = useDeleteEmpresa();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const kpis = useMemo(() => {
    if (!empresas?.length) return { total: 0, activas: 0, prueba: 0 };
    return {
      total: empresas.length,
      activas: empresas.filter((e) => e.suscripcion_estado === "activa").length,
      prueba: empresas.filter((e) => e.suscripcion_estado === "prueba").length,
    };
  }, [empresas]);

  const handleEdit = useCallback((empresa) => {
    setEditingEmpresa(empresa);
    reset({
      razon_social: empresa.razon_social,
      nombre_comercial: empresa.nombre_comercial || "",
      ruc: empresa.ruc || "",
      direccion: empresa.direccion || "",
      telefono: empresa.telefono || "",
      email: empresa.email || "",
      moneda_default: empresa.moneda_default || "PEN",
    });
    setModalOpen(true);
  }, [reset]);

  const handleDelete = useCallback((id) => {
    if (window.confirm("¿Estás seguro de eliminar esta empresa?")) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleOpenSuscripcion = useCallback((empresa) => {
    setSuscripcionEmpresa(empresa);
    setSuscripcionModalOpen(true);
  }, []);

  const handleOpenCreate = () => {
    setEditingEmpresa(null);
    reset({ razon_social: "", nombre_comercial: "", ruc: "", direccion: "", telefono: "", email: "", moneda_default: "PEN" });
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingEmpresa) {
      updateMutation.mutate({ id: editingEmpresa.id, ...data }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(data, { onSuccess: () => setModalOpen(false) });
    }
  };

  const rowSelectionConfig = useMemo(() => ({ mode: "singleRow" }), []);

  const columnDefs = useMemo(() => [
    { headerName: "Razón Social", field: "razon_social", flex: 1, minWidth: 170, filter: true, sortable: true },
    { headerName: "Nombre Comercial", field: "nombre_comercial", flex: 1, minWidth: 150, valueFormatter: (p) => p.value || "—" },
    { headerName: "RUC", field: "ruc", flex: 0.8, minWidth: 115,filter: true, sortable: true, valueFormatter: (p) => p.value || "—" },
    { headerName: "Email", field: "email", flex: 0.5, minWidth: 170, valueFormatter: (p) => p.value || "—" },
    
    {
      headerName: "Plan",
      field: "plan_nombre",
      flex: 0.8,
      minWidth: 160,
      filter: true,
      sortable: true,
      cellRenderer: (p) => {
        if (!p.value) return <span className={styles.planSinAsignar}>Sin plan</span>;
        const badgeClass = getPlanBadgeClass(p.value, p.data?.plan_codigo);
        return (
          <span className={`${styles.badgePlan} ${badgeClass}`}>
            {p.value}
          </span>
        );
      },
    },
    {
      headerName: "E. Suscripción",
      field: "suscripcion_estado",
      flex: 0.9,
      minWidth: 160,
      filter: true,
      sortable: true,
      valueFormatter: (p) => {
        const map = {
          activa: "Activa",
          prueba: "En Prueba",
          vencida: "Vencida",
          cancelada: "Cancelada",
          suspendida: "Suspendida",
        };
        return map[p.value] || (p.value ? p.value : "Sin suscripción");
      },
      cellRenderer: (p) => {
        const estado = p.value?.toLowerCase();
        if (!estado) {
          return (
            <span className={`${styles.badgeEstadoSuscripcion} ${styles.badgeEstadoSinSuscripcion}`}>
              Sin suscripción
            </span>
          );
        }

        const config = {
          activa: { label: "Activa", icon: <FiZap />, className: styles.badgeEstadoActiva },
          prueba: { label: "En Prueba", icon: <FiClock />, className: styles.badgeEstadoPrueba },
          vencida: { label: "Vencida", icon: <FiAlertTriangle />, className: styles.badgeEstadoVencida },
          cancelada: { label: "Cancelada", icon: <FiXCircle />, className: styles.badgeEstadoCancelada },
          suspendida: { label: "Suspendida", icon: <FiPauseCircle />, className: styles.badgeEstadoSuspendida },
        };

        const current = config[estado] || {
          label: estado.charAt(0).toUpperCase() + estado.slice(1),
          icon: <FiClock />,
          className: styles.badgeEstadoSinSuscripcion,
        };

        return (
          <span className={`${styles.badgeEstadoSuscripcion} ${current.className}`}>
            {current.icon}
            <span>{current.label}</span>
          </span>
        );
      },
    },
    { headerName: "Ciclo", field: "suscripcion_ciclo", flex: 0.7, minWidth: 95, sortable: true, valueFormatter: (p) => p.value ? (p.value === "mensual" ? "Mensual" : "Anual") : "—" },
    {
      headerName: "F. Suscripción",
      valueGetter: (p) => {
        if (!p.data?.suscripcion_inicio) return "—";
        const inicio = formatCalendarDate(p.data.suscripcion_inicio);
        const fin = p.data.suscripcion_fin ? formatCalendarDate(p.data.suscripcion_fin) : "∞";
        return `${inicio} - ${fin}`;
      },
      flex: 1.2, minWidth: 180
    },
    {
      headerName: "Acciones", flex: 0.9, minWidth: 140, sortable: false, filter: false,
      cellRenderer: (p) => {
        if (!p.data) return null;
        return (
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.suscripcionBtn}`}
              onClick={() => handleOpenSuscripcion(p.data)}
              title="Gestionar Suscripción"
            >
              <FiCreditCard />
            </button>
            <button type="button" className={styles.actionBtn} onClick={() => handleEdit(p.data)} title="Editar"><FiEdit2 /></button>
            <button type="button" className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(p.data.id)} title="Eliminar"><FiTrash2 /></button>
          </div>
        );
      },
    },
  ], [handleEdit, handleDelete, handleOpenSuscripcion]);

  const defaultColDef = useMemo(() => ({ resizable: true }), []);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Empresas</h1>
            <p className={styles.pageSubtitle}>Administra las empresas del sistema</p>
          </div>
          <button className={styles.primaryBtn} onClick={handleOpenCreate}>
            <FiPlus /> Nueva Empresa
          </button>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        {isLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard label="Total Empresas" value={kpis.total} color="primary" />
            <KpiCard label="Suscripción Activa" value={kpis.activas} icon={FiZap} color="success" />
            <KpiCard label="En Prueba" value={kpis.prueba} icon={FiClock} color="warning" />
          </>
        )}
      </div>

      <div className={styles.tableCard}>
        {!isLoading && (!empresas || empresas.length === 0) ? (
          <EmptyState title="Sin empresas" description="Crea la primera empresa del sistema." icon="🏢" action={<button className={styles.primaryBtn} onClick={handleOpenCreate}><FiPlus /> Crear empresa</button>} />
        ) : (
          <div className={styles.gridContainer}>
            <AgGridReact
              rowData={empresas || []}
              getRowId={(p) => String(p.data.id)}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              domLayout="autoHeight"
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}
              rowSelection={rowSelectionConfig}
              suppressCellFocus={true}
              loading={isLoading}
            />
          </div>
        )}
      </div>

      {/* ── Modal Crear / Editar Empresa ────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEmpresa ? "Editar Empresa" : "Nueva Empresa"}
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>Cancelar</button>
            <button
              className={styles.primaryBtn}
              onClick={handleSubmit(onSubmit)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingEmpresa ? "Guardar Empresa" : "Crear Empresa"}
            </button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Razón Social *</label>
            <input className={styles.formInput} {...register("razon_social", { required: "La razón social es requerida" })} placeholder="Ej: Mi Empresa SAC" />
            {errors.razon_social && <span className={styles.formError}>{errors.razon_social.message}</span>}
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label className={styles.formLabel}>Nombre Comercial</label><input className={styles.formInput} {...register("nombre_comercial")} placeholder="Nombre comercial" /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>RUC</label><input className={styles.formInput} {...register("ruc")} placeholder="20XXXXXXXXX" /></div>
          </div>
          <div className={styles.formGroup}><label className={styles.formLabel}>Dirección</label><input className={styles.formInput} {...register("direccion")} placeholder="Dirección fiscal" /></div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label className={styles.formLabel}>Teléfono</label><input className={styles.formInput} {...register("telefono")} placeholder="+51 999 999 999" /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Email</label><input className={styles.formInput} type="email" {...register("email")} placeholder="empresa@email.com" /></div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Moneda Default</label>
            <select className={styles.formInput} {...register("moneda_default")}><option value="PEN">PEN</option><option value="USD">USD</option></select>
          </div>
        </form>
      </Modal>

      {/* ── Modal de Gestión de Suscripción ─────────────────────── */}
      <Modal
        isOpen={suscripcionModalOpen}
        onClose={() => setSuscripcionModalOpen(false)}
        title={`Suscripción — ${suscripcionEmpresa?.razon_social || suscripcionEmpresa?.nombre_comercial || "Empresa"}`}
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setSuscripcionModalOpen(false)}>
              Cerrar
            </button>
            <button
              className={styles.primaryBtn}
              onClick={() => document.getElementById("submit-suscripcion")?.click()}
            >
              Guardar Suscripción
            </button>
          </>
        }
      >
        {suscripcionEmpresa && (
          <SuscripcionTab empresaId={suscripcionEmpresa.id} />
        )}
      </Modal>
    </div>
  );
};

export default EmpresasPage;
