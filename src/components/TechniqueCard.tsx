import React, { useState } from 'react';
import { Technique } from '../types';
import { Shield, ShieldAlert, ShieldCheck, ShieldEllipsis, Trash2, DollarSign, FileDown } from 'lucide-react';
import { exportPDFWithImages } from '../utils/export';

interface Props {
  technique: Technique;
  onClick: () => void;
  onDelete: () => void;
}

export function TechniqueCard({ technique, onClick, onDelete }: Props) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const getWorstStatus = () => {
    if (technique.models.length === 0) return 'Untested';
    if (technique.models.some(m => m.status === 'Confirmed')) return 'Confirmed';
    if (technique.models.some(m => m.status === 'Partial')) return 'Partial';
    if (technique.models.every(m => m.status === 'Patched')) return 'Patched';
    return 'Untested';
  };

  const status = getWorstStatus();
  
  const statusConfig = {
    Confirmed: { color: 'text-status-confirmed', bg: 'bg-status-confirmed/10', border: 'border-status-confirmed/20', icon: ShieldAlert },
    Partial: { color: 'text-status-partial', bg: 'bg-status-partial/10', border: 'border-status-partial/20', icon: ShieldEllipsis },
    Patched: { color: 'text-status-patched', bg: 'bg-status-patched/10', border: 'border-status-patched/20', icon: ShieldCheck },
    Untested: { color: 'text-status-untested', bg: 'bg-bg-elevated', border: 'border-border-default', icon: Shield }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Untested;
  const StatusIcon = config.icon;

  const severityColors = {
    Critical: 'text-red-400 border-red-400/20 bg-red-400/10',
    High: 'text-orange-400 border-orange-400/20 bg-orange-400/10',
    Medium: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10',
    Low: 'text-blue-400 border-blue-400/20 bg-blue-400/10',
    Informational: 'text-gray-400 border-gray-400/20 bg-gray-400/10',
  };

  return (
    <div 
      className="group relative bg-bg-surface border border-border-default rounded-lg p-4 hover:border-border-active hover:-translate-y-[2px] transition-all cursor-pointer shadow-[0_0_0_1px_var(--color-border-default)] hover:shadow-[0_0_0_1px_var(--color-border-active),0_0_12px_rgba(62,207,120,0.08)] flex flex-col h-full"
      onClick={onClick}
    >
      {isConfirmingDelete ? (
        <div 
          className="absolute top-3 right-3 flex items-center gap-1 bg-bg-elevated border border-border-active rounded p-1 shadow-lg z-10" 
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <span className="text-xs text-text-primary px-1 font-semibold">Delete?</span>
          <button 
            className="text-xs text-bg-base bg-status-patched hover:bg-red-500 font-semibold px-2 py-0.5 rounded transition-colors" 
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(); }}
          >
            Yes
          </button>
          <button 
            className="text-xs text-text-secondary hover:text-text-primary hover:bg-bg-surface px-2 py-0.5 rounded transition-colors" 
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsConfirmingDelete(false); }}
          >
            No
          </button>
        </div>
      ) : (
        <button 
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsConfirmingDelete(true); }}
          className="absolute top-3 right-3 text-text-dim hover:text-status-patched opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-bg-elevated z-10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start justify-between mb-3 pr-8">
        <h3 className="font-semibold text-text-primary text-base line-clamp-1" title={technique.name}>
          {technique.name || 'Untitled'}
        </h3>
      </div>
      
      <p className="text-sm text-text-secondary line-clamp-2 mb-4 min-h-[40px] flex-1">
        {technique.description || <span className="italic opacity-50">No description</span>}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-border-default/50">
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${config.bg} ${config.color} ${config.border} flex items-center gap-1.5 shrink-0`}>
          <StatusIcon className="w-3 h-3" />
          {status}
        </span>
        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-bg-elevated border border-border-default rounded text-text-secondary shrink-0">
          {technique.category}
        </span>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${severityColors[technique.severity]}`}>
          {technique.severity}
        </span>
        
        <div className="ml-auto flex items-center gap-2">
          {technique.bounty && (
            <span className={`flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              technique.bounty.status === 'Awarded' ? 'bg-status-confirmed/10 text-status-confirmed border-status-confirmed/20' : 
              technique.bounty.status === 'Pending' ? 'bg-status-partial/10 text-status-partial border-status-partial/20' : 
              technique.bounty.status === 'Rejected' ? 'bg-status-patched/10 text-status-patched border-status-patched/20' : 
              'bg-bg-elevated text-text-dim border-border-default'
            }`}>
              <DollarSign className="w-3 h-3" />
              {technique.bounty.status === 'Awarded' 
                ? (technique.bounty.amount === 0 ? 'AWARDED' : technique.bounty.amount) 
                : technique.bounty.status === 'Not Submitted' ? 'NOT SUBMITTED' : technique.bounty.status.toUpperCase()}
            </span>
          )}
          {technique.models.length > 0 && (
            <span className="text-[10px] text-text-dim font-mono shrink-0">
              {technique.models.length} {technique.models.length === 1 ? 'm' : 'm'}
            </span>
          )}
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setIsExporting(true);
              exportPDFWithImages(technique).finally(() => setIsExporting(false));
            }}
            disabled={isExporting}
            className="text-text-dim hover:text-status-confirmed opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-bg-elevated disabled:opacity-50"
            title="Export as PDF"
          >
            <FileDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

  );
}
