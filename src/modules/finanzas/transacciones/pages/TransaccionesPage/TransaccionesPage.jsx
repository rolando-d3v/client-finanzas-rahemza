import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { gastosAgGridTheme } from "../../../../../styles/agGridTheme";
import { FiPlus, FiEdit2, FiTrash2, FiSlash, FiSearch, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  useTransacciones,
  useTransaccionesTotals,
  useAnularTransaccion,
  useDeleteTransaccion,
} from "../../hooks/useTransacciones";
import { useCuentas } from "../../../cuentas/hooks/useCuentas";
import KpiCard from "../../../../../components/ui/KpiCard/KpiCard";
import { KpiCardSkeleton } from "../../../../../components/ui/Skeleton/Skeleton";
import Badge from "../../../../../components/ui/Badge/Badge";
import EmptyState from "../../../../../components/ui/EmptyState/EmptyState";
import CategoriaIcons from "../../../categorias/components/categoria_icons/CategoriaIcons";
import ModalTransaccion from "../modal_transaccion/ModalTransaccion";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
import styles from "./TransaccionesPage.module.css";

dayjs.extend(utc);

ModuleRegistry.registerModules([AllCommunityModule]);

const formatCurrency = (v) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(v || 0);

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const TransaccionesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // Filtros que NO afectan la paginación (se usan para totals + datos)
  const [filters, setFilters] = useState({
    limit: 20,
    tipo: "",
    estado: "",
    cuenta_id: "",
    categoria_id: "",
    search: "",
  });

  // Búsqueda local (debounced)
  const [searchInput, setSearchInput] = useState("");

  // ── Keyset pagination: stack de cursores para Anterior/Siguiente ─────────
  // cursorStack[0] = undefined (primera página)
  // cursorStack[1] = cursor de la 2da página, etc.
  const [cursorStack, setCursorStack] = useState([undefined]); // [undefined] = primera página
  const currentCursor = cursorStack[cursorStack.length - 1];

  // Params para el paginador — incluye cursor pero NO el total
  const queryParams = useMemo(() => {
    const p = { limit: filters.limit };
    if (filters.tipo)       p.tipo       = filters.tipo;
    if (filters.estado)     p.estado     = filters.estado;
    if (filters.cuenta_id)  p.cuenta_id  = filters.cuenta_id;
    if (filters.search)     p.search     = filters.search;
    if (currentCursor)      p.cursor     = currentCursor;
    return p;
  }, [filters, currentCursor]);

  // Params para totals — solo filtros, sin cursor (para KPIs globales)
  const totalsParams = useMemo(() => {
    const p = {};
    if (filters.tipo)      p.tipo      = filters.tipo;
    if (filters.estado)    p.estado    = filters.estado;
    if (filters.cuenta_id) p.cuenta_id = filters.cuenta_id;
    if (filters.search)    p.search    = filters.search;
    return p;
  }, [filters.tipo, filters.estado, filters.cuenta_id, filters.search]);

  const { data: txData, isLoading, isFetching } = useTransacciones(queryParams);
  // KPIs: query separada, cache de 5 min — no bloquea ni recalcula al paginar
  const { data: totalsData, isLoading: totalsLoading } = useTransaccionesTotals(totalsParams);
  const { data: cuentasData } = useCuentas();
  const cuentas = cuentasData?.cuentas || [];

  const anularMutation = useAnularTransaccion();
  const deleteMutation = useDeleteTransaccion();

  const transacciones = txData?.data || [];
  const pagination    = txData?.pagination || { has_more: false, has_prev: false };

  // KPIs desde el endpoint separado
  const kpis = useMemo(() => ({
    total:    totalsData?.total    ?? "—",
    ingresos: totalsData?.total_ingresos ?? 0,
    gastos:   totalsData?.total_gastos   ?? 0,
  }), [totalsData]);

  // ── Navegación keyset ────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (txData?.pagination?.next_cursor) {
      setCursorStack((prev) => [...prev, txData.pagination.next_cursor]);
    }
  }, [txData]);

  const handlePrev = useCallback(() => {
    if (cursorStack.length > 1) {
      setCursorStack((prev) => prev.slice(0, -1));
    }
  }, [cursorStack]);

  // Al cambiar filtros, volver a la primera página
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCursorStack([undefined]); // reset a primera página
  }, []);

  // Debounce de búsqueda — 450ms
  useEffect(() => {
    const handler = setTimeout(() => {
      const next = searchInput.trim();
      setFilters((prev) => {
        if (prev.search === next) return prev;
        return { ...prev, search: next };
      });
      setCursorStack([undefined]); // reset
    }, 450);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const hasActiveSearch = Boolean(searchInput.trim());
  const currentPage     = cursorStack.length; // 1-based aproximado

  // ── AG Grid columns ──────────────────────────────────────────────────────
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Fecha",
        field: "fecha",
        flex: 0.8,
        minWidth: 100,
        sortable: true,
        valueFormatter: (p) =>
          p.value ? dayjs.utc(p.value).locale("es").format("DD/MMM/YYYY") : "—",
      },
      {
        headerName: "Tipo",
        field: "tipo",
        flex: 0.6,
        minWidth: 80,
        cellRenderer: (p) => (
          <Badge label={p.value} variant={p.value === "ingreso" ? "success" : "error"} />
        ),
      },
      {
        headerName: "Monto",
        field: "monto",
        flex: 0.8,
        minWidth: 100,
        sortable: true,
        cellRenderer: (p) => (
          <span className={p.data.tipo === "ingreso" ? styles.income : styles.expense}>
            {p.data.tipo === "ingreso" ? "+" : "-"}
            {formatCurrency(p.value)}
          </span>
        ),
      },
      {
        headerName: "Categoría",
        field: "categoria_nombre",
        flex: 1,
        minWidth: 140,
        cellRenderer: (p) => {
          if (!p.value) return "—";
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {p.data.categoria_color && (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: p.data.categoria_color,
                    flexShrink: 0,
                  }}
                />
              )}
              {p.data.categoria_icono && (
                <span style={{ display: "inline-flex", alignItems: "center", fontSize: "14px" }}>
                  <CategoriaIcons name={p.data.categoria_icono} />
                </span>
              )}
              <span>{p.value}</span>
            </div>
          );
        },
      },
      { headerName: "Cuenta", field: "cuenta_nombre", flex: 0.8, minWidth: 120 },
      {
        headerName: "Estado",
        field: "estado",
        flex: 0.7,
        minWidth: 100,
        cellRenderer: (p) => {
          const v =
            p.value === "confirmado" ? "success" : p.value === "pendiente" ? "warning" : "error";
          return <Badge label={p.value} variant={v} />;
        },
      },
      {
        headerName: "Etiquetas",
        flex: 1,
        minWidth: 100,
        cellRenderer: (p) => (
          <div className={styles.tagsCell}>
            {(p.data.etiquetas || []).map((e) => (
              <span key={e.id} className={styles.tag}>
                <span className={styles.tagDot} style={{ backgroundColor: e.color }} />
                {e.nombre}
              </span>
            ))}
          </div>
        ),
      },
      {
        headerName: "Descripción",
        field: "descripcion",
        flex: 1.2,
        minWidth: 150,
        valueFormatter: (p) => p.value || "—",
      },
      {
        headerName: "Acciones",
        flex: 0.8,
        sortable: false,
        filter: false,
        minWidth: 126,
        cellRenderer: (p) => (
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              onClick={() => handleEdit(p.data)}
              title="Editar"
            >
              <FiEdit2 />
            </button>
            {p.data.estado !== "anulado" && (
              <button
                className={`${styles.actionBtn} ${styles.warnBtn}`}
                onClick={() => handleAnular(p.data.id)}
                title="Anular"
              >
                <FiSlash />
              </button>
            )}
            <button
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              onClick={() => handleDelete(p.data.id)}
              title="Eliminar"
            >
              <FiTrash2 />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const defaultColDef = useMemo(() => ({ resizable: true }), []);

  const handleEdit = (tx) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingTx(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTx(null);
  };

  const handleAnular = useCallback(
    (id) => {
      if (window.confirm("¿Estás seguro de anular esta transacción?")) {
        anularMutation.mutate(id);
      }
    },
    [anularMutation],
  );

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("¿Estás seguro de eliminar esta transacción permanentemente?")) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation],
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Transacciones</h1>
            <p className={styles.pageSubtitle}>Gestiona todos los ingresos y salidas</p>
          </div>
          <button className={styles.primaryBtn} onClick={handleOpenCreate}>
            <FiPlus /> Nueva Transacción
          </button>
        </div>
      </div>

      {/* KPI Cards — datos del endpoint /totals, cache 5 min */}
      <div className={styles.kpiGrid}>
        {isLoading || totalsLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard label="Total Registros" value={kpis.total} color="primary" />
            <KpiCard label="Total Ingresos" value={formatCurrency(kpis.ingresos)} color="success" />
            <KpiCard label="Total Gastos" value={formatCurrency(kpis.gastos)} color="error" />
            <KpiCard
              label="Balance"
              value={formatCurrency(kpis.ingresos - kpis.gastos)}
              color={kpis.ingresos - kpis.gastos >= 0 ? "success" : "error"}
            />
          </>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} size={16} />
          <input
            className={styles.searchInput}
            placeholder="Buscar por categoría, tipo, monto, cuenta, estado, etiquetas o descripción..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Buscar transacciones"
          />
          {isFetching && hasActiveSearch && (
            <span className={styles.searchSpinner} aria-hidden="true" />
          )}
          {hasActiveSearch && !isFetching && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => setSearchInput("")}
              title="Limpiar búsqueda"
              aria-label="Limpiar búsqueda"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
        <select
          className={styles.filterSelect}
          value={filters.tipo}
          onChange={(e) => updateFilter("tipo", e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="ingreso">Ingreso</option>
          <option value="salida">Salida</option>
        </select>
        <select
          className={styles.filterSelect}
          value={filters.estado}
          onChange={(e) => updateFilter("estado", e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="confirmado">Confirmado</option>
          <option value="pendiente">Pendiente</option>
          <option value="anulado">Anulado</option>
        </select>
        <select
          className={styles.filterSelect}
          value={filters.cuenta_id}
          onChange={(e) => updateFilter("cuenta_id", e.target.value)}
        >
          <option value="">Todas las cuentas</option>
          {(cuentas || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* AG Grid Table */}
      <div className={styles.tableCard}>
        {!isLoading && transacciones.length === 0 ? (
          <EmptyState
            title={hasActiveSearch ? "Sin resultados" : "Sin transacciones"}
            description={
              hasActiveSearch
                ? `No se encontraron transacciones que coincidan con "${searchInput.trim()}".`
                : "No se encontraron transacciones con los filtros aplicados."
            }
            icon={hasActiveSearch ? "🔍" : "💰"}
            action={
              hasActiveSearch ? (
                <button className={styles.secondaryBtn} onClick={() => setSearchInput("")}>
                  Limpiar búsqueda
                </button>
              ) : (
                <button className={styles.primaryBtn} onClick={handleOpenCreate}>
                  <FiPlus /> Crear primera transacción
                </button>
              )
            }
          />
        ) : (
          <>
            <div className={styles.gridContainer}>
              <AgGridReact
                theme={gastosAgGridTheme}
                rowData={transacciones}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                domLayout="autoHeight"
                animateRows={true}
                rowSelection="single"
                suppressCellFocus={true}
                loading={isLoading}
              />
            </div>

            {/* Paginación keyset — sin número de página absoluto */}
            <div className={styles.paginationInfo}>
              <div className={styles.paginationLeft}>
                <span>
                  {transacciones.length > 0
                    ? `${filters.limit * (currentPage - 1) + 1}–${filters.limit * (currentPage - 1) + transacciones.length} resultados`
                    : "Sin resultados"}
                  {pagination.has_more ? " (hay más)" : ""}
                </span>
                <label className={styles.pageSizeLabel}>
                  Filas por página
                  <select
                    className={styles.pageSizeSelect}
                    value={filters.limit}
                    onChange={(e) => updateFilter("limit", Number(e.target.value))}
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className={styles.paginationBtns}>
                <button
                  className={styles.paginationBtn}
                  disabled={cursorStack.length <= 1 || isFetching}
                  onClick={handlePrev}
                  aria-label="Página anterior"
                >
                  <FiChevronLeft /> Anterior
                </button>
                <span className={styles.pageIndicator}>
                  Página {currentPage}
                </span>
                <button
                  className={styles.paginationBtn}
                  disabled={!pagination.has_more || isFetching}
                  onClick={handleNext}
                  aria-label="Página siguiente"
                >
                  Siguiente <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Crear/Editar */}
      <ModalTransaccion
        isOpen={modalOpen}
        onClose={handleCloseModal}
        editingTx={editingTx}
      />
    </div>
  );
};

export default TransaccionesPage;
