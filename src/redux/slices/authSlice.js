import { createSlice } from "@reduxjs/toolkit";

// ─── Estado inicial ─────────────────────────────────────────
const initialState = {
  // usuario autenticado
  user: null,
  // { id, name, email, empresa_id, image, ... }

  // roles del usuario ["super_admin", "admin", "user"]
  roles: [],

  // rol activo seleccionado (cuando tiene múltiples)
  activeRole: null,

  // datos de la empresa del usuario
  empresa: null,

  // datos de la suscripción de la empresa
  suscripcion: null,

  // datos del planes de la empresa
  plan: null,

  // modulos segun role y plan
  modulos: [],

  // estado de autenticación
  isAuthenticated: false,

  // true cuando sesión + roles están completamente cargados
  isInitialized: false,

  // error de autenticación
  error: null,
};

// ─── Slice ──────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // Establecer credenciales completas (user + roles + empresa)
    setCredentials: (state, action) => {
      const { user, roles, empresa, suscripcion, plan, modulos } = action.payload;
      state.user = user;
      state.roles = roles || [];
      state.activeRole = roles?.[0] || null;
      state.empresa = empresa || null;
      state.suscripcion = suscripcion || null;
      state.plan = plan || null;
      state.modulos = modulos || [];
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.error = null;
    },

    // Cerrar sesión
    logout: (state) => {
      state.user = null;
      state.roles = [];
      state.activeRole = null;
      state.empresa = null;
      state.suscripcion = null;
      state.plan = null;
      state.modulos = [];
      state.isAuthenticated = false;
      state.isInitialized = false;
      state.error = null;
    },

    // Cambiar rol activo (para usuarios con múltiples roles)
    setActiveRole: (state, action) => {
      state.activeRole = action.payload;
    },

    // Seleccionar empresa (para super_admin que gestiona múltiples)
    setEmpresa: (state, action) => {
      state.empresa = action.payload;
    },

    // Guardar error de autenticación
    setAuthError: (state, action) => {
      state.error = action.payload;
    },

    // Limpiar error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  logout,
  setActiveRole,
  setEmpresa,
  setAuthError,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
