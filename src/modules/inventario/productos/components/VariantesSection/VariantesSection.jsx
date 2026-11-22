import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiTag, FiRefreshCw, FiCopy } from "react-icons/fi";
import styles from "./VariantesSection.module.css";

const ATRIBUTOS_COMUNES = ["Color", "Talla", "Material", "Capacidad", "Estilo", "Acabado"];

const VariantesSection = ({
  nombreProductoBase = "",
  precioCosteBase = 0,
  precioVentaBase = 0,
  variantes = [],
  onChangeVariantes,
}) => {
  // Lista de atributos: [{ id: 1, nombre: "Color", opciones: ["Negro", "Rojo", "Gris"] }]
  const [atributos, setAtributos] = useState([
    { id: 1, nombre: "Color", opciones: ["Negro", "Rojo", "Gris"], inputTag: "" },
    { id: 2, nombre: "Talla", opciones: ["L", "M", "S"], inputTag: "" },
  ]);

  // Generar combinación cartesiana de atributos
  const generarMatriz = (attrs, baseName, defaultCost, defaultPrice, prevVariantes) => {
    const validAttrs = attrs.filter((a) => a.nombre.trim() && a.opciones.length > 0);
    if (validAttrs.length === 0) return [];

    // Producto cartesiano recursivo
    const cartesian = (arrays) => {
      return arrays.reduce(
        (acc, curr) => acc.flatMap((x) => curr.map((y) => [...x, y])),
        [[]]
      );
    };

    const optionsArrays = validAttrs.map((a) =>
      a.opciones.map((opt) => ({
        nombre_atributo: a.nombre.trim(),
        valor: opt.trim(),
      }))
    );

    const combos = cartesian(optionsArrays);

    return combos.map((combo) => {
      const comboValues = combo.map((c) => c.valor).join("-");
      const nombreVar = baseName.trim()
        ? `${baseName.trim()}-${comboValues}`
        : `Articulo-${comboValues}`;

      // Buscar si ya existía una variante previa para conservar SKU y precios
      const existing = prevVariantes.find(
        (pv) =>
          pv.nombre_variante === nombreVar ||
          JSON.stringify(pv.atributos) === JSON.stringify(combo)
      );

      return {
        nombre_variante: nombreVar,
        sku: existing?.sku || generarSkuSingle(baseName, combo),
        codigo_barras: existing?.codigo_barras || "",
        precio_costo: existing?.precio_costo !== undefined ? existing.precio_costo : (defaultCost || 0),
        precio_venta: existing?.precio_venta !== undefined ? existing.precio_venta : (defaultPrice || 0),
        atributos: combo,
      };
    });
  };

  // Helper para generar SKU sugerido (ej. BUZ-NEG-L)
  const generarSkuSingle = (baseName, combo) => {
    const basePart = (baseName.trim() || "ART")
      .split(" ")
      .map((w) => w.slice(0, 3).toUpperCase())
      .join("")
      .slice(0, 4);

    const attrPart = combo
      .map((c) => c.valor.slice(0, 3).toUpperCase())
      .join("-");

    return `${basePart}-${attrPart}`;
  };

  // Actualizar matriz cuando cambian atributos o nombre base
  useEffect(() => {
    const nuevasVariantes = generarMatriz(
      atributos,
      nombreProductoBase,
      precioCosteBase,
      precioVentaBase,
      variantes
    );
    onChangeVariantes?.(nuevasVariantes);
  }, [atributos, nombreProductoBase]);

  // Manejo de atributos
  const handleAddAtributo = () => {
    if (atributos.length >= 4) return;
    setAtributos([
      ...atributos,
      { id: Date.now(), nombre: "", opciones: [], inputTag: "" },
    ]);
  };

  const handleRemoveAtributo = (id) => {
    setAtributos(atributos.filter((a) => a.id !== id));
  };

  const handleAtributoNombreChange = (id, newNombre) => {
    setAtributos(
      atributos.map((a) => (a.id === id ? { ...a, nombre: newNombre } : a))
    );
  };

  const handleAddTag = (id) => {
    setAtributos(
      atributos.map((a) => {
        if (a.id === id) {
          const val = a.inputTag?.trim();
          if (val && !a.opciones.includes(val)) {
            return {
              ...a,
              opciones: [...a.opciones, val],
              inputTag: "",
            };
          }
          return { ...a, inputTag: "" };
        }
        return a;
      })
    );
  };

  const handleRemoveTag = (attrId, tagIndex) => {
    setAtributos(
      atributos.map((a) => {
        if (a.id === attrId) {
          return {
            ...a,
            opciones: a.opciones.filter((_, i) => i !== tagIndex),
          };
        }
        return a;
      })
    );
  };

  // Manejo de campos individuales en la matriz de variantes
  const handleVariantChange = (index, field, val) => {
    const updated = [...variantes];
    updated[index] = { ...updated[index], [field]: val };
    onChangeVariantes?.(updated);
  };

  // Acciones masivas
  const handleGenerarTodosSku = () => {
    const updated = variantes.map((v) => ({
      ...v,
      sku: generarSkuSingle(nombreProductoBase, v.atributos || []),
    }));
    onChangeVariantes?.(updated);
  };

  const handleBorrarTodosSku = () => {
    const updated = variantes.map((v) => ({ ...v, sku: "" }));
    onChangeVariantes?.(updated);
  };

  const handleAplicarCosteATodos = (val) => {
    const updated = variantes.map((v) => ({ ...v, precio_costo: Number(val) || 0 }));
    onChangeVariantes?.(updated);
  };

  const handleAplicarVentaATodos = (val) => {
    const updated = variantes.map((v) => ({ ...v, precio_venta: Number(val) || 0 }));
    onChangeVariantes?.(updated);
  };

  return (
    <div className={styles.container}>
      {/* ── SECCIÓN 1: VARIACIONES (Definición de atributos) ── */}
      <div className={styles.sectionHeader}>
        <h4 className={styles.sectionTitle}>Variaciones</h4>
        <span className={styles.sectionSubtitle}>
          Defina los atributos (como Color o Talla) y agregue sus opciones para generar las variantes.
        </span>
      </div>

      <div className={styles.atributosTable}>
        <div className={styles.atributosHeader}>
          <span className={styles.colAtributo}>Atributo*</span>
          <span className={styles.colOpciones}>Opciones*</span>
          <span className={styles.colAction}></span>
        </div>

        {atributos.map((attr) => (
          <div key={attr.id} className={styles.atributoRow}>
            {/* Selector o entrada de nombre de atributo */}
            <div className={styles.atributoSelectWrapper}>
              <input
                type="text"
                list={`attr-presets-${attr.id}`}
                className={styles.inputAtributo}
                placeholder="Ej. Color, Talla..."
                value={attr.nombre}
                onChange={(e) => handleAtributoNombreChange(attr.id, e.target.value)}
              />
              <datalist id={`attr-presets-${attr.id}`}>
                {ATRIBUTOS_COMUNES.map((comun) => (
                  <option key={comun} value={comun} />
                ))}
              </datalist>
            </div>

            {/* Chips y entrada de tags */}
            <div className={styles.tagsContainer}>
              {attr.opciones.map((opcion, idx) => (
                <span key={idx} className={styles.tagChip}>
                  {opcion}
                  <button
                    type="button"
                    className={styles.removeTagBtn}
                    onClick={() => handleRemoveTag(attr.id, idx)}
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                type="text"
                className={styles.inputTag}
                placeholder={
                  attr.opciones.length === 0
                    ? "Escriba una opción y presione Enter..."
                    : "Agregar otra..."
                }
                value={attr.inputTag || ""}
                onChange={(e) =>
                  setAtributos(
                    atributos.map((a) =>
                      a.id === attr.id ? { ...a, inputTag: e.target.value } : a
                    )
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddTag(attr.id);
                  }
                }}
              />
            </div>

            {/* Botón eliminar atributo */}
            <button
              type="button"
              className={styles.deleteAttrBtn}
              onClick={() => handleRemoveAtributo(attr.id)}
              title="Eliminar este atributo"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}

        {atributos.length < 4 && (
          <button
            type="button"
            className={styles.addAttrBtn}
            onClick={handleAddAtributo}
          >
            <FiPlus size={15} />
            <span>Añadir más atributos</span>
          </button>
        )}
      </div>

      {/* ── SECCIÓN 2: VARIANTES (Matriz de artículos generados) ── */}
      {variantes.length > 0 && (
        <div className={styles.variantesMatrixSection}>
          <div className={styles.matrixHeaderRow}>
            <div className={styles.matrixTitleGroup}>
              <h4 className={styles.sectionTitle}>Variantes ({variantes.length})</h4>
              <span className={styles.sectionSubtitle}>
                Ajuste los SKU, precios de coste y venta para cada combinación.
              </span>
            </div>

            {/* Barra de herramientas masivas */}
            <div className={styles.matrixToolbar}>
              <button
                type="button"
                className={styles.toolbarBtn}
                onClick={handleGenerarTodosSku}
                title="Generar SKU para todas las variantes"
              >
                <FiRefreshCw size={13} />
                <span>Generar todos los SKU</span>
              </button>
              <button
                type="button"
                className={styles.toolbarBtnSec}
                onClick={handleBorrarTodosSku}
              >
                Borrar SKUs
              </button>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thNombre}>NOMBRE DEL ARTÍCULO*</th>
                  <th className={styles.thSku}>
                    <div className={styles.skuThContent}>
                      <span>SKU (CÓDIGO DE ARTÍCULO)</span>
                      <div className={styles.skuLinks}>
                        <button type="button" onClick={handleGenerarTodosSku}>
                          GENERAR SKU
                        </button>
                        <span>|</span>
                        <button type="button" onClick={handleBorrarTodosSku}>
                          Borrar
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className={styles.thPrecio}>
                    <div className={styles.precioThContent}>
                      <span>PRECIO DE COSTE (PEN)*</span>
                      {variantes[0]?.precio_costo > 0 && (
                        <button
                          type="button"
                          className={styles.applyAllBtn}
                          onClick={() => handleAplicarCosteATodos(variantes[0].precio_costo)}
                          title="Copiar el primer costo a todas las filas"
                        >
                          <FiCopy size={11} /> Todas
                        </button>
                      )}
                    </div>
                  </th>
                  <th className={styles.thPrecio}>
                    <div className={styles.precioThContent}>
                      <span>PRECIO DE VENTA (PEN)*</span>
                      {variantes[0]?.precio_venta > 0 && (
                        <button
                          type="button"
                          className={styles.applyAllBtn}
                          onClick={() => handleAplicarVentaATodos(variantes[0].precio_venta)}
                          title="Copiar el primer precio a todas las filas"
                        >
                          <FiCopy size={11} /> Todas
                        </button>
                      )}
                    </div>
                  </th>
                  <th className={styles.thAction}></th>
                </tr>
              </thead>
              <tbody>
                {variantes.map((v, i) => (
                  <tr key={i} className={styles.tableRow}>
                    {/* Nombre del artículo */}
                    <td className={styles.tdNombre}>
                      <input
                        type="text"
                        className={styles.tableInput}
                        value={v.nombre_variante || ""}
                        onChange={(e) =>
                          handleVariantChange(i, "nombre_variante", e.target.value)
                        }
                        required
                      />
                      <div className={styles.rowSubtext}>
                        <span className={styles.subtextLink}>
                          🏷 Etiquetas de generación de informes ▾
                        </span>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className={styles.tdSku}>
                      <input
                        type="text"
                        className={styles.tableInput}
                        placeholder="Ej. BUZ-NEG-L"
                        value={v.sku || ""}
                        onChange={(e) => handleVariantChange(i, "sku", e.target.value)}
                      />
                    </td>

                    {/* Precio de coste */}
                    <td className={styles.tdPrecio}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={`${styles.tableInput} ${styles.inputNumber}`}
                        value={v.precio_costo ?? 0}
                        onChange={(e) =>
                          handleVariantChange(i, "precio_costo", e.target.value)
                        }
                      />
                    </td>

                    {/* Precio de venta */}
                    <td className={styles.tdPrecio}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={`${styles.tableInput} ${styles.inputNumber}`}
                        value={v.precio_venta ?? 0}
                        onChange={(e) =>
                          handleVariantChange(i, "precio_venta", e.target.value)
                        }
                      />
                    </td>

                    {/* Acción editar */}
                    <td className={styles.tdAction}>
                      <button
                        type="button"
                        className={styles.rowEditBtn}
                        title="Editar detalles"
                      >
                        <FiEdit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantesSection;
