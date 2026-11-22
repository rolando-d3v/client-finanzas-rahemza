import { useMemo } from "react";
import { FiUser, FiMail, FiGlobe, FiMapPin } from "react-icons/fi";
import { useAuth } from "../../../../modules/auth/hooks/useAuth";
import EmpresaPerfilCard from "./components/EmpresaPerfilCard";
import styles from "./perfil.module.css";

const PerfilPage = () => {
  const { user, roles, empresa, isSuperAdmin, isAdmin } = useAuth();

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ─── Verificación de cuenta Google y rol Admin / Super Admin ───
  const isGoogleUser = useMemo(() => {
    return Boolean(
      user?.provider_id === "google" ||
      (typeof user?.image === "string" && user.image.includes("googleusercontent.com"))
    );
  }, [user]);

  const isUserAdmin = Boolean(
    isAdmin ||
    roles?.includes("admin") ||
    roles?.includes("ADMIN")
  );

  const isUserSuperAdmin = Boolean(
    isSuperAdmin ||
    roles?.includes("super_admin") ||
    roles?.includes("SUPER_ADMIN")
  );

  // Solo visible para role admin (o super_admin) con cuenta Google asociada
  const canViewEmpresa = (isUserAdmin || isUserSuperAdmin) && isGoogleUser;
  const canEditEmpresa = isUserAdmin || isUserSuperAdmin;
  const empresaId = user?.empresa_id || empresa?.id;

  return (
    <div className={styles.page}>
      <div>
        
        <h1 className={styles.pageTitle}>Mi Perfil</h1>
        <p className={styles.pageSubtitle}>Información de tu cuenta y empresa</p>
      </div>

      {/* Tarjeta de Perfil de Usuario */}
      <div className={styles.card}>
        <div className={styles.avatarSection}>
          {user?.image ? (
            <img src={user.image} alt="Avatar" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>{getInitials(user?.name)}</div>
          )}
          <div>
            <h2 className={styles.userName}>{user?.name || "Usuario"}</h2>
            <p className={styles.userEmail}>{user?.email || ""}</p>
            <div className={styles.rolesContainer}>
              {roles.map((roleName) => (
                <span key={roleName} className={styles.roleBadge}>
                  {roleName}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <FiUser className={styles.infoIcon} />
            <div>
              <div className={styles.infoLabel}>Nombre completo</div>
              <div className={styles.infoValue}>{user?.name || "—"}</div>
            </div>
          </div>
          <div className={styles.infoItem}>
            <FiMail className={styles.infoIcon} />
            <div>
              <div className={styles.infoLabel}>Email</div>
              <div className={styles.infoValue}>{user?.email || "—"}</div>
            </div>
          </div>
          <div className={styles.infoItem}>
            <FiGlobe className={styles.infoIcon} />
            <div>
              <div style={{ fontSize: 12, color: "var(--color-texto-secundario)", marginBottom: 2 }}>Idioma</div>
              <div className={styles.infoValue}>{user?.language || "es"}</div>
            </div>
          </div>
          <div className={styles.infoItem}>
            <FiMapPin className={styles.infoIcon} />
            <div>
              <div style={{ fontSize: 12, color: "var(--color-texto-secundario)", marginBottom: 2 }}>País</div>
              <div className={styles.infoValue}>{user?.country || "Perú"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta de Datos de la Empresa (Solo visible para role admin con cuenta Google) */}
      {canViewEmpresa && empresaId && (
        <EmpresaPerfilCard
          empresaId={empresaId}
          canEdit={canEditEmpresa}
        />
      )}
    </div>
  );
};

export default PerfilPage;
