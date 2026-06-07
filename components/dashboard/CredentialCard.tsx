"use client";

import { useState } from "react";
import { Badge, type BadgeTone } from "@/components/dashboard/ui/Badge";
import { Icon } from "@/components/dashboard/ui/Icon";
import { IconButton } from "@/components/dashboard/ui/IconButton";
import type { Credential, CredentialEnv } from "@/lib/dashboard/schema";

type CredentialCardProps = {
  credential: Credential;
  onCopy: (value: string, label: string) => void;
  onDelete: () => void;
  onEdit: () => void;
};

const ENV_TONE: Record<CredentialEnv, BadgeTone> = {
  prod: "danger",
  staging: "warn",
  dev: "info",
  shared: "info",
};

export function CredentialCard({ credential, onCopy, onDelete, onEdit }: CredentialCardProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-[10px] border border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border px-5 py-[14px]">
        <div className="flex size-7 items-center justify-center rounded border border-border bg-surface-2">
          <Icon className="text-accent" name="key" size={13} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[14px] font-medium text-text">{credential.name}</span>
            <Badge dot tone={ENV_TONE[credential.env]}>
              {credential.env}
            </Badge>
            <Badge tone="neutral">{credential.type}</Badge>
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted">
            {credential.service} · actualizado {credential.updated} · por {credential.addedBy}
          </div>
        </div>

        <div className="flex gap-1">
          <IconButton label={revealed ? "Ocultar todo" : "Revelar todo"} onClick={() => setRevealed((current) => !current)}>
            <Icon name={revealed ? "eyeOff" : "eye"} size={14} />
          </IconButton>
          <IconButton label="Editar" onClick={onEdit}>
            <Icon name="edit" size={14} />
          </IconButton>
          <IconButton label="Eliminar" onClick={onDelete}>
            <Icon name="trash" size={14} />
          </IconButton>
        </div>
      </div>

      <div className="px-3 pb-3 pt-2">
        {/* TODO: reemplazar fields[].v por { masked: '••••' } y traer plain solo on reveal via server action. */}
        {credential.fields.map((field, index) => {
          const shown = !field.secret || revealed;

          return (
            <div
              className="grid items-center gap-[14px] px-2 py-2"
              key={`${field.k}-${index}`}
              style={{
                borderBottom: index < credential.fields.length - 1 ? "1px dashed var(--border)" : "none",
                gridTemplateColumns: "160px 1fr auto",
              }}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{field.k}</span>
              <span
                className="overflow-hidden truncate font-mono text-[12.5px] text-text"
                style={{ letterSpacing: shown ? 0 : "0.18em" }}
              >
                {shown ? field.v : "••••••••••••••••••••"}
              </span>
              <div className="flex gap-1">
                {field.secret ? (
                  <IconButton label={revealed ? "Ocultar" : "Revelar"} onClick={() => setRevealed((current) => !current)} size="sm">
                    <Icon name={revealed ? "eyeOff" : "eye"} size={12} />
                  </IconButton>
                ) : null}
                <IconButton label="Copiar" onClick={() => onCopy(field.v, field.k)} size="sm">
                  <Icon name="copy" size={12} />
                </IconButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
