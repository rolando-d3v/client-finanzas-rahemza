import { Outlet } from "react-router";
import Sidebar from "../Sidebar/Sidebar";
import HeaderBar from "../HeaderBar/HeaderBar";
import SubscriptionAlertBanner from "../../components/ui/SubscriptionAlertBanner/SubscriptionAlertBanner";
import styles from "./MainLayout.module.css";
import { useLayout } from "../../hooks/useLayout";

/**
 * Layout principal del sistema (autenticado).
 * Incluye Sidebar + Topbar + Contenido principal.
 */
const MainLayout = () => {
  const { estado_sidebar, handleOpenToggleSidebar } = useLayout();

  return (
    <div className={styles.mainContainer}>
      <div className={`${styles.layout} ${estado_sidebar ? "" : styles.layoutCollapsed}`}>
        <Sidebar />
        <div
          className={`${styles.sidebarOverlay} ${estado_sidebar ? styles.sidebarOverlayVisible : ""}`}
          onClick={() => handleOpenToggleSidebar(false)}
        />
        <div className={styles.content}>
          <HeaderBar />
          <SubscriptionAlertBanner />
          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
