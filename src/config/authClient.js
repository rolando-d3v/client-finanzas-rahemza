import { createAuthClient } from "better-auth/react";
import { API_URL_GASTOS } from "./constants";

export const authClient = createAuthClient({
  baseURL: API_URL_GASTOS,
  
});

export const { signIn, signUp, useSession, signOut } = authClient;
