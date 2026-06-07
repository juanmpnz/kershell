import { seed } from "./seed";
import type {
  Credential,
  DashboardData,
  Project,
  Subscription,
  SubscriptionCategory,
  SubscriptionStatus,
} from "./schema";

export type SubscriptionFilter = {
  category?: SubscriptionCategory;
  daysToEnd?: number;
  projectId?: Project["id"] | null;
  search?: string;
  status?: SubscriptionStatus;
};

function cloneDashboardData(data: DashboardData): DashboardData {
  return {
    today: data.today,
    user: { ...data.user },
    projects: data.projects.map((project) => ({
      ...project,
      stack: [...project.stack],
    })),
    subs: data.subs.map((subscription) => ({ ...subscription })),
    creds: Object.fromEntries(
      Object.entries(data.creds).map(([projectId, credentials]) => [
        projectId,
        credentials.map((credential) => ({
          ...credential,
          fields: credential.fields.map((field) => ({ ...field })),
          tags: credential.tags ? [...credential.tags] : undefined,
        })),
      ]),
    ),
  };
}

const state = cloneDashboardData(seed);

function getToday() {
  const [year, month, day] = state.today.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function diffInDays(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const today = getToday();

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function matchesSearch(subscription: Subscription, search: string) {
  const needle = search.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  return [subscription.name, subscription.plan, subscription.category, subscription.owner]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function updateProjectCredentialCount(projectId: Project["id"]) {
  const project = state.projects.find((item) => item.id === projectId);

  if (!project) {
    return;
  }

  project.credentialsCount = state.creds[projectId]?.length ?? 0;
}

export function getDashboardData() {
  return cloneDashboardData(state);
}

export function getUser() {
  return { ...state.user };
}

export function getProjects() {
  return state.projects.map((project) => ({
    ...project,
    stack: [...project.stack],
  }));
}

export function getProject(id: Project["id"]) {
  const project = state.projects.find((item) => item.id === id);

  return project ? { ...project, stack: [...project.stack] } : null;
}

export function getSubscriptions(filter: SubscriptionFilter = {}) {
  return state.subs
    .filter((subscription) => {
      if (filter.status && subscription.status !== filter.status) {
        return false;
      }

      if (filter.category && subscription.category !== filter.category) {
        return false;
      }

      if (filter.projectId !== undefined && subscription.project !== filter.projectId) {
        return false;
      }

      if (filter.daysToEnd !== undefined) {
        const trialEnd = subscription.trialEnds ?? subscription.nextCharge;
        const days = diffInDays(trialEnd);

        if (days < 0 || days > filter.daysToEnd) {
          return false;
        }
      }

      if (filter.search && !matchesSearch(subscription, filter.search)) {
        return false;
      }

      return true;
    })
    .map((subscription) => ({ ...subscription }));
}

export function getSubscription(id: Subscription["id"]) {
  const subscription = state.subs.find((item) => item.id === id);

  return subscription ? { ...subscription } : null;
}

export function getCredentials(projectId: Project["id"]) {
  return (state.creds[projectId] ?? []).map((credential) => ({
    ...credential,
    fields: credential.fields.map((field) => ({ ...field })),
    tags: credential.tags ? [...credential.tags] : undefined,
  }));
}

export function upsertSubscription(subscription: Subscription) {
  const existingIndex = state.subs.findIndex((item) => item.id === subscription.id);
  const nextSubscription = { ...subscription };

  if (existingIndex >= 0) {
    state.subs[existingIndex] = nextSubscription;
  } else {
    state.subs.unshift(nextSubscription);
  }

  return { ...nextSubscription };
}

export function deleteSubscription(id: Subscription["id"]) {
  const initialLength = state.subs.length;
  state.subs = state.subs.filter((subscription) => subscription.id !== id);

  return state.subs.length !== initialLength;
}

export function upsertCredential(projectId: Project["id"], credential: Credential) {
  const credentials = state.creds[projectId] ?? [];
  const existingIndex = credentials.findIndex((item) => item.id === credential.id);
  const nextCredential: Credential = {
    ...credential,
    fields: credential.fields.map((field) => ({ ...field })),
    tags: credential.tags ? [...credential.tags] : undefined,
  };

  if (existingIndex >= 0) {
    credentials[existingIndex] = nextCredential;
  } else {
    credentials.unshift(nextCredential);
  }

  state.creds[projectId] = credentials;
  updateProjectCredentialCount(projectId);

  return {
    ...nextCredential,
    fields: nextCredential.fields.map((field) => ({ ...field })),
    tags: nextCredential.tags ? [...nextCredential.tags] : undefined,
  };
}

export function deleteCredential(projectId: Project["id"], credId: Credential["id"]) {
  const credentials = state.creds[projectId] ?? [];
  const initialLength = credentials.length;

  state.creds[projectId] = credentials.filter((credential) => credential.id !== credId);
  updateProjectCredentialCount(projectId);

  return state.creds[projectId].length !== initialLength;
}
