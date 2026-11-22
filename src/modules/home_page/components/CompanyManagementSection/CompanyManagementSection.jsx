import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiUsers, FiCreditCard, FiTruck, FiFileText, FiCpu } from 'react-icons/fi';
import styles from './CompanyManagementSection.module.css';

gsap.registerPlugin(ScrollTrigger);

const CompanyManagementSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.bentoItemLarge}`,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );

      gsap.fromTo(
        `.${styles.bentoItemSmall}`,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: `.${styles.bentoGrid}`,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="empresa" className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}>Ecosistema Unificado de Finanzas & Inventario</div>
          <h2 className={styles.title}>Finanzas y Control de Inventario en Sincronía Total</h2>
          <p className={styles.subtitle}>
            Unifica tus finanzas digitales y la logística de tu negocio. Administra billeteras corporativas, transferencias y cobros instantáneos mientras gestionas órdenes de compra, stock multi-almacén, despachos y facturación.
          </p>
        </div>

        <div className={styles.bentoGrid}>
          {/* Large Bento */}
          <div className={styles.bentoItemLarge}>
            <div className={styles.iconBox} style={{ background: 'rgba(163,230,53,0.15)', color: 'var(--color-bg-boton, #a3e635)' }}>
              <FiUsers />
            </div>
            <h3 className={styles.itemTitle}>Roles Segregados: Billeteras, Tesorería y Almacenes</h3>
            <p className={styles.itemDesc}>
              Control granular adaptado a finanzas e inventario: autoriza a tesorería la dispersión de fondos y transferencias en la wallet, mientras logística y bodegas controlan recepciones, packing y despachos. Auditoría inmutable con registro completo de cada operación monetaria y movimiento de stock.
            </p>
            <div className={styles.usersListDemo}>
              <div className={styles.userRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div className={styles.userAvatar}>RF</div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111b21' }}>Rolando Flores</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>rolando@pappuk.com • Dirección General</div>
                  </div>
                </div>
                <span className={styles.userRoleBadge}>Super Admin (Finanzas + Inventario)</span>
              </div>
              <div className={styles.userRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div className={styles.userAvatar} style={{ background: 'rgba(59,130,246,0.15)', color: '#2563eb' }}>
                    TF
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111b21' }}>Equipo de Tesorería</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>finanzas@pappuk.com • Conciliación y Pagos</div>
                  </div>
                </div>
                <span className={styles.userRoleBadge}>Admin  (Fondos & Cuentas)</span>
              </div>
              <div className={styles.userRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div className={styles.userAvatar} style={{ background: 'rgba(234,179,8,0.15)', color: '#ca8a04' }}>
                    OL
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111b21' }}>Operador Logístico</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>almacen@pappuk.com • Control de Inventario</div>
                  </div>
                </div>
                <span className={styles.userRoleBadge}>Gestor de Inventario (Kardex & Despacho)</span>
              </div>
            </div>
          </div>

          {/* Small Bento 1 */}
          <div className={styles.bentoItemSmall}>
            <div className={styles.iconBox} style={{ background: 'rgba(234,179,8,0.15)', color: '#ca8a04' }}>
              <FiCreditCard />
            </div>
            <h3 className={styles.itemTitle}>Smart y Cobros Inmediatos</h3>
            <p className={styles.itemDesc}>
              Billetera digital multicuenta para gestionar tu liquidez. Cada orden de venta completada en el inventario acredita fondos en tiempo real a tu balance disponible para transferencias o reinversión.
            </p>
          </div>

          {/* Small Bento 2 */}
          <div className={styles.bentoItemSmall}>
            <div className={styles.iconBox} style={{ background: 'rgba(16,185,129,0.15)', color: '#059669' }}>
              <FiTruck />
            </div>
            <h3 className={styles.itemTitle}>Ciclo Comercial Integrado</h3>
            <p className={styles.itemDesc}>
              Flujo completo de inventario: órdenes de compra (PO) a proveedores, pedidos de venta (SO), listas de empaque (packing lists) y trazabilidad de envíos entre almacenes centrales y sucursales.
            </p>
          </div>

          {/* Small Bento 3 */}
          <div className={styles.bentoItemSmall}>
            <div className={styles.iconBox} style={{ background: 'rgba(59,130,246,0.15)', color: '#2563eb' }}>
              <FiFileText />
            </div>
            <h3 className={styles.itemTitle}>Facturación electrónica </h3>
            <p className={styles.itemDesc}>
              Emisión oficial de facturas, boletas y guías de remisión conectadas directamente a la salida de stock y a tu wallet. Descarga automática de archivos XML, CDR y representación en PDF.
            </p>
          </div>

          {/* Small Bento 4 */}
          <div className={styles.bentoItemSmall}>
            <div className={styles.iconBox} style={{ background: 'rgba(236,72,153,0.15)', color: '#db2777' }}>
              <FiCpu />
            </div>
            <h3 className={styles.itemTitle}>IA Predictiva & Reorden Automático</h3>
            <p className={styles.itemDesc}>
              Modelos inteligentes que previenen quiebres de existencias calculando puntos de reorden y detectan consumos atípicos o anomalías de efectivo en tus billeteras corporativas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyManagementSection;
