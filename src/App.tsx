import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEvents } from './hooks/useEvents';
import { Project, Repo, Customer, StripeStatus, LogEvent } from './types';
import {
  initialProjects,
  initialRepos,
  initialCustomers,
  COMMIT_MESSAGES
} from './data/mockData';

// Component Imports
import ProjectPanel from './components/ProjectPanel';
import EventStreamPanel from './components/EventStreamPanel';
import StripeRevenuePanel from './components/StripeRevenuePanel';

// Icons
import {
  Waves,
  Github,
  Database,
  CreditCard,
  Settings,
  Info,
  ExternalLink,
  Code,
  Sparkles,
  HelpCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';

export default function App() {
  // State definitions matching Step 1 & 6 specifications
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [repos, setRepos] = useState<Repo[]>(initialRepos);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  // Real-time Event Subscription Feed with built-in simulations
  const { events, addEvent, realtimeActive, triggerReload } = useEvents();

  // Stripe overall status tracker
  const calculateMRR = (currentCustomers: Customer[]) => {
    return currentCustomers
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + c.mrr, 0);
  };

  const [stripeStatus, setStripeStatus] = useState<StripeStatus>({
    webhookStatus: 'connected',
    mrr: calculateMRR(initialCustomers),
    activeSubscriptions: initialCustomers.filter((c) => c.status === 'active').length,
    churnRate: 3.4,
    mode: 'test',
  });

  // --- Handlers for User / Simulation Interactions ---

  // User adds project & associated repo in Left Panel
  const handleAddProject = (name: string, gitUrl: string, branch: string) => {
    const projectId = `p-new-${Math.random().toString(36).substr(2, 9)}`;
    const repoId = `r-new-${Math.random().toString(36).substr(2, 9)}`;

    const newProject: Project = {
      id: projectId,
      name,
      repo_url: gitUrl,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const newRepo: Repo = {
      id: repoId,
      project_id: projectId,
      github_url: gitUrl,
      last_commit: 'Initial commit: Rigged into SaaS Ocean Tracker',
      branch,
    };

    setProjects((prev) => [newProject, ...prev]);
    setRepos((prev) => [newRepo, ...prev]);

    // 1. Log Repository Map Registered Sync event
    addEvent({
      type: 'sync',
      message: `Project anchored in reef storage: ${name} repository linked securely`,
      metadata: { project_id: projectId, repo_url: gitUrl, branch },
    });

    // 2. Queue simulated deployment success build 1.5 seconds later
    setTimeout(() => {
      addEvent({
        type: 'deploy',
        message: `Deployment compiled! ${name} is live on development cluster`,
        metadata: { host: 'ais-dev-run', origin: 'github-action-pipe', duration_ms: 4890 },
      });
    }, 1500);
  };

  // User Pauses / Resumes deploy loops
  const handleToggleStatus = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus: Project['status'] = p.status === 'active' ? 'paused' : 'active';

          // Log change
          addEvent({
            type: 'sync',
            message: `Reef storage status for "${p.name}" changed to [${nextStatus}]`,
            metadata: { project_id: p.id, original_status: p.status, active: nextStatus === 'active' },
          });

          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  // User triggers manual Force Git Synchronization
  const handleSyncProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const commitMessage = COMMIT_MESSAGES[Math.floor(Math.random() * COMMIT_MESSAGES.length)];

    setRepos((prev) =>
      prev.map((r) => {
        if (r.project_id === projectId) {
          return {
            ...r,
            last_commit: commitMessage,
          };
        }
        return r;
      })
    );

    addEvent({
      type: 'sync',
      message: `Forced instant Git Sync complete for repo "${project.name}"`,
      metadata: { last_commit: commitMessage, sync_speed_ms: 184 },
    });
  };

  // New Subscription generated via simulated Stripe session completed webhook
  const handleSimulateWebhook = (email: string, plan: Customer['plan'], value: number) => {
    const existingIndex = customers.findIndex((c) => c.email.toLowerCase() === email.toLowerCase());

    let updatedCustomers = [...customers];

    if (existingIndex > -1) {
      // Re-activate or upgrade existing customer
      updatedCustomers[existingIndex] = {
        ...updatedCustomers[existingIndex],
        plan,
        mrr: value,
        status: 'active',
      };
    } else {
      // Build new customer record
      const newCustomer: Customer = {
        id: `c-sim-${Math.random().toString(36).substr(2, 9)}`,
        email,
        stripe_id: `cus_StripeSim${Math.floor(Math.random() * 800000 + 100000)}`,
        plan,
        status: 'active',
        created_at: new Date().toISOString(),
        mrr: value,
      };
      updatedCustomers = [newCustomer, ...updatedCustomers];
    }

    setCustomers(updatedCustomers);

    // Recompute total MRR
    const activeSubscribers = updatedCustomers.filter((c) => c.status === 'active').length;
    setStripeStatus((prev) => ({
      ...prev,
      mrr: calculateMRR(updatedCustomers),
      activeSubscriptions: activeSubscribers,
    }));

    // Trigger payment event
    addEvent({
      type: 'payment',
      message: `Checkout session successfully processed: activated ${plan} tier for ${email}`,
      metadata: {
        email,
        amount_usd: value,
        currency: 'usd',
        trigger: 'stripe_event_session_completed'
      },
    });
  };

  // Cancel dynamic subscriber
  const handleCancelSubscription = (email: string) => {
    const updatedCustomers = customers.map((c) => {
      if (c.email.toLowerCase() === email.toLowerCase()) {
        return {
          ...c,
          status: 'canceled' as const,
          mrr: 0,
        };
      }
      return c;
    });

    setCustomers(updatedCustomers);

    const activeSubscribers = updatedCustomers.filter((c) => c.status === 'active').length;
    setStripeStatus((prev) => ({
      ...prev,
      mrr: calculateMRR(updatedCustomers),
      activeSubscriptions: activeSubscribers,
    }));

    addEvent({
      type: 'payment',
      message: `Stripe webhook processed: custom subscription revoked for ${email}`,
      metadata: {
        email,
        original_mrr_impact_usd: customers.find((c) => c.email === email)?.mrr || 0,
        trigger: 'customer.subscription.deleted'
      },
    });
  };

  // Helper to trigger fully custom simulated items directly from user input
  const handleCustomTriggerEvent = (type: LogEvent['type'], message: string, metadata: any) => {
    addEvent({
      type,
      message,
      metadata,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Ocean Banner Command Controls */}
      <header className="bg-slate-900 border-b border-cyan-950/60 sticky top-0 z-40 px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-teal-500 rounded-xl text-slate-950 shadow-lg shadow-cyan-500/20">
            <Waves className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg md:text-xl text-slate-100 tracking-tight">
                Ocean Command Center
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                PROTOTYPE READY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live Wave Monitor for SaaS boilerplate pipelines
            </p>
          </div>
        </div>

        {/* Global Blueprint Configuration helper info */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="hidden lg:flex items-center gap-3 border border-cyan-950 bg-slate-950/60 p-1.5 px-3 rounded-lg text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
              <Github className="w-3.5 h-3.5 text-slate-500" />
              <span>reef_storage</span>
            </div>
            <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
              <Database className="w-3.5 h-3.5 text-cyan-500" />
              <span>supabase_brain</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              <span>stripe_engine</span>
            </div>
          </div>
        </div>
      </header>

      {/* Structural Ocean Concept Explanation Bar */}
      <section className="bg-gradient-to-r from-cyan-950/20 via-slate-900 to-teal-950/10 border-b border-cyan-950/35 p-3 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-slate-300 leading-relaxed font-sans max-w-4xl">
              <strong>Architecture Blueprint Mode Activated:</strong> Building a surfboard before the wave arrives ensures flawless frontend discipline.
              Check out how the three panels sync below — each Github project acts as a reef, streaming simulated or live real-time entries directly into your Supabase public logs feed.
            </p>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-all font-mono hover:underline shrink-0 self-end md:self-auto text-[11px]"
          >
            Explore Repo Map <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>

      {/* Main Grid Panels Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 min-h-0">
        
        {/* Left: Projects Panel (GitHub Repo Ocean Map) */}
        <div className="lg:col-span-3 min-h-[350px] lg:h-[calc(105vh-260px)]">
          <ProjectPanel
            projects={projects}
            repos={repos}
            onAddProject={handleAddProject}
            onToggleStatus={handleToggleStatus}
            onSyncProject={handleSyncProject}
          />
        </div>

        {/* Middle: Live Events Stream (Supabase Waves logs tracker) */}
        <div className="lg:col-span-5 min-h-[450px] lg:h-[calc(105vh-260px)]">
          <EventStreamPanel
            events={events}
            onTriggerEvent={handleCustomTriggerEvent}
            realtimeActive={realtimeActive}
            onConfigReload={triggerReload}
          />
        </div>

        {/* Right: Revenue & Stripe Status */}
        <div className="lg:col-span-4 min-h-[400px] lg:h-[calc(105vh-260px)]">
          <StripeRevenuePanel
            customers={customers}
            stripeStatus={stripeStatus}
            onSimulateWebhook={handleSimulateWebhook}
            onCancelSubscription={handleCancelSubscription}
          />
        </div>

      </main>

      {/* Subtle Bottom Credit & Code integration guidelines */}
      <footer className="mt-auto bg-slate-900/60 border-t border-cyan-950/60 py-4 px-6 text-center shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <span>Ocean Command Center Dashboard &copy; 226/226. Wave control online.</span>
          <div className="flex items-center gap-3.5 text-[11px]">
            <span className="flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-slate-600" />
              TypeScript & React
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              Interactive Sandboxed
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
