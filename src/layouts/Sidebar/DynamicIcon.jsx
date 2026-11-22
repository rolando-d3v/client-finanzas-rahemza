import {
  FiGrid,
  FiDollarSign,
  FiRepeat,
  FiCreditCard,
  FiFolder,
  FiTag,
  FiPieChart,
  FiTarget,
  FiSettings,
  FiUsers,
  FiShield,
  FiFileText,
  FiUser,
  FiBriefcase,
  FiList,
  FiLayers,
  FiTrendingUp,
} from "react-icons/fi";

export const ICON_MAP = {
  FiGrid,
  FiDollarSign,
  FiRepeat,
  FiCreditCard,
  FiFolder,
  FiTag,
  FiPieChart,
  FiTarget,
  FiSettings,
  FiUsers,
  FiShield,
  FiFileText,
  FiUser,
  FiBriefcase,
  FiList,
  FiLayers,
  FiTrendingUp,
};

export const getIcon = (iconName) => {
  if (!iconName) return FiFolder;
  if (ICON_MAP[iconName]) return ICON_MAP[iconName];
  // Fallback to text if no icon found
  return () => <span style={{ fontSize: "1.1rem", display: "inline-flex", alignItems: "center" }}>{iconName}</span>;
};

const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = getIcon(name);
  return <IconComponent {...props} />;
};

export default DynamicIcon;
