import { NavLink } from "react-router";
import { FiChevronRight } from "react-icons/fi";
import styles from "./Breadcrumb.module.css";

/**
 * Breadcrumbs navegables.
 * @param {Array} items - Array de { label, path }. El último es la página actual.
 */
const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className={styles.item}>
            {isLast ? (
              <span className={styles.current}>{item.label}</span>
            ) : (
              <>
                <NavLink to={item.path} className={styles.link}>
                  {item.label}
                </NavLink>
                <FiChevronRight className={styles.separator} />
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
