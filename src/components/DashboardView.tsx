import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, CartesianGrid, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line,
  Treemap
} from 'recharts';
import { Technique, CATEGORIES, VECTORS } from '../types';
import {
  ShieldAlert, Target, Cpu, Activity, TrendingUp, Clock, Zap,
  BarChart3, PieChart as PieIcon, GitBranch, Tag, AlertTriangle,
  ChevronDown, ChevronUp, DollarSign, Eye, Layers, Grid3X3
} from 'lucide-react';

interface DashboardViewProps {
  techniques: Technique[];
}

/* ─── Grafana-style Panel wrapper ─────────────────────────────────── */
function Panel({ title, icon, children, span = 1, className = '' }: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  span?: 1 | 2 | 3;
  className?: string;
}): any {
  const colSpan = span === 3 ? 'lg:col-span-3' : span === 2 ? 'lg:col-span-2' : '';
  return (
    <div className={`bg-bg-surface border border-border-default rounded-lg flex flex-col ${colSpan} ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-default">
        {icon && <span className="text-accent opacity-70">{icon}</span>}
        <h3 className="text-xs font-semibold tracking-wider uppercase text-text-secondary">{title}</h3>
      </div>
      <div className="flex-1 p-4 min-h-0">
        {children}
      </div>
    </div>
  );
}

/* ─── Stat Card ───────────────────────────────────────────────────── */
function StatCard({ label, value, sub, color, icon }: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-bg-surface border border-border-default rounded-lg p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">{label}</span>
        {icon && <span className="text-text-dim opacity-60">{icon}</span>}
      </div>
      <span className={`text-2xl font-mono font-bold ${color || 'text-text-primary'}`}>{value}</span>
      {sub && <span className="text-[10px] text-text-dim">{sub}</span>}
    </div>
  );
}

/* ─── Tooltip style ───────────────────────────────────────────────── */
const tooltipStyle = {
  contentStyle: { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: 6, fontSize: 12 },
  itemStyle: { color: '#f8fafc' },
  cursor: { fill: '#334155', opacity: 0.3 },
};

/* ─── Color Palettes ──────────────────────────────────────────────── */
const SEVERITY_COLORS: Record<string, string> = {
  'Critical': '#ef4444',
  'High': '#fb923c',
  'Medium': '#facc15',
  'Low': '#60a5fa',
  'Informational': '#9ca3af',
};

const CATEGORY_COLORS = [
  '#A58CF2', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#6366f1',
  '#d946ef', '#f472b6', '#84cc16',
];

const STATUS_COLORS: Record<string, string> = {
  'Confirmed': '#10B981',
  'Partial': '#F59E0B',
  'Patched': '#EF4444',
  'Untested': '#5E5676',
};

const BOUNTY_COLORS: Record<string, string> = {
  'Awarded': '#10B981',
  'Pending': '#F59E0B',
  'Rejected': '#EF4444',
  'Not Submitted': '#5E5676',
};

export function DashboardView({ techniques }: DashboardViewProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');

  // ── Filter by time range ──────────────────────────────────────────
  const filteredTechniques = useMemo(() => {
    if (timeRange === 'all') return techniques;
    const now = Date.now();
    const ms = timeRange === '7d' ? 7 * 86400000 : timeRange === '30d' ? 30 * 86400000 : 90 * 86400000;
    return techniques.filter(t => now - new Date(t.createdAt).getTime() < ms);
  }, [techniques, timeRange]);

  // ── Stat Counters ─────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = filteredTechniques.length;
    const critical = filteredTechniques.filter(t => t.severity === 'Critical').length;
    const high = filteredTechniques.filter(t => t.severity === 'High').length;
    const confirmed = filteredTechniques.filter(t => t.models.some(m => m.status === 'Confirmed')).length;
    const modelsAffected = new Set(filteredTechniques.flatMap(t => t.models.filter(m => m.status === 'Confirmed').map(m => m.name))).size;
    const totalBounty = filteredTechniques.reduce((sum, t) => sum + (t.bounty?.status === 'Awarded' ? (t.bounty?.amount || 0) : 0), 0);
    const avgSeverityScore = total === 0 ? 0 : filteredTechniques.reduce((sum, t) => {
      const scoreMap: Record<string, number> = { Critical: 5, High: 4, Medium: 3, Low: 2, Informational: 1 };
      return sum + (scoreMap[t.severity] || 0);
    }, 0) / total;
    const uniqueVectors = new Set(filteredTechniques.map(t => t.vector)).size;
    const uniqueCategories = new Set(filteredTechniques.map(t => t.category)).size;
    return { total, critical, high, confirmed, modelsAffected, totalBounty, avgSeverityScore, uniqueVectors, uniqueCategories };
  }, [filteredTechniques]);

  // ── Severity Distribution ─────────────────────────────────────────
  const severityData = useMemo(() => {
    const severities = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
    const counts: Record<string, number> = {};
    severities.forEach(s => counts[s] = 0);
    filteredTechniques.forEach(t => {
      if (counts[t.severity] !== undefined) counts[t.severity]++;
    });
    return severities.map(s => ({ name: s, count: counts[s] })).filter(item => item.count > 0);
  }, [filteredTechniques]);

  // ── Category Distribution ─────────────────────────────────────────
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach(c => counts[c] = 0);
    filteredTechniques.forEach(t => {
      if (counts[t.category] !== undefined) counts[t.category]++;
      else counts['Other'] = (counts['Other'] || 0) + 1;
    });
    return CATEGORIES.map(c => ({ name: c, count: counts[c] }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [filteredTechniques]);

  // ── Attack Vector Distribution ────────────────────────────────────
  const vectorData = useMemo(() => {
    const counts: Record<string, number> = {};
    VECTORS.forEach(v => counts[v] = 0);
    filteredTechniques.forEach(t => {
      if (counts[t.vector] !== undefined) counts[t.vector]++;
    });
    return VECTORS.map(v => ({ name: v, count: counts[v], fullMark: filteredTechniques.length }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [filteredTechniques]);

  // ── Model Status Breakdown ────────────────────────────────────────
  const modelStatusData = useMemo(() => {
    const counts: Record<string, number> = { Confirmed: 0, Partial: 0, Patched: 0, Untested: 0 };
    filteredTechniques.forEach(t => {
      t.models.forEach(m => {
        if (counts[m.status] !== undefined) counts[m.status]++;
      });
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).filter(d => d.count > 0);
  }, [filteredTechniques]);

  // ── Model Vulnerability Ranking ───────────────────────────────────
  const modelRanking = useMemo(() => {
    const modelMap: Record<string, { confirmed: number; partial: number; patched: number; total: number }> = {};
    filteredTechniques.forEach(t => {
      t.models.forEach(m => {
        if (!modelMap[m.name]) modelMap[m.name] = { confirmed: 0, partial: 0, patched: 0, total: 0 };
        modelMap[m.name].total++;
        if (m.status === 'Confirmed') modelMap[m.name].confirmed++;
        else if (m.status === 'Partial') modelMap[m.name].partial++;
        else if (m.status === 'Patched') modelMap[m.name].patched++;
      });
    });
    return Object.entries(modelMap)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.confirmed - a.confirmed)
      .slice(0, 15);
  }, [filteredTechniques]);

  // ── Timeline / Activity Sparkline ─────────────────────────────────
  const timelineData = useMemo(() => {
    if (filteredTechniques.length === 0) return [];
    const byDate: Record<string, { added: number; critical: number; high: number }> = {};
    filteredTechniques.forEach(t => {
      const date = new Date(t.createdAt).toISOString().slice(0, 10);
      if (!byDate[date]) byDate[date] = { added: 0, critical: 0, high: 0 };
      byDate[date].added++;
      if (t.severity === 'Critical') byDate[date].critical++;
      if (t.severity === 'High') byDate[date].high++;
    });
    return Object.entries(byDate)
      .map(([date, d]) => ({ date, ...d }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTechniques]);

  // ── Cumulative Growth ─────────────────────────────────────────────
  const cumulativeData = useMemo(() => {
    if (timelineData.length === 0) return [];
    let cum = 0;
    return timelineData.map(d => {
      cum += d.added;
      return { date: d.date, total: cum };
    });
  }, [timelineData]);

  // ── Bounty Breakdown ──────────────────────────────────────────────
  const bountyData = useMemo(() => {
    const counts: Record<string, number> = { Awarded: 0, Pending: 0, Rejected: 0, 'Not Submitted': 0 };
    filteredTechniques.forEach(t => {
      const st = t.bounty?.status || 'Not Submitted';
      if (counts[st] !== undefined) counts[st]++;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).filter(d => d.count > 0);
  }, [filteredTechniques]);

  // ── Top Tags ──────────────────────────────────────────────────────
  const tagData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTechniques.forEach(t => {
      t.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [filteredTechniques]);

  // ── Severity × Category Heatmap Data ──────────────────────────────
  const heatmapData = useMemo(() => {
    const severities: string[] = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
    const usedCategories = [...new Set(filteredTechniques.map(t => t.category))] as string[];
    const matrix: { category: string; severity: string; count: number }[] = [];
    usedCategories.forEach(cat => {
      severities.forEach(sev => {
        const count = filteredTechniques.filter(t => (t.category as string) === cat && (t.severity as string) === sev).length;
        if (count > 0) matrix.push({ category: cat, severity: sev, count });
      });
    });
    return { matrix, categories: usedCategories, severities };
  }, [filteredTechniques]);

  // ── Recent Activity Feed ──────────────────────────────────────────
  const recentActivity = useMemo(() => {
    return [...filteredTechniques]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8);
  }, [filteredTechniques]);

  // ── Treemap for categories ────────────────────────────────────────
  const treemapData = useMemo(() => {
    return categoryData.map((d, i) => ({
      name: d.name,
      size: d.count,
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
  }, [categoryData]);

  // ── Severity over time stacked ────────────────────────────────────
  const severityTimeData = useMemo(() => {
    if (filteredTechniques.length === 0) return [];
    const byDate: Record<string, Record<string, number>> = {};
    filteredTechniques.forEach(t => {
      const date = new Date(t.createdAt).toISOString().slice(0, 10);
      if (!byDate[date]) byDate[date] = { Critical: 0, High: 0, Medium: 0, Low: 0, Informational: 0 };
      if (byDate[date][t.severity] !== undefined) byDate[date][t.severity]++;
    });
    return Object.entries(byDate)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTechniques]);

  const renderEmpty = (msg: string) => (
    <div className="flex items-center justify-center h-full text-text-dim text-xs">{msg}</div>
  );

  const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, name, fill } = props;
    if (width < 40 || height < 25) return null;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#0B0914" strokeWidth={2} rx={4} />
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={width < 80 ? 9 : 11} fontWeight="bold">
          {name && name.length > 12 ? name.slice(0, 10) + '…' : name}
        </text>
        <text x={x + width / 2} y={y + height / 2 + 14} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.6)" fontSize={9}>
          {props.size}
        </text>
      </g>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-accent" /> Dashboard Overview
          </h2>
          <p className="text-xs text-text-dim mt-1">
            {filteredTechniques.length} technique{filteredTechniques.length !== 1 ? 's' : ''} tracked
            {timeRange !== 'all' && ` (last ${timeRange.replace('d', ' days')})`}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-bg-elevated border border-border-default rounded-md p-0.5">
          {(['7d', '30d', '90d', 'all'] as const).map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                timeRange === r
                  ? 'bg-accent/20 text-accent'
                  : 'text-text-dim hover:text-text-secondary'
              }`}
            >
              {r === 'all' ? 'All' : r.replace('d', 'D')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Row 1: Stat Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Techniques" value={stats.total} icon={<Layers className="w-3.5 h-3.5" />} color="text-accent" />
        <StatCard label="Critical" value={stats.critical} icon={<AlertTriangle className="w-3.5 h-3.5" />} color="text-red-400" sub={stats.total > 0 ? `${((stats.critical / stats.total) * 100).toFixed(0)}% of total` : ''} />
        <StatCard label="High" value={stats.high} icon={<ShieldAlert className="w-3.5 h-3.5" />} color="text-orange-400" sub={stats.total > 0 ? `${((stats.high / stats.total) * 100).toFixed(0)}% of total` : ''} />
        <StatCard label="Confirmed Vulns" value={stats.confirmed} icon={<Zap className="w-3.5 h-3.5" />} color="text-status-confirmed" sub={`${stats.modelsAffected} model${stats.modelsAffected !== 1 ? 's' : ''} affected`} />
        <StatCard label="Bounties Earned" value={`$${stats.totalBounty.toLocaleString()}`} icon={<DollarSign className="w-3.5 h-3.5" />} color="text-accent" />
      </div>

      {/* ── Row 2: Secondary Stats ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Avg Severity Score" value={stats.avgSeverityScore.toFixed(1)} sub="out of 5.0" icon={<Activity className="w-3.5 h-3.5" />} color={stats.avgSeverityScore >= 4 ? 'text-red-400' : stats.avgSeverityScore >= 3 ? 'text-yellow-400' : 'text-blue-400'} />
        <StatCard label="Unique Vectors" value={stats.uniqueVectors} icon={<GitBranch className="w-3.5 h-3.5" />} color="text-text-primary" sub={`of ${VECTORS.length} possible`} />
        <StatCard label="Categories Used" value={stats.uniqueCategories} icon={<Grid3X3 className="w-3.5 h-3.5" />} color="text-text-primary" sub={`of ${CATEGORIES.length} total`} />
        <StatCard label="Models Tested" value={new Set(filteredTechniques.flatMap(t => t.models.map(m => m.name))).size} icon={<Cpu className="w-3.5 h-3.5" />} color="text-text-primary" sub={`${stats.modelsAffected} vulnerable`} />
      </div>

      {/* ── Row 3: Main Charts ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Severity Donut */}
        <Panel title="Severity Distribution" icon={<ShieldAlert className="w-3.5 h-3.5" />}>
          {severityData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`sev-${index}`} fill={SEVERITY_COLORS[entry.name] || '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : renderEmpty('No severity data')}
        </Panel>

        {/* Model Status Donut */}
        <Panel title="Model Test Results" icon={<Cpu className="w-3.5 h-3.5" />}>
          {modelStatusData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {modelStatusData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : renderEmpty('No model data')}
        </Panel>

        {/* Bounty Status Donut */}
        <Panel title="Bounty Status" icon={<DollarSign className="w-3.5 h-3.5" />}>
          {bountyData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bountyData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {bountyData.map((entry, index) => (
                      <Cell key={`bounty-${index}`} fill={BOUNTY_COLORS[entry.name] || '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : renderEmpty('No bounty data')}
        </Panel>
      </div>

      {/* ── Row 4: Bar + Area ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Bar Chart */}
        <Panel title="Techniques by Category" icon={<Target className="w-3.5 h-3.5" />} span={2}>
          {categoryData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-45} textAnchor="end" interval={0} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : renderEmpty('No category data')}
        </Panel>

        {/* Cumulative Growth */}
        <Panel title="Growth Over Time" icon={<TrendingUp className="w-3.5 h-3.5" />}>
          {cumulativeData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradCum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A58CF2" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#A58CF2" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-30} textAnchor="end" />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="total" stroke="#A58CF2" strokeWidth={2} fill="url(#gradCum)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : renderEmpty('No timeline data')}
        </Panel>
      </div>

      {/* ── Row 5: Radar + Stacked Severity ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attack Vector Radar */}
        <Panel title="Attack Vector Radar" icon={<GitBranch className="w-3.5 h-3.5" />}>
          {vectorData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={vectorData.slice(0, 8)}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <PolarRadiusAxis tick={{ fill: '#5E5676', fontSize: 9 }} />
                  <Radar name="Count" dataKey="count" stroke="#A58CF2" fill="#A58CF2" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip {...tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : renderEmpty('No vector data')}
        </Panel>

        {/* Severity Over Time Stacked Area */}
        <Panel title="Severity Breakdown Over Time" icon={<Activity className="w-3.5 h-3.5" />} span={2}>
          {severityTimeData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={severityTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-30} textAnchor="end" />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="Critical" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="High" stackId="1" stroke="#fb923c" fill="#fb923c" fillOpacity={0.5} />
                  <Area type="monotone" dataKey="Medium" stackId="1" stroke="#facc15" fill="#facc15" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="Low" stackId="1" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="Informational" stackId="1" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.2} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : renderEmpty('No timeline data')}
        </Panel>
      </div>

      {/* ── Row 6: Model Ranking + Category Treemap ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Model Vulnerability Ranking */}
        <Panel title="Model Vulnerability Ranking" icon={<Cpu className="w-3.5 h-3.5" />} span={2}>
          {modelRanking.length > 0 ? (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelRanking} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} width={120} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="confirmed" stackId="a" fill="#10B981" name="Confirmed" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="partial" stackId="a" fill="#F59E0B" name="Partial" />
                  <Bar dataKey="patched" stackId="a" fill="#EF4444" name="Patched" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : renderEmpty('No model data')}
        </Panel>

        {/* Category Treemap */}
        <Panel title="Category Proportions" icon={<Layers className="w-3.5 h-3.5" />}>
          {treemapData.length > 0 ? (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#0B0914"
                  content={<CustomTreemapContent />}
                />
              </ResponsiveContainer>
            </div>
          ) : renderEmpty('No category data')}
        </Panel>
      </div>

      {/* ── Row 7: Attack Vector Bar + Tags ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attack Vectors Horizontal Bar */}
        <Panel title="Attack Vectors Breakdown" icon={<GitBranch className="w-3.5 h-3.5" />} span={2}>
          {vectorData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vectorData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} width={140} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {vectorData.map((_entry, index) => (
                      <Cell key={`vec-${index}`} fill={CATEGORY_COLORS[(index + 3) % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : renderEmpty('No vector data')}
        </Panel>

        {/* Tag Cloud */}
        <Panel title="Top Tags" icon={<Tag className="w-3.5 h-3.5" />}>
          {tagData.length > 0 ? (
            <div className="flex flex-wrap gap-2 content-start">
              {tagData.map((tag, i) => {
                const maxCount = tagData[0].count;
                const intensity = Math.max(0.3, tag.count / maxCount);
                return (
                  <span
                    key={tag.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border-default text-xs font-mono transition-colors hover:border-accent/40"
                    style={{ opacity: 0.5 + intensity * 0.5, backgroundColor: `rgba(165, 140, 242, ${intensity * 0.15})` }}
                  >
                    <span className="text-accent">#</span>
                    <span className="text-text-secondary">{tag.name}</span>
                    <span className="text-text-dim text-[10px]">({tag.count})</span>
                  </span>
                );
              })}
            </div>
          ) : renderEmpty('No tags found')}
        </Panel>
      </div>

      {/* ── Row 8: Risk Matrix Heatmap ──────────────────────────── */}
      <Panel title="Risk Matrix — Severity × Category" icon={<Grid3X3 className="w-3.5 h-3.5" />} span={3}>
        {heatmapData.matrix.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2 text-text-dim font-semibold uppercase tracking-wider">Category</th>
                  {heatmapData.severities.map(s => (
                    <th key={s} className="text-center px-3 py-2 font-semibold uppercase tracking-wider" style={{ color: SEVERITY_COLORS[s] }}>
                      {s}
                    </th>
                  ))}
                  <th className="text-center px-3 py-2 text-text-dim font-semibold uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.categories.map(cat => {
                  const total = heatmapData.severities.reduce((sum, sev) => {
                    return sum + (heatmapData.matrix.find(m => m.category === cat && m.severity === sev)?.count || 0);
                  }, 0);
                  return (
                    <tr key={cat} className="border-t border-border-default hover:bg-bg-elevated/50 transition-colors">
                      <td className="px-3 py-2.5 text-text-secondary font-medium">{cat}</td>
                      {heatmapData.severities.map(sev => {
                        const cell = heatmapData.matrix.find(m => m.category === cat && m.severity === sev);
                        const count = cell?.count || 0;
                        const maxCount = Math.max(...heatmapData.matrix.map(m => m.count));
                        const intensity = count > 0 ? Math.max(0.15, count / maxCount) : 0;
                        return (
                          <td key={sev} className="text-center px-3 py-2.5">
                            {count > 0 ? (
                              <span
                                className="inline-flex items-center justify-center w-8 h-8 rounded font-mono font-bold text-xs"
                                style={{
                                  backgroundColor: `${SEVERITY_COLORS[sev]}${Math.round(intensity * 50).toString(16).padStart(2, '0')}`,
                                  color: SEVERITY_COLORS[sev],
                                }}
                              >
                                {count}
                              </span>
                            ) : (
                              <span className="text-text-dim opacity-30">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="text-center px-3 py-2.5 font-mono font-bold text-text-primary">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : renderEmpty('No data for heatmap')}
      </Panel>

      {/* ── Row 9: Recent Activity Feed ─────────────────────────── */}
      <Panel title="Recent Activity" icon={<Clock className="w-3.5 h-3.5" />} span={3}>
        {recentActivity.length > 0 ? (
          <div className="divide-y divide-border-default">
            {recentActivity.map(t => {
              const timeDiff = Date.now() - new Date(t.updatedAt).getTime();
              const minutesAgo = Math.floor(timeDiff / 60000);
              const hoursAgo = Math.floor(timeDiff / 3600000);
              const daysAgo = Math.floor(timeDiff / 86400000);
              const timeStr = daysAgo > 0 ? `${daysAgo}d ago` : hoursAgo > 0 ? `${hoursAgo}h ago` : `${minutesAgo}m ago`;

              return (
                <div key={t.id} className="flex items-center gap-4 py-3 px-2 hover:bg-bg-elevated/30 transition-colors rounded">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SEVERITY_COLORS[t.severity] || '#9ca3af' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{t.name || 'Untitled'}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-border-default" style={{ color: SEVERITY_COLORS[t.severity] }}>
                        {t.severity}
                      </span>
                      <span className="text-[10px] text-text-dim">{t.category}</span>
                      <span className="text-[10px] text-text-dim">·</span>
                      <span className="text-[10px] text-text-dim">{t.vector}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-text-dim font-mono">{timeStr}</div>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      {t.models.length > 0 && (
                        <span className="text-[10px] text-text-dim flex items-center gap-0.5">
                          <Cpu className="w-3 h-3" /> {t.models.length}
                        </span>
                      )}
                      {t.tags.length > 0 && (
                        <span className="text-[10px] text-text-dim flex items-center gap-0.5">
                          <Tag className="w-3 h-3" /> {t.tags.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : renderEmpty('No recent activity')}
      </Panel>

      {/* ── Row 10: Technique Coverage Table ────────────────────── */}
      <Panel title="Full Technique Coverage" icon={<Eye className="w-3.5 h-3.5" />} span={3}>
        {filteredTechniques.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-left px-3 py-2 text-text-dim font-semibold uppercase tracking-wider">Name</th>
                  <th className="text-left px-3 py-2 text-text-dim font-semibold uppercase tracking-wider">Category</th>
                  <th className="text-left px-3 py-2 text-text-dim font-semibold uppercase tracking-wider">Vector</th>
                  <th className="text-center px-3 py-2 text-text-dim font-semibold uppercase tracking-wider">Severity</th>
                  <th className="text-center px-3 py-2 text-text-dim font-semibold uppercase tracking-wider">Models</th>
                  <th className="text-center px-3 py-2 text-text-dim font-semibold uppercase tracking-wider">Bounty</th>
                  <th className="text-right px-3 py-2 text-text-dim font-semibold uppercase tracking-wider">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredTechniques
                  .sort((a, b) => {
                    const scoreMap: Record<string, number> = { Critical: 5, High: 4, Medium: 3, Low: 2, Informational: 1 };
                    return (scoreMap[b.severity] || 0) - (scoreMap[a.severity] || 0);
                  })
                  .slice(0, 25)
                  .map(t => (
                    <tr key={t.id} className="border-t border-border-default hover:bg-bg-elevated/30 transition-colors">
                      <td className="px-3 py-2.5 text-text-primary font-medium truncate max-w-[200px]">{t.name || 'Untitled'}</td>
                      <td className="px-3 py-2.5 text-text-secondary">{t.category}</td>
                      <td className="px-3 py-2.5 text-text-secondary">{t.vector}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="font-mono font-bold text-[10px] uppercase" style={{ color: SEVERITY_COLORS[t.severity] }}>
                          {t.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {t.models.length > 0 ? (
                            <>
                              <span className="text-status-confirmed font-mono">{t.models.filter(m => m.status === 'Confirmed').length}</span>
                              <span className="text-text-dim">/</span>
                              <span className="text-text-dim font-mono">{t.models.length}</span>
                            </>
                          ) : (
                            <span className="text-text-dim">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {t.bounty && t.bounty.status !== 'Not Submitted' ? (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border" style={{
                            color: BOUNTY_COLORS[t.bounty.status],
                            borderColor: `${BOUNTY_COLORS[t.bounty.status]}33`,
                            backgroundColor: `${BOUNTY_COLORS[t.bounty.status]}15`,
                          }}>
                            {t.bounty.status}
                          </span>
                        ) : (
                          <span className="text-text-dim">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right text-text-dim font-mono">
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {filteredTechniques.length > 25 && (
              <div className="text-center text-[10px] text-text-dim py-3 border-t border-border-default">
                Showing top 25 of {filteredTechniques.length} techniques (sorted by severity)
              </div>
            )}
          </div>
        ) : renderEmpty('No techniques to display')}
      </Panel>
    </div>
  );
}
