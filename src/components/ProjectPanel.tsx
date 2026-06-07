import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, Repo } from '../types';
import { Search, FolderGit2, Plus, RefreshCw, Layers, Radio, Globe, GitBranch, Terminal, ShieldAlert } from 'lucide-react';

interface ProjectPanelProps {
  projects: Project[];
  repos: Repo[];
  onAddProject: (name: string, gitUrl: string, branch: string) => void;
  onToggleStatus: (id: string) => void;
  onSyncProject: (projectId: string) => void;
}

export default function ProjectPanel({
  projects,
  repos,
  onAddProject,
  onToggleStatus,
  onSyncProject,
}: ProjectPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newGitUrl, setNewGitUrl] = useState('');
  const [newBranch, setNewBranch] = useState('main');
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.repo_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !newGitUrl) return;
    onAddProject(newProjectName, newGitUrl, newBranch);
    setNewProjectName('');
    setNewGitUrl('');
    setNewBranch('main');
    setShowAddNew(false);
  };

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      projects.forEach((p) => onSyncProject(p.id));
      setIsSyncingAll(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-cyan-950/60 rounded-xl overflow-hidden shadow-2xl shadow-cyan-950/20">
      {/* Panel Header */}
      <div className="p-4 bg-slate-900/90 border-b border-cyan-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-tr from-cyan-600/20 to-teal-600/10 rounded-lg border border-cyan-500/30 text-cyan-400">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-slate-100 tracking-tight text-base">Reef Storage</h2>
            <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">GitHub Repository Map</p>
          </div>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={isSyncingAll}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-md border border-slate-700/60 hover:border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono"
          title="Synchronize all active reefs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-cyan-400' : ''}`} />
          Sync All
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-3 bg-slate-950/40 border-b border-cyan-950/30 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter ocean reefs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-md text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono"
          />
        </div>
        <button
          onClick={() => setShowAddNew(!showAddNew)}
          className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 text-cyan-400 hover:text-cyan-300 rounded-md border border-cyan-500/30 hover:border-cyan-500/50 transition-all text-xs font-mono flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Rig
        </button>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Rigid "Add New Project" Drawer */}
        <AnimatePresence>
          {showAddNew && (
            <motion.form
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              onSubmit={handleSubmit}
              className="p-4 bg-slate-950/80 border border-cyan-500/20 rounded-lg overflow-hidden space-y-3"
            >
              <div className="flex items-center gap-1.5 pb-1 border-b border-cyan-950/50">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">Rig New Coral Base</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Base Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wave-Analytics-Service"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">GitHub Repository URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/..."
                    value={newGitUrl}
                    onChange={(e) => setNewGitUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Branch</label>
                  <input
                    type="text"
                    placeholder="main"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddNew(false)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded text-[11px] border border-slate-800 transition-all cursor-pointer font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded font-semibold text-[11px] transition-all cursor-pointer font-mono"
                >
                  Anchor Project
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Existing Projects List */}
        <div className="space-y-3">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-mono text-xs">
              No ocean projects mapped under current filter.
            </div>
          ) : (
            filteredProjects.map((project) => {
              const repo = repos.find((r) => r.project_id === project.id);
              return (
                <motion.div
                  key={project.id}
                  layoutId={`project-${project.id}`}
                  className="group relative p-3 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/80 hover:border-cyan-950/80 rounded-lg transition-all duration-250 flex flex-col gap-2.5"
                >
                  {/* Status Indicator & Title */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative flex">
                        {project.status === 'active' && (
                          <>
                            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                          </>
                        )}
                        {project.status === 'paused' && (
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        )}
                        {project.status === 'error' && (
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 animate-pulse"></span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-display font-medium text-xs text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Globe className="w-3 h-3 text-slate-600" />
                          <span className="text-[10px] text-slate-500 font-mono select-all truncate max-w-[140px]">
                            {project.repo_url.replace('https://', '')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onToggleStatus(project.id)}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono border cursor-pointer transition-all ${
                          project.status === 'active'
                            ? 'bg-slate-900 text-amber-500 border-amber-950/40 hover:bg-amber-950/20'
                            : 'bg-slate-900 text-cyan-400 border-cyan-950/40 hover:bg-cyan-950/20'
                        }`}
                        title={project.status === 'active' ? 'Pause sync loops' : 'Resume sync loops'}
                      >
                        {project.status === 'active' ? 'PAUSE' : 'DEPLOY'}
                      </button>
                      <button
                        onClick={() => onSyncProject(project.id)}
                        disabled={project.status === 'paused'}
                        className="p-1 bg-slate-900 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-950 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Force Immediate Git Sync"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Git branch & Commit Subtree */}
                  {repo && (
                    <div className="p-2 bg-slate-950 border border-cyan-950/40 rounded space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-cyan-500">
                          <GitBranch className="w-3 h-3" />
                          {repo.branch}
                        </span>
                        <span className="text-slate-600">active</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Terminal className="w-3 h-3 text-slate-600 mt-0.5 flex-none" />
                        <span className="text-[10px] font-mono text-slate-300 line-clamp-2 leading-relaxed">
                          {repo.last_commit}
                        </span>
                      </div>
                    </div>
                  )}

                  {project.status === 'error' && (
                    <div className="p-1.5 bg-rose-950/30 border border-rose-900/40 rounded flex items-center gap-2 text-[10px] text-rose-400 font-mono">
                      <ShieldAlert className="w-3.5 h-3.5 flex-none" />
                      <span>Warning: Connection to GitHub API rate-limited or broken.</span>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-3 bg-slate-950 font-mono border-t border-cyan-950/50 flex align-items text-[10px] text-slate-500 justify-between">
        <span className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          Active Bases: {projects.filter((p) => p.status === 'active').length} / {projects.length}
        </span>
        <span>Reef v1.1.0</span>
      </div>
    </div>
  );
}
