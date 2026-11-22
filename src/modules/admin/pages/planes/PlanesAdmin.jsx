import { useAuth } from "../../../auth/hooks/useAuth";
import PlanesComponent from "../../../../components/planes/PlanesComponent";

export default function PlanesAdmin() {
  const { suscripcion, empresa } = useAuth();

  return (
    <PlanesComponent
      isAuthenticated={true}
      suscripcion={suscripcion}
      empresaId={empresa?.id || null}
      isPlanesAdmin={true}
    />
  );
}
