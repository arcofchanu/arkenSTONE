import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Technique, CATEGORIES } from '../types';

interface DashboardViewProps {
  techniques: Technique[];
}

export function DashboardView({ techniques }: DashboardViewProps) {
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach(c => counts[c] = 0);
    techniques.forEach(t => {
      if (counts[t.category] !== undefined) {
        counts[t.category]++;
      } else {
        counts['Other'] = (counts['Other'] || 0) + 1;
      }
    });
    
    return CATEGORIES.map(c => ({
      name: c,
      count: counts[c]
    })).filter(item => item.count > 0).sort((a, b) => b.count - a.count);
  }, [techniques]);

  const severityData = useMemo(() => {
    const severities = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
    const counts: Record<string, number> = {};
    severities.forEach(s => counts[s] = 0);
    
    techniques.forEach(t => {
      if (counts[t.severity] !== undefined) {
        counts[t.severity]++;
      }
    });

    return severities.map(s => ({
      name: s,
      count: counts[s]
    })).filter(item => item.count > 0);
  }, [techniques]);

  const SEVERITY_COLORS: Record<string, string> = {
    'Critical': '#ef4444',
    'High': '#fb923c',
    'Medium': '#facc15',
    'Low': '#60a5fa',
    'Informational': '#9ca3af'
  };

  const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Dashboard Overview</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-surface border border-border-default rounded-lg p-6 flex flex-col items-center">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-text-secondary w-full text-left mb-6">Severity Distribution</h3>
          {severityData.length > 0 ? (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-12 text-text-dim text-sm text-center">No severity data available.</div>
          )}
        </div>

        <div className="bg-bg-surface border border-border-default rounded-lg p-6 flex flex-col items-center">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-text-secondary w-full text-left mb-6">Techniques by Category</h3>
          {categoryData.length > 0 ? (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                    cursor={{ fill: '#334155', opacity: 0.4 }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-12 text-text-dim text-sm text-center">No category data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
