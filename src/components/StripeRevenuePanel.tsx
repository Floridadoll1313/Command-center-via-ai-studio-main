import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, StripeStatus } from '../types';
import {
  CreditCard, ShieldCheck, HeartPulse, UserCheck, DollarSign,
  TrendingUp, Users, ArrowUpRight, CheckCircle, Mail, Clock, HelpCircle, AlertCircle
} from 'lucide-react';

interface StripeRevenuePanelProps {
  customers: Customer[];
  stripeStatus: StripeStatus;
  onSimulateWebhook: (email: string, plan: Customer['plan'], value: number) => void;
  onCancelSubscription: (email: string) => void;
}

export default function StripeRevenuePanel({
  customers,
  stripeStatus,
  onSimulateWebhook,
  onCancelSubscription,
}: StripeRevenuePanelProps) {
  const [showSimModal, setShowSimModal] = useState(false);
  const [simEmail, setSimEmail] = useState('');
  const [simPlan, setSimPlan] = useState<Customer['plan']>('Pro');

  // Calculates plan allocations for custom CSS bento graph
  const planCounts = customers.reduce(
    (acc, c) => {
      if (c.status === 'active' || c.status === 'trialing') {
        acc[c.plan] = (acc[c.plan] || 0) + 1;
      }
      return acc;
    },
    { Starter: 0, Pro: 0, Enterprise: 0, Free: 0 } as Record<Customer['plan'], number>
  );

  const totalActives = Object.values(planCounts).reduce((a, b) => a + b, 0);

  const handleSimWebSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simEmail.trim()) return;

    let price = 0;
    if (simPlan === 'Starter') price = 19;
    if (simPlan === 'Pro') price = 49;
    if (simPlan === 'Enterprise') price = 299;

    onSimulateWebhook(simEmail.trim(), simPlan, price);
    setSimEmail('');
    setShowSimModal(false);
  };

  const getPlanColor = (plan: Customer['plan']) => {
    switch (plan) {
      case 'Starter': return 'text-cyan-400 bg-cyan-950/40 border-cyan-500/20';
      case 'Pro': return 'text-violet-400 bg-violet-950/40 border-violet-500/20';
      case 'Enterprise': return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20';
      case 'Free': return 'text-slate-400 bg-slate-950/40 border-slate-500/20';
    }
  };

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-950/30';
      case 'trialing': return 'text-cyan-400 bg-cyan-950/30';
      case 'canceled': return 'text-rose-400 bg-rose-950/30';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-cyan-950/60 rounded-xl overflow-hidden shadow-2xl shadow-cyan-950/20">
      {/* Panel Header */}
      <div className="p-4 bg-slate-900/90 border-b border-cyan-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-tr from-cyan-600/20 to-teal-600/10 rounded-lg border border-cyan-500/30 text-cyan-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-slate-100 tracking-tight text-base">Tide Engine</h2>
            <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Stripe MRR Stream</p>
          </div>
        </div>

        {/* Connection status code */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] font-mono text-slate-400 font-semibold">Webhooks Active</span>
        </div>
      </div>

      {/* Hero Stats Module */}
      <div className="p-4 bg-slate-950 border-b border-cyan-950/30 grid grid-cols-2 gap-3 shrink-0">
        <div className="p-3 bg-slate-905/60 border border-slate-900 rounded-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">MRR</span>
            <DollarSign className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-display font-bold text-slate-100 tracking-tight">
            ${stripeStatus.mrr.toLocaleString()}
          </div>
          <p className="text-[9px] font-mono text-cyan-500 flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            +14% this lunar week
          </p>
        </div>

        <div className="p-3 bg-slate-905/60 border border-slate-900 rounded-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Subscribers</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-display font-bold text-slate-100 tracking-tight">
            {stripeStatus.activeSubscriptions}
          </div>
          <div className="text-[9px] font-mono text-indigo-400 flex items-center justify-between mt-0.5">
            <span>{customers.filter(c => c.status === 'trialing').length} trialing</span>
            <span>Churn: {stripeStatus.churnRate}%</span>
          </div>
        </div>
      </div>

      {/* Main Stats Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Visual Allocation Graph */}
        <div className="p-3 bg-slate-950/30 border border-slate-800/80 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 font-display">Contract Distribution</h3>
            <span className="text-[10px] text-slate-500 font-mono">Active Subscriptions</span>
          </div>

          <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-950">
            {totalActives > 0 ? (
              <>
                <div
                  style={{ width: `${(planCounts.Starter / totalActives) * 100}%` }}
                  className="bg-cyan-500"
                  title={`Starter: ${planCounts.Starter}`}
                />
                <div
                  style={{ width: `${(planCounts.Pro / totalActives) * 100}%` }}
                  className="bg-violet-500"
                  title={`Pro: ${planCounts.Pro}`}
                />
                <div
                  style={{ width: `${(planCounts.Enterprise / totalActives) * 100}%` }}
                  className="bg-emerald-500"
                  title={`Enterprise: ${planCounts.Enterprise}`}
                />
              </>
            ) : (
              <div className="w-full bg-slate-800" />
            )}
          </div>

          {/* Legend Details */}
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1">
            <div className="flex flex-col">
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Starter
              </span>
              <span className="text-slate-500 pl-2.5">{planCounts.Starter} / $19</span>
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-1 text-violet-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                Pro
              </span>
              <span className="text-slate-500 pl-2.5">{planCounts.Pro} / $49</span>
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Enterprise
              </span>
              <span className="text-slate-500 pl-2.5">{planCounts.Enterprise} / $299</span>
            </div>
          </div>
        </div>

        {/* Customers log ledger */}
        <div className="space-y-2">
          <div className="flex items-center justify-between sticky top-0 bg-slate-900 pb-1 z-10">
            <h3 className="text-xs font-semibold text-slate-300 font-display">Tide Ledger</h3>
            <button
              onClick={() => setShowSimModal(true)}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-950 hover:border-cyan-500/40 px-2 py-0.5 rounded cursor-pointer transition-all bg-slate-950/60"
            >
              Simulate Checkout Webhook
            </button>
          </div>

          <div className="space-y-2">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="p-2.5 bg-slate-950/40 border border-slate-800/60 hover:border-cyan-950 rounded-lg transition-colors flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-500 flex-none" />
                    <span className="text-xs text-slate-200 truncate select-all">
                      {customer.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono border ${getPlanColor(customer.plan)}`}>
                      {customer.plan}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {customer.stripe_id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                  {customer.status === 'active' && (
                    <button
                      onClick={() => onCancelSubscription(customer.email)}
                      className="p-1 hover:bg-rose-950/15 text-slate-600 hover:text-rose-400 rounded cursor-pointer transition-all border border-transparent hover:border-rose-900/40"
                      title="Simulate Cancel Subscription Webhook"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stripe Webhook Simulation Modal */}
      <AnimatePresence>
        {showSimModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-cyan-800/40 rounded-xl p-5 w-full max-w-sm shadow-2xl relative"
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-950/50">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-semibold text-slate-100">Simulate Stripe Checkout Wave</h3>
              </div>

              <form onSubmit={handleSimWebSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Customer Email</label>
                  <input
                    type="email"
                    required
                    placeholder="shaka@northshore.com"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Billing Contract Level</label>
                  <select
                    value={simPlan}
                    onChange={(e) => setSimPlan(e.target.value as Customer['plan'])}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Starter">Starter ($19/mo)</option>
                    <option value="Pro">Pro ($49/mo)</option>
                    <option value="Enterprise">Enterprise ($299/mo)</option>
                  </select>
                </div>

                <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 rounded text-[11px] text-cyan-400 leading-relaxed font-mono">
                  <div className="font-bold flex items-center gap-1 mb-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    How Webhooks Flow:
                  </div>
                  Triggers Stripe event &quot;checkout.session.completed&quot; in middle console log & updates your MRR dynamic pool.
                </div>

                <div className="flex justify-end gap-2 pt-1 font-mono">
                  <button
                    type="button"
                    onClick={() => setShowSimModal(false)}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded text-xs transition-colors cursor-pointer"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded font-bold text-xs transition-colors cursor-pointer"
                  >
                    Simulate Wave
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Panel Footer */}
      <div className="p-3 bg-slate-950 font-mono border-t border-cyan-950/50 flex text-[10px] text-slate-500 justify-between items-center">
        <span>Stripe Secret Config: OK</span>
        <span>Sandbox-Mode</span>
      </div>
    </div>
  );
}
