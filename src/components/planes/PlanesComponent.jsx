import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { FiCheck, FiArrowRight, FiLock, FiX, FiClock, FiShield, FiZap, FiCheckCircle, FiCalendar, FiUsers, FiCreditCard, FiMessageCircle, FiCopy } from "react-icons/fi";
import { FaGoogle, FaWhatsapp } from "react-icons/fa";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate, useLocation } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import styles from "./planes.module.css";
import { usePlanesPublic } from "./hooks/usePlanesPublic";
import { selfSubscribe } from "./services/suscripcionSelfService";
import { useMiSuscripcion } from "./hooks/useMiSuscripcion";
import { formatCalendarDate } from "../../utils/dateUtils";
import { setCredentials } from "../../redux/slices/authSlice";
import { verifyAuthService } from "../../modules/auth/services/authService";

gsap.registerPlugin(ScrollTrigger);

/**
 * PlanesComponent — Componente compartido para mostrar planes.
 *
 * @param {boolean} isAuthenticated — Si el usuario está logueado.
 * @param {object|null} suscripcion — Suscripción actual del usuario (si tiene).
 * @param {string|null} empresaId — ID de la empresa del usuario.
 */
export default function PlanesComponent({
  isAuthenticated = false,
  suscripcion = null,
  empresaId = null,
  isPlanesAdmin = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const [isAnnual, setIsAnnual] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppPlan, setWhatsAppPlan] = useState(null);
  // Tipo de cambio que se está solicitando — determina el mensaje de WhatsApp
  // Valores: 'nuevo' | 'upgrade' | 'cambio_ciclo' | 'renovar'
  const [planChangeType, setPlanChangeType] = useState('nuevo');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  // ─── Datos de planes desde la BD ──────────────────────────
  const { data: planesData, isLoading: loadingPlanes } = usePlanesPublic();
  const planes = planesData || [];

  // ─── Información de suscripción y usuario (hook useMiSuscripcion) ──
  const {
    suscripcion: freshSuscripcion,
    plan: freshPlan,
    trialInfo,
    isGoogleUser,
    isAdmin,
  } = useMiSuscripcion();

  const activeSub = freshSuscripcion || suscripcion;

  // Determinar si está en la ruta /admin/planes
  const isPlanesAdminRoute = isPlanesAdmin || location?.pathname === "/admin/planes";

  // CONDICIÓN: Solo cuando esté en /admin/planes, cuenta logueada con Google y rol = admin
  const showCurrentPlanInfo = Boolean(
    isPlanesAdminRoute &&
    isGoogleUser &&
    isAdmin &&
    activeSub
  );

  // Encontrar el plan actual según la suscripción
  const currentPlan = useMemo(() => {
    if (!activeSub) return null;
    return (
      freshPlan ||
      planes.find((p) => String(p.id) === String(activeSub.plan_id)) ||
      null
    );
  }, [activeSub, freshPlan, planes]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Indefinido";
    return formatCalendarDate(dateStr, "DD [de] MMM [de] YYYY");
  };

  // ─── Mutation para auto-suscripción ───────────────────────
  const subscribeMutation = useMutation({
    mutationFn: selfSubscribe,
    onSuccess: async (data) => {
      toast.success(data.msj || "¡Plan activado exitosamente!");
      setShowModal(false);

      // Limpiar caché local de auth
      localStorage.removeItem("pappuk_auth_cache");

      // Invalidar caché de React Query para refrescar componentes suscritos
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suscripcion", "mi-suscripcion"] }),
        queryClient.invalidateQueries({ queryKey: ["auth", "verify"] }),
      ]);

      // Refrescar inmediatamente el estado de autenticación y los módulos en Redux
      try {
        const freshAuth = await verifyAuthService();
        if (freshAuth?.user && freshAuth?.empresa) {
          dispatch(setCredentials(freshAuth));
          localStorage.setItem("pappuk_auth_cache", JSON.stringify(freshAuth));
        }
      } catch (err) {
        console.error("Error al actualizar módulos en sidebar:", err);
      }

      // Redirigir al dashboard tras activar el plan
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    },
    onError: (error) => {
      const msg = error.response?.data?.msj || "Error al activar el plan";
      toast.error(msg);
    },
  });

  // ─── Addon toggles ────────────────────────────────────────
  const toggleAddon = (planId, addonId) => {
    const key = `${planId}_${addonId}`;
    setSelectedAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ─── WhatsApp modal: datos derivados + copy + a11y ──────────
  // El mensaje cambia según el tipo de acción solicitada
  const waData = useMemo(() => {
    if (!whatsAppPlan) return null;
    const precio = Number(isAnnual ? whatsAppPlan.precio_anual : whatsAppPlan.precio_mensual) || 0;
    const modalidad = isAnnual ? "Anual (12 meses)" : "Mensual (1 mes)";

    // Construir intención del mensaje según el tipo de cambio
    let intencion = "activar mi suscripción";
    if (planChangeType === 'upgrade') {
      intencion = `cambiar al plan ${whatsAppPlan.nombre} (upgrade)`;
    } else if (planChangeType === 'cambio_ciclo') {
      intencion = `cambiar mi ciclo de facturación a ANUAL en el plan ${whatsAppPlan.nombre}`;
    } else if (planChangeType === 'renovar') {
      intencion = `renovar mi suscripción al plan ${whatsAppPlan.nombre}`;
    }

    const lineas = [
      `Hola, deseo ${intencion} en Pappuk.`,
      "",
      `Plan: ${whatsAppPlan.nombre}`,
      `Modalidad: ${modalidad}`,
      `Total a pagar: S/ ${precio.toFixed(2)}`,
      "Medio de pago: Yape / Plin",
      "Número Yape/Plin: 985 503 581",
      "",
      "Adjunto mi comprobante. Gracias!",
    ];
    return {
      precio,
      modalidad,
      planChangeType,
      waUrl: `https://wa.me/51985503581?text=${encodeURIComponent(lineas.join("\n"))}`,
    };
  }, [whatsAppPlan, isAnnual, planChangeType]);

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText("985503581");
    } catch {
      const t = document.createElement("textarea");
      t.value = "985503581";
      document.body.appendChild(t);
      t.select();
      try { document.execCommand("copy"); } catch { /* noop */ }
      t.remove();
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!showWhatsAppModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShowWhatsAppModal(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(copyTimer.current);
      setCopied(false);
    };
  }, [showWhatsAppModal]);

  // ─── GSAP Animations ─────────────────────────────────────
  const sectionRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.header}`,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        },
      );
      gsap.fromTo(
        `.${styles.pricingGrid} > div`,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: `.${styles.pricingGrid}`, start: "top 75%" },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [planes]);

  // ─── Auto-abrir modal si viene con plan preseleccionado ───
  useEffect(() => {
    if (!isAuthenticated || !planes.length) return;
    const pendingPlanId = sessionStorage.getItem("pending_plan_id");
    if (pendingPlanId) {
      const plan = planes.find((p) => String(p.id) === pendingPlanId);
      if (plan && plan.disponible !== false) {
        setSelectedPlan(plan);
        setShowModal(true);
      }
      sessionStorage.removeItem("pending_plan_id");
    }
  }, [isAuthenticated, planes]);

  // ─── Helpers de clasificación de plan ────────────────────
  /**
   * Determina el precio de referencia de un plan para comparar jerarquía.
   * Siempre usamos precio_mensual como base de comparación.
   */
  const getPlanPrecioBase = (plan) => Number(plan.precio_mensual) || 0;

  /**
   * Verifica si el usuario ya tiene el mismo plan activo (sin importar ciclo).
   */
  const isMismoPlan = (plan) =>
    activeSub && String(plan.id) === String(activeSub.plan_id);

  /**
   * Verifica si el plan objetivo es un upgrade respecto al plan actual.
   */
  const isUpgrade = (plan) => {
    if (!currentPlan) return false;
    return getPlanPrecioBase(plan) > getPlanPrecioBase(currentPlan);
  };

  /**
   * Mismo plan + toggle Anual + suscripción actual NO es anual → quiere cambiar a anual.
   * Cubre ciclo_facturacion = 'mensual', null o undefined.
   */
  const isCambioCicloAAnual = (plan) =>
    isMismoPlan(plan) &&
    isAnnual &&
    activeSub?.ciclo_facturacion !== 'anual';

  /**
   * Mismo plan + toggle Mensual + suscripción actual ES anual → quiere cambiar a mensual.
   */
  const isCambioCicloAMensual = (plan) =>
    isMismoPlan(plan) &&
    !isAnnual &&
    activeSub?.ciclo_facturacion === 'anual';

  /** Cualquier cambio de ciclo (en cualquier dirección) sobre el mismo plan. */
  const isCambioCiclo = (plan) => isCambioCicloAAnual(plan) || isCambioCicloAMensual(plan);

  // ─── Lógica del botón "Obtener Plan" ──────────────────────
  const handlePlanClick = (plan) => {
    // Plan no disponible (Empresa Premium)
    if (plan.disponible === false) return;

    // Usuario no autenticado → guardar plan y redirigir a registro
    if (!isAuthenticated) {
      sessionStorage.setItem("pending_plan_id", String(plan.id));
      navigate("/register");
      return;
    }

    const esPlanGratis = isFreePlan(plan);
    const tieneSubActiva = Boolean(activeSub);
    const subActiva = activeSub?.estado === 'activa';
    const subPrueba = activeSub?.estado === 'prueba';
    const subVencida = activeSub?.estado === 'vencida';

    // ── CASO 1: Mismo plan activo + mismo ciclo → ya lo tiene, no hacer nada ──
    if (isMismoPlan(plan) && subActiva && !isAnnual) {
      if (esPlanGratis) {
        toast.info("Ya tienes este plan gratuito activo.");
      } else {
        toast.info("Ya tienes este plan activo. Para renovarlo, escríbenos por WhatsApp.");
      }
      return;
    }

    // ── CASO 2: Mismo plan → cambio de ciclo (mensual↔anual) → WhatsApp ──
    if (isCambioCiclo(plan)) {
      setPlanChangeType('cambio_ciclo');
      setWhatsAppPlan(plan);
      setShowWhatsAppModal(true);
      return;
    }

    // ── CASO 3: Plan de pago sin suscripción previa → WhatsApp ──
    if (!esPlanGratis && !tieneSubActiva) {
      setPlanChangeType('nuevo');
      setWhatsAppPlan(plan);
      setShowWhatsAppModal(true);
      return;
    }

    // ── CASO 4: Upgrade de plan (plan pago → plan pago superior) → WhatsApp ──
    if (!esPlanGratis && tieneSubActiva && isUpgrade(plan)) {
      setPlanChangeType('upgrade');
      setWhatsAppPlan(plan);
      setShowWhatsAppModal(true);
      return;
    }

    // ── CASO 5: Plan de pago vencido o en prueba + mismo u otro plan pago → WhatsApp ──
    if (!esPlanGratis && tieneSubActiva && (subVencida || subPrueba)) {
      setPlanChangeType('nuevo');
      setWhatsAppPlan(plan);
      setShowWhatsAppModal(true);
      return;
    }

    // ── CASO 6: Downgrade a plan gratuito desde cualquier plan pago → automático ──
    // (incluye: activo→gratis, prueba→gratis, vencido→gratis)
    if (esPlanGratis) {
      setSelectedPlan(plan);
      setShowModal(true);
      return;
    }

    // ── FALLBACK: Sin suscripción → plan gratuito ──
    setSelectedPlan(plan);
    setShowModal(true);
  };

  // ─── Confirmar suscripción ────────────────────────────────
  const handleConfirmSubscribe = () => {
    if (!selectedPlan) return;
    subscribeMutation.mutate({
      plan_id: selectedPlan.id,
      ciclo_facturacion: isAnnual ? "anual" : "mensual",
    });
  };

  // ─── Helpers de renderizado ───────────────────────────────
  const getFeatures = (plan) => {
    if (Array.isArray(plan.caracteristicas)) return plan.caracteristicas;
    try { return JSON.parse(plan.caracteristicas || "[]"); } catch { return []; }
  };

  const getPlanPrice = (plan) => {
    const monthly = Number(plan.precio_mensual) || 0;
    const annual = Number(plan.precio_anual) || 0;
    return isAnnual ? annual : monthly;
  };

  const isFreePlan = (plan) => {
    return (Number(plan.precio_mensual) || 0) === 0;
  };

  const getCtaText = (plan) => {
    if (plan.disponible === false) return "Próximamente";

    // Plan gratuito
    if (isFreePlan(plan)) {
      return activeSub ? "Cambiar a Plan Gratis" : "Comenzar ahora (Gratis)";
    }

    if (!isAuthenticated || !activeSub) {
      return `Obtener ${plan.nombre}`;
    }

    // Mismo plan + misma modalidad (activo)
    if (isMismoPlan(plan) && activeSub?.estado === 'activa' && !isAnnual) {
      return "Plan Activo";
    }

    // Mismo plan mensual → quiere anual
    if (isCambioCicloAAnual(plan)) {
      return "Cambiar a Anual — WhatsApp";
    }

    // Upgrade de plan
    if (isUpgrade(plan)) {
      return `Mejorar a ${plan.nombre} — WhatsApp`;
    }

    // Plan vencido o en prueba → renovar
    if (activeSub?.estado === 'vencida' || activeSub?.estado === 'prueba') {
      return `Contratar ${plan.nombre} — WhatsApp`;
    }

    return `Pagar por WhatsApp`;
  };

  const isFeaturedPlan = (plan) => {
    // El plan con precio más bajo > 0 y más popular (el 2do plan)
    const paidPlans = planes.filter((p) => (Number(p.precio_mensual) || 0) > 0 && p.disponible !== false);
    return paidPlans.length > 0 && paidPlans[0]?.id === plan.id;
  };

  // ─── Addons estáticos para Empresa Premium ────────────────
  const premiumAddons = [
    { id: "webPersonalizada", label: "Página Web Personalizada" },
    { id: "facturacionElectronica", label: "Facturación Electrónica" },
  ];

  // ─── Loading skeleton ─────────────────────────────────────
  if (loadingPlanes) {
    return (
      <section data-theme="light" className={`${styles.section} ${isPlanesAdminRoute ? styles.sectionAdmin : ""}`} ref={sectionRef}>
        <div className={styles.container}>
          <div className={styles.header}>
            <span className={styles.badge}>Planes y Precios</span>
          </div>
          <div className={styles.pricingGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${styles.pricingCard} ${styles.skeletonCard}`}>
                <div className={styles.skeletonLine} style={{ width: "60%", height: 20 }} />
                <div className={styles.skeletonLine} style={{ width: "80%", height: 14, marginTop: 8 }} />
                <div className={styles.skeletonLine} style={{ width: "40%", height: 36, marginTop: 16 }} />
                <div className={styles.skeletonLine} style={{ width: "100%", height: 14, marginTop: 16 }} />
                <div className={styles.skeletonLine} style={{ width: "90%", height: 14, marginTop: 8 }} />
                <div className={styles.skeletonLine} style={{ width: "85%", height: 14, marginTop: 8 }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="planes" data-theme="light" className={`${styles.section} ${isPlanesAdminRoute ? styles.sectionAdmin : ""}`} ref={sectionRef}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <span className={styles.badge}>Planes y Precios</span>
            </div>

            <div className={styles.toggleWrapper}>
              <span
                className={`${styles.toggleLabel} ${!isAnnual ? styles.toggleLabelActive : ""}`}
                onClick={() => setIsAnnual(false)}
                role="button"
                tabIndex={0}
              >
                <span className={styles.togglePrefix}>Facturación </span>Mensual
              </span>

              <label className={styles.switch} aria-label="Cambiar a facturación anual">
                <input type="checkbox" checked={isAnnual} onChange={(e) => setIsAnnual(e.target.checked)} />
                <span className={styles.slider}></span>
              </label>

              <span
                className={`${styles.toggleLabel} ${isAnnual ? styles.toggleLabelActive : ""}`}
                onClick={() => setIsAnnual(true)}
                role="button"
                tabIndex={0}
              >
                <span className={styles.togglePrefix}>Facturación </span>Anual
                <span className={styles.discountBadge}>2 meses gratis</span>
              </span>
            </div>
          </div>

          <div className={styles.pricingGrid}>
            {planes.map((plan) => {
              const price = getPlanPrice(plan);
              const features = getFeatures(plan);
              const featured = isFeaturedPlan(plan);
              const disabled = plan.disponible === false;
              const hasTrial = (plan.dias_prueba || 0) > 0 && !isFreePlan(plan);
              const isPremium = disabled;
              const addons = isPremium ? premiumAddons : [];

              // isCurrentPlan: true solo cuando es el plan activo Y el ciclo seleccionado coincide con el actual.
              // Si el toggle cambia el ciclo (anual↔mensual) sobre el mismo plan → habilitar botón.
              const isMismoPlanCard = showCurrentPlanInfo && activeSub && String(plan.id) === String(activeSub.plan_id);
              const planTieneCambioCirclo = isCambioCiclo(plan);
              const isCurrentPlan = isMismoPlanCard && !planTieneCambioCirclo;

              return (
                <div
                  key={plan.id}
                  className={`${styles.pricingCard} ${isCurrentPlan ? styles.currentPlanCard : (featured ? styles.popularCard : "")} ${disabled ? styles.disabledCard : ""}`}
                >
                  {isCurrentPlan ? (
                    <div className={styles.currentPlanBadge}>✓ TU PLAN ACTUAL</div>
                  ) : (
                    featured && <div className={styles.popularBadge}>MÁS POPULAR</div>
                  )}
                  {disabled && <div className={styles.comingSoonBadge}>PRÓXIMAMENTE</div>}

                  <div>
                    <h3 className={styles.planName}>{plan.nombre}</h3>
                    <p className={styles.planDesc}>{plan.descripcion}</p>

                    {isCurrentPlan && (
                      <div className={styles.currentPlanStatusPill}>
                        <FaGoogle size={11} color="#ea4335" />
                        <span>
                          {trialInfo.esPrueba
                            ? (trialInfo.vencido ? "Prueba Finalizada" : `Prueba: Quedan ${trialInfo.diasRestantes} días`)
                            : (activeSub?.estado === "activa" ? "Suscripción Activa" : `Estado: ${activeSub?.estado || "Inactivo"}`)}
                        </span>
                      </div>
                    )}

                    <div className={styles.divider}></div>

                    <div className={styles.planPrice}>
                      <span className={styles.currency}>S/</span>
                      <span className={styles.amount}>{price}</span>
                      <span className={styles.period}>{isAnnual ? "/ año" : "/ mes"}</span>
                    </div>

                    {hasTrial && (
                      <div className={styles.trialBadge}>
                        <FiClock />
                        <span>
                          {isCurrentPlan && trialInfo.esPrueba
                            ? (trialInfo.vencido ? "Prueba vencida" : `Quedan ${trialInfo.diasRestantes} días de prueba`)
                            : `${Math.round(plan.dias_prueba / 30)} meses de prueba gratis`}
                        </span>
                      </div>
                    )}

                    <ul className={styles.featuresList}>
                      {features.map((feat, idx) => (
                        <li key={idx} className={styles.featureItem}>
                          <FiCheck className={styles.checkIcon} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {addons.length > 0 && (
                      <div className={styles.addonsContainer}>
                        {addons.map((addon) => {
                          const addonKey = `${plan.id}_${addon.id}`;
                          const isChecked = selectedAddons[addonKey] ?? false;
                          return (
                            <div key={addon.id} className={styles.addonItem}>
                              <label htmlFor={`addon-${addonKey}`} className={styles.addonLabel}>
                                <span className={styles.addonText}>{addon.label}</span>
                                <div className={styles.miniSwitch}>
                                  <input
                                    type="checkbox"
                                    id={`addon-${addonKey}`}
                                    checked={isChecked}
                                    onChange={() => toggleAddon(plan.id, addon.id)}
                                    disabled={disabled}
                                  />
                                  <span className={styles.miniSlider}></span>
                                </div>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {isCurrentPlan && activeSub?.fecha_fin && (
                    <div className={styles.currentPlanRenewalNotice}>
                      <FiCalendar size={12} />
                      <span>
                        {trialInfo.esPrueba ? "Vence el:" : "Renovación:"} {formatDate(activeSub.fecha_fin)}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    className={`${
                      isCurrentPlan
                        ? styles.btnCurrentPlan
                        : isMismoPlanCard && planTieneCambioCirclo
                        ? styles.btnPrimary
                        : featured
                        ? styles.btnPrimary
                        : styles.btnSecondary
                    } ${disabled ? styles.btnDisabled : ""}`}
                    onClick={() => handlePlanClick(plan)}
                    disabled={isCurrentPlan || disabled || subscribeMutation.isPending}
                  >
                    {isCurrentPlan ? (
                      // Plan activo sin cambio de ciclo → estado informativo deshabilitado
                      <>
                        <FiCheckCircle />
                        <span>Tu Plan Actual</span>
                      </>
                    ) : isMismoPlanCard && planTieneCambioCirclo ? (
                      // Mismo plan pero el usuario quiere cambiar el ciclo → acción activa
                      <>
                        <FaWhatsapp />
                        <span>
                          {isCambioCicloAAnual(plan)
                            ? 'Cambiar a Plan Anual'
                            : 'Cambiar a Plan Mensual'}
                        </span>
                        <FiArrowRight />
                      </>
                    ) : (
                      // Cualquier otro plan
                      <>
                        {disabled && <FiLock />}
                        {showCurrentPlanInfo ? `Cambiar a ${plan.nombre}` : getCtaText(plan)}
                        {!disabled && <FiArrowRight />}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  MODAL DE CONFIRMACIÓN DE PLAN                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showModal && selectedPlan && (
        <div data-theme="light" className={styles.modalOverlay} onClick={() => !subscribeMutation.isPending && setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalIconCircle}>
                {isFreePlan(selectedPlan) ? <FiShield /> : <FiZap />}
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
                disabled={subscribeMutation.isPending}
              >
                <FiX />
              </button>
            </div>

            {/* Body */}
            <h3 className={styles.modalTitle}>
              {isFreePlan(selectedPlan)
                ? (activeSub ? "Cambiar a Plan Gratuito" : "Activar Plan Gratuito")
                : "Comenzar Período de Prueba"}
            </h3>
            <p className={styles.modalPlanName}>{selectedPlan.nombre}</p>

            {/* Detalles */}
            <div className={styles.modalDetails}>
              <div className={styles.modalDetailRow}>
                <span>Plan</span>
                <strong>{selectedPlan.nombre}</strong>
              </div>
              <div className={styles.modalDetailRow}>
                <span>Precio</span>
                <strong>
                  {isFreePlan(selectedPlan)
                    ? "Gratis"
                    : `S/ ${getPlanPrice(selectedPlan)} / ${isAnnual ? "año" : "mes"}`}
                </strong>
              </div>
              {(selectedPlan.dias_prueba || 0) > 0 && !isFreePlan(selectedPlan) && (
                <div className={styles.modalDetailRow}>
                  <span>Período de prueba</span>
                  <strong className={styles.modalTrialHighlight}>
                    {Math.round(selectedPlan.dias_prueba / 30)} meses gratis
                  </strong>
                </div>
              )}
              <div className={styles.modalDetailRow}>
                <span>Facturación</span>
                <strong>{isAnnual ? "Anual" : "Mensual"}</strong>
              </div>
            </div>

            {/* Info de prueba */}
            {(selectedPlan.dias_prueba || 0) > 0 && !isFreePlan(selectedPlan) && (
              <div className={styles.modalTrialInfo}>
                <FiClock />
                <span>
                  Tendrás acceso completo durante {Math.round(selectedPlan.dias_prueba / 30)} meses
                  sin ningún cargo. Al finalizar el período de prueba podrás elegir continuar
                  con el plan o cambiar al plan gratuito.
                </span>
              </div>
            )}

            {isFreePlan(selectedPlan) && (
              <div className={styles.modalFreeInfo}>
                <FiShield />
                <span>
                  {activeSub
                    ? "Tu suscripción actual cambiará al plan Finanzas Básico. Este plan es completamente gratuito y permanente. Podrás volver a actualizar a un plan superior cuando lo requieras."
                    : "Este plan es completamente gratuito y no tiene límite de tiempo. Podrás actualizar a un plan superior en cualquier momento."}
                </span>
              </div>
            )}

            {/* Acciones */}
            <div className={styles.modalActions}>
              <button
                className={styles.modalBtnConfirm}
                onClick={handleConfirmSubscribe}
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? (
                  <>
                    <span className={styles.modalSpinner} />
                    {activeSub && isFreePlan(selectedPlan) ? "Cambiando plan..." : "Activando..."}
                  </>
                ) : (
                  <>
                    <FiCheck />
                    {isFreePlan(selectedPlan)
                      ? (activeSub ? "Confirmar Cambio a Plan Gratis" : "Activar Plan Gratis")
                      : "Comenzar Prueba Gratuita"}
                  </>
                )}
              </button>
              <button
                className={styles.modalBtnCancel}
                onClick={() => setShowModal(false)}
                disabled={subscribeMutation.isPending}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  MODAL DE WHATSAPP — PAGO MANUAL                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showWhatsAppModal && whatsAppPlan && waData && (
        <div data-theme="light" className={styles.modalOverlay} onClick={() => setShowWhatsAppModal(false)}>
          <div
            className={`${styles.modalContent} ${styles.waContent}`}
            role="dialog"
            aria-modal="true"
            aria-label="Pagar por WhatsApp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.waHeader}>
              <div className={styles.waHeaderInfo}>
                <span className={styles.waIcon}>
                  <FaWhatsapp />
                </span>
                <div>
                  <p className={styles.waTitle}>
                    {planChangeType === 'cambio_ciclo'
                      ? 'Cambiar a Facturación Anual'
                      : planChangeType === 'upgrade'
                      ? `Mejorar a Plan ${whatsAppPlan?.nombre}`
                      : planChangeType === 'renovar'
                      ? 'Renovar Suscripción'
                      : 'Contratar Plan — WhatsApp'}
                  </p>
                  <p className={styles.waSubtitle}>
                    {planChangeType === 'cambio_ciclo'
                      ? 'Paga 12 meses y ahorra 2 meses'
                      : planChangeType === 'upgrade'
                      ? 'Más funciones para tu negocio'
                      : 'Pago manual rápido y seguro'}
                  </p>
                </div>
              </div>
              <button
                className={styles.waClose}
                onClick={() => setShowWhatsAppModal(false)}
                aria-label="Cerrar"
              >
                <FiX />
              </button>
            </div>

            <div className={styles.waBody}>
              <div className={styles.waPlanCard}>
                <div className={styles.waRow}>
                  <span>Plan seleccionado</span>
                  <strong className={styles.waPlanBadge}>{whatsAppPlan.nombre}</strong>
                </div>
                <div className={styles.waRow}>
                  <span>Modalidad</span>
                  <strong>{waData.modalidad}</strong>
                </div>
                <div className={styles.waRow}>
                  <span>Total a pagar</span>
                  <strong className={styles.waPrice}>S/ {waData.precio.toFixed(2)}</strong>
                </div>
              </div>

              <div className={styles.waPayCard}>
                <p className={styles.waLabel}>Realiza tu pago vía:</p>
                <div className={styles.waMethods}>
                  <span className={styles.waYape}>Yape</span>
                  <span className={styles.waPlin}>Plin</span>
                </div>
                <div className={styles.waNumberRow}>
                  <span className={styles.waNumber}>985 503 581</span>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className={`${styles.waCopy} ${copied ? styles.waCopied : ""}`}
                  >
                    <FiCopy size={13} />
                    {copied ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              <ol className={styles.waSteps}>
                <li><b>1</b><span>Yapea o Plinéa al número de arriba.</span></li>
                <li><b>2</b><span>Pulsa el botón verde, se abre WhatsApp con el mensaje listo.</span></li>
                <li><b>3</b><span>Adjunta tu comprobante y envíalo. Activamos tu cuenta.</span></li>
              </ol>
            </div>

            <div className={styles.waActions}>
              <a
                href={waData.waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.waCta}
              >
                <FaWhatsapp size={22} />
                Enviar mensaje por WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className={styles.modalBtnCancel}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
