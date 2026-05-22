import { Technique, CATEGORIES, ModelStatus } from '../types';
import { Database, Filter, ShieldAlert, Target, Shield, Cpu, DollarSign } from 'lucide-react';

interface SidebarProps {
  techniques: Technique[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  selectedSeverity: string;
  setSelectedSeverity: (s: string) => void;
  currentView: 'dashboard' | 'vault' | 'models' | 'bounties';
  setCurrentView: (v: 'dashboard' | 'vault' | 'models' | 'bounties') => void;
}

export function Sidebar({ techniques, selectedCategory, setSelectedCategory, selectedStatus, setSelectedStatus, selectedSeverity, setSelectedSeverity, currentView, setCurrentView }: SidebarProps) {
  const statuses: ModelStatus[] = ['Confirmed', 'Partial', 'Patched', 'Untested'];
  const severities = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
  
  const stats = {
    total: techniques.length,
    confirmed: techniques.filter(t => t.models.some(m => m.status === 'Confirmed')).length,
    partial: techniques.filter(t => t.models.some(m => m.status === 'Partial')).length,
    patched: techniques.filter(t => t.models.some(m => m.status === 'Patched')).length,
  };

  return (
    <aside className="w-64 border-r border-border-default bg-bg-surface flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-border-default space-y-2">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors font-semibold ${currentView === 'dashboard' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}
        >
          <Database className="w-4 h-4" /> Dashboard
        </button>
        <button 
          onClick={() => setCurrentView('vault')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors font-semibold ${currentView === 'vault' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}
        >
          <Shield className="w-4 h-4" /> Vault
        </button>
        <button 
          onClick={() => setCurrentView('models')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors font-semibold ${currentView === 'models' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}
        >
          <Cpu className="w-4 h-4" /> Models Setup
        </button>
        <button 
          onClick={() => setCurrentView('bounties')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors font-semibold ${currentView === 'bounties' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}
        >
          <DollarSign className="w-4 h-4" /> Bounty Tracker
        </button>
      </div>

      {currentView === 'vault' && (
        <>
          <div className="p-4 border-b border-border-default">
            <h2 className="text-xs font-semibold text-text-secondary tracking-wider uppercase mb-3 flex items-center gap-2">
              <Database className="w-3 h-3" /> Vault Stats
            </h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-bg-base p-2 rounded border border-border-default">
                <div className="text-text-dim text-xs">Total</div>
                <div className="font-mono text-lg text-text-primary">{stats.total}</div>
              </div>
              <div className="bg-bg-base p-2 rounded border border-border-default">
                <div className="text-text-dim text-xs">Confirmed</div>
                <div className="font-mono text-lg text-status-confirmed">{stats.confirmed}</div>
              </div>
              <div className="bg-bg-base p-2 rounded border border-border-default">
                <div className="text-text-dim text-xs">Partial</div>
                <div className="font-mono text-lg text-status-partial">{stats.partial}</div>
              </div>
              <div className="bg-bg-base p-2 rounded border border-border-default">
                <div className="text-text-dim text-xs">Patched</div>
                <div className="font-mono text-lg text-status-patched">{stats.patched}</div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-text-secondary tracking-wider uppercase mb-3 flex items-center gap-2">
                <Filter className="w-3 h-3" /> Status
              </h2>
              <div className="space-y-1">
                <button 
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${selectedStatus === '' ? 'bg-bg-elevated text-text-primary' : 'text-text-dim hover:text-text-secondary hover:bg-bg-base'}`}
                  onClick={() => setSelectedStatus('')}
                >
                  All Statuses
                </button>
                {statuses.map(s => (
                  <button 
                    key={s}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors flex items-center justify-between ${selectedStatus === s ? 'bg-bg-elevated text-text-primary' : 'text-text-dim hover:text-text-secondary hover:bg-bg-base'}`}
                    onClick={() => setSelectedStatus(s)}
                  >
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-text-secondary tracking-wider uppercase mb-3 flex items-center gap-2">
                <ShieldAlert className="w-3 h-3" /> Severity
              </h2>
              <div className="space-y-1">
                <button 
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${selectedSeverity === '' ? 'bg-bg-elevated text-text-primary' : 'text-text-dim hover:text-text-secondary hover:bg-bg-base'}`}
                  onClick={() => setSelectedSeverity('')}
                >
                  All Severities
                </button>
                {severities.map(s => {
                   const count = techniques.filter(t => t.severity === s).length;
                   if (count === 0 && selectedSeverity !== s) return null;
                   
                   const severityColor = s === 'Critical' ? 'text-red-400' :
                                         s === 'High' ? 'text-orange-400' :
                                         s === 'Medium' ? 'text-yellow-400' :
                                         s === 'Low' ? 'text-blue-400' : 'text-gray-400';

                   return (
                    <button 
                      key={s}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors flex items-center justify-between ${selectedSeverity === s ? `bg-bg-elevated ${severityColor} font-medium` : `text-text-dim hover:${severityColor} hover:bg-bg-base`}`}
                      onClick={() => setSelectedSeverity(s)}
                    >
                      <span>{s}</span>
                      <span className="text-xs font-mono opacity-50">{count}</span>
                    </button>
                   )
                })}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-text-secondary tracking-wider uppercase mb-3 flex items-center gap-2">
                <Target className="w-3 h-3" /> Category
              </h2>
              <div className="space-y-1">
                <button 
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${selectedCategory === '' ? 'bg-bg-elevated text-text-primary' : 'text-text-dim hover:text-text-secondary hover:bg-bg-base'}`}
                  onClick={() => setSelectedCategory('')}
                >
                  All Categories
                </button>
                {CATEGORIES.map(c => {
                   const count = techniques.filter(t => t.category === c).length;
                   if (count === 0 && selectedCategory !== c) return null;
                   return (
                    <button 
                      key={c}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors flex items-center justify-between ${selectedCategory === c ? 'bg-bg-elevated text-text-primary' : 'text-text-dim hover:text-text-secondary hover:bg-bg-base'}`}
                      onClick={() => setSelectedCategory(c)}
                    >
                      <span className="truncate pr-2">{c}</span>
                      <span className="text-xs font-mono opacity-50">{count}</span>
                    </button>
                   )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
