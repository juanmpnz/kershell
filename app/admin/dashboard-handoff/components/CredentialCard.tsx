// dashboard-handoff/components/CredentialCard.tsx
// Tarjeta de credencial con reveal/copy. Spec §3.5.
//
// IMPORTANTE — backend integration:
// Cuando exista el backend, `cred.fields[].v` con secret:true NO debe llegar
// pre-cargado al client. Reemplazar por { masked: '••••', id: '<fieldId>' }
// y resolver el valor real con una server action al hacer reveal/copy.

'use client';

import { useState } from 'react';
import type { Credential } from '@/lib/dashboard/schema';
import { Badge } from './Badge';
import { Icon } from './Icon';
import { IconButton } from '@/components/dashboard/ui/IconButton';

type Props = {
  cred: Credential;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: (value: string, label: string) => void;
};

const ENV_TONE = {
  prod:    'danger',
  staging: 'warn',
  dev:     'info',
  shared:  'info',
} as const;

export function CredentialCard({ cred, onEdit, onDelete, onCopy }: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-[10px] border border-border bg-surface">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-[14px]">
        <div className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-border bg-surface-2">
          <Icon name="key" size={13} className="text-accent" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-[10px]">
            <span className="text-[14px] font-medium text-text">{cred.name}</span>
            <Badge tone={ENV_TONE[cred.env]} dot>{cred.env}</Badge>
            <Badge tone="neutral">{cred.type}</Badge>
          </div>
          <div className="mt-[3px] font-mono text-[11px] text-muted">
            {cred.service} · actualizado {cred.updated} · por {cred.addedBy}
          </div>
        </div>

        <div className="flex gap-1">
          <IconButton
            icon={revealed ? 'eyeOff' : 'eye'}
            onClick={() => setRevealed((r) => !r)}
            title={revealed ? 'Ocultar todo' : 'Revelar todo'}
          />
          <IconButton icon="edit" onClick={onEdit} title="Editar" />
          <IconButton icon="trash" onClick={onDelete} title="Eliminar" />
        </div>
      </div>

      {/* Fields */}
      <div className="px-3 pb-3 pt-2">
        {cred.fields.map((f, i) => {
          const isShown = !f.secret || revealed;
          return (
            <div
              key={i}
              className="grid items-center gap-[14px]"
              style={{
                gridTemplateColumns: '140px 1fr auto',
                padding: '8px',
                borderBottom: i < cred.fields.length - 1 ? '1px dashed var(--border)' : 'none',
              }}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{f.k}</span>
              <span
                className="overflow-hidden truncate font-mono text-[12.5px] text-text"
                style={{ letterSpacing: isShown ? 'normal' : '0.18em' }}
              >
                {isShown ? f.v : '••••••••••••••••••••'}
              </span>
              <div className="flex gap-1 opacity-90">
                {f.secret && (
                  <IconButton
                    icon={revealed ? 'eyeOff' : 'eye'}
                    size={26}
                    onClick={() => setRevealed((r) => !r)}
                    title={revealed ? 'Ocultar' : 'Revelar'}
                  />
                )}
                <IconButton
                  icon="copy"
                  size={26}
                  onClick={() => onCopy(f.v, f.k)}
                  title="Copiar"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
