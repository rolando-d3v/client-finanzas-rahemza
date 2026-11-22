import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import layoutReducer from "./slices/layoutSlice";

export const store = configureStore({
  reducer: {
    Auth: authReducer,
    Layout: layoutReducer,
  },
  devTools: import.meta.env.DEV ? {
    maxAge: 25,
    trace: false,
  } : false,
});
