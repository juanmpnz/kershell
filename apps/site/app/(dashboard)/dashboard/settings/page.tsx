import { PageHeader } from "@/components/dashboard/PageHeader";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { getUser } from "@/lib/dashboard/store";

export default function SettingsPage() {
  const user = getUser();

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        sub="Preferencias del workspace, seguridad, integraciones y notificaciones internas."
        title="Configuración"
      />
      <SettingsPanel user={user} />
    </>
  );
}
