// dashboard-handoff/data/seed.ts
// Datos demo del dashboard. Mismos del canvas. Copiar a lib/dashboard/seed.ts.

import type { DashboardData } from './schema';

export const seed: DashboardData = {
  today: '2026-05-29',
  user: { name: 'Jerónimo Cárdenas', email: 'jero@kershell.dev', role: 'Owner' },

  projects: [
    {
      id: 'campos',
      name: 'Campos Inmobiliaria',
      code: 'CAMPOS',
      status: 'live',
      stage: 'Producción',
      summary: 'Plataforma de listings y gestión de leads para inmobiliaria boutique.',
      stack: ['Next.js', 'Supabase', 'Vercel', 'Resend'],
      created: '2024-02-11',
      owner: 'Kershell',
      monthly: 51,
      credentialsCount: 8,
      color: '#B4F23F',
    },
    {
      id: 'specops',
      name: 'SpecOps',
      code: 'SPECOPS',
      status: 'live',
      stage: 'Producción',
      summary: 'Panel de operaciones en vivo — monitoreo y despacho de equipos en campo.',
      stack: ['Remix', 'PostgreSQL', 'Railway', 'Mapbox'],
      created: '2023-09-04',
      owner: 'Kershell',
      monthly: 84,
      credentialsCount: 12,
      color: '#7AD0FF',
    },
    {
      id: 'lma',
      name: 'Live Match Analytics',
      code: 'LMA',
      status: 'beta',
      stage: 'Beta cerrada',
      summary: 'Motor de analítica deportiva en tiempo real — ingest, modelo y panel.',
      stack: ['FastAPI', 'Postgres', 'Apollo', 'Redis'],
      created: '2024-06-22',
      owner: 'Kershell',
      monthly: 162,
      credentialsCount: 14,
      color: '#F5A623',
    },
  ],

  subs: [
    { id: 's-vercel',    name: 'Vercel',           plan: 'Pro',                          category: 'Hosting',       cost: 20,   period: 'mensual',        nextCharge: '2026-06-15', cycle: 'Anual con renovación 15',  status: 'active', project: 'campos',  payment: 'Visa •• 4421',          owner: 'team@kershell.dev', url: 'https://vercel.com',                    notes: 'Hosting para Campos + previews de marketing.' },
    { id: 's-supabase',  name: 'Supabase',         plan: 'Pro',                          category: 'Hosting',       cost: 25,   period: 'mensual',        nextCharge: '2026-06-08', cycle: 'Mensual día 8',            status: 'active', project: 'campos',  payment: 'Visa •• 4421',          owner: 'team@kershell.dev', url: 'https://supabase.com',                  notes: 'DB + auth Campos. Backups diarios habilitados.' },
    { id: 's-railway',   name: 'Railway',          plan: 'Hobby',                        category: 'Hosting',       cost: 5,    period: 'mensual',        nextCharge: '2026-06-11', cycle: 'Mensual día 11',           status: 'active', project: 'specops', payment: 'Visa •• 4421',          owner: 'team@kershell.dev', url: 'https://railway.app',                   notes: 'Workers y cron de SpecOps.' },
    { id: 's-apollo',    name: 'Apollo GraphOS',   plan: 'Serverless',                   category: 'Dev tools',     cost: 89,   period: 'mensual',        nextCharge: '2026-06-09', cycle: 'Mensual día 9',            status: 'trial',  trialEnds: '2026-06-04', project: 'lma', payment: 'Mastercard •• 0917', owner: 'team@kershell.dev', url: 'https://www.apollographql.com',         notes: 'Federación de schemas LMA. Trial vence en 7 días.' },
    { id: 's-google',    name: 'Google Workspace', plan: 'Business Starter · 4 usuarios', category: 'Comunicación', cost: 24,   period: 'mensual',        nextCharge: '2026-06-03', cycle: 'Mensual día 3',            status: 'active', project: null,      payment: 'Visa •• 4421',          owner: 'team@kershell.dev', url: 'https://workspace.google.com',          notes: 'Correo corporativo + drive del equipo.' },
    { id: 's-namecheap', name: 'Namecheap',        plan: 'Dominios × 6',                 category: 'Dominios',      cost: 9.5,  period: 'mensual',        nextCharge: '2026-08-21', cycle: 'Anual — próx. renovación ago', status: 'active', project: null,  payment: 'PayPal team@kershell.dev', owner: 'team@kershell.dev', url: 'https://namecheap.com',                 notes: 'kershell.dev, kershell.com, campos.estate y 3 más.' },
    { id: 's-github',    name: 'GitHub',           plan: 'Team · 2 seats',               category: 'Dev tools',     cost: 8,    period: 'mensual',        nextCharge: '2026-06-19', cycle: 'Mensual día 19',           status: 'active', project: null,      payment: 'Visa •• 4421',          owner: 'team@kershell.dev', url: 'https://github.com',                    notes: 'Org kershell — repos privados, Actions.' },
    { id: 's-linear',    name: 'Linear',           plan: 'Standard · 2 seats',           category: 'Dev tools',     cost: 16,   period: 'mensual',        nextCharge: '2026-06-05', cycle: 'Mensual día 5',            status: 'trial',  trialEnds: '2026-06-05', project: null,  payment: 'Visa •• 4421',          owner: 'team@kershell.dev', url: 'https://linear.app',                    notes: 'Trial — definir si seguimos.' },
    { id: 's-anthropic', name: 'Anthropic API',    plan: 'Pay-as-you-go',                category: 'IA',            cost: 47,   period: 'mensual (uso)',  nextCharge: '2026-06-01', cycle: 'Cargo por uso',            status: 'active', project: 'lma',     payment: 'Visa •• 4421',          owner: 'team@kershell.dev', url: 'https://console.anthropic.com',         notes: 'Modelos para LMA — Claude Sonnet.' },
    { id: 's-openai',    name: 'OpenAI',           plan: 'Pay-as-you-go',                category: 'IA',            cost: 22,   period: 'mensual (uso)',  nextCharge: '2026-06-01', cycle: 'Cargo por uso',            status: 'active', project: 'lma',     payment: 'Visa •• 4421',          owner: 'team@kershell.dev', url: 'https://platform.openai.com',           notes: 'Embeddings para LMA.' },
    { id: 's-sentry',    name: 'Sentry',           plan: 'Team',                         category: 'Monitoring',    cost: 26,   period: 'mensual',        nextCharge: '2026-06-13', cycle: 'Mensual día 13',           status: 'active', project: 'specops', payment: 'Visa •• 4421',          owner: 'team@kershell.dev', url: 'https://sentry.io',                     notes: 'Errores y performance — SpecOps + LMA.' },
    { id: 's-figma',     name: 'Figma',            plan: 'Professional · 2 editores',    category: 'Diseño',        cost: 30,   period: 'mensual',        nextCharge: '2026-06-17', cycle: 'Mensual día 17',           status: 'active', project: null,      payment: 'Visa •• 4421',          owner: 'team@kershell.dev', url: 'https://figma.com',                     notes: 'Diseño de producto del equipo.' },
    { id: 's-cloudflare',name: 'Cloudflare',       plan: 'Pro',                          category: 'Hosting',       cost: 20,   period: 'mensual',        nextCharge: '2026-06-26', cycle: 'Mensual día 26',           status: 'active', project: 'specops', payment: 'Visa •• 4421',          owner: 'team@kershell.dev', url: 'https://cloudflare.com',                notes: 'DNS + WAF para SpecOps.' },
    { id: 's-resend',    name: 'Resend',           plan: 'Pro',                          category: 'Comunicación',  cost: 20,   period: 'mensual',        nextCharge: '2026-06-22', cycle: 'Mensual día 22',           status: 'active', project: 'campos',  payment: 'Visa •• 4421',          owner: 'team@kershell.dev', url: 'https://resend.com',                    notes: 'Emails transaccionales Campos.' },
  ],

  creds: {
    campos: [
      {
        id: 'c-campos-1', name: 'Supabase — service role',
        type: 'API key', service: 'Supabase', env: 'prod',
        updated: '2026-05-12', addedBy: 'jero@kershell.dev',
        fields: [
          { k: 'URL',          v: 'https://campos-prod.supabase.co', secret: false },
          { k: 'anon_key',     v: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.campos-anon', secret: true },
          { k: 'service_role', v: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.campos-srv', secret: true },
        ],
      },
      {
        id: 'c-campos-2', name: 'Vercel — deploy token',
        type: 'Deploy token', service: 'Vercel', env: 'prod',
        updated: '2026-04-29', addedBy: 'jero@kershell.dev',
        fields: [
          { k: 'token', v: 'vrcl_live_aB3xT1pZmqQ7Lk0RpvCe9N', secret: true },
          { k: 'team',  v: 'kershell', secret: false },
        ],
      },
      {
        id: 'c-campos-3', name: 'Resend — sending key',
        type: 'API key', service: 'Resend', env: 'prod',
        updated: '2026-05-02', addedBy: 'mateo@kershell.dev',
        fields: [
          { k: 'api_key', v: 're_7f6Bm0LpXc91kQzVnTr2A', secret: true },
          { k: 'from',    v: 'no-reply@campos.estate', secret: false },
        ],
      },
      {
        id: 'c-campos-4', name: 'Cloudflare — DNS',
        type: 'Login', service: 'Cloudflare', env: 'shared',
        updated: '2026-03-17', addedBy: 'jero@kershell.dev',
        fields: [
          { k: 'user', v: 'team@kershell.dev', secret: false },
          { k: 'pass', v: 'Q9!fmZ-tx72LbE#a', secret: true },
          { k: '2fa',  v: 'authenticator app', secret: false },
        ],
      },
      {
        id: 'c-campos-5', name: 'Admin user — staging',
        type: 'Login', service: 'Campos app', env: 'staging',
        updated: '2026-05-08', addedBy: 'mateo@kershell.dev',
        fields: [
          { k: 'email', v: 'admin@campos.staging', secret: false },
          { k: 'pass',  v: 'staging-9bxLpRq4', secret: true },
        ],
      },
    ],
    specops: [
      {
        id: 'c-spec-1', name: 'Postgres — primary',
        type: 'Connection string', service: 'Railway', env: 'prod',
        updated: '2026-05-21', addedBy: 'jero@kershell.dev',
        fields: [
          { k: 'host', v: 'roundhouse.proxy.rlwy.net', secret: false },
          { k: 'port', v: '14722', secret: false },
          { k: 'db',   v: 'specops_prod', secret: false },
          { k: 'user', v: 'specops_app', secret: false },
          { k: 'pass', v: 'B7nQ-LpZ!42ftRq9Xw', secret: true },
        ],
      },
      {
        id: 'c-spec-2', name: 'Mapbox — production',
        type: 'API key', service: 'Mapbox', env: 'prod',
        updated: '2026-02-14', addedBy: 'jero@kershell.dev',
        fields: [
          { k: 'public_token', v: 'pk.eyJ1Ijoia2Vyc2hlbGwiLCJhIjoidGVzdCJ9.qaZ91Mw', secret: false },
          { k: 'secret_token', v: 'sk.eyJ1Ijoia2Vyc2hlbGwiLCJhIjoidGVzdCJ9.aPmZ70x', secret: true },
        ],
      },
      {
        id: 'c-spec-3', name: 'Sentry — DSN',
        type: 'DSN', service: 'Sentry', env: 'prod',
        updated: '2026-04-10', addedBy: 'mateo@kershell.dev',
        fields: [
          { k: 'dsn', v: 'https://9f2bc1@o4509.ingest.sentry.io/4509187', secret: true },
        ],
      },
    ],
    lma: [
      {
        id: 'c-lma-1', name: 'Apollo Studio — graph API',
        type: 'API key', service: 'Apollo', env: 'prod',
        updated: '2026-05-25', addedBy: 'jero@kershell.dev',
        fields: [
          { k: 'graph_id', v: 'live-match-analytics', secret: false },
          { k: 'key',      v: 'service:lma:7BkXz9pQ-aRTm21Lo', secret: true },
        ],
      },
      {
        id: 'c-lma-2', name: 'Anthropic — production',
        type: 'API key', service: 'Anthropic', env: 'prod',
        updated: '2026-05-18', addedBy: 'mateo@kershell.dev',
        fields: [
          { k: 'api_key', v: 'sk-ant-api03-9bxLpRq4-XyZ91MwBmN', secret: true },
          { k: 'project', v: 'lma-prod', secret: false },
        ],
      },
      {
        id: 'c-lma-3', name: 'Redis — ingest cache',
        type: 'Connection string', service: 'Railway', env: 'prod',
        updated: '2026-05-19', addedBy: 'jero@kershell.dev',
        fields: [
          { k: 'host', v: 'redis.rlwy.net', secret: false },
          { k: 'port', v: '6379', secret: false },
          { k: 'pass', v: 'red!sLM4-77pxAqZ', secret: true },
        ],
      },
      {
        id: 'c-lma-4', name: 'OpenAI — embeddings',
        type: 'API key', service: 'OpenAI', env: 'prod',
        updated: '2026-05-15', addedBy: 'mateo@kershell.dev',
        fields: [
          { k: 'api_key', v: 'sk-proj-lma-aB3xT1pZmqQ7Lk0RpvCe9N', secret: true },
          { k: 'org',     v: 'org-kershell', secret: false },
        ],
      },
    ],
  },
};
