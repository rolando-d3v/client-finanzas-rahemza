import { useState } from "react";
import { FiLayers, FiShield, FiCreditCard } from "react-icons/fi";
import { useModulos, usePlanes, useRoles } from "../../hooks/usePlanRoles";
import TabModulos from "./modulos/TabModulos";
import TabPlanes from "./planes/TabPlanes";
import TabRoles from "./roles/TabRoles";
import styles from "./PlanRolesPage.module.css";

const TABS = [
  { key: "modulos", label: "Módulos", icon: <FiLayers /> },
  { key: "roles", label: "Roles", icon: <FiShield /> },
  { key: "planes", label: "Planes", icon: <FiCreditCard /> },
];

const PlanRolesPage = () => {
  const [activeTab, setActiveTab] = useState("modulos");

  // Data
  const { data: modulosData, isLoading: loadingModulos } = useModulos();
  const { data: planesData, isLoading: loadingPlanes } = usePlanes();
  const { data: rolesData, isLoading: loadingRoles } = useRoles();

  const modulosFlat = modulosData?.flat || [];
  const modulosTree = modulosData?.tree || [];
  const planes = planesData || [];
  const roles = rolesData || [];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Planes, Roles y Módulos</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
            <span className={styles.tabBadge}>
              {tab.key === "modulos" ? modulosFlat.length : tab.key === "planes" ? planes.length : roles.length}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "modulos" && (
        <TabModulos modulosFlat={modulosFlat} modulosTree={modulosTree} isLoading={loadingModulos} />
      )}
      {activeTab === "planes" && (
        <TabPlanes planes={planes} modulosTree={modulosTree} modulosFlat={modulosFlat} isLoading={loadingPlanes} />
      )}
      {activeTab === "roles" && (
        <TabRoles roles={roles} modulosTree={modulosTree} modulosFlat={modulosFlat} isLoading={loadingRoles} />
      )}
    </div>
  );
};

export default PlanRolesPage;
