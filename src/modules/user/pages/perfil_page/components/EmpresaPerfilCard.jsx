import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  FiBriefcase,
  FiFileText,
  FiMapPin,
  FiPhone,
  FiMail,
  FiDollarSign,
  FiGlobe,
  FiClock,
  FiCompass,
  FiEdit2,
  FiCheck,
  FiCalendar,
  FiLock,
} from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { useEmpresaById, useUpdateEmpresa } from "../../../../super_admin/empresas/hooks/useEmpresas";
import { setEmpresa as setEmpresaAction } from "../../../../../redux/slices/authSlice";
import { useAuth } from "../../../../auth/hooks/useAuth";
import Modal from "../../../../../components/ui/Modal/Modal";
import Badge from "../../../../../components/ui/Badge/Badge";
import Skeleton from "../../../../../components/ui/Skeleton/Skeleton";
import { formatCalendarDate } from "../../../../../utils/dateUtils";
import styles from "./EmpresaPerfilCard.module.css";

/**
 * EmpresaPerfilCard — Componente que muestra y permite editar los datos
 * de la empresa asociada a la cuenta Google del administrador.
 *
 * @param {string} empresaId — ID de la empresa a consultar y editar.
 * @param {boolean} canEdit — Si el usuario tiene permisos de edición (admin / super_admin).
 */
export default function EmpresaPerfilCard({ empresaId, canEdit = false }) {
  const dispatch = useDispatch();
  const { empresa: authEmpresa, isSuperAdmin, user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // Consulta los datos frescos de la empresa
  const { data: empresaQueryData, isLoading } = useEmpresaById(empresaId);
  const empresa = empresaQueryData || authEmpresa;

  const updateMutation = useUpdateEmpresa();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Precargar el formulario al abrir el modal con datos de la empresa
  const handleOpenEdit = () => {
    if (empresa) {
      reset({
        razon_social: empresa.razon_social || "",
        nombre_comercial: empresa.nombre_comercial || "",
        ruc: empresa.ruc || "",
        direccion: empresa.direccion || "",
        telefono: empresa.telefono || "",
        email: empresa.email || user?.email || "",
        moneda_default: empresa.moneda_default || "PEN",
        pais: empresa.pais || "PE",
        timezone: empresa.timezone || "America/Lima",
        ubigeo: empresa.ubigeo || "",
      });
    }
    setModalOpen(true);
  };

  const onSubmit = (formData) => {
    updateMutation.mutate(
      { id: empresaId, ...formData },
      {
        onSuccess: (res) => {
          if (res?.empresa) {
            // Actualizar también en el estado global de Redux
            dispatch(setEmpresaAction(res.empresa));
          }
          setModalOpen(false);
        },
      }
    );
  };

  if (isLoading && !empresa) {
    return (
      <div className={styles.card}>
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonHeader} />
          <div className={styles.infoGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height={60} borderRadius={14} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!empresa) return null;

  return (
    <>
      <div className={styles.card}>
        {/* Encabezado */}
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <div className={styles.iconCircle}>
              <FiBriefcase />
            </div>
            <div className={styles.titleContainer}>
              <h2 className={styles.title}>Datos de la Empresa</h2>
              <p className={styles.subtitle}>
                Información institucional y comercial asociada a tu cuenta
              </p>
            </div>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.googleBadge}>
              <FaGoogle className={styles.googleIcon} />
              Google Admin
            </span>
            <span className={styles.roleBadge}>
              Rol: {isSuperAdmin ? "Super Admin" : "Admin"}
            </span>

            {canEdit && (
              <button
                type="button"
                className={styles.editBtn}
                onClick={handleOpenEdit}
                id="btn-editar-empresa-perfil"
              >
                <FiEdit2 />
                Editar Empresa
              </button>
            )}
          </div>
        </div>

        {/* Cuadrícula de información */}
        <div className={styles.infoGrid}>
          {/* Razón Social */}
          <div className={styles.infoItem}>
            <FiBriefcase className={styles.infoIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Razón Social</span>
              <span className={styles.infoValue} title={empresa.razon_social}>
                {empresa.razon_social || "—"}
              </span>
            </div>
          </div>

          {/* Nombre Comercial */}
          <div className={styles.infoItem}>
            <FiFileText className={styles.infoIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Nombre Comercial</span>
              <span className={styles.infoValue} title={empresa.nombre_comercial}>
                {empresa.nombre_comercial || "—"}
              </span>
            </div>
          </div>

          {/* RUC */}
          <div className={styles.infoItem}>
            <FiFileText className={styles.infoIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>RUC</span>
              <span className={styles.infoValue}>{empresa.ruc || "—"}</span>
            </div>
          </div>

          {/* Dirección */}
          <div className={styles.infoItem}>
            <FiMapPin className={styles.infoIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Dirección Fiscal</span>
              <span className={styles.infoValue} title={empresa.direccion}>
                {empresa.direccion || "—"}
              </span>
            </div>
          </div>

          {/* Teléfono */}
          <div className={styles.infoItem}>
            <FiPhone className={styles.infoIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Teléfono / Contacto</span>
              <span className={styles.infoValue}>{empresa.telefono || "—"}</span>
            </div>
          </div>

          {/* Correo Electrónico (Gmail) */}
          <div className={styles.infoItem}>
            <FiMail className={styles.infoIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Correo Electrónico (Gmail)</span>
              <span className={styles.infoValue} title={empresa.email || user?.email}>
                {empresa.email || user?.email || "—"}
              </span>
            </div>
          </div>

          {/* Moneda Principal */}
          <div className={styles.infoItem}>
            <FiDollarSign className={styles.infoIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Moneda Predeterminada</span>
              <span className={styles.infoValue}>
                {empresa.moneda_default === "USD" ? "Dólares (USD $)" : "Soles (PEN S/)"}
              </span>
            </div>
          </div>

          {/* País */}
          <div className={styles.infoItem}>
            <FiGlobe className={styles.infoIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>País</span>
              <span className={styles.infoValue}>{empresa.pais || "PE"}</span>
            </div>
          </div>

          {/* Zona Horaria */}
          <div className={styles.infoItem}>
            <FiClock className={styles.infoIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Zona Horaria</span>
              <span className={styles.infoValue}>{empresa.timezone || "America/Lima"}</span>
            </div>
          </div>

          {/* Ubigeo */}
          <div className={styles.infoItem}>
            <FiCompass className={styles.infoIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Ubigeo</span>
              <span className={styles.infoValue}>{empresa.ubigeo || "—"}</span>
            </div>
          </div>

          {/* Fecha de Registro */}
          <div className={styles.infoItem}>
            <FiCalendar className={styles.infoIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Fecha de Registro</span>
              <span className={styles.infoValue}>
                {empresa.created_at ? formatCalendarDate(empresa.created_at) : "—"}
              </span>
            </div>
          </div>

          {/* Estado de la Empresa */}
          <div className={styles.infoItem}>
            <FiCheck className={styles.infoIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Estado en el Sistema</span>
              <div>
                <Badge
                  variant={empresa.activo !== false ? "success" : "error"}
                  label={empresa.activo !== false ? "Operativa / Activa" : "Inactiva"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal de Edición de Empresa ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !updateMutation.isPending && setModalOpen(false)}
        title="Editar Datos de la Empresa"
        size="lg"
        footer={
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => setModalOpen(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSubmit(onSubmit)}
              disabled={updateMutation.isPending}
              id="btn-guardar-empresa-modal"
            >
              <FiCheck />
              {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Razón Social *</label>
            <input
              className={styles.formInput}
              {...register("razon_social", { required: "La razón social es obligatoria" })}
              placeholder="Ej: Mi Negocio SAC"
            />
            {errors.razon_social && (
              <span className={styles.formError}>{errors.razon_social.message}</span>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre Comercial</label>
              <input
                className={styles.formInput}
                {...register("nombre_comercial")}
                placeholder="Ej: Mi Negocio"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>RUC (11 dígitos)</label>
              <input
                className={styles.formInput}
                {...register("ruc", {
                  pattern: {
                    value: /^[0-9]{11}$/,
                    message: "El RUC debe tener exactamente 11 dígitos numéricos",
                  },
                })}
                placeholder="20123456789"
                maxLength={11}
              />
              {errors.ruc && <span className={styles.formError}>{errors.ruc.message}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Dirección Fiscal</label>
            <input
              className={styles.formInput}
              {...register("direccion")}
              placeholder="Av. Principal 123, Lima"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Teléfono / WhatsApp</label>
              <input
                className={styles.formInput}
                {...register("telefono")}
                placeholder="+51 987 654 321"
              />
            </div>
            <div className={styles.formGroup}>
              <div className={styles.labelWithBadge}>
                <label className={styles.formLabel} htmlFor="empresa-email-input">
                  Correo Electrónico (Gmail)
                </label>
                <span className={styles.lockedBadge} title="Este campo no se puede editar">
                  <FiLock className={styles.lockedBadgeIcon} /> Bloqueado
                </span>
              </div>
              <div className={styles.lockedInputContainer}>
                <input
                  id="empresa-email-input"
                  type="email"
                  className={`${styles.formInput} ${styles.inputLocked}`}
                  {...register("email")}
                  readOnly
                  tabIndex={-1}
                  placeholder="correo@gmail.com"
                  title="El correo de la cuenta Google está vinculado y no se puede modificar"
                />
                <FiLock className={styles.inputLockIcon} aria-hidden="true" />
              </div>
              <span className={styles.lockedHelpText}>
                Vinculado a tu cuenta Google. Campo no editable.
              </span>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Moneda Predeterminada</label>
              <select className={styles.formInput} {...register("moneda_default")}>
                <option value="PEN">Soles (PEN S/)</option>
                <option value="USD">Dólares (USD $)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>País</label>
              <input className={styles.formInput} {...register("pais")} placeholder="PE" />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Zona Horaria</label>
              <input
                className={styles.formInput}
                {...register("timezone")}
                placeholder="America/Lima"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Código Ubigeo</label>
              <input
                className={styles.formInput}
                {...register("ubigeo")}
                placeholder="150101"
                maxLength={6}
              />
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
