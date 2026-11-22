import { NavLink } from "react-router";
import styles from "./Sidebar.module.css";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { useLayout } from "../../hooks/useLayout";
import logo from "../../assets/logos/rahemza.png";
import { FiChevronDown, FiChevronLeft, FiLogOut, FiBriefcase } from "react-icons/fi";
import { useState, useMemo } from "react";
import { getIcon } from "./DynamicIcon";
import TrialSidebarWidget from "./TrialSidebarWidget";
import { useMiSuscripcion } from "../../components/planes/hooks/useMiSuscripcion";



const mapModuleToNavItem = (mod) => {
  const IconComp = getIcon(mod.icono);
  return {
    id: String(mod.id ?? mod.codigo),
    label: mod.nombre,
    codigo: mod.codigo,
    path: mod.ruta || undefined,
    icon: IconComp,
    mostrar_en_sidebar: mod.mostrar_en_sidebar !== false, // default true si el campo no existe aún
    children: mod.children && mod.children.length > 0
      ? mod.children
          .filter((c) => c.mostrar_en_sidebar !== false)
          .map(mapModuleToNavItem)
      : undefined,
  };
};



const Sidebar = () => {
  const { handleLogout, empresa, modulos, plan: authPlan } = useAuth();
  const { plan: subPlan } = useMiSuscripcion();
  const currentPlan = subPlan || authPlan;
  const planCodigo = currentPlan?.codigo || null;
  const { estado_sidebar, handleOpenToggleSidebar } = useLayout();

  const sections = useMemo(() => {
    if (!modulos || modulos.length === 0) return [];
    // Filtrar módulos raíz que no deben mostrarse en sidebar
    const mappedItems = modulos
      .filter((m) => m.mostrar_en_sidebar !== false)
      .map(mapModuleToNavItem);

    const finanzasItems = [];
    const inventarioItems = [];
    const empresaItems = [];
    const adminItems = [];
    const sistemaItems = [];

    mappedItems.forEach((item) => {
      const code = (item.codigo || "").toLowerCase();

      // Dashboard principal va al inicio de Finanzas
      if (code === "dashboard" || code === "dashboard_finanza") {
        finanzasItems.unshift(item);
        return;
      }

      if (
        code.startsWith("finanza") ||
        code.includes("finanza") 
      ) {
        finanzasItems.push(item);
      } else if (
        code.startsWith("inventario") ||
        code.includes("inventario") 
      ) {
        inventarioItems.push(item);
      } else if (
        code.startsWith("empresa") ||
        code.includes("empresa") 
      ) {
        empresaItems.push(item);
      } else if (
        code.startsWith("admin") ||
        code.includes("admin") 
      ) {
        adminItems.push(item);
      } else {
        sistemaItems.push(item);
      }
    });

    const result = [];
    if (finanzasItems.length > 0) {
      result.push({
        key: "finanzas",
        title: "Finanzas",
        codigo: "finanzas",
        items: finanzasItems,
        badgeColor: "var(--color-primario)",
      });
    }
    if (inventarioItems.length > 0) {
      result.push({
        key: "inventario",
        title: "Inventario",
        codigo: "inventario",
        items: inventarioItems,
        badgeColor: "var(--color-info)",
      });
    }
    if (empresaItems.length > 0) {
      result.push({
        key: "empresa",
        title: "Empresa",
        codigo: "empresa",
        items: empresaItems,
        badgeColor: "#8b5cf6",
      });
    }
    if (adminItems.length > 0) {
      result.push({
        key: "admin",
        title: "Admin",
        codigo: "admin",
        items: adminItems,
        badgeColor: "#f59e0b",
      });
    }
    if (sistemaItems.length > 0) {
      result.push({
        key: "sistema",
        title: "Sistema",
        codigo: "sistema",
        items: sistemaItems,
        badgeColor: "var(--color-texto-sidebar-muted)",
      });
    }
    return result;
  }, [modulos]);

  const toggleSidebar = () => {
    handleOpenToggleSidebar(!estado_sidebar);
  };

  return (
    <aside className={`${styles.sidebar} ${estado_sidebar ? "" : styles.sidebarCollapsed}`}>
      {/* ── Header ─────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.brand}>
          <img src={logo} alt="logo" className={styles.logoIcon} />
          {estado_sidebar && <span className={styles.logoText}>Pappuk</span>}
        </div>
        <button className={`${styles.toggle} ${estado_sidebar && styles.toggle_open}`} onClick={toggleSidebar}>
          <FiChevronLeft
            style={{
              transform: estado_sidebar ? "rotate(0)" : "rotate(180deg)",
              transition: "transform 0.3s",
            }}
          />
        </button>
      </div>

      {/* ── Empresa actual ─────────────────────────────── */}
      {empresa && estado_sidebar && (
        <div className={styles.empresaInfo}>
          <div className={styles.empresaHeader}>
            <div className={styles.empresaTitleWrapper}>
              <FiBriefcase className={styles.empresaIcon} />
              <span className={styles.empresaNombre}>
                {empresa.nombre_comercial || empresa.razon_social}
              </span>
            </div>
            {planCodigo && (
              <span
                className={styles.empresaPlanBadge}
                title={`Plan actual de la empresa: ${currentPlan?.nombre || planCodigo} (${planCodigo})`}
              >
                {planCodigo}
              </span>
            )}
          </div>
          {empresa.ruc && <span className={styles.empresaRuc}>RUC: {empresa.ruc}</span>}
        </div>
      )}

      {/* ── Nav items ──────────────────────────────────── */}
      <nav className={styles.nav}>
        {sections.map((section, idx) => (
          <div key={section.key} className={styles.sectionGroup}>
            {idx > 0 && !estado_sidebar && <hr className={styles.sectionDividerCollapsed} />}
            {estado_sidebar && (
              <div className={styles.sectionHeader}>
                <span className={styles.sectionDot} style={{ backgroundColor: section.badgeColor }} />
                <span className={styles.sectionTitle}>{section.title}</span>
                <div className={styles.sectionLine} />
              </div>
            )}
            {section.items.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer (Trial Widget + logout) ───── */}
      <div className={styles.footer}>
        <TrialSidebarWidget />
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <span className={styles.logoutIconWrapper}>
            <FiLogOut className={styles.logoutIcon} />
          </span>
          {estado_sidebar && <span className={styles.logoutLabel}>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

// ─── Menu Item (con submenu colapsable) ───────────────────
const MenuItem = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level === 1);
  const hasChildren = item.children?.length > 0;
  const { estado_sidebar, handleOpenToggleSidebar } = useLayout();

  const handleNavClick = () => {
    if (window.innerWidth <= 1024) {
      handleOpenToggleSidebar(false);
    }
  };

  const Icon = item.icon;
  const paddingLeft = estado_sidebar ? `${level * 16 + 16}px` : "0px";

  const content = (
    <>
      {Icon && (
        <span className={styles.menuIcon}>
          <Icon />
        </span>
      )}
      {estado_sidebar && <span className={styles.menuText}>{item.label}</span>}
      {estado_sidebar && hasChildren && (
        <span className={`${styles.menuToggle} ${isOpen ? styles.menuToggleOpen : ""}`}>
          <FiChevronDown />
        </span>
      )}
    </>
  );
  const content1 = (
    <>
      {Icon && (
        <span className={styles.menuIcon} style={{ marginRight: 6 }}>
          <Icon />
        </span>
      )}
      {estado_sidebar && <span className={styles.menuText}>{item.label}</span>}
      {estado_sidebar && hasChildren && (
        <span className={`${styles.menuToggle} ${isOpen ? styles.menuToggleOpen : ""}`}>
          <FiChevronDown />
        </span>
      )}
    </>
  );

  return (
    <div className={styles.menuItem}>
      {!hasChildren && item.path ? (
        <NavLink
          to={item.path}
          className={({ isActive }) => `${styles.menuHeader} ${isActive ? styles.menuHeaderActive : ""}`}
          style={{ paddingLeft: estado_sidebar ? paddingLeft : undefined }}
          title={!estado_sidebar ? item.label : undefined}
          onClick={handleNavClick}
        >
          {content1}
        </NavLink>
      ) : (
        <div
          className={styles.menuHeader}
          style={{ paddingLeft: estado_sidebar ? paddingLeft : undefined }}
          onClick={() => hasChildren && setIsOpen(!isOpen)}
          title={!estado_sidebar ? item.label : undefined}
        >
          {content}
        </div>
      )}

      {hasChildren && isOpen && estado_sidebar && (
        <div className={styles.menuChildren}>
          {item.children.map((child) => (
            <MenuItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
