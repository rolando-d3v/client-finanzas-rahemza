import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiSave,
  FiX,
  FiHelpCircle,
  FiCheck,
  FiPlus,
  FiLayers,
} from "react-icons/fi";
import { toast } from "sonner";
import ImageUploadPanel from "../../components/ImageUploadPanel/ImageUploadPanel";
import UnidadCombobox from "../../components/UnidadCombobox/UnidadCombobox";
import VariantesSection from "../../components/VariantesSection/VariantesSection";
import MarcaModal from "../../components/MarcaModal/MarcaModal";
import { useProducto, useCreateProducto, useUpdateProducto } from "../../hooks/useProductos";
import { useMarcas, useCategoriasProductos } from "../../hooks/useMarcas";
import styles from "./ProductoFormPage.module.css";

const ProductoFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Consultas React Query
  const { data: productoRes, isLoading: isLoadingProd } = useProducto(id);
  const { data: marcasRes } = useMarcas();
  const { data: categoriasRes } = useCategoriasProductos();

  const createProductoMutation = useCreateProducto();
  const updateProductoMutation = useUpdateProducto();

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("bien"); // 'bien' | 'servicio'
  const [categoriaId, setCategoriaId] = useState("");
  const [marcaId, setMarcaId] = useState("");
  const [fabricante, setFabricante] = useState("");

  // Imágenes
  const [imagenFrontal, setImagenFrontal] = useState("");
  const [imagenTrasera, setImagenTrasera] = useState("");
  const [imagenesGaleria, setImagenesGaleria] = useState([]);

  // Detalles del artículo
  const [tipoProducto, setTipoProducto] = useState("unico"); // 'unico' | 'variante'
  const [unidadMedida, setUnidadMedida] = useState("UND");
  const [sku, setSku] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [precioCosto, setPrecioCosto] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [stockMaximo, setStockMaximo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Variantes
  const [variantes, setVariantes] = useState([]);

  // Modal de marca
  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);

  // Errores de validación
  const [errors, setErrors] = useState({});

  // Cargar datos en modo edición
  useEffect(() => {
    if (isEdit && productoRes?.data) {
      const p = productoRes.data;
      setNombre(p.nombre || "");
      setTipo(p.tipo || "bien");
      setCategoriaId(p.categoria_id ? String(p.categoria_id) : "");
      setMarcaId(p.marca_id || "");
      setFabricante(p.fabricante || "");
      setTipoProducto(p.tipo_producto || "unico");
      setUnidadMedida(p.unidad_medida || "UND");
      setSku(p.sku || "");
      setCodigoBarras(p.codigo_barras || "");
      setPrecioCosto(p.precio_costo ?? "");
      setPrecioVenta(p.precio_venta ?? "");
      setStockMinimo(p.stock_minimo ?? "");
      setStockMaximo(p.stock_maximo ?? "");
      setDescripcion(p.descripcion || "");
      setImagenFrontal(p.imagen_frontal_url || p.imagen_url || "");
      setImagenTrasera(p.imagen_trasera_url || "");

      if (Array.isArray(p.imagenes)) {
        const galeria = p.imagenes.filter((img) => img.tipo_vista === "galeria");
        setImagenesGaleria(galeria);
      }

      if (Array.isArray(p.variantes) && p.variantes.length > 0) {
        setVariantes(p.variantes);
      }
    }
  }, [isEdit, productoRes]);

  const marcas = marcasRes?.data || [];
  const categorias = categoriasRes?.data || [];

  // Validaciones
  const validateForm = () => {
    const newErrors = {};
    if (!nombre.trim()) {
      newErrors.nombre = "El nombre del artículo es obligatorio.";
    }
    if (!unidadMedida.trim()) {
      newErrors.unidadMedida = "La unidad es obligatoria.";
    }

    if (tipoProducto === "unico") {
      if (precioVenta === "" || Number(precioVenta) < 0) {
        newErrors.precioVenta = "Ingrese un precio de venta válido.";
      }
    } else {
      if (variantes.length === 0) {
        newErrors.variantes = "Debe generar al menos una variante.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor complete los campos obligatorios.");
      return;
    }

    // Preparar lista unificada de imágenes
    const todasImagenes = [];
    if (imagenFrontal) {
      todasImagenes.push({ url: imagenFrontal, tipo_vista: "frontal", orden: 0 });
    }
    if (imagenTrasera) {
      todasImagenes.push({ url: imagenTrasera, tipo_vista: "trasera", orden: 1 });
    }
    imagenesGaleria.forEach((img, idx) => {
      todasImagenes.push({
        url: img.url,
        tipo_vista: "galeria",
        orden: idx + 2,
      });
    });

    const payload = {
      nombre: nombre.trim(),
      tipo,
      tipo_producto: tipoProducto,
      categoria_id: categoriaId ? Number(categoriaId) : null,
      marca_id: marcaId || null,
      fabricante: fabricante.trim() || null,
      sku: tipoProducto === "unico" ? sku.trim() || null : null,
      codigo_barras: tipoProducto === "unico" ? codigoBarras.trim() || null : null,
      unidad_medida: unidadMedida.trim() || "UND",
      descripcion: descripcion.trim() || null,
      imagen_url: imagenFrontal || null,
      imagen_frontal_url: imagenFrontal || null,
      imagen_trasera_url: imagenTrasera || null,
      precio_costo: tipoProducto === "unico" ? Number(precioCosto) || 0 : 0,
      precio_venta: tipoProducto === "unico" ? Number(precioVenta) || 0 : 0,
      stock_minimo: tipo === "bien" && tipoProducto === "unico" ? Number(stockMinimo) || 0 : 0,
      stock_maximo: tipo === "bien" && tipoProducto === "unico" && stockMaximo !== "" ? Number(stockMaximo) : null,
      imagenes: todasImagenes,
      variantes: tipoProducto === "variante" ? variantes : [],
    };

    try {
      if (isEdit) {
        await updateProductoMutation.mutateAsync({ id, data: payload });
      } else {
        await createProductoMutation.mutateAsync(payload);
      }
      navigate("/inventario/productos");
    } catch (err) {
      // El error ya genera toast en el hook
    }
  };

  const isSaving = createProductoMutation.isPending || updateProductoMutation.isPending;

  if (isEdit && isLoadingProd) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando información del producto...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Barra Superior con Navegación y Acciones */}
      <header className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate("/articulos/productos")}
            title="Volver a la lista de productos"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <span className={styles.breadcrumb}>Inventario / Artículos</span>
            <h1 className={styles.pageTitle}>
              {isEdit ? "Editar artículo" : "Nuevo artículo"}
            </h1>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate("/articulos/productos")}
            disabled={isSaving}
          >
            <FiX size={16} /> Cancelar
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSubmit}
            disabled={isSaving}
          >
            <FiSave size={16} />
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </header>

      {/* Contenedor del Formulario Principal */}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* ── FILA SUPERIOR: Campos Principales + Panel de Imágenes ── */}
        <div className={styles.topSection}>
          {/* Columna Izquierda: Datos Principales */}
          <div className={styles.mainFieldsCol}>
            {/* Nombre */}
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>
                Nombre<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={`${styles.textInput} ${errors.nombre ? styles.inputError : ""}`}
                  placeholder="Ej. Buzo Nova Hombre, Consultoría Técnica..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoFocus
                />
                {errors.nombre && <span className={styles.errorText}>{errors.nombre}</span>}
              </div>
            </div>

            {/* Tipo: Bienes / Servicio */}
            <div className={styles.fieldRow}>
              <div className={styles.labelWithTooltip}>
                <label className={styles.fieldLabel}>Tipo</label>
                <span
                  className={styles.tooltipIcon}
                  title="Bienes: artículos físicos con control de inventario y stock en almacenes. Servicio: actividades intangibles sin stock físico."
                >
                  <FiHelpCircle size={14} />
                </span>
              </div>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="tipo_producto_radio"
                    value="bien"
                    checked={tipo === "bien"}
                    onChange={() => setTipo("bien")}
                    className={styles.radioInput}
                  />
                  <span>Bienes</span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="tipo_producto_radio"
                    value="servicio"
                    checked={tipo === "servicio"}
                    onChange={() => setTipo("servicio")}
                    className={styles.radioInput}
                  />
                  <span>Servicio</span>
                </label>
              </div>
            </div>

            {/* Categoría */}
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>Categoría</label>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.selectInput}
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                >
                  <option value="">Seleccionar una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Marca */}
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>Marca</label>
              <div className={styles.selectWithAction}>
                <select
                  className={styles.selectInput}
                  value={marcaId}
                  onChange={(e) => {
                    if (e.target.value === "__NEW_MARCA__") {
                      setIsMarcaModalOpen(true);
                    } else {
                      setMarcaId(e.target.value);
                    }
                  }}
                >
                  <option value="">Seleccionar o agregar marca</option>
                  {marcas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                  <option value="__NEW_MARCA__">+ Añadir nueva marca...</option>
                </select>
              </div>
            </div>

            {/* Fabricante */}
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>Fabricante</label>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.textInput}
                  placeholder="Seleccionar o agregar fabricante"
                  value={fabricante}
                  onChange={(e) => setFabricante(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Columna Derecha: Panel de Carga de Imágenes */}
          <div className={styles.imagePanelCol}>
            <ImageUploadPanel
              imagenFrontal={imagenFrontal}
              setImagenFrontal={setImagenFrontal}
              imagenTrasera={imagenTrasera}
              setImagenTrasera={setImagenTrasera}
              imagenesGaleria={imagenesGaleria}
              setImagenesGaleria={setImagenesGaleria}
            />
          </div>
        </div>

        {/* ── SECCIÓN MEDIA: Detalles del Artículo ── */}
        <div className={styles.sectionDivider}></div>

        <div className={styles.sectionBlock}>
          <h3 className={styles.blockTitle}>Detalles del artículo</h3>

          {/* Toggle: Artículo único vs Contiene variantes */}
          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>Tipo de artículo</label>
            <div className={styles.segmentedToggle}>
              <button
                type="button"
                className={`${styles.togglePill} ${
                  tipoProducto === "unico" ? styles.togglePillActive : ""
                }`}
                onClick={() => setTipoProducto("unico")}
              >
                <span className={styles.checkCircle}>
                  {tipoProducto === "unico" && <FiCheck size={12} />}
                </span>
                <span>Artículo único</span>
              </button>

              <button
                type="button"
                className={`${styles.togglePill} ${
                  tipoProducto === "variante" ? styles.togglePillActive : ""
                }`}
                onClick={() => setTipoProducto("variante")}
              >
                <span className={styles.checkCircle}>
                  {tipoProducto === "variante" && <FiCheck size={12} />}
                </span>
                <span>Contiene variantes</span>
              </button>
            </div>
          </div>

          {/* Unidad & SKU en la misma fila */}
          <div className={styles.twoColsRow}>
            {/* Unidad Combobox */}
            <div className={styles.colHalf}>
              <UnidadCombobox
                value={unidadMedida}
                onChange={setUnidadMedida}
                error={errors.unidadMedida}
              />
            </div>

            {/* SKU (Solo si es artículo único) */}
            {tipoProducto === "unico" && (
              <div className={styles.colHalf}>
                <div className={styles.labelWithTooltip}>
                  <label className={styles.fieldLabel}>SKU (Código de artículo)</label>
                  <span
                    className={styles.tooltipIcon}
                    title="Código identificador único del artículo para control de almacén"
                  >
                    <FiHelpCircle size={14} />
                  </span>
                </div>
                <input
                  type="text"
                  className={styles.textInput}
                  placeholder="Ej. BUZ-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Precios y Stock (Para artículo único) */}
          {tipoProducto === "unico" && (
            <div className={styles.pricesGrid}>
              <div className={styles.colHalf}>
                <label className={styles.fieldLabel}>
                  Precio de coste (PEN)<span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={styles.textInput}
                  placeholder="0.00"
                  value={precioCosto}
                  onChange={(e) => setPrecioCosto(e.target.value)}
                />
              </div>

              <div className={styles.colHalf}>
                <label className={styles.fieldLabel}>
                  Precio de venta (PEN)<span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`${styles.textInput} ${errors.precioVenta ? styles.inputError : ""}`}
                  placeholder="0.00"
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(e.target.value)}
                />
                {errors.precioVenta && (
                  <span className={styles.errorText}>{errors.precioVenta}</span>
                )}
              </div>

              {/* Si es tipo Bien, permitir umbrales de stock */}
              {tipo === "bien" && (
                <>
                  <div className={styles.colHalf}>
                    <label className={styles.fieldLabel}>Stock Mínimo</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      className={styles.textInput}
                      placeholder="Ej. 5"
                      value={stockMinimo}
                      onChange={(e) => setStockMinimo(e.target.value)}
                    />
                  </div>

                  <div className={styles.colHalf}>
                    <label className={styles.fieldLabel}>Stock Máximo</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      className={styles.textInput}
                      placeholder="Ej. 100"
                      value={stockMaximo}
                      onChange={(e) => setStockMaximo(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className={styles.identifierAction}>
            <button type="button" className={styles.linkActionBtn}>
              <FiPlus size={14} /> Agregar Identificador
            </button>
          </div>
        </div>

        {/* ── SECCIÓN DESCRIPCIÓN ── */}
        <div className={styles.sectionDivider}></div>

        <div className={styles.sectionBlock}>
          <h3 className={styles.blockTitle}>Descripción del artículo</h3>
          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>Descripción</label>
            <div className={styles.inputContainer}>
              <textarea
                rows={4}
                className={styles.textareaInput}
                placeholder="Escriba especificaciones técnicas, detalles o notas del producto..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── SECCIÓN VARIACIONES & VARIANTES (Solo si es tipo_producto === 'variante') ── */}
        {tipoProducto === "variante" && (
          <>
            <div className={styles.sectionDivider}></div>
            <VariantesSection
              nombreProductoBase={nombre}
              precioCosteBase={precioCosto}
              precioVentaBase={precioVenta}
              variantes={variantes}
              onChangeVariantes={setVariantes}
            />
            {errors.variantes && (
              <span className={styles.errorText}>{errors.variantes}</span>
            )}
          </>
        )}

        {/* Barra inferior de confirmación */}
        <div className={styles.bottomBar}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate("/inventario/productos")}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={isSaving}
          >
            <FiSave size={16} />
            {isSaving ? "Guardando..." : "Guardar Producto"}
          </button>
        </div>
      </form>

      {/* Modal para creación rápida de Marca */}
      <MarcaModal
        isOpen={isMarcaModalOpen}
        onClose={() => setIsMarcaModalOpen(false)}
        onMarcaCreated={(nuevaMarca) => {
          setMarcaId(nuevaMarca.id);
        }}
      />
    </div>
  );
};

export default ProductoFormPage;
