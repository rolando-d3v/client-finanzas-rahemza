import { useState, useCallback } from "react";
import { FiChevronRight, FiChevronDown, FiEdit2, FiTrash2, FiPlus, FiLock } from "react-icons/fi";
import CategoriaIcons from "../categoria_icons/CategoriaIcons";
import Badge from "../../../../../components/ui/Badge/Badge";
import styles from "./CategoriaTree.module.css";

const CategoriaTreeRow = ({ node, depth = 0, onEdit, onDelete, onAddChild }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSistema = node.es_sistema === true;

  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }, []);

  const tipoBadgeVariant = node.tipo === "ingreso" ? "success" : node.tipo === "salida" ? "error" : "info";

  return (
    <>
      <div
        className={`${styles.row} ${depth === 0 ? styles.rootRow : ""} ${isSistema ? styles.systemRow : ""}`}
        style={{ "--depth": depth }}
      >
        {/* Indentation + Toggle */}
        <div className={styles.indentArea}>
          {hasChildren ? (
            <button className={styles.toggleBtn} onClick={handleToggle} aria-label={expanded ? "Colapsar" : "Expandir"}>
              {expanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>
          ) : (
            <span className={styles.leafSpacer} />
          )}
        </div>

        {/* Category Info */}
        <div className={styles.nameCell}>
          {node.icono && (
            <span className={styles.icon}>
              <CategoriaIcons name={node.icono} />
            </span>
          )}
          {node.color && <span className={styles.colorDot} style={{ backgroundColor: node.color }} />}
          <span className={styles.name} title={node.nombre}>
            {node.nombre}
          </span>
          {isSistema && (
            <span className={styles.systemBadge} title="Categoría del sistema">
              <FiLock size={10} />
              <span className={styles.systemBadgeText}>Sistema</span>
            </span>
          )}
          {hasChildren && <span className={styles.childCount}>({node.children.length})</span>}
        </div>

        {/* Type Badge */}
        <div className={styles.tipoCell}>
          <Badge label={node.tipo} variant={tipoBadgeVariant} />
        </div>

        {/* Color Hex */}
        <div className={styles.colorCell}>
          <span className={styles.colorHex}>{node.color || "—"}</span>
        </div>

        {/* Actions */}
        <div className={styles.actionsCell}>
          {isSistema ? (
            <>
              <button className={styles.actionBtn} onClick={() => onAddChild(node)} title="Añadir Subcategoría">
                <FiPlus size={14} />
              </button>
              <span className={styles.systemLock} title="Categoría del sistema — no editable">
                <FiLock size={14} />
              </span>
            </>
          ) : (
            <>
              <button className={styles.actionBtn} onClick={() => onAddChild(node)} title="Añadir Subcategoría">
                <FiPlus size={14} />
              </button>
              <button className={styles.actionBtn} onClick={() => onEdit(node)} title="Editar">
                <FiEdit2 size={14} />
              </button>
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={() => onDelete(node.id)}
                title="Eliminar"
              >
                <FiTrash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className={styles.childrenContainer} style={{ "--depth": depth }}>
          {node.children.map((child) => (
            <CategoriaTreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </>
  );
};

const CategoriaTree = ({ data = [], onEdit, onDelete, onAddChild, onAddParent, isLoading }) => {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerIndent} />
          <div className={`${styles.headerCell} ${styles.nameCell}`}>Nombre</div>
          <div className={`${styles.headerCell} ${styles.tipoCell}`}>Tipo</div>
          <div className={`${styles.headerCell} ${styles.colorCell}`}>Color</div>
          <div className={`${styles.headerCell} ${styles.actionsCell}`}>Acciones</div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.skeletonRow}>
            <div className={styles.skeletonBar} style={{ width: `${60 + Math.random() * 30}%` }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIndent} />
        <div className={`${styles.headerCell} ${styles.nameCell}`}>Nombre</div>
        <div className={`${styles.headerCell} ${styles.tipoCell}`}>Tipo</div>
        <div className={`${styles.headerCell} ${styles.colorCell}`}>Color</div>
        <div className={`${styles.headerCell} ${styles.actionsCell}`}>
          <span className={styles.actionsHeaderLabel}>Acciones</span>
          <button
            className={styles.addParentBtn}
            onClick={onAddParent}
            title="Añadir Categoría Padre"
          >
            <FiPlus size={14} />
          </button>
        </div>
      </div>

      {/* Tree Rows */}
      <div className={styles.body}>
        {data.map((node) => (
          <CategoriaTreeRow
            key={node.id}
            node={node}
            depth={0}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoriaTree;
