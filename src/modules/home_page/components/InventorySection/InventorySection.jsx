import React, { useEffect, useRef } from 'react';
import { FiBox, FiAlertTriangle, FiLayers, FiTruck, FiMaximize, FiAlertCircle } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './InventorySection.module.css';

gsap.registerPlugin(ScrollTrigger);


// "Zoho Inventory es una herramienta en la nube que te ayuda a gestionar inventarios, órdenes de venta, compras y envíos, optimizando todo el ciclo de operaciones comerciales desde un solo lugar."



export default function InventorySection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.header}`,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      gsap.fromTo(
        `.${styles.grid} > div`,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: `.${styles.grid}`,
            start: 'top 75%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="inventario" className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>Módulo de Inventario</span>
          <h2 className={styles.title}>Gestión de Inventario y Kardex en Tiempo Real</h2>
          <p className={styles.subtitle}>
            Mantén el control absoluto de tus existencias. Desde alertas automáticas de reabastecimiento y stock mínimo, hasta escáner de código de barras, kardex valorado y transferencias entre almacenes.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Card 1 */}
          <div className={styles.card}>
            <div>
              <div className={styles.cardIcon}>
                <FiBox />
              </div>
              <h3 className={styles.cardTitle}>Control Multi-Almacén & Kardex</h3>
              <p className={styles.cardDesc}>
                Gestiona existencias distribuidas en múltiples almacenes o sucursales. Registra entradas y salidas con valoración contable automática (Kardex en Tiempo Real y Costo Promedio).
              </p>
            </div>

            <div
              style={{
                background: '#f4f5f6',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4b5563' }}>
                <span>Almacén Principal (Chorrillos)</span>
                <span style={{ fontWeight: '700', color: 'var(--color-bg-boton, #a3e635)' }}>842 units</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  color: '#4b5563',
                  marginTop: '0.5rem',
                }}
              >
                <span>Almacén Secundario</span>
                <span style={{ fontWeight: '700', color: '#059669' }}>398 units</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className={styles.card}>
            <div>
              <div
                className={styles.cardIcon}
                style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}
              >
                <FiAlertTriangle />
              </div>
              <h3 className={styles.cardTitle}>Alertas de Stock & Reabastecimiento</h3>
              <p className={styles.cardDesc}>
                Previene rupturas de inventario. Pappuk monitorea tu catálogo contra los límites de stock mínimo y máximo para coordinar órdenes de compra con proveedores a tiempo.
              </p>
            </div>

            <div className={styles.stockAlertBadge}>
              <FiAlertCircle style={{ fontSize: '1.2rem' }} />
              <span>Alerta: Producto alcanzó el stock mínimo crítico configurado (2 restan)</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className={styles.card}>
            <div>
              <div
                className={styles.cardIcon}
                style={{ background: 'rgba(16,185,129,0.15)', color: '#059669' }}
              >
                <FiMaximize />
              </div>
              <h3 className={styles.cardTitle}>Ciclo de Compras & Ventas con Barcode</h3>
              <p className={styles.cardDesc}>
                Control integral con directorio de Clientes y Proveedores. Agiliza recepción y salidas con lectores físicos o QR, vinculando cada venta con la facturación y finanzas.
              </p>
            </div>

            <div className={styles.barcodeDemo}>
              <div className={styles.barcodeLines}>
                <div className={styles.line} style={{ width: '4px' }}></div>
                <div className={styles.line} style={{ width: '2px' }}></div>
                <div className={styles.line} style={{ width: '6px' }}></div>
                <div className={styles.line} style={{ width: '3px' }}></div>
                <div className={styles.line} style={{ width: '5px' }}></div>
                <div className={styles.line} style={{ width: '2px' }}></div>
                <div className={styles.line} style={{ width: '7px' }}></div>
                <div className={styles.line} style={{ width: '3px' }}></div>
                <div className={styles.line} style={{ width: '4px' }}></div>
              </div>
              <div
                style={{
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  color: '#5c8b18',
                }}
              >
                SKU: RAH-2026-PROD
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
