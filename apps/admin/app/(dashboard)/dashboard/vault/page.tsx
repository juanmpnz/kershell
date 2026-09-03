import { getDatabase } from "@kershell/db/client";
import { listProjectOverviews } from "@kershell/db/repositories/projects";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { VaultProjects } from "@/components/dashboard/VaultProjects";
import { requireOwner } from "@/lib/auth/owner-session";

export default async function VaultPage() {
  const owner = await requireOwner();
  const projects = await listProjectOverviews(getDatabase(), owner.ownerId);

  return (
    <>
      <PageHeader
        actions={
          <>
            <button className="rounded-md border border-border px-3 py-2 text-sm text-text-dim transition hover:bg-surface" type="button">
              Importar .env
            </button>
            <Link className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink transition hover:brightness-110" href="/dashboard/vault/new">
              Nuevo proyecto
            </Link>
          </>
        }
        eyebrow="Vault · proyectos"
        sub="Bóveda de credenciales por proyecto. Las claves se mantienen ocultas por defecto — un click revela, dos clicks copian."
        title="Vault de proyectos"
      />
      <VaultProjects projects={projects} />
    </>
  );
}
