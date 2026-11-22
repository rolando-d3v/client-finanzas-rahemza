
## Estructura de carpetas referencial para el frontend de react

src/
 │
 ├── modules/
 │   ├── auth/
 │   │    ├── pages/
 │   │    │     ├── login_page/
 │   │    │     │        ├── LoginPage.jsx
 │   │    │     │        └── login.module.css
 │   │    │     ├── register_user_page/
 │   │    │     │        ├── RegisterPage.jsx
 │   │    │     │        └── register.module.css
 │   │    │     └── recover_password_page/
 │   │    │              ├── RecoverPage.jsx
 │   │    │              └── recover.module.css
 │   │    │ 
 │   │    ├── components/
 │   │    │     ├── modal/
 │   │    │     │     ├── Modal.jsx
 │   │    │     │     └── modal.module.css
 │   │    │     ├── table/
 │   │    │     │     ├── Table.jsx
 │   │    │     │     └── table.module.css
 │   │    │     ├── spinner/
 │   │    │     │     ├── Spinner.jsx
 │   │    │     │     └── spinner.module.css
 │   │    │     └── cards/
 │   │    │           ├── Card.jsx
 │   │    │           └── card.module.css
 │   │    ├── hooks/
 │   │    │      ├── useAuth.js
 │   │    │      └── useUser.js
 │   │    │ 
 │   │    └── services/
 │   │           ├── authService.js
 │   │           └── userService.js
 │   │
 │   ├── user/
 │   │    ├── pages/
 │   │    │     ├── profile/
 │   │    │     │        ├── ProfilePage.jsx
 │   │    │     │        └── profile.module.css
 │   │    │     └── config/
 │   │    │              ├── ConfigPage.jsx
 │   │    │              └── config.module.css
 │   │    │ 
 │   │    ├── components/
 │   │    │     ├── modal/
 │   │    │     │     ├── Modal.jsx
 │   │    │     │     └── modal.module.css
 │   │    │     └── cards/
 │   │    │           ├── Card.jsx
 │   │    │           └── card.module.css
 │   │    ├── hooks/
 │   │    │      ├── useProfile.js
 │   │    │      └── useConfig.js
 │   │    │ 
 │   │    └── services/
 │   │           ├── profileService.js
 │   │           └── configService.js
 │   │
 │   ├── categories/
 │   │    ├── pages/
 │   │    ├── components/
 │   │    ├── hooks/
 │   │    └── services
 │   │
 │   ├── roles/
 │   └── productos/
 │
 ├── config/
 │    ├── axios.js
 │    ├── constants.js
 │    ├── queryClient.js
 │    └── routes.js
 ├── styles/
 │    ├── globals.css
 │    ├── variables.css
 │    └── index.css
 ├── redux/
 │    ├── slices/
 │    │    ├── authSlice.js
 │    │    ├── categoriesSlice.js
 │    │    └── usersSlice.js
 │    └── store.js
 │
 └── layouts/





## archivo = src/config/routes.jsx


import { createBrowserRouter } from "react-router";

// ─── Placeholder para páginas aún no implementadas ──────────
const ComingSoon = ({ title }) => (
  <div style={{ padding: "2rem" }}>
    <h2>{title}</h2>
    <p style={{ color: "var(--text)", marginTop: "0.5rem" }}>
      Esta sección está en desarrollo...
    </p>
   
    <h2>{title}</h2>
    <p style={{ color: "var(--text)", marginTop: "0.5rem" }}>
      Esta sección está en desarrollo...
    </p>
  </div>
);



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
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  PÁGINA NO AUTORIZADO
  // ════════════════════════════════════════════════════════════
  { path: "/no-autorizado", element: <UnauthorizedPage /> },

  // ════════════════════════════════════════════════════════════
  //  RUTAS PRIVADAS - Todos los roles autenticados
  // ════════════════════════════════════════════════════════════
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/dashboard", element: <ComingSoon title="Dashboard" /> },
          { path: "/perfil", element: <ComingSoon title="Mi Perfil" /> },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  RUTAS PRIVADAS - ADMIN
  // ════════════════════════════════════════════════════════════
  {
    element: <PrivateRoute allowedRoles={[1]} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/admin/colegios",
            element: <ComingSoon title="Gestión de Colegios" />,
          },
          {
            path: "/admin/role-opcion",
            element: <RoleOpcionPage />,
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  RUTAS PRIVADAS  USER
  // ════════════════════════════════════════════════════════════
  {
    element: <PrivateRoute allowedRoles={[2]} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/user/dashboard",
            element: <ComingSoon title="Dashboard" />,
          },
          {
            path: "/user/configuracion",
            element: <ComingSoon title="Configuración del Colegio" />,
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  CATCH ALL → 404
  // ════════════════════════════════════════════════════════════
  {
    path: "*",
    element: <ComingSoon title="Página no encontrada (404)" />,
  },
]);
