import { useState } from "react";
import { FiBriefcase, FiCheckCircle, FiShield, FiArrowRight, FiZap } from "react-icons/fi";
import * as FaIcons from "react-icons/fa";
import { Link } from "react-router";
import { useRegister } from "../../hooks/useRegister";
import styles from "./RegisterForm.module.css";
import logo from "../../../../assets/logos/rahemza.png";

const MAX_NAME = 40;

const RegisterForm = () => {
  const [empresaNombre, setEmpresaNombre] = useState("");
  const { handleGoogleLogin, isLoading } = useRegister();

  const trimmed = empresaNombre.trim();
  const len = trimmed.length;
  const isEmpty = len === 0;
  const isTooShort = !isEmpty && len < 2;
  const isValid = len >= 2 && len <= MAX_NAME;
  const isButtonDisabled = isLoading || !isValid;

  const onGoogleSubmit = (e) => {
    e.preventDefault();
    if (isButtonDisabled) return;

    sessionStorage.setItem("pending_empresa_nombre", trimmed);
    handleGoogleLogin();
  };

  return (
    <div className={styles.container}>
      {/* ── Header Financiero ─────────────────────────────── */}
      <div className={styles.header}>
        <span className={styles.eyebrow}>
          <FiZap className={styles.eyebrowIcon} aria-hidden="true" />
          Pappuk
        </span>
        <div className={styles.logo} aria-hidden="false">
          <img src={logo} alt="Rahemza — logo" className={styles.logoIcon} loading="eager" decoding="async" />
        </div>
        <h2 className={styles.title}>Registra tu Empresa</h2>
        <p className={styles.subtitle}>
          Crea tu espacio de trabajo financiero y toma el control de tus ingresos y gastos.
        </p>
      </div>

      <form className={styles.form} onSubmit={onGoogleSubmit} noValidate>
        {/* ── Campo Nombre de la Empresa ───────────────────── */}
        <div className={styles.group}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="reg-empresa">
              Nombre de la Empresa <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <div className={styles.labelMeta}>
              {empresaNombre.length > 0 && (
                <span className={`${styles.counter} ${isValid ? styles.counterValid : ""}`}>
                  {len}/{MAX_NAME}
                </span>
              )}
              {isValid && (
                <span className={styles.validBadge} aria-live="polite">
                  <FiCheckCircle aria-hidden="true" /> Listo
                </span>
              )}
            </div>
          </div>

          <div
            className={`${styles.inputWrapper} ${
              isValid ? styles.inputWrapperValid : ""
            } ${isTooShort ? styles.inputWrapperError : ""}`}
          >
            <FiBriefcase className={styles.inputIcon} aria-hidden="true" />
            <input
              id="reg-empresa"
              type="text"
              className={styles.input}
              placeholder="Ej. Mi Empresa S.A.C."
              value={empresaNombre}
              onChange={(e) => setEmpresaNombre(e.target.value)}
              required
              autoFocus
              autoComplete="organization"
              maxLength={MAX_NAME}
              aria-invalid={isTooShort}
              aria-describedby="reg-empresa-hint"
            />
          </div>
          <span
            id="reg-empresa-hint"
            className={`${styles.hint} ${isTooShort ? styles.hintError : ""} ${isValid ? styles.hintSuccess : ""}`}
          >
            {isTooShort
              ? "Mínimo 2 caracteres para continuar"
              : isValid
                ? "✓ Este nombre se asignará a tu cuenta de administración"
                : "Este nombre se asignará a tu cuenta de administración financiera."}
          </span>
        </div>

        {/* ── Google Register Button ──────────────────────── */}
        <div className={styles.googleWrapper}>
          <button
            type="submit"
            className={`${styles.googleButton} ${
              !isButtonDisabled ? styles.googleButtonActive : ""
            }`}
            disabled={isButtonDisabled}
            aria-busy={isLoading}
            aria-describedby="google-hint"
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <span className={styles.googleIconWrap} aria-hidden="true">
                  <FaIcons.FaGoogle color="#ea4335" size={16} />
                </span>
                <span>Continuar con Google</span>
                <FiArrowRight className={styles.googleArrow} aria-hidden="true" />
              </>
            )}
          </button>
          <p id="google-hint" className={styles.googleHint}>
            {isButtonDisabled && !isLoading
              ? "Ingresa el nombre de tu empresa para habilitar el registro"
              : "Se creará tu cuenta vinculada a Google de forma segura"}
          </p>
        </div>

        {/* ── Garantía de Seguridad ───────────────────────── */}
        <div className={styles.securityNote} role="note">
          <FiShield className={styles.shieldIcon} aria-hidden="true" />
          <span>Acceso seguro cifrado de extremo a extremo • Datos protegidos</span>
        </div>

        {/* ── Link a Login ────────────────────────────────── */}
        <div className={styles.footerLink}>
          <span>¿Ya tienes una cuenta registrada?</span>
          <Link to="/login" className={styles.link}>
            Inicia sesión aquí
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
