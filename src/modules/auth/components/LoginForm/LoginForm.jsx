import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import rahemza from "../../../../assets/logos/rahemza.png";
import { useLogin } from "../../hooks/useLogin";
import { useEffect, useState } from "react";
import styles from "./LoginForm.module.css";
import * as FaIcons from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router";

const loginSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Formato de correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida").min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const LoginForm = () => {
  const [eyePass, setEyePass] = useState(false);
  const { handleLogin, handleGoogleLogin, isLoading } = useLogin();


  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data) => {
    console.log(data);
    handleLogin(data);
  };

  // MOSTRAR UN ERROR PERSONALIZADO
  const errorHookForm = (err) => {
    if (err) {
      return <span className={styles.error_alert}>{err}</span>;
    }
  };

  // efecto de input label hacia arriba
  useEffect(() => {
    const inputs = document.querySelectorAll(".input");

    function addcl() {
      let parent = this.parentNode.parentNode;
      parent.classList.add(styles.focus);
    }
    function remcl() {
      let parent = this.parentNode.parentNode;
      if (this.value === "") {
        parent.classList.remove(styles.focus);
      }
    }

    inputs.forEach((input) => {
      input?.addEventListener("focus", addcl);
      input?.addEventListener("blur", remcl);
    });
  }, []);

  // mostrar el eye con el password
  const clickEyePassword = () => {
    setEyePass(!eyePass);
  };

  return (
    <form className={styles.form_login} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.header}>
        <div className={styles.content_logo}>
          <div className={styles.logoWrap}>
            <img
              className={styles.logo}
              src={rahemza}
              alt="Rahemza — Sistema Pappuk"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
        <p className={styles.sub_title}>Sistema Pappuk</p>
      </div>

      {/* ── Google Login Button ────────────────────────── */}
      <div className={styles.google_wrapper}>
        <button type="button" onClick={handleGoogleLogin} className={styles.google_button} disabled={isLoading}>
          <FaIcons.FaGoogle color="#ea4335" size={18} />
          <span>Continuar con Google</span>
        </button>
      </div>

      {/* ── Divisor ─────────────────────────────────────── */}
      <div className={styles.divider}>o</div>

      <section className={`${styles.section_input}`}>
        <span className={styles.icon_login}>
          <FaIcons.FaEnvelope className="" />
        </span>
        <div className="div_input">
          <label className={`${styles.label_form} `}>Correo Electrónico</label>
          <input
            autoComplete="off"
            className={`${styles.input} ${"input"}`}
            type="email"
            name="email"
            id="email"
            {...register("email")}
          />
          {errorHookForm(errors.email?.message)}
        </div>
      </section>

      {/* ── Password ───────────────────────────────────── */}
      <section className={`${styles.section_input}`}>
        <span className={styles.icon_login}>
          <FaIcons.FaKey className="" />
        </span>
        <div className="control-input">
          <label htmlFor="password" className={`${styles.label_form} `}>
            Contraseña
          </label>
          <input
            autoComplete="off"
            type={eyePass ? "text" : "password"}
            name="password"
            id="password"
            className={`${styles.input} ${"input"} `}
            {...register("password")}
          />
          {watch("password") && (
            <span className={styles.eye_pass} onClick={() => clickEyePassword()}>
              {eyePass ? <FaIcons.FaEye /> : <FaIcons.FaEyeSlash />}
            </span>
          )}

          {errorHookForm(errors.password?.message)}
        </div>
      </section>

      {/* ── Submit ─────────────────────────────────────── */}
      <div className={styles.wrapper_button}>
        {watch("email") && watch("password") ? (
          <button type="submit" className={`${styles.__login}  ${styles.__checked} `} disabled={isLoading}>
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        ) : (
          <button className={styles.__login} disabled>
            Iniciar Sesión
          </button>
        )}
      </div>

      {/* ── Divisor ─────────────────────────────────────── */}
      <div className={styles.divider}>o</div>

      {/* ── Link a Inicio ──────────────────────────── */}
      <div className={styles.options}>
        <Link to="/home" className={styles.homeLink}>
          <FaIcons.FaHome className={styles.linkIcon} />
          <span>Ir al inicio</span>
        </Link>
      </div>

      {/* ── Link a Registro ──────────────────────────── */}
      <div className={styles.footerLink}>
        <span>¿No tienes cuenta?</span>
        <Link to="/register" className={styles.registerLink}>
          Regístrate
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
