import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogEvent } from '../types';
import { getSupabaseCredentials, saveSupabaseCredentials, setSandboxModeEnforced } from '../lib/supabase';
import {
  Activity, Sparkles, Send, Eye, Database, Terminal, ShieldAlert,
  ArrowDownCircle, BadgeAlert, Layers, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

interface EventStreamPanelProps {
  events: LogEvent[];
  onTriggerEvent: (type: LogEvent['type'], message: string, metadata: any) => void;
  realtimeActive: boolean;
  onConfigReload: () => void;
}

export default function EventStreamPanel({
  events,
  onTriggerEvent,
  realtimeActive,
  onConfigReload,
}: EventStreamPanelProps) {
  const [filter, setFilter] = useState<LogEvent['type'] | 'all'>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Manual Trigger options
  const [customMsg, setCustomMsg] = useState('');
  const [customType, setCustomType] = useState<LogEvent['type']>('deploy');

  // Supabase quick connect configuration preview state
  const [showConfig, setShowConfig] = useState(false);
  
  // Connect configured values first
  const currentCreds = getSupabaseCredentials();
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(currentCreds.url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(currentCreds.key);
  const [sandboxEnforced, setSandboxEnforced] = useState(currentCreds.isSandboxEnforced);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  // Sync state if localStorage changes externally
  useEffect(() => {
    const latest = getSupabaseCredentials();
    setSupabaseUrlInput(latest.url);
    setSupabaseKeyInput(latest.key);
    setSandboxEnforced(latest.isSandboxEnforced);
  }, [showConfig]);

  const filteredEvents = events.filter((e) => filter === 'all' || e.type === filter);

  // Handle manual mock action
  const handleSimulate = (type: LogEvent['type']) => {
    switch (type) {
      case 'deploy':
        onTriggerEvent(
          'deploy',
          'SwellTracker API v1.4.3 production deploy finished successfully in 12.5s',
          { route_matches: 44, container_id: 'cr-sea-90', cpu_claimed: '0.5 vCPU' }
        );
        break;
      case 'payment': {
        const randFloat = Math.random();
        const plan = randFloat > 0.6 ? 'Pro' : randFloat > 0.3 ? 'Starter' : 'Enterprise';
        const price = plan === 'Pro' ? 4900 : plan === 'Starter' ? 1900 : 29900;
        const randNum = Math.floor(Math.random() * 9000) + 1000;
        onTriggerEvent(
          'payment',
          `Stripe Checkout Completed: Active ${plan} subscription created`,
          {
            email: `external_wave_${randNum}@reefmail.io`,
            customer_id: `cus_StripeSim${randNum}`,
            amount: price,
            currency: 'usd',
            source: 'Stripe Webhook Handler'
          }
        );
        break;
      }
      case 'sync':
        onTriggerEvent(
          'sync',
          'Immediate synchronizer triggered. Mapped 3 latest commits from main',
          { parent: 'github-sync-lambda', initiator: 'cli-admin-token' }
        );
        break;
      case 'error':
        onTriggerEvent(
          'error',
          'Supabase deep brain pipeline warning: Query lookup latency exceeded warning limit',
          { latency_ms: 1044, threshold_ms: 500, query: 'SELECT * FROM events' }
        );
        break;
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    onTriggerEvent(customType, customMsg.trim(), { custom_origin: 'Admin Dashboard Controller' });
    setCustomMsg('');
  };

  // Handle live database connection submission
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
    
    // Refresh states with clean parsed credentials
    const cleanCreds = getSupabaseCredentials();
    setSupabaseUrlInput(cleanCreds.url);
    setSupabaseKeyInput(cleanCreds.key);

    setIsSavedSuccessfully(true);
    setTimeout(() => {
      setIsSavedSuccessfully(false);
    }, 2000);

    onConfigReload();
  };

  // Reset to default mock simulator
  const handleResetToMock = () => {
    saveSupabaseCredentials('', '');
    setSupabaseUrlInput('');
    setSupabaseKeyInput('');
    setIsSavedSuccessfully(true);
    setTimeout(() => {
      setIsSavedSuccessfully(false);
    }, 2000);
    onConfigReload();
  };

  const handleToggleSandbox = (val: boolean) => {
    setSandboxModeEnforced(val);
    setSandboxEnforced(val);
    onConfigReload();
  };

  const getEventBadgeClass = (type: LogEvent['type']) => {
    switch (type) {
      case 'deploy':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'payment':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'sync':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'error':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-cyan-950/60 rounded-xl overflow-hidden shadow-2xl shadow-cyan-950/20 z-10">
      {/* Panel Header */}
      <div className="p-4 bg-slate-900/90 border-b border-cyan-950/50 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
              </span>
              <div className="p-1.5 bg-gradient-to-tr from-cyan-600/20 to-teal-600/10 rounded-lg border border-cyan-500/30 text-cyan-400">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="font-display font-semibold text-slate-100 tracking-tight text-base flex items-center gap-2">
                Live Events Stream
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  REAL-TIME
                </span>
              </h2>
              <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Supabase Webhook Feed</p>
            </div>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`px-2.5 py-1 text-[10px] font-mono rounded border flex items-center gap-1.5 cursor-pointer transition-all ${
              realtimeActive
                ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40'
                : 'bg-slate-950/80 text-orange-400 border-orange-500/30 hover:bg-orange-950/20'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            {realtimeActive ? 'Real Supabase: ON' : 'Mock Mode: active'}
            <ChevronDown className={`w-3 h-3 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Supabase connection details drawer */}
        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-950 border border-cyan-900/40 rounded-lg p-3 text-xs font-mono text-slate-300 overflow-hidden mt-1.5 space-y-3"
            >
              <div className="flex items-center justify-between text-[10px] text-cyan-400 pb-1 border-b border-cyan-950/60 uppercase">
                <span>Configure Live Database Reef</span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <Terminal className="w-3 h-3" />
                  Anchor Setup
                </span>
              </div>

              {/* Explicit Mode Selector Switch */}
              <div className="bg-slate-900/60 border border-cyan-950 p-2.5 rounded-lg space-y-2">
                <div className="text-[10px] text-slate-505 uppercase tracking-wider font-semibold">Active Engine Mode:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleSandbox(true)}
                    className={`p-2 rounded text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      sandboxEnforced
                        ? 'bg-amber-955/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-950/40 animate-pulse'
                        : 'bg-slate-950/40 text-slate-500 border-slate-900 hover:text-slate-300'
                    }`}
                  >
                    🚧 Mock Sandbox On
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSandbox(false)}
                    className={`p-2 rounded text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      !sandboxEnforced
                        ? 'bg-cyan-955/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-950/40'
                        : 'bg-slate-950/40 text-slate-500 border-slate-900 hover:text-slate-300'
                    }`}
                  >
                    ⚡ Real Live DB On
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 leading-relaxed font-sans pt-1">
                  {sandboxEnforced 
                    ? "Currently in Offline Mock Sandbox Mode. The app will simulate incoming payments and git-hooks offline without requesting database resources." 
                    : "Currently in Live Integration Mode. Connection to real-time events tables will load automatically if credentials below are specified."}
                </p>
              </div>

              {/* Profile Presets Quick Selection */}
              <div className="bg-slate-900/40 border border-cyan-950/50 p-2 rounded-lg space-y-1.5 text-[11px]">
                <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Quick-Connect Presets:</div>
                <div className="space-y-1 font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      const u = "https://cctobgbyxjfabksnokbe.supabase.co";
                      const k = "sb_publishable_MMlDjds0mfsZR4_0pjaUVw_bBqm_BJt";
                      setSupabaseUrlInput(u);
                      setSupabaseKeyInput(k);
                      saveSupabaseCredentials(u, k);
                      setSandboxModeEnforced(false);
                      setSandboxEnforced(false);
                      setIsSavedSuccessfully(true);
                      setTimeout(() => setIsSavedSuccessfully(false), 2000);
                      onConfigReload();
                    }}
                    className="w-full text-left p-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/30 text-slate-300 flex items-center justify-between transition-all"
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold text-cyan-400 font-mono text-[10px]">Reef A:</span>{" "}
                      cctobgbyxjfabksnokbe
                    </div>
                    <span className="text-[9px] bg-cyan-950/80 text-cyan-400 px-1 rounded font-mono border border-cyan-500/20">LOAD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const u = "https://mkgnyarwiscttobnytin.supabase.co";
                      const k = "sb_publishable_Jp0Laxs-KoieNMD5hqLA0w_jCnrxATm";
                      setSupabaseUrlInput(u);
                      setSupabaseKeyInput(k);
                      saveSupabaseCredentials(u, k);
                      setSandboxModeEnforced(false);
                      setSandboxEnforced(false);
                      setIsSavedSuccessfully(true);
                      setTimeout(() => setIsSavedSuccessfully(false), 2000);
                      onConfigReload();
                    }}
                    className="w-full text-left p-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/30 text-slate-300 flex items-center justify-between transition-all"
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold text-teal-400 font-mono text-[10px]">Reef B:</span>{" "}
                      mkgnyarwiscttobnytin
                    </div>
                    <span className="text-[9px] bg-teal-950/80 text-teal-400 px-1 rounded font-mono border border-teal-500/20">LOAD</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-3 pt-1 border-t border-cyan-950/40">
                <p className="text-[10px] text-slate-405 leading-relaxed font-sans">
                  Paste your custom Supabase URL and Anon key credentials below. The tracker will connect to your real-time PostgreSQL database immediately!
                </p>
                
                <div className="space-y-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-1">VITE_SUPABASE_URL</span>
                    <input
                      type="url"
                      required
                      placeholder="https://your-project.supabase.co"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-1">VITE_SUPABASE_ANON_KEY / PUBLISHABLE_KEY</span>
                    <input
                      type="password"
                      required
                      placeholder="sb_publishable_... or eyJhbGciOi..."
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 gap-2">
                  <button
                    type="button"
                    onClick={handleResetToMock}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded border border-slate-800 text-[10px] transition-all cursor-pointer"
                  >
                    Clear & Reset
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-[10px] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Save Credentials
                  </button>
                </div>
              </form>

              {isSavedSuccessfully && (
                <div className="text-[10px] text-emerald-400 bg-emerald-950/40 p-1 rounded text-center border border-emerald-900/30 animate-pulse font-sans">
                  Success! Database instance credentials connected.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stream Filters */}
      <div className="p-2.5 bg-slate-950/40 border-b border-cyan-950/30 flex gap-1 flex-wrap overflow-x-auto">
        {(['all', 'deploy', 'payment', 'sync', 'error'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-2 py-1 text-[10px] font-mono rounded uppercase tracking-wider border cursor-pointer transition-all ${
              filter === type
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {type === 'all' && '● '}
            {type}
          </button>
        ))}
      </div>

      {/* Live Stream Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/20 relative">
        <AnimatePresence initial={false}>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-mono text-xs">
              No wave events match this filter yet.
            </div>
          ) : (
            filteredEvents.map((item) => {
              const isExpanded = expandedEventId === item.id;
              const formattedTime = new Date(item.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  layout
                  className={`p-3 bg-slate-900/80 border rounded-lg transition-all ${
                    item.type === 'error'
                      ? 'border-rose-950 hover:bg-rose-950/10'
                      : 'border-slate-800/80 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Time Indicator */}
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5 shrink-0 select-none">
                      {formattedTime}
                    </div>

                    {/* Metadata Icon Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono border uppercase tracking-wider font-semibold shrink-0 ${getEventBadgeClass(
                            item.type
                          )}`}
                        >
                          {item.type}
                        </span>
                        {item.metadata?.env && (
                          <span className="text-[8px] bg-slate-950 border border-slate-800 text-slate-400 px-1 rounded font-mono">
                            {item.metadata.env}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 font-sans leading-relaxed select-text font-medium select-all">
                        {item.message}
                      </p>

                      {/* Expansion trigger */}
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="mt-2 text-right">
                          <button
                            onClick={() => setExpandedEventId(isExpanded ? null : item.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-500 hover:text-cyan-400 cursor-pointer"
                          >
                            {isExpanded ? (
                              <>
                                Hide Payload <ChevronUp className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                View Payload <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Expanded Meta-JSON panel */}
                      <AnimatePresence>
                        {isExpanded && item.metadata && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-950 border border-cyan-950 rounded p-2.5 mt-2 overflow-hidden text-[10px] font-mono text-cyan-400 space-y-1 max-h-48 overflow-y-auto"
                          >
                            <div className="text-slate-500 text-[9px] uppercase tracking-wider pb-1.5 border-b border-cyan-950/40 mb-1.5 flex justify-between">
                              <span>Metadata Payload</span>
                              <span>JSON</span>
                            </div>
                            {Object.entries(item.metadata).map(([key, val]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-slate-500 select-none">{key}:</span>
                                <span className="text-slate-300 break-all select-all">
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Simulation Desk */}
      <div className="p-3 bg-slate-950 border-t border-cyan-950/50 space-y-3">
        <div className="flex items-center gap-1 pb-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest font-semibold">Wave Generator</span>
        </div>

        {/* Simulated quick buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => handleSimulate('deploy')}
            className="p-1 px-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-cyan-400 hover:text-cyan-300 rounded cursor-pointer text-[10px] font-mono uppercase text-center truncate"
            title="Deploy Event"
          >
            + Deploy
          </button>
          <button
            onClick={() => handleSimulate('payment')}
            className="p-1 px-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded cursor-pointer text-[10px] font-mono uppercase text-center truncate"
            title="Checkout completed payment webhook"
          >
            + Checkout
          </button>
          <button
            onClick={() => handleSimulate('sync')}
            className="p-1 px-1.5 bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-violet-400 hover:text-violet-300 rounded cursor-pointer text-[10px] font-mono uppercase text-center truncate"
            title="Sync Event"
          >
            + Git Sync
          </button>
          <button
            onClick={() => handleSimulate('error')}
            className="p-1 px-1.5 bg-slate-900 border border-slate-800 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 rounded cursor-pointer text-[10px] font-mono uppercase text-center truncate"
            title="Error exception log"
          >
            + Warning
          </button>
        </div>

        {/* Custom manual event trigger bar */}
        <form onSubmit={handleCustomSubmit} className="flex gap-1.5 border-t border-cyan-950/30 pt-2 bg-slate-950">
          <select
            value={customType}
            onChange={(e) => setCustomType(e.target.value as LogEvent['type'])}
            className="bg-slate-900 text-slate-300 font-mono text-xs border border-slate-800 rounded p-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="deploy">DEPLOY</option>
            <option value="payment">PAYMENT</option>
            <option value="sync">SYNC</option>
            <option value="error">ERROR</option>
          </select>
          <div className="flex-1 relative flex">
            <input
              type="text"
              placeholder="Inject custom log wave message..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-l p-1.5 px-2 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
            />
            <button
              type="submit"
              className="px-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 border border-cyan-700 font-bold rounded-r flex items-center justify-center transition-all cursor-pointer"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
