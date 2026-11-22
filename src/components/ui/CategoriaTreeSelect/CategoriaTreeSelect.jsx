import { useState, useRef, useEffect, useCallback } from "react";
import { FiChevronRight, FiChevronDown, FiX } from "react-icons/fi";
import CategoriaIcons from "../../../modules/finanzas/categorias/components/categoria_icons/CategoriaIcons";
import styles from "./CategoriaTreeSelect.module.css";

/* ── Single tree node (recursive) ──────────────────── */
const TreeNode = ({ node, depth = 0, onSelect, expandedIds, toggleExpand }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  const tipoBadge = {
    ingreso: { label: "Ingreso", cls: styles.badgeSuccess },
    salida: { label: "Salida", cls: styles.badgeError },
  };
  const badge = tipoBadge[node.tipo];

  console.log(badge);

  return (
    <>
      <div
        className={styles.node}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => onSelect(node)}
        role="option"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(node); }}}
      >
        {/* Toggle chevron */}
        {hasChildren ? (
          <button
            className={styles.chevronBtn}
            onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
            aria-label={isExpanded ? "Colapsar" : "Expandir"}
            type="button"
          >
            {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
          </button>
        ) : (
          <span className={styles.chevronSpacer} />
        )}

        {/* Icon */}
        {node.icono && <span className={styles.nodeIcon}><CategoriaIcons name={node.icono} /></span>}

        {/* Color dot */}
        {node.color && (
          <span className={styles.colorDot} style={{ backgroundColor: node.color }} />
        )}

        {/* Name */}
        <span className={styles.nodeName}>{node.nombre}</span>

        {/* Type badge */}
        {badge && (
          <span className={`${styles.badge} ${badge.cls}`}>{badge.label}</span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className={styles.childrenGroup}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </>
  );
};

/* ── Main component ────────────────────────────────── */
const CategoriaTreeSelect = ({ treeData = [], flatData = [], value, onChange, placeholder = "Sin categoría" }) => {
  const [open, setOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const containerRef = useRef(null);

  // Find the selected category from flat data
  const selectedCat = value ? flatData.find((c) => String(c.id) === String(value)) : null;

  console.log(selectedCat);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((node) => {
    onChange(String(node.id));
    setOpen(false);
  }, [onChange]);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    onChange("");
    setOpen(false);
  }, [onChange]);

  const tipoBadge = {
    ingreso: { label: "Ingreso", cls: styles.badgeSuccess },
    salida: { label: "Salida", cls: styles.badgeError },

  };

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {selectedCat ? (
          <span className={styles.selectedDisplay}>
            {selectedCat.icono && <span className={styles.selectedIcon}><CategoriaIcons name={selectedCat.icono} /></span>}
            {selectedCat.color && (
              <span className={styles.selectedDot} style={{ backgroundColor: selectedCat.color }} />
            )}
            <span className={styles.selectedName}>{selectedCat.nombre}</span>
            {tipoBadge[selectedCat.tipo] && (
              <span className={`${styles.badge} ${tipoBadge[selectedCat.tipo].cls}`}>
                {tipoBadge[selectedCat.tipo].label}
              </span>
            )}
          </span>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}

        <span className={styles.triggerActions}>
          {selectedCat && (
            <span className={styles.clearBtn} onClick={handleClear} role="button" tabIndex={0} aria-label="Limpiar selección">
              <FiX size={14} />
            </span>
          )}
          <FiChevronDown size={16} className={`${styles.triggerChevron} ${open ? styles.triggerChevronOpen : ""}`} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className={styles.dropdown}>
          {treeData.length === 0 ? (
            <div className={styles.emptyMsg}>No hay categorías disponibles</div>
          ) : (
            <div className={styles.nodeList} role="listbox">
              {treeData.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  onSelect={handleSelect}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriaTreeSelect;
