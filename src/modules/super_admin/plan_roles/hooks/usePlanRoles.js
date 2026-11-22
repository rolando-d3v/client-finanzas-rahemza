import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as svc from "../services/planRolesService";

// ═══════════════════════════════════════════════════════════════
//  MÓDULOS
// ═══════════════════════════════════════════════════════════════
export const useModulos = () =>
  useQuery({ queryKey: ["modulos"], queryFn: svc.getModulos });

export const useCreateModulo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createModulo,
    onSuccess: (data) => { toast.success(data.msj); qc.invalidateQueries({ queryKey: ["modulos"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear módulo"),
  });
};

export const useUpdateModulo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.updateModulo,
    onSuccess: (data) => { toast.success(data.msj); qc.invalidateQueries({ queryKey: ["modulos"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar módulo"),
  });
};

export const useToggleModulo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.toggleModulo,
    onSuccess: (data) => { toast.success(data.msj); qc.invalidateQueries({ queryKey: ["modulos"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al cambiar estado"),
  });
};

export const useDeleteModulo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.deleteModulo,
    onSuccess: (data) => { toast.success(data.msj); qc.invalidateQueries({ queryKey: ["modulos"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al eliminar módulo"),
  });
};

// ═══════════════════════════════════════════════════════════════
//  PLANES
// ═══════════════════════════════════════════════════════════════
export const usePlanes = () =>
  useQuery({
    queryKey: ["planes"],
    queryFn: svc.getPlanes,
    staleTime: 1000 * 60 * 10, // 10 min: los planes rara vez cambian
    gcTime:    1000 * 60 * 30, // 30 min: en caché todo lo que dure la sesión de trabajo
  });


export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createPlan,
    onSuccess: (data) => { toast.success(data.msj); qc.invalidateQueries({ queryKey: ["planes"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear plan"),
  });
};

export const useUpdatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.updatePlan,
    onSuccess: (data) => { toast.success(data.msj); qc.invalidateQueries({ queryKey: ["planes"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar plan"),
  });
};

export const useTogglePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.togglePlan,
    onSuccess: (data) => { toast.success(data.msj); qc.invalidateQueries({ queryKey: ["planes"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al cambiar estado"),
  });
};

export const useDeletePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.deletePlan,
    onSuccess: (data) => { toast.success(data.msj); qc.invalidateQueries({ queryKey: ["planes"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al eliminar plan"),
  });
};

export const useSyncModulosPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.syncModulosPlan,
    onSuccess: () => { toast.success("Módulos sincronizados ✔️"); qc.invalidateQueries({ queryKey: ["planes"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al sincronizar módulos"),
  });
};

// ═══════════════════════════════════════════════════════════════
//  ROLES
// ═══════════════════════════════════════════════════════════════
export const useRoles = () =>
  useQuery({ queryKey: ["roles-admin"], queryFn: svc.getRoles });

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createRole,
    onSuccess: (data) => { toast.success(data.msj); qc.invalidateQueries({ queryKey: ["roles-admin"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al crear rol"),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.updateRole,
    onSuccess: (data) => { toast.success(data.msj); qc.invalidateQueries({ queryKey: ["roles-admin"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al actualizar rol"),
  });
};

export const useToggleRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.toggleRole,
    onSuccess: (data) => { toast.success(data.msj); qc.invalidateQueries({ queryKey: ["roles-admin"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al cambiar estado"),
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.deleteRole,
    onSuccess: (data) => { toast.success(data.msj); qc.invalidateQueries({ queryKey: ["roles-admin"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al eliminar rol"),
  });
};

export const useSyncModulosRol = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.syncModulosRol,
    onSuccess: () => { toast.success("Permisos sincronizados ✔️"); qc.invalidateQueries({ queryKey: ["roles-admin"] }); },
    onError: (err) => toast.error(err.response?.data?.msj || "Error al sincronizar permisos"),
  });
};
