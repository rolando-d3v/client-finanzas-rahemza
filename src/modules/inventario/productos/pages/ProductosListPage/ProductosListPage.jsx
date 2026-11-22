import { useState } from "react";
import { useNavigate } from "react-router";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiLayers,
  FiBriefcase,
  FiTag,
  FiBox,
} from "react-icons/fi";
import { useProductos, useDeleteProducto } from "../../hooks/useProductos";
import { useCategoriasProductos } from "../../hooks/useMarcas";
import styles from "./ProductosListPage.module.css";

const formatCurrency = (val) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(val || 0);

const ProductosListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [tipoProductoFilter, setTipoProductoFilter] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");

  const { data: productosRes, isLoading } = useProductos({
    search: searchTerm,
    tipo: tipoFilter,
    tipo_producto: tipoProductoFilter,
    categoria_id: categoriaFilter,
  });

  const { data: categoriasRes } = useCategoriasProductos();
  const deleteMutation = useDeleteProducto();

  const productos = productosRes?.data || [];
  const categorias = categoriasRes?.data || [];

  // Métricas / KPIs rápidos
  const totalProductos = productos.length;
  const totalBienes = productos.filter((p) => p.tipo === "bien").length;
  const totalServicios = productos.filter((p) => p.tipo === "servicio").length;
  const totalConVariantes = productos.filter((p) => p.tipo_producto === "variante").length;

  const handleDelete = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de desactivar el artículo "${nombre}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className={styles.page}>
      {/* Encabezado Principal */}
      <div className={styles.headerRow}>
        <div>
          <span className={styles.breadcrumb}>Inventario</span>
          <h1 className={styles.title}>Artículos y Productos</h1>
          <p className={styles.subtitle}>
            Gestión integral de catálogo, bienes físicos, servicios, marcas y variantes estilo Zoho Inventory.
          </p>
        </div>

        <button
          type="button"
          className={styles.newBtn}
          onClick={() => navigate("/articulos/productos/nuevo")}
        >
          <FiPlus size={18} />
          <span>Nuevo Artículo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
            <FiBox size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Artículos</span>
            <strong className={styles.kpiValue}>{totalProductos}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
            <FiPackage size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Bienes (Stock Físico)</span>
            <strong className={styles.kpiValue}>{totalBienes}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ backgroundColor: "#fdf2f8", color: "#db2777" }}>
            <FiBriefcase size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Servicios</span>
            <strong className={styles.kpiValue}>{totalServicios}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconWrapper} style={{ backgroundColor: "#faf5ff", color: "#9333ea" }}>
            <FiLayers size={20} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Con Variantes</span>
            <strong className={styles.kpiValue}>{totalConVariantes}</strong>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <FiSearch size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU, código o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          {/* Tipo: Bien / Servicio */}
          <select
            className={styles.selectFilter}
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="bien">Bienes</option>
            <option value="servicio">Servicios</option>
          </select>

          {/* Formato: Único / Variante */}
          <select
            className={styles.selectFilter}
            value={tipoProductoFilter}
            onChange={(e) => setTipoProductoFilter(e.target.value)}
          >
            <option value="">Todas las variantes</option>
            <option value="unico">Artículo Único</option>
            <option value="variante">Con Variantes</option>
          </select>

          {/* Categoría */}
          <select
            className={styles.selectFilter}
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loadingWrapper}>
            <div className={styles.spinner}></div>
            <p>Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className={styles.emptyState}>
            <FiPackage size={42} className={styles.emptyIcon} />
            <h3>No se encontraron productos</h3>
            <p>Crea tu primer artículo o ajusta los filtros de búsqueda.</p>
            <button
              type="button"
              className={styles.createFirstBtn}
              onClick={() => navigate("/articulos/productos/nuevo")}
            >
              <FiPlus size={16} /> Crear Producto
            </button>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}></th>
                  <th>ARTÍCULO / SKU</th>
                  <th>TIPO</th>
                  <th>MARCA / CATEGORÍA</th>
                  <th style={{ textAlign: "right" }}>PRECIO COSTE</th>
                  <th style={{ textAlign: "right" }}>PRECIO VENTA</th>
                  <th style={{ textAlign: "center" }}>STOCK</th>
                  <th style={{ textAlign: "center", width: "100px" }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod) => {
                  const imagen =
                    prod.imagen_frontal_url ||
                    prod.imagen_url ||
                    (prod.imagenes && prod.imagenes[0]?.url);

                  return (
                    <tr key={prod.id} className={styles.tableRow}>
                      {/* Miniatura */}
                      <td>
                        <div className={styles.thumbWrapper}>
                          {imagen ? (
                            <img src={imagen} alt={prod.nombre} />
                          ) : (
                            <FiPackage size={20} color="#94a3b8" />
                          )}
                        </div>
                      </td>

                      {/* Nombre y SKU */}
                      <td>
                        <div className={styles.productNameCell}>
                          <span
                            className={styles.productName}
                            onClick={() => navigate(`/articulos/productos/editar/${prod.id}`)}
                          >
                            {prod.nombre}
                          </span>
                          <div className={styles.subSku}>
                            {prod.sku && <span>SKU: {prod.sku}</span>}
                            {prod.tipo_producto === "variante" && (
                              <span className={styles.variantBadge}>
                                <FiLayers size={11} /> {prod.total_variantes || "Variantes"}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td>
                        <span
                          className={`${styles.typeBadge} ${
                            prod.tipo === "servicio" ? styles.badgeServicio : styles.badgeBien
                          }`}
                        >
                          {prod.tipo === "servicio" ? "Servicio" : "Bien"}
                        </span>
                      </td>

                      {/* Marca y Categoría */}
                      <td>
                        <div className={styles.brandCatCell}>
                          <span className={styles.brandText}>
                            {prod.marca_nombre || prod.marca || "—"}
                          </span>
                          <span className={styles.catText}>
                            {prod.categoria_nombre || "Sin categoría"}
                          </span>
                        </div>
                      </td>

                      {/* Precio Coste */}
                      <td style={{ textAlign: "right" }}>
                        <span className={styles.priceNumber}>
                          {formatCurrency(prod.precio_costo)}
                        </span>
                      </td>

                      {/* Precio Venta */}
                      <td style={{ textAlign: "right" }}>
                        <strong className={styles.salePriceNumber}>
                          {formatCurrency(prod.precio_venta)}
                        </strong>
                      </td>

                      {/* Stock */}
                      <td style={{ textAlign: "center" }}>
                        {prod.tipo === "servicio" ? (
                          <span className={styles.naBadge}>N/A</span>
                        ) : (
                          <span
                            className={`${styles.stockBadge} ${
                              Number(prod.stock_total) <= Number(prod.stock_minimo)
                                ? styles.stockLow
                                : styles.stockOk
                            }`}
                          >
                            {prod.stock_total} {prod.unidad_medida || "UND"}
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td>
                        <div className={styles.actionsCell}>
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => navigate(`/articulos/productos/editar/${prod.id}`)}
                            title="Editar"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionDeleteBtn}`}
                            onClick={() => handleDelete(prod.id, prod.nombre)}
                            title="Desactivar"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductosListPage;
