"use client";

import {
  Copy,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  Search,
  Trash2,
  Unlock,
  WalletCards,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type SubscriptionStatus = "activa" | "trial" | "cancelada";
type BillingCycle = "mensual" | "anual" | "unico";
type SubscriptionCategory = "hosting" | "herramientas" | "dominios" | "email" | "otros";
type ProjectStatus = "activo" | "completado" | "pausado";
type CredentialCategory = "deploy" | "base de datos" | "api keys" | "storage" | "email" | "otros";

type Subscription = {
  id: string;
  service: string;
  amount: number;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  category: SubscriptionCategory;
  nextDate: string;
  notes: string;
};

type EncryptedValue = {
  iv: string;
  data: string;
};

type CredentialField = {
  id: string;
  key: string;
  value: EncryptedValue;
};

type Credential = {
  id: string;
  name: string;
  category: CredentialCategory;
  fields: CredentialField[];
  updatedAt: string;
};

type Project = {
  id: string;
  name: string;
  client: string;
  description: string;
  productionUrl: string;
  stagingUrl: string;
  repositoryUrl: string;
  status: ProjectStatus;
  notes: string;
  credentials: Credential[];
};

type PlainField = {
  id: string;
  key: string;
  value: string;
};

type AdminState = {
  subscriptions: Subscription[];
  projects: Project[];
  vaultSalt: string | null;
  vaultCheck: EncryptedValue | null;
};

const SUBSCRIPTIONS_KEY = "kershell-admin-subscriptions";
const PROJECTS_KEY = "kershell-admin-projects";
const LOCAL_STATE_KEY = "kershell-admin-state";

const subscriptionStatuses: SubscriptionStatus[] = ["activa", "trial", "cancelada"];
const subscriptionCategories: SubscriptionCategory[] = ["hosting", "herramientas", "dominios", "email", "otros"];
const billingCycles: BillingCycle[] = ["mensual", "anual", "unico"];
const projectStatuses: ProjectStatus[] = ["activo", "completado", "pausado"];
const credentialCategories: CredentialCategory[] = ["deploy", "base de datos", "api keys", "storage", "email", "otros"];

const emptySubscription = (): Subscription => ({
  id: "",
  service: "",
  amount: 0,
  cycle: "mensual",
  status: "activa",
  category: "herramientas",
  nextDate: "",
  notes: "",
});

const emptyProject = (): Project => ({
  id: "",
  name: "",
  client: "",
  description: "",
  productionUrl: "",
  stagingUrl: "",
  repositoryUrl: "",
  status: "activo",
  notes: "",
  credentials: [],
});

const emptyCredential = () => ({
  id: "",
  name: "",
  category: "api keys" as CredentialCategory,
  fields: [
    {
      id: crypto.randomUUID(),
      key: "",
      value: "",
    },
  ] as PlainField[],
});

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function toBufferSource(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy as Uint8Array<ArrayBuffer>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function monthlyEquivalent(subscription: Subscription) {
  if (subscription.status === "cancelada" || subscription.cycle === "unico") {
    return 0;
  }

  return subscription.cycle === "anual" ? subscription.amount / 12 : subscription.amount;
}

function daysUntil(date: string) {
  if (!date) {
    return null;
  }

  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function isTrialEndingSoon(subscription: Subscription) {
  const days = daysUntil(subscription.nextDate);
  return subscription.status === "trial" && days !== null && days >= 0 && days < 7;
}

function createVaultSalt() {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    base64: bytesToBase64(salt),
    bytes: salt,
  };
}

async function deriveVaultKey(passphrase: string, salt: Uint8Array) {
  const sourceKey = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toBufferSource(salt),
      iterations: 150_000,
      hash: "SHA-256",
    },
    sourceKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptSecret(value: string, key: CryptoKey): Promise<EncryptedValue> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(value));

  return {
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  };
}

async function decryptSecret(value: EncryptedValue, key: CryptoKey) {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(value.iv) },
    key,
    base64ToBytes(value.data),
  );

  return decoder.decode(decrypted);
}

function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "accent" | "warning" }) {
  const toneClass =
    tone === "accent"
      ? "border-accent/40 bg-accent-soft text-accent"
      : tone === "warning"
        ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
        : "border-border bg-surface-2 text-text-dim";

  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${toneClass}`}>{children}</span>;
}

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<"suscripciones" | "vault">("suscripciones");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageMode, setStorageMode] = useState<"server" | "local">("local");
  const [subscriptionDraft, setSubscriptionDraft] = useState<Subscription | null>(null);
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "todas">("todas");
  const [categoryFilter, setCategoryFilter] = useState<SubscriptionCategory | "todas">("todas");
  const [projectDraft, setProjectDraft] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [vaultPassphrase, setVaultPassphrase] = useState("");
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [vaultSalt, setVaultSalt] = useState<string | null>(null);
  const [vaultCheck, setVaultCheck] = useState<EncryptedValue | null>(null);
  const [vaultError, setVaultError] = useState("");
  const [credentialDraft, setCredentialDraft] = useState<ReturnType<typeof emptyCredential> | null>(null);
  const [visibleSecretId, setVisibleSecretId] = useState<string | null>(null);
  const [decryptedValues, setDecryptedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      try {
        const response = await fetch("/api/admin/state", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Server state unavailable.");
        }

        const state = (await response.json()) as AdminState;

        if (cancelled) {
          return;
        }

        setStorageMode("server");
        setSubscriptions(state.subscriptions ?? []);
        setProjects(state.projects ?? []);
        setVaultSalt(state.vaultSalt ?? null);
        setVaultCheck(state.vaultCheck ?? null);
        setSelectedProjectId(state.projects?.[0]?.id ?? "");
      } catch {
        const fallbackState = JSON.parse(localStorage.getItem(LOCAL_STATE_KEY) ?? "{}") as Partial<AdminState>;
        const fallbackSubscriptions =
          fallbackState.subscriptions ?? (JSON.parse(localStorage.getItem(SUBSCRIPTIONS_KEY) ?? "[]") as Subscription[]);
        const fallbackProjects = fallbackState.projects ?? (JSON.parse(localStorage.getItem(PROJECTS_KEY) ?? "[]") as Project[]);

        if (cancelled) {
          return;
        }

        setStorageMode("local");
        setSubscriptions(fallbackSubscriptions);
        setProjects(fallbackProjects);
        setVaultSalt(fallbackState.vaultSalt ?? null);
        setVaultCheck(fallbackState.vaultCheck ?? null);
        setSelectedProjectId(fallbackProjects[0]?.id ?? "");
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    void loadState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    const state: AdminState = {
      subscriptions,
      projects,
      vaultSalt,
      vaultCheck,
    };

    if (storageMode === "server") {
      void fetch("/api/admin/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      return;
    }

    localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
  }, [loaded, projects, storageMode, subscriptions, vaultCheck, vaultSalt]);

  const summary = useMemo(() => {
    const monthlyTotal = subscriptions.reduce((total, subscription) => total + monthlyEquivalent(subscription), 0);
    const activeCount = subscriptions.filter((subscription) => subscription.status === "activa").length;
    const trialCount = subscriptions.filter((subscription) => subscription.status === "trial").length;

    return {
      monthlyTotal,
      annualTotal: monthlyTotal * 12,
      activeCount,
      trialCount,
      activeProjects: projects.filter((project) => project.status === "activo").length,
    };
  }, [projects, subscriptions]);

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const statusMatches = statusFilter === "todas" || subscription.status === statusFilter;
    const categoryMatches = categoryFilter === "todas" || subscription.category === categoryFilter;
    return statusMatches && categoryMatches;
  });

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }

  function saveSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subscriptionDraft) {
      return;
    }

    const nextSubscription = {
      ...subscriptionDraft,
      id: subscriptionDraft.id || crypto.randomUUID(),
      amount: Number(subscriptionDraft.amount),
    };

    setSubscriptions((current) => {
      const exists = current.some((subscription) => subscription.id === nextSubscription.id);
      return exists
        ? current.map((subscription) => (subscription.id === nextSubscription.id ? nextSubscription : subscription))
        : [nextSubscription, ...current];
    });
    setSubscriptionDraft(null);
  }

  function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!projectDraft) {
      return;
    }

    const nextProject = {
      ...projectDraft,
      id: projectDraft.id || crypto.randomUUID(),
    };

    setProjects((current) => {
      const exists = current.some((project) => project.id === nextProject.id);
      return exists ? current.map((project) => (project.id === nextProject.id ? nextProject : project)) : [nextProject, ...current];
    });
    setSelectedProjectId(nextProject.id);
    setProjectDraft(null);
  }

  async function unlockVault(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVaultError("");

    try {
      let nextVaultSalt = vaultSalt;
      let saltBytes: Uint8Array;

      if (nextVaultSalt) {
        saltBytes = base64ToBytes(nextVaultSalt);
      } else {
        const createdSalt = createVaultSalt();
        nextVaultSalt = createdSalt.base64;
        saltBytes = createdSalt.bytes;
      }

      const key = await deriveVaultKey(vaultPassphrase, saltBytes);

      if (vaultCheck) {
        await decryptSecret(vaultCheck, key);
      } else {
        const encryptedCheck = await encryptSecret("kershell-vault", key);
        setVaultCheck(encryptedCheck);
      }

      setVaultSalt(nextVaultSalt);
      setVaultKey(key);
      setVaultPassphrase("");
    } catch {
      setVaultError("La clave del vault no coincide.");
    }
  }

  async function decryptField(field: CredentialField) {
    if (!vaultKey) {
      return;
    }

    const cacheKey = field.id;

    if (decryptedValues[cacheKey]) {
      setVisibleSecretId(visibleSecretId === cacheKey ? null : cacheKey);
      return;
    }

    const plainValue = await decryptSecret(field.value, vaultKey);
    setDecryptedValues((current) => ({ ...current, [cacheKey]: plainValue }));
    setVisibleSecretId(cacheKey);
  }

  async function copyField(field: CredentialField) {
    if (!vaultKey) {
      return;
    }

    const plainValue = decryptedValues[field.id] ?? (await decryptSecret(field.value, vaultKey));
    await navigator.clipboard.writeText(plainValue);
    setDecryptedValues((current) => ({ ...current, [field.id]: plainValue }));
  }

  async function editCredential(credential: Credential) {
    if (!vaultKey) {
      return;
    }

    const fields = await Promise.all(
      credential.fields.map(async (field) => ({
        id: field.id,
        key: field.key,
        value: await decryptSecret(field.value, vaultKey),
      })),
    );

    setCredentialDraft({
      id: credential.id,
      name: credential.name,
      category: credential.category,
      fields,
    });
  }

  async function saveCredential(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProject || !credentialDraft || !vaultKey) {
      return;
    }

    const encryptedFields = await Promise.all(
      credentialDraft.fields
        .filter((field) => field.key.trim())
        .map(async (field) => ({
          id: field.id,
          key: field.key.trim(),
          value: await encryptSecret(field.value, vaultKey),
        })),
    );

    const nextCredential: Credential = {
      id: credentialDraft.id || crypto.randomUUID(),
      name: credentialDraft.name,
      category: credentialDraft.category,
      fields: encryptedFields,
      updatedAt: new Date().toISOString(),
    };

    setProjects((current) =>
      current.map((project) => {
        if (project.id !== selectedProject.id) {
          return project;
        }

        const exists = project.credentials.some((credential) => credential.id === nextCredential.id);
        return {
          ...project,
          credentials: exists
            ? project.credentials.map((credential) => (credential.id === nextCredential.id ? nextCredential : credential))
            : [nextCredential, ...project.credentials],
        };
      }),
    );
    setCredentialDraft(null);
    setVisibleSecretId(null);
    setDecryptedValues({});
  }

  return (
    <main className="min-h-svh bg-ink text-text">
      <div className="flex min-h-svh flex-col lg:flex-row">
        <aside className="border-b border-border bg-surface/80 px-4 py-4 lg:fixed lg:inset-y-0 lg:w-72 lg:border-b-0 lg:border-r lg:px-5">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-accent">Kershell TI</p>
              <h1 className="mt-1 text-lg font-semibold">Admin interno</h1>
            </div>
            <button
              className="rounded-md border border-border p-2 text-text-dim transition hover:bg-surface-2 hover:text-text"
              type="button"
              onClick={logout}
              title="Cerrar sesión"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
          <nav className="grid gap-2">
            <button
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition ${
                activeSection === "suscripciones" ? "bg-accent text-accent-ink" : "text-text-dim hover:bg-surface-2 hover:text-text"
              }`}
              type="button"
              onClick={() => setActiveSection("suscripciones")}
            >
              <WalletCards className="size-4" aria-hidden="true" />
              Suscripciones
            </button>
            <button
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition ${
                activeSection === "vault" ? "bg-accent text-accent-ink" : "text-text-dim hover:bg-surface-2 hover:text-text"
              }`}
              type="button"
              onClick={() => setActiveSection("vault")}
            >
              <KeyRound className="size-4" aria-hidden="true" />
              Vault de proyectos
            </button>
          </nav>
          <div className="mt-6 rounded-md border border-border bg-ink p-3 text-xs text-text-dim">
            Persistencia: <span className="font-medium text-text">{storageMode === "server" ? "servidor" : "local"}</span>
          </div>
        </aside>

        <section className="flex-1 px-4 py-6 lg:ml-72 lg:px-8">
          <header className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 xl:flex-row xl:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm text-text-dim">
                <LayoutDashboard className="size-4 text-accent" aria-hidden="true" />
                Operativa interna
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Panel administrativo</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={<CreditCard className="size-4" />} label="Gasto mensual" value={formatCurrency(summary.monthlyTotal)} />
              <Metric icon={<WalletCards className="size-4" />} label="Anual estimado" value={formatCurrency(summary.annualTotal)} />
              <Metric icon={<Search className="size-4" />} label="Activas / trials" value={`${summary.activeCount} / ${summary.trialCount}`} />
              <Metric icon={<FolderKanban className="size-4" />} label="Proyectos activos" value={String(summary.activeProjects)} />
            </div>
          </header>

          {activeSection === "suscripciones" ? (
            <SubscriptionsSection
              categoryFilter={categoryFilter}
              filteredSubscriptions={filteredSubscriptions}
              setCategoryFilter={setCategoryFilter}
              setStatusFilter={setStatusFilter}
              setSubscriptionDraft={setSubscriptionDraft}
              statusFilter={statusFilter}
              subscriptionDraft={subscriptionDraft}
              subscriptions={subscriptions}
              saveSubscription={saveSubscription}
              setSubscriptions={setSubscriptions}
            />
          ) : (
            <VaultSection
              credentialDraft={credentialDraft}
              copyField={copyField}
              decryptedValues={decryptedValues}
              editCredential={editCredential}
              projectDraft={projectDraft}
              projects={projects}
              saveCredential={saveCredential}
              saveProject={saveProject}
              selectedProject={selectedProject}
              selectedProjectId={selectedProjectId}
              setCredentialDraft={setCredentialDraft}
              setProjectDraft={setProjectDraft}
              setProjects={setProjects}
              setSelectedProjectId={setSelectedProjectId}
              setVaultPassphrase={setVaultPassphrase}
              unlockVault={unlockVault}
              vaultError={vaultError}
              vaultKey={vaultKey}
              vaultPassphrase={vaultPassphrase}
              visibleSecretId={visibleSecretId}
              decryptField={decryptField}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-[150px] rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2 text-text-dim">
        {icon}
        <span className="text-xs uppercase">{label}</span>
      </div>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function SubscriptionsSection({
  categoryFilter,
  filteredSubscriptions,
  setCategoryFilter,
  setStatusFilter,
  setSubscriptionDraft,
  statusFilter,
  subscriptionDraft,
  subscriptions,
  saveSubscription,
  setSubscriptions,
}: {
  categoryFilter: SubscriptionCategory | "todas";
  filteredSubscriptions: Subscription[];
  setCategoryFilter: (value: SubscriptionCategory | "todas") => void;
  setStatusFilter: (value: SubscriptionStatus | "todas") => void;
  setSubscriptionDraft: (value: Subscription | null) => void;
  statusFilter: SubscriptionStatus | "todas";
  subscriptionDraft: Subscription | null;
  subscriptions: Subscription[];
  saveSubscription: (event: FormEvent<HTMLFormElement>) => void;
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-border bg-surface p-4 md:flex-row md:items-center">
        <div>
          <h3 className="text-lg font-semibold">Control de suscripciones y gastos</h3>
          <p className="mt-1 text-sm text-text-dim">{subscriptions.length} servicios registrados</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-md border border-border bg-ink px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as SubscriptionStatus | "todas")}
          >
            <option value="todas">Todos los estados</option>
            {subscriptionStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-border bg-ink px-3 py-2 text-sm"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as SubscriptionCategory | "todas")}
          >
            <option value="todas">Todas las categorías</option>
            {subscriptionCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink"
            type="button"
            onClick={() => setSubscriptionDraft(emptySubscription())}
          >
            <Plus className="size-4" aria-hidden="true" />
            Agregar
          </button>
        </div>
      </div>

      {subscriptionDraft ? (
        <SubscriptionForm
          draft={subscriptionDraft}
          saveSubscription={saveSubscription}
          setDraft={setSubscriptionDraft}
        />
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid min-w-[900px] grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.9fr_0.8fr] bg-surface-2 px-4 py-3 text-xs uppercase text-muted">
          <span>Servicio</span>
          <span>Categoría</span>
          <span>Estado</span>
          <span>Costo</span>
          <span>Próximo evento</span>
          <span>Acciones</span>
        </div>
        <div className="overflow-x-auto">
          {filteredSubscriptions.length ? (
            filteredSubscriptions.map((subscription) => {
              const trialWarning = isTrialEndingSoon(subscription);
              return (
                <div
                  className="grid min-w-[900px] grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.9fr_0.8fr] items-center border-t border-border bg-surface px-4 py-4 text-sm"
                  key={subscription.id}
                >
                  <div>
                    <p className="font-medium">{subscription.service}</p>
                    {subscription.notes ? <p className="mt-1 text-xs text-text-dim">{subscription.notes}</p> : null}
                  </div>
                  <span className="text-text-dim">{subscription.category}</span>
                  <Pill tone={subscription.status === "trial" ? "warning" : subscription.status === "activa" ? "accent" : "default"}>
                    {subscription.status}
                  </Pill>
                  <span>
                    {formatCurrency(subscription.amount)} <span className="text-text-dim">/{subscription.cycle}</span>
                  </span>
                  <span className={trialWarning ? "font-medium text-amber-200" : "text-text-dim"}>
                    {subscription.nextDate || "Sin fecha"}
                    {trialWarning ? ` · ${daysUntil(subscription.nextDate)} días` : ""}
                  </span>
                  <div className="flex gap-2">
                    <IconButton label="Editar" onClick={() => setSubscriptionDraft(subscription)} icon={<Pencil className="size-4" />} />
                    <IconButton
                      label="Eliminar"
                      onClick={() => setSubscriptions((current) => current.filter((item) => item.id !== subscription.id))}
                      icon={<Trash2 className="size-4" />}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-surface px-4 py-12 text-center text-sm text-text-dim">No hay suscripciones para este filtro.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubscriptionForm({
  draft,
  saveSubscription,
  setDraft,
}: {
  draft: Subscription;
  saveSubscription: (event: FormEvent<HTMLFormElement>) => void;
  setDraft: (value: Subscription | null) => void;
}) {
  return (
    <form className="grid gap-4 rounded-lg border border-border bg-surface p-4" onSubmit={saveSubscription}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{draft.id ? "Editar suscripción" : "Nueva suscripción"}</h4>
        <button type="button" onClick={() => setDraft(null)} className="rounded-md p-2 text-text-dim hover:bg-surface-2">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Servicio" value={draft.service} onChange={(value) => setDraft({ ...draft, service: value })} required />
        <Field label="Costo" type="number" value={String(draft.amount)} onChange={(value) => setDraft({ ...draft, amount: Number(value) })} required />
        <SelectField label="Frecuencia" value={draft.cycle} values={billingCycles} onChange={(value) => setDraft({ ...draft, cycle: value as BillingCycle })} />
        <SelectField label="Estado" value={draft.status} values={subscriptionStatuses} onChange={(value) => setDraft({ ...draft, status: value as SubscriptionStatus })} />
        <SelectField label="Categoría" value={draft.category} values={subscriptionCategories} onChange={(value) => setDraft({ ...draft, category: value as SubscriptionCategory })} />
        <Field label="Trial / próximo cobro" type="date" value={draft.nextDate} onChange={(value) => setDraft({ ...draft, nextDate: value })} />
      </div>
      <label className="text-sm text-text-dim">
        Notas
        <textarea
          className="mt-2 min-h-20 w-full rounded-md border border-border bg-ink px-3 py-2 text-sm text-text"
          value={draft.notes}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
        />
      </label>
      <button className="w-fit rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink" type="submit">
        Guardar suscripción
      </button>
    </form>
  );
}

function VaultSection({
  credentialDraft,
  copyField,
  decryptedValues,
  decryptField,
  editCredential,
  projectDraft,
  projects,
  saveCredential,
  saveProject,
  selectedProject,
  selectedProjectId,
  setCredentialDraft,
  setProjectDraft,
  setProjects,
  setSelectedProjectId,
  setVaultPassphrase,
  unlockVault,
  vaultError,
  vaultKey,
  vaultPassphrase,
  visibleSecretId,
}: {
  credentialDraft: ReturnType<typeof emptyCredential> | null;
  copyField: (field: CredentialField) => Promise<void>;
  decryptedValues: Record<string, string>;
  decryptField: (field: CredentialField) => Promise<void>;
  editCredential: (credential: Credential) => Promise<void>;
  projectDraft: Project | null;
  projects: Project[];
  saveCredential: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  saveProject: (event: FormEvent<HTMLFormElement>) => void;
  selectedProject: Project | null;
  selectedProjectId: string;
  setCredentialDraft: (value: ReturnType<typeof emptyCredential> | null) => void;
  setProjectDraft: (value: Project | null) => void;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setSelectedProjectId: (value: string) => void;
  setVaultPassphrase: (value: string) => void;
  unlockVault: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  vaultError: string;
  vaultKey: CryptoKey | null;
  vaultPassphrase: string;
  visibleSecretId: string | null;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <div className="grid content-start gap-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Proyectos</h3>
              <p className="mt-1 text-sm text-text-dim">{projects.length} registrados</p>
            </div>
            <button className="rounded-md bg-accent p-2 text-accent-ink" type="button" onClick={() => setProjectDraft(emptyProject())}>
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="grid gap-2">
            {projects.map((project) => (
              <button
                className={`rounded-md border px-3 py-3 text-left transition ${
                  selectedProjectId === project.id ? "border-accent bg-accent-soft" : "border-border bg-ink hover:bg-surface-2"
                }`}
                key={project.id}
                type="button"
                onClick={() => setSelectedProjectId(project.id)}
              >
                <span className="block font-medium">{project.name}</span>
                <span className="mt-1 block text-xs text-text-dim">{project.client || "Sin cliente"}</span>
              </button>
            ))}
            {!projects.length ? <p className="rounded-md border border-border bg-ink p-4 text-sm text-text-dim">Aún no hay proyectos.</p> : null}
          </div>
        </div>

        {!vaultKey ? (
          <form className="rounded-lg border border-border bg-surface p-4" onSubmit={unlockVault}>
            <div className="mb-4 flex items-center gap-2">
              <Unlock className="size-4 text-accent" aria-hidden="true" />
              <h3 className="font-semibold">Desbloquear vault</h3>
            </div>
            <input
              className="w-full rounded-md border border-border bg-ink px-3 py-3 text-sm"
              type="password"
              placeholder="Clave privada del vault"
              value={vaultPassphrase}
              onChange={(event) => setVaultPassphrase(event.target.value)}
              required
            />
            {vaultError ? <p className="mt-3 text-sm text-red-200">{vaultError}</p> : null}
            <button className="mt-3 w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink" type="submit">
              Desbloquear
            </button>
          </form>
        ) : (
          <div className="rounded-lg border border-accent/35 bg-accent-soft p-4 text-sm text-accent">Vault desbloqueado en esta sesión.</div>
        )}
      </div>

      <div className="grid content-start gap-4">
        {projectDraft ? <ProjectForm draft={projectDraft} saveProject={saveProject} setDraft={setProjectDraft} /> : null}

        {selectedProject ? (
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-start">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-semibold">{selectedProject.name}</h3>
                  <Pill tone={selectedProject.status === "activo" ? "accent" : "default"}>{selectedProject.status}</Pill>
                </div>
                <p className="text-sm text-text-dim">{selectedProject.description || "Sin descripción"}</p>
              </div>
              <div className="flex gap-2">
                <IconButton label="Editar proyecto" onClick={() => setProjectDraft(selectedProject)} icon={<Pencil className="size-4" />} />
                <IconButton
                  label="Eliminar proyecto"
                  onClick={() => setProjects((current) => current.filter((project) => project.id !== selectedProject.id))}
                  icon={<Trash2 className="size-4" />}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <InfoLink label="Producción" value={selectedProject.productionUrl} />
              <InfoLink label="Staging" value={selectedProject.stagingUrl} />
              <InfoLink label="Repositorio" value={selectedProject.repositoryUrl} />
            </div>

            <div className="mt-5 rounded-md border border-border bg-ink p-4">
              <p className="mb-2 text-sm font-medium">Notas</p>
              <p className="whitespace-pre-wrap text-sm text-text-dim">{selectedProject.notes || "Sin notas generales."}</p>
            </div>

            <div className="mt-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h4 className="text-lg font-semibold">Credenciales</h4>
                <p className="mt-1 text-sm text-text-dim">{selectedProject.credentials.length} grupos guardados</p>
              </div>
              <button
                className="inline-flex w-fit items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={!vaultKey}
                onClick={() => setCredentialDraft(emptyCredential())}
              >
                <Plus className="size-4" aria-hidden="true" />
                Agregar credencial
              </button>
            </div>

            {credentialDraft ? (
              <CredentialForm draft={credentialDraft} saveCredential={saveCredential} setDraft={setCredentialDraft} />
            ) : null}

            <div className="mt-4 grid gap-3">
              {selectedProject.credentials.map((credential) => (
                <div className="rounded-lg border border-border bg-ink p-4" key={credential.id}>
                  <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-semibold">{credential.name}</h5>
                        <Pill>{credential.category}</Pill>
                      </div>
                      <p className="mt-1 text-xs text-muted">Actualizado {new Date(credential.updatedAt).toLocaleDateString("es-ES")}</p>
                    </div>
                    <div className="flex gap-2">
                      <IconButton label="Editar credencial" onClick={() => editCredential(credential)} icon={<Pencil className="size-4" />} />
                      <IconButton
                        label="Eliminar credencial"
                        onClick={() =>
                          setProjects((current) =>
                            current.map((project) =>
                              project.id === selectedProject.id
                                ? { ...project, credentials: project.credentials.filter((item) => item.id !== credential.id) }
                                : project,
                            ),
                          )
                        }
                        icon={<Trash2 className="size-4" />}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {credential.fields.map((field) => {
                      const isVisible = visibleSecretId === field.id;
                      return (
                        <div className="grid gap-2 rounded-md border border-border bg-surface px-3 py-3 md:grid-cols-[180px_1fr_auto]" key={field.id}>
                          <span className="text-sm text-text-dim">{field.key}</span>
                          <code className="overflow-hidden text-ellipsis whitespace-nowrap rounded bg-ink px-2 py-1 font-mono text-sm">
                            {isVisible ? decryptedValues[field.id] : "••••••••••••••••"}
                          </code>
                          <div className="flex gap-2">
                            <IconButton
                              label={isVisible ? "Ocultar" : "Mostrar"}
                              onClick={() => decryptField(field)}
                              disabled={!vaultKey}
                              icon={isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            />
                            <IconButton label="Copiar" onClick={() => copyField(field)} disabled={!vaultKey} icon={<Copy className="size-4" />} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!selectedProject.credentials.length ? (
                <div className="rounded-lg border border-border bg-ink p-8 text-center text-sm text-text-dim">
                  <Database className="mx-auto mb-3 size-6 text-muted" aria-hidden="true" />
                  No hay credenciales guardadas para este proyecto.
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-10 text-center text-text-dim">Crea un proyecto para comenzar el vault.</div>
        )}
      </div>
    </div>
  );
}

function ProjectForm({
  draft,
  saveProject,
  setDraft,
}: {
  draft: Project;
  saveProject: (event: FormEvent<HTMLFormElement>) => void;
  setDraft: (value: Project | null) => void;
}) {
  return (
    <form className="grid gap-4 rounded-lg border border-border bg-surface p-4" onSubmit={saveProject}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{draft.id ? "Editar proyecto" : "Nuevo proyecto"}</h4>
        <button type="button" onClick={() => setDraft(null)} className="rounded-md p-2 text-text-dim hover:bg-surface-2">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nombre" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} required />
        <Field label="Cliente" value={draft.client} onChange={(value) => setDraft({ ...draft, client: value })} />
        <SelectField label="Estado" value={draft.status} values={projectStatuses} onChange={(value) => setDraft({ ...draft, status: value as ProjectStatus })} />
        <Field label="URL producción" value={draft.productionUrl} onChange={(value) => setDraft({ ...draft, productionUrl: value })} />
        <Field label="URL staging" value={draft.stagingUrl} onChange={(value) => setDraft({ ...draft, stagingUrl: value })} />
        <Field label="Repositorio" value={draft.repositoryUrl} onChange={(value) => setDraft({ ...draft, repositoryUrl: value })} />
      </div>
      <Field label="Descripción" value={draft.description} onChange={(value) => setDraft({ ...draft, description: value })} />
      <label className="text-sm text-text-dim">
        Notas
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-border bg-ink px-3 py-2 text-sm text-text"
          value={draft.notes}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
        />
      </label>
      <button className="w-fit rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink" type="submit">
        Guardar proyecto
      </button>
    </form>
  );
}

function CredentialForm({
  draft,
  saveCredential,
  setDraft,
}: {
  draft: ReturnType<typeof emptyCredential>;
  saveCredential: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  setDraft: (value: ReturnType<typeof emptyCredential> | null) => void;
}) {
  return (
    <form className="mt-4 grid gap-4 rounded-lg border border-border bg-surface-2 p-4" onSubmit={saveCredential}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{draft.id ? "Editar credencial" : "Nueva credencial"}</h4>
        <button type="button" onClick={() => setDraft(null)} className="rounded-md p-2 text-text-dim hover:bg-surface">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nombre" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} required />
        <SelectField
          label="Categoría"
          value={draft.category}
          values={credentialCategories}
          onChange={(value) => setDraft({ ...draft, category: value as CredentialCategory })}
        />
      </div>
      <div className="grid gap-2">
        {draft.fields.map((field, index) => (
          <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]" key={field.id}>
            <Field
              label={index === 0 ? "Clave" : ""}
              value={field.key}
              onChange={(value) =>
                setDraft({
                  ...draft,
                  fields: draft.fields.map((item) => (item.id === field.id ? { ...item, key: value } : item)),
                })
              }
            />
            <Field
              label={index === 0 ? "Valor sensible" : ""}
              value={field.value}
              onChange={(value) =>
                setDraft({
                  ...draft,
                  fields: draft.fields.map((item) => (item.id === field.id ? { ...item, value } : item)),
                })
              }
            />
            <button
              className="mt-auto rounded-md border border-border p-3 text-text-dim hover:bg-surface"
              type="button"
              onClick={() => setDraft({ ...draft, fields: draft.fields.filter((item) => item.id !== field.id) })}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-border px-3 py-2 text-sm text-text-dim hover:bg-surface"
          type="button"
          onClick={() => setDraft({ ...draft, fields: [...draft.fields, { id: crypto.randomUUID(), key: "", value: "" }] })}
        >
          Agregar par clave-valor
        </button>
        <button className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink" type="submit">
          Guardar credencial
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  onChange,
  required,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="block text-sm text-text-dim">
      {label ? <span>{label}</span> : <span className="sr-only">Campo</span>}
      <input
        className="mt-2 w-full rounded-md border border-border bg-ink px-3 py-2 text-sm text-text"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  value,
  values,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
  values: string[];
}) {
  return (
    <label className="block text-sm text-text-dim">
      {label}
      <select className="mt-2 w-full rounded-md border border-border bg-ink px-3 py-2 text-sm text-text" value={value} onChange={(event) => onChange(event.target.value)}>
        {values.map((item) => (
          <option value={item} key={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

function IconButton({
  disabled,
  icon,
  label,
  onClick,
}: {
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-md border border-border p-2 text-text-dim transition hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function InfoLink({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-ink p-3">
      <p className="mb-1 text-xs uppercase text-muted">{label}</p>
      {value ? (
        <a className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm text-accent hover:underline" href={value} target="_blank" rel="noreferrer">
          {value}
        </a>
      ) : (
        <p className="text-sm text-text-dim">Sin URL</p>
      )}
    </div>
  );
}
