import React, { useEffect, useRef } from 'react';
import {
  FiDollarSign,
  FiPieChart,
  FiTrendingUp,
  FiCheckCircle,
  FiFileText,
  FiRepeat,
  FiCreditCard,
} from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './FinancesSection.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function FinancesSection() {
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
    <section id="finanzas" className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>Módulo de Finanzas</span>
          <h2 className={styles.title}>Gestión Financiera de Alto Nivel</h2>
          <p className={styles.subtitle}>
            Control preciso y transparente de tu capital. Monitorea transacciones, realiza transferencias entre cuentas bancarias, clasifica gastos con etiquetas y alcanza tus metas de ahorro.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Main Card */}
          <div className={styles.cardMain}>
            <div>
              <div className={styles.cardIcon}>
                <FiDollarSign />
              </div>
              <h3 className={styles.cardTitle}>Transacciones, Transferencias y Flujo de Caja</h3>
              <p className={styles.cardDesc}>
                Visualiza y gestiona la liquidez de tu empresa en tiempo real. Controla entradas y salidas, realiza transferencias entre tus cuentas y proyecta tu balance financiero con total exactitud.
              </p>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <FiCheckCircle className={styles.checkIcon} />
                  Categorías personalizables (Ingresos/Salidas) con íconos y Etiquetas de colores.
                </li>
                <li className={styles.featureItem}>
                  <FiCheckCircle className={styles.checkIcon} />
                  Gestión multicuenta (Banco de la Nación, Interbank, Efectivo) y transferencias directas.
                </li>
                <li className={styles.featureItem}>
                  <FiCheckCircle className={styles.checkIcon} />
                  Dashboard financiero intuitivo para monitorear cada movimiento y saldo disponible.
                </li>
              </ul>
            </div>

            <div className={styles.demoWidget}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem', fontWeight: '600' }}>
                DESGLOSE OPERATIVO POR CATEGORÍAS (RAHEMZA)
              </div>
              <div className={styles.widgetRow}>
                <span style={{ color: '#4b5563', fontSize: '0.85rem' }}>Gastos Fijos & Servicios (Luz, Agua, Internet)</span>
                <span style={{ fontWeight: '700', color: '#111b21' }}>$1,450.00 (35%)</span>
              </div>
              <div className={styles.widgetRow}>
                <span style={{ color: '#4b5563', fontSize: '0.85rem' }}>Educación & Universidad</span>
                <span style={{ fontWeight: '700', color: '#111b21' }}>$1,800.00 (43%)</span>
              </div>
              <div className={styles.widgetRow}>
                <span style={{ color: '#4b5563', fontSize: '0.85rem' }}>Transporte & Pasajes</span>
                <span style={{ fontWeight: '700', color: '#111b21' }}>$920.00 (22%)</span>
              </div>
            </div>
          </div>

          {/* Side Card */}
          <div className={styles.cardSide}>
            <div>
              <div
                className={styles.cardIcon}
                style={{ background: 'rgba(16,185,129,0.15)', color: '#059669' }}
              >
                <FiPieChart />
              </div>
              <h3 className={styles.cardTitle}>Presupuestos y Metas de Ahorro</h3>
              <p className={styles.cardDesc}>
                Olvídate de las hojas de cálculo manuales. Rahemza te permite fijar límites de presupuesto por período y monitorear en tiempo real el progreso para alcanzar tus metas de ahorro.
              </p>
            </div>

            <div
              style={{
                background: '#f4f5f6',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Meta de Ahorro en Progreso</span>
                <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '700' }}>74% alcanzado</span>
              </div>
              <div
                style={{
                  height: '8px',
                  width: '100%',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '74%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, var(--color-bg-boton, #a3e635))',
                  }}
                ></div>
              </div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                Monto actual: $7,400.00 / Objetivo: $10,000.00
              </span>
            </div>
          </div>

          {/* Bottom Card 1 */}
          <div className={styles.cardBottom}>
            <div className={styles.cardIcon} style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
              <FiCreditCard />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: '#111b21', fontWeight: '700', marginBottom: '0.5rem' }}>
              Cuentas Bancarias & Sueldo
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: '1.5' }}>
              Administra cuentas principales y secundarias con control del saldo inicial, moneda y transferencias instantáneas.
            </p>
          </div>

          {/* Bottom Card 2 */}
          <div className={styles.cardBottom}>
            <div className={styles.cardIcon} style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
              <FiTrendingUp />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: '#111b21', fontWeight: '700', marginBottom: '0.5rem' }}>
              Presupuestos por Período
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: '1.5' }}>
              Fija montos límite periódicos por categoría y recibe monitoreo continuo para mantener la salud financiera.
            </p>
          </div>

          {/* Bottom Card 3 */}
          <div className={styles.cardBottom}>
            <div className={styles.cardIcon} style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
              <FiRepeat />
            </div>
            <h4 style={{ fontSize: '1.15rem', color: '#111b21', fontWeight: '700', marginBottom: '0.5rem' }}>
              Catálogos & Etiquetas
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: '1.5' }}>
              Organiza cada movimiento utilizando categorías personalizables con código de color y etiquetas inteligentes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
