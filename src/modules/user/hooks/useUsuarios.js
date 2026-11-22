import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as usuarioService from "../services/usuarioService";
import * as rolService from "../services/rolService";

// ─── Admin hooks (usuarios de su empresa) ───────────────────

// Hook-query para obtener el listado de usuarios de la empresa y la información del plan
export const useUsuarios = () =>
  useQuery({
    queryKey: ["usuarios"],
    queryFn: usuarioService.getUsuarios,
    select: (response) => ({
      usuarios: Array.isArray(response) ? response : (response?.data || []),
      plan_info: response?.plan_info || null,
    }),
  });

// Hook-query para obtener el listado de roles asignables
export const useRoles = () =>
  useQuery({ queryKey: ["roles"], queryFn: rolService.getRoles });

// Hook-query para crear un usuario en la empresa
export const useCreateUsuario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usuarioService.createUsuario,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear usuario"),
  });
};

// Hook-query para actualizar un usuario de la empresa
export const useUpdateUsuario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usuarioService.updateUsuario,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar usuario"),
  });
};

// Hook-query para desactivar un usuario de la empresa
export const useDeleteUsuario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usuarioService.deleteUsuario,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      queryClient.invalidateQueries({ queryKey: ["usuarios-all"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al desactivar usuario"),
  });
};

// ─── Módulos por usuario hooks ──────────────────────────────

// Hook-query para obtener módulos del plan + asignados al usuario
export const useUserModulos = (userId) =>
  useQuery({
    queryKey: ["user-modulos", userId],
    queryFn: () => usuarioService.getUserModulos(userId),
    enabled: !!userId,
  });

// Hook-mutation para actualizar módulos asignados a un usuario
export const useUpdateUserModulos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usuarioService.updateUserModulos,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["user-modulos"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar módulos"),
  });
};

// ─── Super Admin hooks (usuarios globales) ──────────────────

// Hook-query para obtener todos los usuarios a nivel global (Super Admin)
export const useAllUsuarios = () =>
  useQuery({ queryKey: ["usuarios-all"], queryFn: usuarioService.getAllUsuarios });

// Hook-query para crear un usuario global (Super Admin)
export const useCreateUsuarioSuperAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usuarioService.createUsuarioSuperAdmin,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["usuarios-all"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear usuario"),
  });
};

// Hook-query para actualizar un usuario global (Super Admin)
export const useUpdateUsuarioSuperAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usuarioService.updateUsuarioSuperAdmin,
    onSuccess: (data) => {
      toast.success(data.msj);
      queryClient.invalidateQueries({ queryKey: ["usuarios-all"] });
    },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar usuario"),
  });
};
