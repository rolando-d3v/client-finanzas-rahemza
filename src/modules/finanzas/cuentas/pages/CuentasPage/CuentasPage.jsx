import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { FiPlus, FiEdit2, FiTrash2, FiLock, FiAlertTriangle } from "react-icons/fi";
import { useCuentas, useCreateCuenta, useUpdateCuenta, useDeleteCuenta } from "../../hooks/useCuentas";
import KpiCard from "../../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../../components/ui/Skeleton/Skeleton";
import Modal from "../../../../../components/ui/Modal/Modal";
import Breadcrumb from "../../../../../components/ui/Breadcrumb/Breadcrumb";
import Badge from "../../../../../components/ui/Badge/Badge";
import EmptyState from "../../../../../components/ui/EmptyState/EmptyState";
import styles from "./CuentasPage.module.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const TIPOS_CUENTA = [
  { value: "efectivo", label: "Efectivo" },
  { value: "banco", label: "Banco" },
  { value: "tarjeta_credito", label: "Tarjeta de Crédito" },
  { value: "tarjeta_debito", label: "Tarjeta de Débito" },
  { value: "otro", label: "Otro" },
];

const formatCurrency = (v) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(v || 0);

const CuentasPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState(null);

  const { data, isLoading } = useCuentas();
  const cuentas = data?.cuentas || [];
  const planInfo = data?.plan_info || null;

  const createMutation = useCreateCuenta();
  const updateMutation = useUpdateCuenta();
  const deleteMutation = useDeleteCuenta();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // KPIs calculados
  const kpis = useMemo(() => {
    if (!cuentas?.length) return { total: 0, saldoTotal: 0, tipos: {} };
    const saldoTotal = cuentas.reduce((acc, c) => acc + Number(c.saldo_actual || 0), 0);
    const tipos = {};
    cuentas.forEach((c) => {
      tipos[c.tipo] = (tipos[c.tipo] || 0) + 1;
    });
    return { total: cuentas.length, saldoTotal, tipos };
  }, [cuentas]);

  // Verificar si alcanzó el límite del plan
  const limitReached = planInfo ? planInfo.cuentas_activas >= planInfo.max_cuentas : false;

  // AG Grid columns
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Nombre",
        field: "nombre",
        flex: 2,
        filter: true,
        minWidth: 190,
        sortable: true,
        cellRenderer: (params) => (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {params.data.bloqueada_por_plan && <FiLock style={{ color: "var(--color-warning)", fontSize: "14px" }} />}
            <span style={{ opacity: params.data.bloqueada_por_plan ? 0.5 : 1 }}>{params.value}</span>
            {params.data.es_principal && <Badge label="Principal" variant="primary" />}
            {params.data.bloqueada_por_plan && <Badge label="Bloqueada por plan" variant="warning" />}
          </div>
        ),
      },
      {
        headerName: "Tipo",
        field: "tipo",
        flex: 1,
        minWidth: 90,
        filter: true,
        cellRenderer: (params) => {
          const variant = params.value === "banco" ? "info" : params.value === "efectivo" ? "success" : "primary";
          return <Badge label={params.value} variant={variant} />;
        },
      },
      { headerName: "Moneda", field: "moneda", flex: 0.6, minWidth: 90 },
      {
        headerName: "Saldo Inicial",
        field: "saldo_inicial",
        flex: 1,
        minWidth: 130,
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        headerName: "Saldo Actual",
        field: "saldo_actual",
        flex: 1,
        minWidth: 130,
        valueFormatter: (params) => formatCurrency(params.value),
        cellStyle: (params) => ({
          color: Number(params.value) >= 0 ? "var(--color-exito)" : "var(--color-error)",
          fontWeight: 600,
          opacity: params.data.bloqueada_por_plan ? 0.5 : 1,
        }),
      },
      {
        headerName: "Acciones",
        flex: 0.8,
        sortable: false,
        filter: false,
        minWidth: 100,
        cellRenderer: (params) => {
          const isBlocked = params.data.bloqueada_por_plan;
          return (
            <div className={styles.actions}>
              <button
                className={`${styles.actionBtn} ${isBlocked ? styles.disabledBtn : ""}`}
                onClick={() => !isBlocked && handleEdit(params.data)}
                title={isBlocked ? "Cuenta bloqueada por plan" : "Editar"}
                disabled={isBlocked}
              >
                {isBlocked ? <FiLock /> : <FiEdit2 />}
              </button>
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn} ${isBlocked ? styles.disabledBtn : ""}`}
                onClick={() => !isBlocked && handleDelete(params.data.id)}
                title={isBlocked ? "Cuenta bloqueada por plan" : "Eliminar"}
                disabled={isBlocked}
              >
                <FiTrash2 />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
    }),
    [],
  );

  // Row styling for blocked accounts
  const getRowStyle = useCallback((params) => {
    if (params.data?.bloqueada_por_plan) {
      return {
        backgroundColor: "var(--color-fondo-blocked, rgba(255,193,7,0.05))",
        borderLeft: "3px solid var(--color-warning, #ffc107)",
      };
    }
    return undefined;
  }, []);

  const handleEdit = (cuenta) => {
    setEditingCuenta(cuenta);
    reset({
      nombre: cuenta.nombre,
      tipo: cuenta.tipo,
      saldo_inicial: cuenta.saldo_inicial,
      moneda: cuenta.moneda,
      es_principal: cuenta.es_principal || false,
    });
    setModalOpen(true);
  };

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("¿Estás seguro de eliminar esta cuenta?")) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation],
  );

  const handleOpenCreate = () => {
    setEditingCuenta(null);
    reset({
      nombre: "",
      tipo: "banco",
      saldo_inicial: 0,
      moneda: "PEN",
      es_principal: !cuentas || cuentas.length === 0,
    });
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingCuenta) {
      updateMutation.mutate(
        { id: editingCuenta.id, ...data },
        {
          onSuccess: () => {
            setModalOpen(false);
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setModalOpen(false);
        },
      });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Cuentas</h1>
            <p className={styles.pageSubtitle}>Administra tus cuentas bancarias y de efectivo</p>
          </div>
          <button
            className={`${styles.primaryBtn} ${limitReached ? styles.disabledBtn : ""}`}
            onClick={handleOpenCreate}
            disabled={limitReached}
            title={
              limitReached ? `Tu plan "${planInfo?.plan_nombre}" solo permite ${planInfo?.max_cuentas} cuenta(s)` : ""
            }
          >
            <FiPlus /> {limitReached ? "Límite alcanzado" : "Nueva Cuenta"}
          </button>
        </div>
      </div>

      {/* Banner de límite alcanzado */}
      {limitReached && (
        <div className={styles.upgradeBanner}>
          <FiAlertTriangle className={styles.upgradeBannerIcon} />
          <div>
            <strong>Has alcanzado el límite de cuentas de tu plan "{planInfo?.plan_nombre}"</strong>
            <p>Tu plan permite {planInfo?.max_cuentas} cuenta(s). Actualiza tu suscripción para crear más cuentas.</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {isLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard label="Total Cuentas" value={kpis.total} color="info" />
            <KpiCard
              label="Saldo Total"
              value={formatCurrency(kpis.saldoTotal)}
              color={kpis.saldoTotal >= 0 ? "success" : "error"}
            />
            <KpiCard label="Tipos de Cuenta" value={Object.keys(kpis.tipos).length} color="primary" />
            <KpiCard
              label="Límite del Plan"
              value={`${planInfo?.cuentas_activas || 0} / ${planInfo?.max_cuentas || "∞"}`}
              color={limitReached ? "warning" : "success"}
            />
          </>
        )}
      </div>

      {/* AG Grid Table */}
      <div className={styles.tableCard}>
        {!isLoading && (!cuentas || cuentas.length === 0) ? (
          <EmptyState
            title="Sin cuentas"
            description="Aún no tienes cuentas registradas. Crea tu primera cuenta para comenzar."
            icon="🏦"
            action={
              <button className={styles.primaryBtn} onClick={handleOpenCreate}>
                <FiPlus /> Crear primera cuenta
              </button>
            }
          />
        ) : (
          <div className={styles.gridContainer}>
            <AgGridReact
              rowData={cuentas || []}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              domLayout="autoHeight"
              pagination={true}
              paginationPageSize={10}
              animateRows={true}
              rowSelection="single"
              suppressCellFocus={true}
              loading={isLoading}
              getRowStyle={getRowStyle}
            />
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCuenta ? "Editar Cuenta" : "Nueva Cuenta"}
        footer={
          <>
            <button className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button
              className={styles.primaryBtn}
              onClick={handleSubmit(onSubmit)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingCuenta ? "Guardar Cambios" : "Crear Cuenta"}
            </button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre *</label>
            <input
              className={styles.formInput}
              {...register("nombre", { required: "El nombre es requerido" })}
              placeholder="Ej: Cuenta BCP"
            />
            {errors.nombre && <span className={styles.formError}>{errors.nombre.message}</span>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tipo *</label>
            <select className={styles.formInput} {...register("tipo", { required: "El tipo es requerido" })}>
              {TIPOS_CUENTA.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Saldo Inicial</label>
              <input
                className={styles.formInput}
                type="number"
                step="0.01"
                {...register("saldo_inicial")}
                placeholder="0.00"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Moneda</label>
              <select className={styles.formInput} {...register("moneda")}>
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" className={styles.checkboxInput} {...register("es_principal")} />
              <span>Marcar como cuenta principal (predeterminada)</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CuentasPage;
