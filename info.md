# Pappuk — Sistema de Gestión Financiera Multiempresa (Frontend)

Cliente frontend del proyecto **Pappuk** (también conocido como *client-gastos-rahemza*): una plataforma web tipo SaaS para la **gestión financiera empresarial multi-tenant**. Permite controlar ingresos, egresos, flujo de caja, cuentas, presupuestos, metas de ahorro, transferencias y reportes financieros por empresa.

---

## 1. Datos técnicos

| Ítem | Valor |
|---|---|
| Nombre | `client-gastos-rahemza` |
| Versión | `0.0.0` |
| Tipo de proyecto | SPA (Single Page Application) |
| Lenguaje | JavaScript (ESM, `type: module`) |
| Framework UI | React 18 (`react`, `react-dom`) |
| Enrutador | React Router 7 (`react-router` con `createBrowserRouter`) |
| Bundler / Dev server | Vite 8 (`@vitejs/plugin-react`) |
| Node mínimo | `>=22.12.0` |
| Linting | ESLint 9 (flat config) + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` |
| Formato | Prettier (`.prettierrc`) |
| Variables de entorno | `.env` (prefijo `VITE_`) |
| Título en el navegador | **Pappuk** |

### Scripts npm

- `npm run dev` — inicia Vite en modo desarrollo con HMR.
- `npm run build` — genera el bundle de producción en `dist/`.
- `npm run preview` — sirve el build de producción para revisión.
- `npm run lint` — corre ESLint sobre todo el proyecto.

---

## 2. Stack de librerías (dependencias)

### Estado y datos
- **Redux Toolkit** + **react-redux** — estado global de la app (autenticación, layout, empresa activa, módulos, plan).
- **@tanstack/react-query** — cache, fetching, mutaciones y revalidación de datos del backend.
- **axios** — cliente HTTP, con `interceptors` que inyectan `X-Empresa-Id` y manejan `401`.

### Autenticación
- **better-auth** + **@better-auth/react** — cliente `authClient` para login, registro y logout contra el backend.

### Formularios y validación
- **react-hook-form** — manejo de formularios.
- **zod** + **@hookform/resolvers** — esquemas y validación.

### UI y visual
- **ag-grid-community** + **ag-grid-react** — tablas empresariales avanzadas.
- **recharts** — gráficos (line, bar, pie, area, composed, etc.).
- **react-select** — selects enriquecidos.
- **react-icons** — iconografía (Feather, etc.).
- **sonner** — toasts/notificaciones.
- **dayjs** — manejo de fechas.

### Animación y scroll
- **gsap** + **@gsap/react** — animaciones.
- **motion** — microinteracciones.
- **lenis** — smooth scroll integrado con `gsap.ticker` y `ScrollTrigger`.

### Tablas (segundo stack)
- **@tanstack/react-table** — tablas headless (headless table) complementarias.

---

## 3. Arquitectura general

El proyecto sigue una **arquitectura modular por dominio (feature-based)** con capas claras:

- **Rutas** declarativas con `createBrowserRouter`.
- **Guards** que verifican autenticación, rol y permiso por módulo.
- **Layouts** separados para rutas públicas y privadas.
- **Módulos** auto-contenidos: `auth`, `dashboard`, `cuentas`, `categorias`, `etiquetas`, `transacciones`, `transferencias`, `presupuestos`, `metas`, `empresas`, `auditoria`, `plan_roles`, `user`, `home_page`.
- **Config centralizada** para cliente HTTP, constantes, rutas, queryClient, smooth scroll y guards.
- **Redux** como fuente de verdad para sesión y UI persistente.
- **React Query** como fuente de verdad para datos del backend.

### Estructura de carpetas

```
src/
├── assets/                 # íconos, logos, imágenes, videos, tonos, wallpapers
├── components/
│   ├── table/              # (reservado) piezas para tablas
│   └── ui/                 # componentes UI reutilizables (Badge, Breadcrumb,
│                           #   ComingSoonPage, EmptyState, KpiCard, Modal,
│                           #   Skeleton, Spinner, CategoriaTreeSelect)
├── config/
│   ├── axios.js            # instancia axios + interceptors
│   ├── authClient.js       # cliente Better Auth
│   ├── constants.js        # API URL, ROLES, DEFAULT_ROUTES, paginación
│   ├── Lenis.jsx           # smooth scroll provider (Lenis + GSAP)
│   ├── queryClient.js      # config TanStack Query
│   ├── routes.jsx          # router principal (rutas públicas, privadas, admin, super_admin, 404)
│   └── guards/
│       ├── PrivateRoute/   # valida auth + roles + módulo por BD
│       └── PublicRoute/    # rutas solo para usuarios no autenticados
├── hooks/
│   ├── useLayout.js        # toggle sidebar + estado layout
│   ├── usePagination.js    # (plantilla)
│   └── useUIPreferences.jsx# preferencias de UI
├── layouts/
│   ├── AuthLayout/         # layout público (login, register, home)
│   ├── HeaderBar/          # header superior con breadcrumbs y búsqueda
│   ├── MainLayout/         # layout autenticado (sidebar + header + content)
│   ├── Sidebar/            # sidebar colapsable con menú dinámico por módulos
│   └── toggleTheme/        # toggle dark/light
├── modules/                # módulos de dominio
│   ├── auth/               # login, register, callback Google, unauthorized
│   ├── auditoria/          # auditoría (admin/super_admin)
│   ├── categorias/         # categorías jerárquicas + árbol
│   ├── cuentas/            # cuentas (efectivo, banco, tarjetas…)
│   ├── dashboard/          # dashboard principal + charts
│   ├── empresas/           # administración de empresas
│   ├── etiquetas/          # tags para transacciones
│   ├── home_page/          # landing pública de marketing (Navbar, Hero, Pricing…)
│   ├── metas/              # metas de ahorro
│   ├── plan_roles/         # planes y roles
│   ├── presupuestos/       # presupuestos (diario, semanal, mensual, anual)
│   ├── transacciones/      # ingresos y egresos
│   ├── transferencias/     # transferencias entre cuentas
│   └── user/               # perfil, usuarios (admin), super admin
├── redux/
│   ├── store.js            # configureStore con Auth + Layout
│   └── slices/
│       ├── authSlice.js    # user, roles, activeRole, empresa, suscripción, plan, módulos
│       └── layoutSlice.js  # estado sidebar, modal, select categoría
├── styles/
│   ├── color.css           # design tokens (colores, sombras, radios)
│   └── index.css           # reset + tipografías (Inter, Black Ops One)
├── tools/
│   ├── Toasting.jsx        # helpers de toasts
│   └── xlsx.jsx            # utilidades para Excel/CSV
└── main.jsx                # entrypoint: Provider + QueryClient + Toaster + AuthInitializer + RouterProvider
```

Convención interna: cada módulo se organiza en `pages/`, `components/`, `hooks/` y `services/` (servicios de React Query/axios).

---

## 4. Sistema de autenticación y autorización

### Flujo de sesión

1. **`AuthInitializer`** (`src/modules/auth/components/AuthInitializer/AuthInitializer.jsx`) se monta **antes** del router y consulta `GET /api/custom-auth/verify-auth` (cookie HttpOnly).
2. Si la respuesta trae `{ user, empresa }` válidos, dispara `setCredentials` en Redux.
3. Si no, dispara `logout` y la app queda en modo “no autenticado”.
4. Mientras se verifica, muestra un loader (spinner + “Cargando Sistema de Gastos…”).

### Roles

Definidos en `src/config/constants.js`:

- `super_admin`
- `admin`
- `user`

### Guard de rutas privadas (`PrivateRoute`)

- Si **no está autenticado** → redirige a `/login`.
- Si `allowedRoles` está definido y el usuario no tiene ninguno → redirige a `/no-autorizado`.
- Si `requireModule={true}` y el usuario **no es super_admin**, verifica que el `pathname` actual exista dentro de los `modulos` del usuario (recurso de la BD). Si no, redirige a `/no-autorizado`.
- Paths siempre permitidos: `/`, `/dashboard`, `/perfil`.

### Cliente HTTP (`axios.js`)

- `baseURL` = `VITE_BACKEND_URL_GASTOS` (default `http://localhost:4000`).
- `withCredentials: true` para enviar cookies HttpOnly.
- Interceptor de **request**: inyecta `X-Empresa-Id` cuando el store de Redux tiene una empresa activa (caso super_admin multi-empresa).
- Interceptor de **response**: ante `401`, redirige a `/login` salvo que ya estés en `/login`.

### Cliente Better Auth (`authClient.js`)

- `baseURL: http://localhost:4000`.
- Exporta `signIn`, `signUp`, `signOut`, `useSession`.

### Hook central `useAuth`

Expone:

- Estado: `user`, `roles`, `activeRole`, `empresa`, `suscripcion`, `plan`, `modulos`, `isAuthenticated`, `isLoggingOut`, `error`.
- Acciones: `handleLogout` (mutation que limpia backend + Redux + cache de React Query), `handleSetActiveRole`, `handleSetEmpresa`.
- Helpers: `hasRole`, `hasAnyRole`, `isSuperAdmin`, `isAdmin`, `isUser`.

---

## 5. Rutas y navegación

Definidas en `src/config/routes.jsx`.

### Públicas (con `AuthLayout`)
- `/home` — landing pública de marketing (`home_page`).
- `/login` — inicio de sesión.
- `/register` — registro de usuario.

### Públicas especiales
- `/auth/callback` — callback de Google OAuth.
- `/no-autorizado` — pantalla de no autorización.

### Privadas — usuario autenticado (`MainLayout`)
Roles: `user`, `admin`, `super_admin` (con `requireModule`).

- `/` y `/dashboard` — Dashboard principal.
- `/operaciones/transacciones` — Transacciones (ingresos/egresos).
- `/operaciones/transferencias` — Transferencias entre cuentas.
- `/catalogos/cuentas` — Cuentas.
- `/catalogos/categorias` — Categorías (jerárquicas).
- `/catalogos/etiquetas` — Etiquetas.
- `/finanzas/presupuestos` — Presupuestos.
- `/finanzas/metas_ahorro` — Metas de ahorro.
- `/perfil` — Perfil del usuario.

### Privadas — Admin (`MainLayout`)
Roles: `admin`, `super_admin`.

- `/admin/empresas` — Empresas.
- `/admin/usuarios` — Usuarios.
- `/admin/roles` — Planes y roles.
- `/admin/auditoria` — Auditoría.

### Privadas — Super Admin (`MainLayout`)
Roles: `super_admin`.

- `/super_admin/empresas` — Empresas.
- `/super_admin/usuarios` — Gestión global de usuarios.
- `/super_admin/plan_roles` — Planes y roles.
- `/super_admin/auditoria` — Auditoría.

### Catch-all
- `*` → `ComingSoonPage` con título “Página no encontrada (404)”.

### Menú lateral (Sidebar)

- Se genera dinámicamente desde los `modulos` del usuario autenticado (definidos por plan/rol en backend).
- Agrupa módulos en secciones: **Finanzas**, **Inventario**, **Sistema** según `codigo`.
- Colapsable (estado persistido en Redux).
- Soporta submenús anidados y resaltado del item activo con `NavLink`.
- En móvil (`<=1024px`) cierra automáticamente al navegar.
- Muestra la empresa activa (nombre comercial y RUC) cuando hay sesión.

### Header (`HeaderBar`)

- Breadcrumbs (componente `Breadcrumb` reutilizable).
- Buscador global y utilidades de UI.

---

## 6. Redux store

`src/redux/store.js`

```
{
  Auth:  authSlice   // user, roles, activeRole, empresa, suscripcion, plan, modulos, isAuthenticated, isInitialized, error
  Layout: layoutSlice // estado_sidebar, select_categoria, estado_modal
}
```

Acciones clave de `authSlice`:

- `setCredentials` — payload `{ user, roles, empresa, suscripcion, plan, modulos }`.
- `logout` — limpia todo el estado de auth.
- `setActiveRole` — cambio de rol activo.
- `setEmpresa` — selección de empresa (super_admin multi-empresa).
- `setAuthError` / `clearError`.

Acciones de `layoutSlice`:

- `setOpenToggleSidebar`.
- `x_select_categoria`.
- `openModalBasex`.

---

## 7. React Query

`src/config/queryClient.js`

- `refetchOnWindowFocus: false`.
- `retry: 1`.
- `refetchOnReconnect: true`.
- `staleTime: 5 minutos`.

Queries destacadas:

- `["auth", "verify"]` → verificación inicial de sesión (`verifyAuthService`).
- Mutación de logout → invalida queries con `queryKey: ["auth"]`.

Servicios HTTP por módulo siguen el patrón `api.get/post/put/delete('/api/...')`.

---

## 8. UI / UX

- **Tipografía**: `Inter` como sans principal; `Black Ops One` para acentos.
- **Design tokens**: variables CSS centralizadas en `src/styles/color.css` (colores, sombras, radios, estados).
- **Modo claro/oscuro**: soportado vía `toggleTheme` y variables CSS.
- **Animaciones**: GSAP + ScrollTrigger + Motion + Lenis (smooth scroll).
- **Componentes UI base**: `Badge`, `Breadcrumb`, `ComingSoonPage`, `EmptyState`, `KpiCard`, `Modal`, `Skeleton`, `Spinner`, `CategoriaTreeSelect`.
- **Notificaciones**: Sonner (toasts rich en `top-right`).
- **Iconografía**: `react-icons` (Feather, etc.).
- **Responsive**: breakpoints por CSS modules (`<1024px` colapsa sidebar automáticamente).

---

## 9. Dashboard

`src/modules/dashboard/pages/DashboardPage/`

Incluye:

- KPI cards (`KpiCard`).
- Gráficos con **Recharts**:
  - `FlujoCajaChart.jsx`
  - `GastosPorCategoriaChart.jsx`
  - `PresupuestoChart.jsx`
  - `SaldosPorCuentaChart.jsx`

Diseñado para responder de un vistazo: saldo total, ingresos/egresos del mes, balance, flujo de caja, presupuestos críticos y metas.

---

## 10. Home pública (marketing)

`src/modules/home_page/`

Landing independiente con:

- `Navbar`
- `Hero`
- `FinancesSection`
- `InventorySection`
- `CompanyManagementSection`
- `PricingSection`
- `Footer`
- `video/` — recursos de video

Se monta bajo `AuthLayout` en la ruta `/home` y aprovecha el smooth scroll (Lenis + GSAP).

---

## 11. Variables de entorno

Archivo `.env`:

```
VITE_BACKEND_URL_GASTOS=http://localhost:4000
# (opcional, comentado) VITE_BACKEND_URL_COLEX=http://localhost:4002
```

> **Importante:** todas las variables expuestas al cliente deben llevar el prefijo `VITE_`.

---

## 12. Build y despliegue

- Genera estáticos en `dist/` con `vite build`.
- Entry HTML: `index.html` (incluye `<div id="root">` y carga `src/main.jsx`).
- Configuración Vite: `vite.config.js` con `@vitejs/plugin-react`.
- Node mínimo: `>=22.12.0` (definido en `engines`).

---

## 13. Documentación auxiliar

El proyecto incluye notas de diseño y arquitectura en `skills/`:

- `requerimiento.md` — brief funcional completo (entidades, roles, dashboards, reportes, KPIs, gráficos, roadmap MVP → Enterprise).
- `frontend_react.md` — guía de arquitectura frontend.
- `carpetas_routes_react.md` — convenciones de carpetas y rutas.

---

## 14. Resumen ejecutivo

**Pappuk (client-gastos-rahemza)** es el frontend de un ERP financiero multi-tenant construido en **React 18 + Vite**, con un stack moderno de datos (**Redux Toolkit + TanStack Query + Axios**), autenticación robusta (**Better Auth + cookies HttpOnly**), autorización por **roles y módulos**, UI profesional (**CSS modules + design tokens + modo oscuro + animaciones GSAP/Motion/Lenis**), tablas empresariales (**AG Grid + TanStack Table**), gráficos (**Recharts**) y formularios validados (**React Hook Form + Zod**). La arquitectura modular por dominio permite escalar de un MVP financiero a una versión Enterprise multi-módulo (Finanzas, Inventario, Auditoría, Administración).
