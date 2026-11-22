import RegisterForm from "../../components/RegisterForm/RegisterForm";
import styles from "./RegisterUserPage.module.css";

const RegisterUserPage = () => {
  return (
    <div className={styles.page}>
      {/* ── Formulario ──────────────────────────────── */}
      <RegisterForm />

      {/* ── Background decoration ─────────────────────── */}
      <div className={styles.bg}>
        <div className={`${styles.bgCircle} ${styles.bgCircle1}`} />
        <div className={`${styles.bgCircle} ${styles.bgCircle2}`} />
        <div className={`${styles.bgCircle} ${styles.bgCircle3}`} />
        <div className={`${styles.bgCircle} ${styles.bgCircle4}`} />
      </div>
    </div>
  );
};

export default RegisterUserPage;
