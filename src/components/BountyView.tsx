import { Technique } from '../types';
import { DollarSign, ExternalLink, Award, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  techniques: Technique[];
  onTechniqueClick: (id: string) => void;
}

export function BountyView({ techniques, onTechniqueClick }: Props) {
  const submittedTechniques = techniques.filter(t => t.bounty && t.bounty.status !== 'Not Submitted');
  
  const totalAwarded = submittedTechniques
    .filter(t => t.bounty?.status === 'Awarded')
    .reduce((sum, t) => sum + (t.bounty?.amount || 0), 0);

  const pendingCount = submittedTechniques.filter(t => t.bounty?.status === 'Pending').length;
  const awardedCount = submittedTechniques.filter(t => t.bounty?.status === 'Awarded').length;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-accent flex items-center gap-3">
          <DollarSign className="w-6 h-6" /> Bounty Tracker
        </h2>
        <p className="text-text-secondary mt-2 text-sm">
          Track your bug bounty submissions, statuses, and earnings across all your techniques.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-surface border border-border-default rounded-lg p-5">
          <div className="text-text-dim text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" /> Total Earned
          </div>
          <div className="text-3xl font-mono text-accent">
            ${totalAwarded.toLocaleString()}
          </div>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-lg p-5">
          <div className="text-text-dim text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-status-partial" /> Pending Submissions
          </div>
          <div className="text-3xl font-mono text-status-partial">
            {pendingCount}
          </div>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-lg p-5">
          <div className="text-text-dim text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-text-primary" /> Reports Rewarded
          </div>
          <div className="text-3xl font-mono text-text-primary">
             {awardedCount} <span className="text-sm text-text-dim font-sans ml-1">/ {submittedTechniques.length} total</span>
          </div>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-elevated border-b border-border-default">
              <tr>
                <th className="px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Technique</th>
                <th className="px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider w-32">Status</th>
                <th className="px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Program</th>
                <th className="px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider text-right w-32">Amount</th>
                <th className="px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              <AnimatePresence>
                {submittedTechniques.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-text-dim text-sm border-dashed border-border-default">
                      No techniques submitted for bounties yet. Update the bounty status inside a technique.
                    </td>
                  </tr>
                ) : (
                  submittedTechniques.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(t => {
                    const b = t.bounty!;
                    const statusColors = {
                      Pending: 'text-status-partial bg-status-partial/10 border-status-partial/20',
                      Awarded: 'text-status-confirmed bg-status-confirmed/10 border-status-confirmed/20',
                      Rejected: 'text-status-patched bg-status-patched/10 border-status-patched/20',
                      'Not Submitted': ''
                    };
                    const color = statusColors[b.status as keyof typeof statusColors];

                    return (
                      <motion.tr 
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-bg-elevated transition-colors group cursor-pointer"
                        onClick={() => onTechniqueClick(t.id)}
                      >
                        <td className="px-4 py-3 font-medium text-text-primary">
                          <div className="line-clamp-1">{t.name || 'Untitled Technique'}</div>
                          <div className="text-xs text-text-dim mt-0.5 font-mono">{t.severity}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border inline-block ${color}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {b.program || '-'}
                        </td>
                        <td className="px-4 py-3 font-mono text-right text-text-primary">
                          {b.status === 'Awarded' && b.amount > 0 ? `$${b.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ExternalLink className="w-4 h-4 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity inline-block" />
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
