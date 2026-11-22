import api from "../../../../config/axios";

/**
 * Obtiene el listado de cuentas bancarias y de efectivo de la empresa.
 * @param {Object} [params] - Parámetros de filtro opcionales (ej: { activo: "true" | "false" }).
 * @returns {Promise<Object>} Promesa que resuelve a { data: Array<Cuenta>, plan_info: Object }.
 */
export const getCuentas = (params) =>
  api.get("/api/cuentas", { params }).then((res) => res.data);

/**
 * Obtiene los detalles de una cuenta específica por su ID.
 * @param {string} id - ID de la cuenta.
 * @returns {Promise<Object>} Promesa que resuelve con los datos de la cuenta especificada.
 */
export const getCuentaById = (id) =>
  api.get(`/api/cuentas/${id}`).then((res) => res.data);

/**
 * Crea una nueva cuenta en la empresa actual.
 * @param {Object} data - Datos de la cuenta ({ nombre, tipo, saldo_inicial, moneda, es_principal }).
 * @returns {Promise<Object>} Promesa que resuelve con { msj: string, cuenta: Object }.
 */
export const createCuenta = (data) =>
  api.post("/api/cuentas", data).then((res) => res.data);

/**
 * Actualiza los datos de una cuenta existente.
 * @param {Object} params - Objeto con el `id` de la cuenta y los demás campos a actualizar ({ id, nombre, tipo, saldo_inicial, moneda, es_principal }).
 * @returns {Promise<Object>} Promesa que resuelve con { msj: string, cuenta: Object }.
 */
export const updateCuenta = ({ id, ...data }) =>
  api.put(`/api/cuentas/${id}`, data).then((res) => res.data);

/**
 * Realiza un borrado lógico (desactivación) de una cuenta.
 * @param {string} id - ID de la cuenta a eliminar.
 * @returns {Promise<Object>} Promesa que resuelve con { msj: string, cuenta: Object }.
 */
export const deleteCuenta = (id) =>
  api.delete(`/api/cuentas/${id}`).then((res) => res.data);
