// dashboard-handoff/data/schema.ts
// Tipos canónicos del dashboard. Copiar a lib/dashboard/schema.ts en el repo.

export type ProjectStatus = 'live' | 'beta' | 'paused';

export type Project = {
  id: string;
  name: string;
  code: string;
  status: ProjectStatus;
  /** Descripción humana del stage. Ej: "Producción", "Beta cerrada". */
  stage: string;
  summary: string;
  stack: string[];
  /** ISO date (YYYY-MM-DD) */
  created: string;
  owner: string;
  monthly: number;
  credentialsCount: number;
  /** Hex del color del tag del proyecto. */
  color: string;
};

export type SubscriptionCategory =
  | 'Hosting'
  | 'Dev tools'
  | 'IA'
  | 'Comunicación'
  | 'Dominios'
  | 'Monitoring'
  | 'Diseño';

export type SubscriptionStatus = 'active' | 'trial' | 'paused';

export type Subscription = {
  id: string;
  name: string;
  plan: string;
  category: SubscriptionCategory;
  cost: number;
  /** Ej: "mensual", "anual", "mensual (uso)". */
  period: string;
  /** ISO date (YYYY-MM-DD). */
  nextCharge: string;
  cycle: string;
  status: SubscriptionStatus;
  /** Solo si status === 'trial'. ISO date. */
  trialEnds?: string;
  /** Project.id o null si es shared / no asignada. */
  project: string | null;
  payment: string;
  owner: string;
  url: string;
  notes: string;
};

export type CredentialField = {
  k: string;
  v: string;
  secret: boolean;
};

export type CredentialEnv = 'prod' | 'staging' | 'dev' | 'shared';
export type CredentialType =
  | 'API key'
  | 'Login'
  | 'Connection string'
  | 'Deploy token'
  | 'DSN'
  | 'OAuth client'
  | 'SSH key';

export type Credential = {
  id: string;
  name: string;
  type: CredentialType;
  service: string;
  env: CredentialEnv;
  /** ISO date */
  updated: string;
  addedBy: string;
  fields: CredentialField[];

  // backend-only / opcionales en el frontend
  tags?: string[];
  rotateEvery?: '30' | '60' | '90' | '180' | 'never';
  notes?: string;
};

export type User = {
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member';
};

export type DashboardData = {
  projects: Project[];
  subs: Subscription[];
  /** Indexado por Project.id */
  creds: Record<string, Credential[]>;
  user: User;
  /** ISO date. Útil para tests deterministas. */
  today: string;
};
