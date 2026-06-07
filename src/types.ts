export interface Project {
  id: string;
  name: string;
  repo_url: string;
  status: 'active' | 'paused' | 'error';
  created_at: string;
}

export interface Repo {
  id: string;
  project_id: string;
  github_url: string;
  last_commit: string;
  branch: string;
}

export interface LogEvent {
  id: string;
  type: 'deploy' | 'error' | 'payment' | 'sync';
  message: string;
  metadata: any;
  created_at: string;
}

export interface Customer {
  id: string;
  email: string;
  stripe_id: string;
  plan: 'Starter' | 'Pro' | 'Enterprise' | 'Free';
  status: 'active' | 'canceled' | 'trialing';
  created_at: string;
  mrr: number; // monthly recurring revenue contribution
}

export interface StripeStatus {
  webhookStatus: 'connected' | 'error' | 'inactive';
  mrr: number;
  activeSubscriptions: number;
  churnRate: number; // percentage
  mode: 'test' | 'live';
}
