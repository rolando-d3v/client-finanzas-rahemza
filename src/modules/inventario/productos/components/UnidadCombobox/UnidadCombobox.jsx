import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiTrash2, FiPlus, FiCheck, FiHelpCircle } from "react-icons/fi";
import styles from "./UnidadCombobox.module.css";

const DEFAULT_UNIDADES = [
  "UND",
  "caja",
  "cm",
  "dc",
  "pies",
  "g",
  "kg",
  "pulg.",
  "lt",
  "ml",
  "m",
  "paquete",
  "docena",
  "par",
  "bolsa",
  "juego",
  "rollo",
];

const UnidadCombobox = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [unidades, setUnidades] = useState(() => {
    const saved = localStorage.getItem("pappuk_unidades_inventario");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_UNIDADES;
  });

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = unidades.filter((u) =>
    u.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (unit) => {
    onChange?.(unit);
    setSearch("");
    setIsOpen(false);
  };

  const handleAddCustom = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    if (!unidades.includes(trimmed)) {
      const updated = [...unidades, trimmed];
      setUnidades(updated);
      localStorage.setItem("pappuk_unidades_inventario", JSON.stringify(updated));
    }
    handleSelect(trimmed);
  };

  const handleDelete = (e, unitToDelete) => {
    e.stopPropagation();
    const updated = unidades.filter((u) => u !== unitToDelete);
    setUnidades(updated);
    localStorage.setItem("pappuk_unidades_inventario", JSON.stringify(updated));
    if (value === unitToDelete) {
      onChange?.("");
    }
  };

  const isExactMatch = unidades.some(
    (u) => u.toLowerCase() === search.trim().toLowerCase()
  );

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.labelRow}>
        <label className={styles.label}>
          Unidad<span className={styles.required}>*</span>
        </label>
        <span
          className={styles.tooltipIcon}
          title="Unidad de medida estándar para control de inventario y ventas (ej. UND, caja, kg)"
        >
          <FiHelpCircle size={14} />
        </span>
      </div>

      <div
        className={`${styles.combobox} ${isOpen ? styles.comboboxOpen : ""} ${
          error ? styles.comboboxError : ""
        }`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={value || "Seleccione o escriba para agregar"}
          value={isOpen ? search : value || ""}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (search.trim()) {
                if (filtered.length > 0 && isExactMatch) {
                  handleSelect(filtered[0]);
                } else {
                  handleAddCustom();
                }
              }
            } else if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
        />

        <button
          type="button"
          className={styles.chevronBtn}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownList}>
            {filtered.map((unit) => {
              const isSelected = value === unit;
              return (
                <div
                  key={unit}
                  className={`${styles.optionItem} ${
                    isSelected ? styles.optionSelected : ""
                  }`}
                  onClick={() => handleSelect(unit)}
                >
                  <span className={styles.optionText}>{unit}</span>
                  <div className={styles.optionActions}>
                    {isSelected && <FiCheck className={styles.checkIcon} size={15} />}
                    {/* Permitir eliminar unidades no por defecto si se desea */}
                    {!DEFAULT_UNIDADES.slice(0, 5).includes(unit) && (
                      <button
                        type="button"
                        className={styles.deleteOptionBtn}
                        onClick={(e) => handleDelete(e, unit)}
                        title="Eliminar unidad"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {search.trim() && !isExactMatch && (
              <div
                className={styles.addOptionItem}
                onClick={handleAddCustom}
              >
                <FiPlus size={15} />
                <span>Agregar <strong>"{search.trim()}"</strong></span>
              </div>
            )}

            {filtered.length === 0 && !search.trim() && (
              <div className={styles.emptyText}>No hay unidades disponibles</div>
            )}
          </div>
        </div>
      )}

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default UnidadCombobox;
