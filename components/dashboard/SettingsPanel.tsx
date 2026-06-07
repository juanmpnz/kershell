"use client";

import { useState, type ReactNode } from "react";
import { Badge } from "@/components/dashboard/ui/Badge";
import { Input } from "@/components/dashboard/ui/Input";
import { Select } from "@/components/dashboard/ui/Select";
import { useToast } from "@/components/dashboard/ui/Toast";
import type { User } from "@/lib/dashboard/schema";

type SettingsSection =
  | "profile"
  | "workspace"
  | "team"
  | "security"
  | "billing"
  | "integrations"
  | "notifications";

type SettingsPanelProps = {
  user: User;
};

const SECTIONS: Array<{ id: SettingsSection; label: string }> = [
  { id: "profile", label: "Perfil" },
  { id: "workspace", label: "Workspace" },
  { id: "team", label: "Equipo" },
  { id: "security", label: "Seguridad" },
  { id: "billing", label: "Facturación" },
  { id: "integrations", label: "Integraciones" },
  { id: "notifications", label: "Notificaciones" },
];

export function SettingsPanel({ user }: SettingsPanelProps) {
  const [selected, setSelected] = useState<SettingsSection>("profile");
  const [twoFactor, setTwoFactor] = useState(true);
  const [reAuthReveal, setReAuthReveal] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [trialAlerts, setTrialAlerts] = useState(true);
  const [costAlerts, setCostAlerts] = useState(false);
  const { push, Toaster } = useToast();

  return (
    <div className="grid min-h-[calc(100svh-145px)] grid-cols-1 border-t border-border lg:grid-cols-[220px_1fr]">
      <aside className="border-b border-border px-4 py-4 lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {SECTIONS.map((section) => (
            <button
              className={`shrink-0 rounded-md border px-3 py-2 text-left text-[13px] font-medium transition ${
                selected === section.id
                  ? "border-border bg-surface-2 text-text"
                  : "border-transparent text-text-dim hover:bg-surface hover:text-text"
              }`}
              key={section.id}
              onClick={() => setSelected(section.id)}
              type="button"
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="grid max-w-[760px] content-start gap-6 p-8">
        {selected === "profile" ? (
          <>
            <SettingsBlock description="Datos visibles dentro de la consola interna." title="Perfil">
              <SettingsRow description="Nombre usado en auditoría, owner fields y actividad interna." label="Nombre">
                <Input defaultValue={user.name} />
              </SettingsRow>
              <SettingsRow description="Cuenta autorizada para acceder al dashboard." label="Email">
                <Input defaultValue={user.email} type="email" />
              </SettingsRow>
              <SettingsRow description="Permiso actual del usuario." label="Rol">
                <Badge tone="accent">{user.role}</Badge>
              </SettingsRow>
            </SettingsBlock>
          </>
        ) : null}

        {selected === "workspace" ? (
          <>
            <SettingsBlock description="Configuración base del workspace de Kershell TI." title="Workspace">
              <SettingsRow description="Nombre corto mostrado en sidebar y reportes." label="Nombre">
                <Input defaultValue="Kershell" />
              </SettingsRow>
              <SettingsRow description="Ambiente operativo activo para esta consola." label="Entorno">
                <Select defaultValue="prod">
                  <option value="prod">internal · prod</option>
                  <option value="staging">internal · staging</option>
                </Select>
              </SettingsRow>
              <SettingsRow description="Moneda usada para métricas de gasto." label="Moneda">
                <Select defaultValue="usd">
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                </Select>
              </SettingsRow>
            </SettingsBlock>
          </>
        ) : null}

        {selected === "team" ? (
          <SettingsBlock description="Miembros con acceso interno a esta consola." title="Equipo">
            <SettingsRow description="Owner principal del workspace." label="Jerónimo Cárdenas">
              <Badge tone="accent">Owner</Badge>
            </SettingsRow>
            <SettingsRow description="Segundo senior developer del equipo." label="Mateo">
              <Badge tone="neutral">Admin</Badge>
            </SettingsRow>
            <SettingsRow description="Invitación manual hasta integrar auth de equipo." label="Invitar miembro">
              <button className="rounded-md border border-border px-3 py-2 text-sm text-text-dim hover:bg-surface" type="button">
                Invitar
              </button>
            </SettingsRow>
          </SettingsBlock>
        ) : null}

        {selected === "security" ? (
          <>
            <SettingsBlock description="Políticas de acceso y protección del vault." title="Seguridad">
              <SettingsRow description="Exigir segundo factor después del login." label="2FA">
                <Toggle checked={twoFactor} onChange={setTwoFactor} />
              </SettingsRow>
              <SettingsRow description="Pedir re-autenticación antes de revelar secretos." label="Re-autenticación al revelar">
                <Toggle checked={reAuthReveal} onChange={setReAuthReveal} />
              </SettingsRow>
              <SettingsRow description="Tiempo máximo de sesión activa." label="Duración de sesión">
                <Select defaultValue="12">
                  <option value="4">4 horas</option>
                  <option value="12">12 horas</option>
                  <option value="24">24 horas</option>
                </Select>
              </SettingsRow>
            </SettingsBlock>
          </>
        ) : null}

        {selected === "billing" ? (
          <SettingsBlock description="Preferencias de gasto, forecast y alertas financieras." title="Facturación">
            <SettingsRow description="Umbral mensual para alertar incrementos de costo." label="Límite mensual">
              <Input className="font-mono" defaultValue="500" type="number" />
            </SettingsRow>
            <SettingsRow description="Método por defecto para nuevas suscripciones." label="Método default">
              <Input defaultValue="Visa •• 4421" />
            </SettingsRow>
            <SettingsRow description="Mostrar forecast anual en el overview." label="Forecast anual">
              <Toggle checked={costAlerts} onChange={setCostAlerts} />
            </SettingsRow>
          </SettingsBlock>
        ) : null}

        {selected === "integrations" ? (
          <SettingsBlock description="Servicios externos conectados o pendientes." title="Integraciones">
            <SettingsRow description="Sincronización futura de leads y cuentas." label="Apollo">
              <Badge tone="warn">Pendiente</Badge>
            </SettingsRow>
            <SettingsRow description="Repositorio y actividad técnica." label="GitHub">
              <Badge tone="info">Próximo</Badge>
            </SettingsRow>
            <SettingsRow description="Persistencia backend para datos reales." label="Supabase">
              <Badge tone="accent">Preparado</Badge>
            </SettingsRow>
          </SettingsBlock>
        ) : null}

        {selected === "notifications" ? (
          <SettingsBlock description="Señales operativas que la consola debe emitir." title="Notificaciones">
            <SettingsRow description="Resumen semanal de gastos, trials y proyectos." label="Digest semanal">
              <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
            </SettingsRow>
            <SettingsRow description="Avisar cuando un trial vence en menos de 7 días." label="Trials por vencer">
              <Toggle checked={trialAlerts} onChange={setTrialAlerts} />
            </SettingsRow>
            <SettingsRow description="Avisar si el gasto mensual supera el umbral." label="Alertas de costo">
              <Toggle checked={costAlerts} onChange={setCostAlerts} />
            </SettingsRow>
          </SettingsBlock>
        ) : null}

        <div className="flex justify-end gap-2">
          <button className="rounded-md border border-border px-3 py-2 text-sm text-text-dim hover:bg-surface" type="button">
            Descartar
          </button>
          <button
            className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink hover:brightness-110"
            onClick={() => push("Cambios guardados", "ok")}
            type="button"
          >
            Guardar cambios
          </button>
        </div>
      </section>

      <Toaster />
    </div>
  );
}

function SettingsBlock({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-border bg-surface">
      <header className="border-b border-border px-[22px] py-[18px]">
        <h2 className="text-[15px] font-medium text-text">{title}</h2>
        <p className="mt-1 text-[12.5px] text-muted">{description}</p>
      </header>
      <div className="grid gap-4 p-[22px]">{children}</div>
    </section>
  );
}

function SettingsRow({
  children,
  description,
  label,
}: {
  children: ReactNode;
  description: string;
  label: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-border/60 pb-4 last:border-b-0 last:pb-0 md:flex-row md:items-center">
      <div className="max-w-[440px]">
        <p className="text-sm font-medium text-text">{label}</p>
        <p className="mt-1 text-[12.5px] leading-5 text-text-dim">{description}</p>
      </div>
      <div className="w-full md:w-[240px] md:shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      aria-pressed={checked}
      className={`relative h-6 w-11 rounded-full border transition ${
        checked ? "border-accent bg-accent" : "border-border bg-[var(--ink-2)]"
      }`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span
        className={`absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-ink transition ${
          checked ? "left-[22px]" : "left-1"
        }`}
      />
    </button>
  );
}
