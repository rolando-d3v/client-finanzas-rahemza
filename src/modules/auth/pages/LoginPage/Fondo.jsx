import { useState, useEffect } from "react";
import imgFinanzasAnalytics from "../../../../assets/login/ecommerce.jpeg";
import imgInventarioAlmacen from "../../../../assets/login/inventario_almacen.jpeg";
import imgEmpresaBoardroom from "../../../../assets/login/empresa_boardroom.webp";
import imgNegocioOperaciones from "../../../../assets/login/negocio_operaciones.webp";
import imgFinanzasCrecimiento from "../../../../assets/login/finanzas_crecimiento.webp";

import Monedas from "../../../../assets/login/moneda.jpeg";

const images = [
  Monedas,
  imgFinanzasAnalytics,
  imgInventarioAlmacen,
  imgEmpresaBoardroom,
  imgNegocioOperaciones,
  imgFinanzasCrecimiento,
];

function Fondo() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {images.map((img, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${img})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: index === currentIndex ? 1 : 0,
            transition: "opacity 1.2s ease-in-out",
            zIndex: index === currentIndex ? 1 : 0,
          }}
        />
      ))}
      {/* Overlay cinematográfico sutil para garantizar contraste con el formulario y textos */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(0, 0, 0, 0.45) 0%, rgba(12, 24, 14, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default Fondo;
