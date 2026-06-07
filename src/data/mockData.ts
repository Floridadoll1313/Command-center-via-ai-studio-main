import { Project, Repo, LogEvent, Customer } from '../types';

export const initialProjects: Project[] = [
  {
    id: 'p1',
    name: 'SwellTracker API',
    repo_url: 'https://github.com/oceantide/swelltracker-api',
    status: 'active',
    created_at: '2026-05-01T10:00:00Z',
  },
  {
    id: 'p2',
    name: 'Tide Engine Engine',
    repo_url: 'https://github.com/oceantide/tide-engine',
    status: 'active',
    created_at: '2026-05-12T14:30:00Z',
  },
  {
    id: 'p3',
    name: 'Coral Reef App',
    repo_url: 'https://github.com/oceantide/coral-reef-ui',
    status: 'paused',
    created_at: '2026-05-20T08:15:00Z',
  },
  {
    id: 'p4',
    name: 'Wave Analytics API',
    repo_url: 'https://github.com/oceantide/wave-analytics',
    status: 'error',
    created_at: '2026-06-01T11:45:00Z',
  }
];

export const initialRepos: Repo[] = [
  {
    id: 'r1',
    project_id: 'p1',
    github_url: 'https://github.com/oceantide/swelltracker-api',
    last_commit: 'Merge pull request #42 from fix/temp-sensor-delay',
    branch: 'main',
  },
  {
    id: 'r2',
    project_id: 'p2',
    github_url: 'https://github.com/oceantide/tide-engine',
    last_commit: 'deps: upgrade Stripe-Node SDK to v15',
    branch: 'release-v2',
  },
  {
    id: 'r3',
    project_id: 'p3',
    github_url: 'https://github.com/oceantide/coral-reef-ui',
    last_commit: 'chore: remove redundant console.log statements',
    branch: 'dev',
  },
  {
    id: 'r4',
    project_id: 'p4',
    github_url: 'https://github.com/oceantide/wave-analytics',
    last_commit: 'api: crash on out-of-memory with heavy queries',
    branch: 'main',
  }
];

export const initialEvents: LogEvent[] = [
  {
    id: 'e1',
    type: 'deploy',
    message: 'SwellTracker API v1.4.2 compiled and deployed successfully to Cloud Run',
    metadata: { service: 'swelltracker-api', duration_ms: 18450, env: 'production' },
    created_at: '2026-06-06T22:45:10Z',
  },
  {
    id: 'e2',
    type: 'payment',
    message: 'New subscription activated: premium_reef tier',
    metadata: { email: 'surfer_pro@blueocean.net', amount: 4900, currency: 'usd', customer_id: 'cus_Q918aH', source: 'Stripe Webhook' },
    created_at: '2026-06-06T22:30:15Z',
  },
  {
    id: 'e3',
    type: 'sync',
    message: 'GitHub repo tide-engine fully synchronized with Reef storage',
    metadata: { commits_synced: 4, branch: 'release-v2', author: 'ocean-bot' },
    created_at: '2026-06-06T22:15:00Z',
  },
  {
    id: 'e4',
    type: 'error',
    message: 'Wave Analytics API crashed: PostgreSQL Connection Pool Refused Ref (Too many clients)',
    metadata: { severity: 'critical', exit_code: 1, trigger: 'cron-hourly-aggregation' },
    created_at: '2026-06-06T22:05:42Z',
  },
  {
    id: 'e5',
    type: 'payment',
    message: 'Subscription renewal payment succeeded: starter_reef tier',
    metadata: { email: 'shaka_aloha@island.com', amount: 1900, currency: 'usd', customer_id: 'cus_K842xL', source: 'Stripe Webhook' },
    created_at: '2026-06-06T21:44:20Z',
  },
  {
    id: 'e6',
    type: 'deploy',
    message: 'Coral Reef App v0.9.0-alpha built in 4.2s',
    metadata: { branch: 'dev', commit: 'e6a8ff3' },
    created_at: '2026-06-06T21:30:00Z',
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'c1',
    email: 'surfer_pro@blueocean.net',
    stripe_id: 'cus_Q918aH',
    plan: 'Pro',
    status: 'active',
    created_at: '2026-06-06T22:30:15Z',
    mrr: 49,
  },
  {
    id: 'c2',
    email: 'shaka_aloha@island.com',
    stripe_id: 'cus_K842xL',
    plan: 'Starter',
    status: 'active',
    created_at: '2026-05-15T09:12:00Z',
    mrr: 19,
  },
  {
    id: 'c3',
    email: 'techleads@swellcorp.io',
    stripe_id: 'cus_A742zE',
    plan: 'Enterprise',
    status: 'active',
    created_at: '2026-04-10T11:22:00Z',
    mrr: 299,
  },
  {
    id: 'c4',
    email: 'kailua_coder@maui.edu',
    stripe_id: 'cus_M902uY',
    plan: 'Free',
    status: 'trialing',
    created_at: '2026-06-05T15:20:00Z',
    mrr: 0,
  }
];

// Random names for live wave simulator
export const randomSubscribers = [
  'pipeline_master@grom.net',
  'teal_wave@crest.co',
  'aloha_dev@kawaii.org',
  'deep_water@abyss.io',
  'kelp_coder@reef.net',
  'barrel_rider@waimea.com',
  'hangten_tide@coast.au',
  'salt_and_code@beach.dev'
];

export const COMMIT_MESSAGES = [
  'fix: prevent tide overflow on low index',
  'feat: add lunar gravity tide force calculation core',
  'refactor: optimize wind-speed vectors',
  'fix: resolve race-condition on webhook parsing',
  'docs: elaborate on the deep-brain storage structure',
  'style: improve visual dashboard contrast grid'
];
