import { useRef, useState } from "react";
import { FiUpload, FiArrowUp, FiX, FiImage, FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";
import styles from "./ImageUploadPanel.module.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_IMAGES = 15;

const ImageUploadPanel = ({
  imagenFrontal,
  setImagenFrontal,
  imagenTrasera,
  setImagenTrasera,
  imagenesGaleria = [],
  setImagenesGaleria,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const frontalInputRef = useRef(null);
  const traseraInputRef = useRef(null);
  const galeriaInputRef = useRef(null);

  // Convertir File a base64 DataURL
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" supera el límite de 5 MB.`);
        return reject(new Error("File too large"));
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFrontalChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      setImagenFrontal(url);
    } catch (err) {}
  };

  const handleTraseraChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      setImagenTrasera(url);
    } catch (err) {}
  };

  const handleGaleriaFiles = async (files) => {
    const fileList = Array.from(files);
    const totalCurrent =
      (imagenFrontal ? 1 : 0) +
      (imagenTrasera ? 1 : 0) +
      imagenesGaleria.length;

    const availableSlots = MAX_TOTAL_IMAGES - totalCurrent;
    if (availableSlots <= 0) {
      toast.error(`Ya has alcanzado el límite máximo de ${MAX_TOTAL_IMAGES} imágenes.`);
      return;
    }

    const filesToProcess = fileList.slice(0, availableSlots);
    if (fileList.length > availableSlots) {
      toast.warning(`Solo se pueden añadir ${availableSlots} imagen(es) más para no exceder 15.`);
    }

    const newImgs = [];
    for (const file of filesToProcess) {
      try {
        const url = await fileToDataUrl(file);
        newImgs.push({
          url,
          tipo_vista: "galeria",
          orden: imagenesGaleria.length + newImgs.length,
        });
      } catch (err) {}
    }

    if (newImgs.length > 0) {
      setImagenesGaleria([...imagenesGaleria, ...newImgs]);
      toast.success(`${newImgs.length} imagen(es) agregada(s)`);
    }
  };

  const handleGaleriaChange = (e) => {
    if (e.target.files?.length) {
      handleGaleriaFiles(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleGaleriaFiles(e.dataTransfer.files);
    }
  };

  const removeGaleriaImg = (index) => {
    const updated = imagenesGaleria.filter((_, i) => i !== index);
    setImagenesGaleria(updated);
  };

  const totalImagenesCount =
    (imagenFrontal ? 1 : 0) +
    (imagenTrasera ? 1 : 0) +
    imagenesGaleria.length;

  return (
    <div className={styles.container}>
      <div className={styles.topInfo}>
        <span className={styles.counterBadge}>
          {totalImagenesCount} / {MAX_TOTAL_IMAGES} imágenes
        </span>
      </div>

      <div className={styles.cardLayout}>
        {/* Columna Izquierda: Vista frontal y Vista posterior */}
        <div className={styles.leftCol}>
          {/* Vista frontal */}
          <div className={styles.slotBlock}>
            <span className={styles.slotTitle}>Vista frontal</span>
            <div
              className={`${styles.slotBox} ${imagenFrontal ? styles.slotBoxWithImg : ""}`}
              onClick={() => !imagenFrontal && frontalInputRef.current?.click()}
            >
              {imagenFrontal ? (
                <div className={styles.previewContainer}>
                  <img src={imagenFrontal} alt="Vista frontal" className={styles.previewImg} />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagenFrontal("");
                    }}
                    title="Eliminar imagen frontal"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div className={styles.emptySlot}>
                  <FiArrowUp className={styles.uploadArrow} size={18} />
                  <span className={styles.slotUploadText}>Cargar imagen frontal</span>
                </div>
              )}
            </div>
            <input
              ref={frontalInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={handleFrontalChange}
            />
          </div>

          {/* Vista posterior */}
          <div className={styles.slotBlock}>
            <span className={styles.slotTitle}>Vista posterior</span>
            <div
              className={`${styles.slotBox} ${imagenTrasera ? styles.slotBoxWithImg : ""}`}
              onClick={() => !imagenTrasera && traseraInputRef.current?.click()}
            >
              {imagenTrasera ? (
                <div className={styles.previewContainer}>
                  <img src={imagenTrasera} alt="Vista posterior" className={styles.previewImg} />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagenTrasera("");
                    }}
                    title="Eliminar imagen trasera"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div className={styles.emptySlot}>
                  <FiArrowUp className={styles.uploadArrow} size={18} />
                  <span className={styles.slotUploadText}>Cargar imagen trasera</span>
                </div>
              )}
            </div>
            <input
              ref={traseraInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={handleTraseraChange}
            />
          </div>
        </div>

        {/* Columna Derecha: Otras imágenes (Arrastrar y soltar) */}
        <div className={styles.rightCol}>
          <span className={styles.slotTitle}>Otras imágenes</span>
          <div
            className={`${styles.dropzoneBox} ${isDragging ? styles.dropzoneActive : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => galeriaInputRef.current?.click()}
          >
            <div className={styles.dropzoneIconWrapper}>
              <FiUpload size={20} />
            </div>
            <strong className={styles.dropzoneTitle}>Arrastrar y soltar imágenes</strong>
            <p className={styles.dropzoneSubtitle}>
              Puede añadir hasta 15 imágenes, incluidas la frontal, la trasera y otras, siempre
              que ninguna exceda los 5 MB.
            </p>
          </div>
          <input
            ref={galeriaInputRef}
            type="file"
            multiple
            accept="image/*"
            className={styles.hiddenInput}
            onChange={handleGaleriaChange}
          />

          {/* Miniaturas de galería */}
          {imagenesGaleria.length > 0 && (
            <div className={styles.galleryGrid}>
              {imagenesGaleria.map((img, idx) => (
                <div key={idx} className={styles.galleryThumb}>
                  <img src={img.url} alt={`Galería ${idx + 1}`} />
                  <button
                    type="button"
                    className={styles.removeThumbBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGaleriaImg(idx);
                    }}
                    title="Eliminar imagen"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadPanel;
