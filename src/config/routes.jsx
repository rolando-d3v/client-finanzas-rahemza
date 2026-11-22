import { createBrowserRouter } from "react-router";

// ─── Guards ─────────────────────────────────────────────────
import PrivateRoute from "./guards/PrivateRoute/PrivateRoute";
import PublicRoute from "./guards/PublicRoute/PublicRoute";

// ─── Layouts ────────────────────────────────────────────────
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import MainLayout from "../layouts/MainLayout/MainLayout";

// ─── Auth pages ─────────────────────────────────────────────
import LoginPage from "../modules/auth/pages/LoginPage/LoginPage";
import RegisterUserPage from "../modules/auth/pages/RegisterUserPage/RegisterUserPage";
import UnauthorizedPage from "../modules/auth/pages/UnauthorizedPage/UnauthorizedPage";
import GoogleCallbackPage from "../modules/auth/pages/GoogleCallbackPage/GoogleCallbackPage";
import SuscripcionVencidaPage from "./guards/SuscripcionVencidaPage/SuscripcionVencidaPage";
import Planes from "../modules/home_page/page/planes/Planes";
import HomePage from "../modules/home_page/page/HomePage";

// ─── Dashboard ──────────────────────────────────────────────
import DashboardPage from "../modules/finanzas/dashboard/pages/DashboardPage/DashboardPage";

// ─── Cuentas ────────────────────────────────────────────────
import CuentasPage from "../modules/finanzas/cuentas/pages/CuentasPage/CuentasPage";

// ─── Categorías ─────────────────────────────────────────────
import CategoriasPage from "../modules/finanzas/categorias/pages/CategoriasPage/CategoriasPage";

// ─── Etiquetas ──────────────────────────────────────────────
import EtiquetasPage from "../modules/finanzas/etiquetas/pages/EtiquetasPage/EtiquetasPage";

// ─── Transacciones ──────────────────────────────────────────
import TransaccionesPage from "../modules/finanzas/transacciones/pages/TransaccionesPage/TransaccionesPage";

// ─── Transferencias ─────────────────────────────────────────
import TransferenciasPage from "../modules/finanzas/transferencias/pages/TransferenciasPage/TransferenciasPage";

// ─── Presupuestos ───────────────────────────────────────────
import PresupuestosPage from "../modules/finanzas/presupuestos/pages/PresupuestosPage/PresupuestosPage";

// ─── Metas ──────────────────────────────────────────────────
import MetasPage from "../modules/finanzas/metas/pages/MetasPage/MetasPage";

// ─── Perfil / Usuarios ──────────────────────────────────────
import PerfilPage from "../modules/user/pages/perfil_page/PerfilPage";
import UsuariosPage from "../modules/admin/pages/usuario_page/UsuariosPage";

// ─── Admin Empresas / Auditoría ────────────────────────────
import EmpresasPage from "../modules/super_admin/empresas/pages/EmpresasPage/EmpresasPage";
import AuditoriaPage from "../modules/admin/auditoria/pages/AuditoriaPage/AuditoriaPage";

// ─── ComingSoon (páginas aún en desarrollo) ─────────────────
import ComingSoonPage from "../components/ui/ComingSoonPage/ComingSoonPage";
import UsuarioSuperAdminPage from "../modules/super_admin/usuario_super_admin_page/UsuariosSuperAdminPage";

// ─── Planes y Roles ─────────────────────────────────────────
import PlanRolesPage from "../modules/super_admin/plan_roles/pages/PlanRolesPage/PlanRolesPage";
import LayoutHomePage from "../modules/home_page/page/layout/LayoutHomePage";
import FinanzasPage from "../modules/home_page/page/finanzas/FinanzasPage";
import InventarioPage from "../modules/home_page/page/inventario/InventarioPage";
import PlanesAdmin from "../modules/admin/pages/planes/PlanesAdmin";
import PagosAdmin from "../modules/admin/pages/pagos/PagosAdmin";

// ─── Inventario / Productos ─────────────────────────────────
import ProductosListPage from "../modules/inventario/productos/pages/ProductosListPage/ProductosListPage";
import ProductoFormPage from "../modules/inventario/productos/pages/ProductoFormPage/ProductoFormPage";

// ─── Router ─────────────────────────────────────────────────
export const router = createBrowserRouter([
  // ════════════════════════════════════════════════════════════
  //  RUTAS PÚBLICAS (login, recover, register)
  // ════════════════════════════════════════════════════════════
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterUserPage /> },
          {
            element: <LayoutHomePage />,
            children: [
              { path: "/home", element: <HomePage /> },
              { path: "/finanzas", element: <FinanzasPage /> },
              { path: "/inventario", element: <InventarioPage /> },
              { path: "/planes", element: <Planes /> },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  PÁGINA NO AUTORIZADO
  // ════════════════════════════════════════════════════════════
  { path: "/no-autorizado", element: <UnauthorizedPage /> },
  { path: "/suscripcion-vencida", element: <SuscripcionVencidaPage /> },

  // ════════════════════════════════════════════════════════════
  //  CALLBACK DE GOOGLE OAUTH
  // ════════════════════════════════════════════════════════════
  { path: "/auth/callback", element: <GoogleCallbackPage /> },

  // ════════════════════════════════════════════════════════════
  //  RUTAS PRIVADAS - USUARIOS
  // ════════════════════════════════════════════════════════════
  {
    element: <PrivateRoute allowedRoles={["user", "admin", "super_admin"]} requireModule={true} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          // ── Dashboard ─────────────────────────────────────
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/", element: <DashboardPage /> },

          // ── Operaciones ───────────────────────────────────
          { path: "/operaciones/transacciones", element: <TransaccionesPage /> },
          { path: "/operaciones/transferencias", element: <TransferenciasPage /> },

          // ── Catálogos ─────────────────────────────────────
          { path: "/catalogos/cuentas", element: <CuentasPage /> },
          { path: "/catalogos/categorias", element: <CategoriasPage /> },
          { path: "/catalogos/etiquetas", element: <EtiquetasPage /> },

          // ── Finanzas ──────────────────────────────────────
          { path: "/finanzas/presupuestos", element: <PresupuestosPage /> },
          { path: "/finanzas/metas_ahorro", element: <MetasPage /> },

          // ── Perfil ────────────────────────────────────────
          { path: "/perfil", element: <PerfilPage /> },

          // ── Inventario / Productos (Estilo Zoho Inventory) ───
          { path: "/articulos/productos", element: <ProductosListPage /> },
          { path: "/articulos/productos/nuevo", element: <ProductoFormPage /> },
          { path: "/articulos/productos/editar/:id", element: <ProductoFormPage /> },
          // Compatibilidad con sidebar /catalogos/productos
          { path: "/catalogos/productos", element: <ProductosListPage /> },
          { path: "/catalogos/productos/nuevo", element: <ProductoFormPage /> },
          { path: "/catalogos/productos/editar/:id", element: <ProductoFormPage /> },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  RUTAS PRIVADAS - ADMIN
  // ════════════════════════════════════════════════════════════
  {
    element: <PrivateRoute allowedRoles={["admin", "super_admin"]} requireModule={true} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/admin/usuarios", element: <UsuariosPage /> },
          { path: "/admin/auditoria", element: <AuditoriaPage /> },
          { path: "/admin/planes", element: <PlanesAdmin /> },
          { path: "/admin/pagos", element: <PagosAdmin /> },
        ],
      },
    ],
  },
  // ════════════════════════════════════════════════════════════
  //  RUTAS PRIVADAS - SUPER ADMIN
  // ════════════════════════════════════════════════════════════
  {
    element: <PrivateRoute allowedRoles={["super_admin"]} requireModule={true} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/super_admin/empresas", element: <EmpresasPage /> },
          { path: "/super_admin/usuarios", element: <UsuarioSuperAdminPage /> },
          { path: "/super_admin/plan_roles", element: <PlanRolesPage /> },
          { path: "/super_admin/auditoria", element: <AuditoriaPage /> },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  CATCH ALL → 404
  // ════════════════════════════════════════════════════════════
  {
    path: "*",
    element: <ComingSoonPage title="Página no encontrada (404)" icon="🔍" breadcrumbs={[]} />,
  },
]);

