import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Technique, GlobalModel, CATEGORIES, VECTORS } from './types';
import { getTechniques, saveTechniques, getGlobalModels, saveGlobalModels } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { TechniqueCard } from './components/TechniqueCard';
import { TechniqueEditor } from './components/TechniqueEditor';
import { ReportGenerator } from './components/ReportGenerator';
import { ModelsView } from './components/ModelsView';
import { Search, Plus, Sun, Moon, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LockScreen } from './components/LockScreen';
import { LockToggle } from './components/LockToggle';
import { BountyView } from './components/BountyView';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DashboardView } from './components/DashboardView';

export default function App() {
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return localStorage.getItem('arkenSTONE_lock_creds') === null;
  });
  const [currentView, setCurrentView] = useState<'dashboard' | 'vault' | 'models' | 'bounties'>('vault');
  const [globalModels, setGlobalModels] = useState<GlobalModel[]>([]);
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [dateRange, setDateRange] = useState<{start: string; end: string}>({ start: '', end: '' });
  
  const [activeTechniqueId, setActiveTechniqueId] = useState<string | null>(null);
  const [reportTechniqueId, setReportTechniqueId] = useState<string | null>(null);
  
  const [lockConfig, setLockConfig] = useState<{ id: string, pin: string } | null>(() => {
    const saved = localStorage.getItem('arkenSTONE_lock_creds');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('arkenSTONE_lock_creds') !== null;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark'|'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, [theme]);

  useEffect(() => {
    setTechniques(getTechniques());
    setGlobalModels(getGlobalModels());
  }, []);

  const handleSaveModels = (models: GlobalModel[]) => {
    setGlobalModels(models);
    saveGlobalModels(models);
  };

  const handleSave = (technique: Technique) => {
    const isNew = !techniques.find(t => t.id === technique.id);
    let updated;
    if (isNew) {
      updated = [technique, ...techniques];
    } else {
      updated = techniques.map(t => t.id === technique.id ? technique : t);
    }
    setTechniques(updated);
    saveTechniques(updated);
  };

  const handleDelete = (id: string) => {
    const updated = techniques.filter(t => t.id !== id);
    setTechniques(updated);
    saveTechniques(updated);
    if (activeTechniqueId === id) setActiveTechniqueId(null);
  };

  const createNew = () => {
    const newTech: Technique = {
      id: uuidv4(),
      name: 'Untitled Technique',
      category: CATEGORIES[0],
      vector: VECTORS[0],
      description: '',
      technique: '',
      notes: '',
      severity: 'Medium',
      tags: [],
      models: [],
      bounty: { status: 'Not Submitted', amount: 0, program: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setActiveTechniqueId(newTech.id);
    setCurrentView('vault');
  };

  const handleSaveLockConfig = (config: { id: string, pin: string } | null) => {
    setLockConfig(config);
    if (config) {
      localStorage.setItem('arkenSTONE_lock_creds', JSON.stringify(config));
    } else {
      localStorage.removeItem('arkenSTONE_lock_creds');
      setIsLocked(false);
    }
  };

  const handleUnlock = (id: string, pin: string) => {
    if (lockConfig && lockConfig.id === id && lockConfig.pin === pin) {
      setIsLocked(false);
      setShowWelcome(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNew();
      }
      if (e.key === 'Escape') {
        setActiveTechniqueId(null);
        setReportTechniqueId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const filteredTechniques = techniques.filter(t => {
    if (selectedCategory && t.category !== selectedCategory) return false;
    if (selectedSeverity && t.severity !== selectedSeverity) return false;
    
    if (selectedStatus) {
      const hasStatus = t.models.some(m => m.status === selectedStatus);
      // if selectedStatus is "Untested" and no models exist, it might count as untested, but for simplicity we rely on model list.
      if (!hasStatus && t.models.length > 0) return false;
      if (!hasStatus && t.models.length === 0 && selectedStatus !== 'Untested') return false; 
    }

    if (dateRange.start || dateRange.end) {
      const techDate = new Date(t.updatedAt || t.createdAt);
      if (dateRange.start) {
        const start = new Date(dateRange.start);
        if (techDate < start) return false;
      }
      if (dateRange.end) {
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        if (techDate > end) return false;
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.technique.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeTechnique = techniques.find(t => t.id === activeTechniqueId) || 
    (activeTechniqueId ? { // Handle newly created before save
      id: activeTechniqueId,
      name: 'Untitled Technique',
      category: CATEGORIES[0],
      vector: VECTORS[0],
      description: '',
      technique: '',
      notes: '',
      severity: 'Medium',
      tags: [],
      models: [],
      bounty: { status: 'Not Submitted', amount: 0, program: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Technique : null);

  const reportTechnique = techniques.find(t => t.id === reportTechniqueId);

  // Collect all unique tags across all techniques for autocomplete
  const allTags: string[] = Array.from(new Set(techniques.flatMap(t => t.tags)));

  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && <WelcomeScreen onComplete={() => setShowWelcome(false)} />}
      </AnimatePresence>
      
      {isLocked ? (
        <LockScreen onUnlock={handleUnlock} />
      ) : (
        <div className="flex h-screen overflow-hidden bg-bg-base text-text-primary selection:bg-accent-muted">
          <Sidebar 
            techniques={techniques}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedSeverity={selectedSeverity}
        setSelectedSeverity={setSelectedSeverity}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border-default z-10 shrink-0 bg-bg-base">
          <h1 className="text-xl font-bold tracking-tight text-accent">
            {currentView === 'dashboard' ? 'DASHBOARD' : currentView === 'vault' ? 'arkenSTONE' : currentView === 'models' ? 'MODELS SETUP' : 'BOUNTY TRACKER'}
          </h1>
          
          <div className="flex flex-1 items-center justify-end gap-4">
            {currentView === 'vault' && (
              <div className="flex items-center gap-4 flex-1 max-w-xl ml-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input 
                    type="text" 
                    placeholder="Search techniques, tags, prompts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-bg-input border border-border-default rounded-md py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-border-active focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-text-dim"
                  />
                </div>
                <button 
                  onClick={createNew}
                  className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 rounded-md text-sm transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  New <span className="hidden sm:inline text-xs opacity-60 ml-1">⌘N</span>
                </button>
              </div>
            )}
            
            <LockToggle 
              config={lockConfig} 
              onSaveConfig={handleSaveLockConfig} 
              onLockNow={() => lockConfig && setIsLocked(true)} 
            />
            
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="p-2 text-text-dim hover:text-accent bg-bg-elevated/50 hover:bg-bg-elevated border border-border-default rounded-full transition-colors ml-2"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-auto p-6" id="scroll-container">
          {currentView === 'dashboard' ? (
            <DashboardView techniques={techniques} />
          ) : currentView === 'bounties' ? (
            <BountyView techniques={techniques} onTechniqueClick={id => { setActiveTechniqueId(id); setCurrentView('vault'); }} />
          ) : currentView === 'models' ? (
            <ModelsView models={globalModels} onModelsChange={handleSaveModels} />
          ) : reportTechnique ? (
            <ReportGenerator 
              technique={reportTechnique} 
              onClose={() => setReportTechniqueId(null)} 
            />
          ) : activeTechnique ? (
            <TechniqueEditor 
              technique={activeTechnique} 
              globalModels={globalModels}
              allTags={allTags}
              onSave={handleSave} 
              onClose={() => setActiveTechniqueId(null)}
              onGenerateReport={() => setReportTechniqueId(activeTechnique.id)}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-4 py-2 shrink-0">
                <span className="text-sm font-medium text-text-secondary flex items-center gap-2"><Calendar className="w-4 h-4"/> Filter by Date</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-dim uppercase tracking-wider font-semibold">From</span>
                  <input 
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="bg-transparent border-b border-border-default px-1 py-1 text-sm text-text-primary focus:outline-none focus:border-border-active css-date-input"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-dim uppercase tracking-wider font-semibold">To</span>
                  <input 
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="bg-transparent border-b border-border-default px-1 py-1 text-sm text-text-primary focus:outline-none focus:border-border-active css-date-input"
                  />
                </div>
                {(dateRange.start || dateRange.end) && (
                  <button 
                    onClick={() => setDateRange({ ...dateRange, start: '', end: '' })}
                    className="text-xs text-accent hover:text-text-primary transition-colors ml-2"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredTechniques.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center text-text-dim"
                  >
                    {searchQuery || selectedCategory || selectedStatus 
                      ? "Nothing matched. Try a different filter." 
                      : "Vault is empty. Add your first technique."}
                  </motion.div>
                ) : (
                  filteredTechniques.map((tech, i) => (
                    <motion.div
                      key={tech.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.05, 0.25) }}
                    >
                      <TechniqueCard 
                        technique={tech} 
                        onClick={() => setActiveTechniqueId(tech.id)} 
                        onDelete={() => handleDelete(tech.id)}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
            </div>
          )}
        </div>
      </main>
    </div>
      )}
    </>
  );
}
