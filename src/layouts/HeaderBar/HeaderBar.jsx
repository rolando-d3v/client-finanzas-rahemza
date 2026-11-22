import { useState, useRef, useEffect, useMemo } from "react";
import { NavLink } from "react-router";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { useLayout } from "../../hooks/useLayout";
import ToggleTheme from "../toggleTheme/ToggleTheme";
import styles from "./headerBar.module.css";
import { FiMenu, FiBell, FiUser } from "react-icons/fi";
import { useEmpresas } from "../../modules/super_admin/empresas/hooks/useEmpresas";
import { useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "var(--color-fondo-input)",
    borderColor: state.isFocused ? "var(--color-borde-focus)" : "var(--color-borde)",
    borderRadius: "12px",
    boxShadow: state.isFocused ? "var(--focus-ring)" : "none",
    minHeight: "38px",
    minWidth: "50px",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s",
    "&:hover": {
      borderColor: "var(--color-borde-focus)",
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "var(--color-fondo-elevado)",
    borderRadius: "12px",
    border: "1px solid var(--color-borde)",
    boxShadow: "var(--sombra-dropdown)",
    padding: "4px",
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "var(--color-primario)"
      : state.isFocused
        ? "var(--color-fondo-hover)"
        : "transparent",
    color: state.isSelected ? "#ffffff" : "var(--color-texto-body)",
    borderRadius: "8px",
    fontSize: "0.85rem",
    padding: "8px 12px",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "var(--color-primario-activo)",
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "var(--color-texto-body)",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "var(--color-texto-placeholder)",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "var(--color-texto-secundario)",
    "&:hover": {
      color: "var(--color-texto-heading)",
    },
  }),
};

const HeaderBar = () => {
  const { user, activeRole, handleLogout, isSuperAdmin, empresa, handleSetEmpresa } = useAuth();
  const { estado_sidebar, handleOpenToggleSidebar } = useLayout();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: empresas } = useEmpresas({ activo: true }, { enabled: !!isSuperAdmin });

  const empresasOptions = useMemo(() => {
    return (empresas || []).map((emp) => ({
      value: emp,
      label: emp.nombre_comercial || emp.razon_social,
    }));
  }, [empresas]);

  const currentEmpresaOption = useMemo(() => {
    if (!empresa) return null;
    return {
      value: empresa,
      label: empresa.nombre_comercial || empresa.razon_social,
    };
  }, [empresa]);

  const handleEmpresaChange = (selectedOption) => {
    const empresaData = selectedOption ? selectedOption.value : null;
    handleSetEmpresa(empresaData);
    queryClient.invalidateQueries();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.headerBar}>
      {/* ── Hamburger (mobile) ─────────────────────────── */}
      <button className={styles.menuBtn} onClick={() => handleOpenToggleSidebar(!estado_sidebar)}>
        <FiMenu />
      </button>

      {/* ── Selector Empresa ──────────────────────────────── */}
      {isSuperAdmin ? (
        <div className={styles.empresaSelector}>
          <Select
            options={empresasOptions}
            value={currentEmpresaOption}
            onChange={handleEmpresaChange}
            placeholder="Seleccionar Empresa"
            isClearable={true}
            styles={customSelectStyles}
            noOptionsMessage={() => "No hay empresas"}
          />
        </div>
      ) : (
        <div></div>
      )}

      {/* ── Acciones ───────────────────────────────────── */}
      <div className={styles.actions}>
        <ToggleTheme />

        <button className={styles.iconBtn} title="Notificaciones">
          <FiBell />
          <span className={styles.badge}>3</span>
        </button>

        <div className={styles.userMenu} ref={dropdownRef}>
          <button className={styles.userBtn} onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className={styles.avatar}>{user?.nombre?.[0]?.toUpperCase() || "U"}</div>
            <span className={styles.userName}>{user?.codigo_usuario || "Usuario"}</span>
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <strong>
                  {user?.nombre} {user?.apellido}
                </strong>
                <small>{activeRole?.nombre}</small>
              </div>
              <hr className={styles.dropdownDivider} />
              <NavLink
                to="/perfil"
                className={styles.userInfo}
                onClick={() => setDropdownOpen(false)}
                title="Mi perfil"
              >
                <div className={styles.userAvatar}>
                  {user?.image ? (
                    <img src={user.image} alt={user?.nombre || user?.name} className={styles.avatarImg} />
                  ) : (
                    <FiUser />
                  )}
                </div>
                <div className={styles.userText}>
                  <span className={styles.userNameText}>Mi perfil</span>
                  <span className={styles.userEmail}>{user?.email || user?.codigo_usuario}</span>
                </div>
              </NavLink>
              <button
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
