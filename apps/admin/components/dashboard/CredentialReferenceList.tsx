import type { CredentialReferenceDto } from "@kershell/db/repositories/credential-references";
import Link from "next/link";

import { Badge } from "@/components/dashboard/ui/Badge";

export function CredentialReferenceList({
  projectId,
  references,
}: {
  projectId: string;
  references: CredentialReferenceDto[];
}) {
  return (
    <div className="grid gap-4 p-8">
      <div className="rounded-md border border-warn/30 bg-warn/10 p-4 text-sm text-warn">
        Este vault almacena referencias, nunca valores secretos. Abrí el elemento
        directamente en tu gestor externo.
      </div>

      {references.map((reference) => (
        <Link
          className="rounded-[10px] border border-border bg-surface p-5 transition hover:bg-surface-2"
          href={`/dashboard/vault/${projectId}/credentials/${reference.id}/edit`}
          key={reference.id}
        >
          <div className="flex items-center justify-between gap-3">
            <strong className="text-text">{reference.name}</strong>
            <div className="flex gap-2">
              <Badge tone="neutral">{reference.environment}</Badge>
              <Badge tone="neutral">{reference.credentialType}</Badge>
            </div>
          </div>
          <p className="mt-2 text-sm text-text-dim">
            {reference.service} · {reference.secretProvider}
          </p>
          <p className="mt-3 font-mono text-xs text-muted">
            ID externo: {reference.externalItemId}
          </p>
        </Link>
      ))}

      {!references.length ? (
        <p className="rounded-[10px] border border-border bg-surface p-10 text-center text-sm text-text-dim">
          No hay referencias para este proyecto.
        </p>
      ) : null}
    </div>
  );
}
