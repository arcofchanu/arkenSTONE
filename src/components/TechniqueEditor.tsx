import { useState, useEffect, useRef } from 'react';
import { Technique, GlobalModel, CATEGORIES, VECTORS, ModelStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Check, Plus, Trash2, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface Props {
  technique: Technique;
  globalModels: GlobalModel[];
  onSave: (t: Technique) => void;
  onClose: () => void;
  onGenerateReport: () => void;
}

export function TechniqueEditor({ technique, globalModels, onSave, onClose, onGenerateReport }: Props) {
  const [data, setData] = useState<Technique>(technique);
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const saveTimeout = useRef<number | null>(null);

  // Update local state if parent prop changes and we are not editing it actively
  useEffect(() => {
    setData(technique);
  }, [technique.id]);

  const handleChange = (field: keyof Technique, value: any) => {
    setData(prev => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }));
  };

  const triggerSave = () => {
    onSave(data);
    setShowSavedMsg(true);
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => setShowSavedMsg(false), 1500);
  };

  const handleBlur = () => {
    triggerSave();
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    handleChange('tags', val.split(',').map(t => t.trim()).filter(Boolean));
  };

  const toggleModel = (name: string, checked: boolean) => {
    if (checked) {
      handleChange('models', [
        ...data.models,
        { id: uuidv4(), name, status: 'Untested' as ModelStatus, note: '' }
      ]);
    } else {
      handleChange('models', data.models.filter(m => m.name !== name));
    }
  };

  const updateModel = (id: string, field: string, value: string) => {
    handleChange(
      'models', 
      data.models.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        const scaleSize = img.width > MAX_WIDTH ? (MAX_WIDTH / img.width) : 1;
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        handleChange('photos', [...(data.photos || []), dataUrl]);
        triggerSave();
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset input
  };

  const removePhoto = (index: number) => {
      const newPhotos = [...(data.photos || [])];
      newPhotos.splice(index, 1);
      handleChange('photos', newPhotos);
      triggerSave();
  };

  const trackedModelNames = data.models.map(m => m.name);
  const allModelNames = Array.from(new Set([
    ...globalModels.map(g => g.name),
    ...trackedModelNames
  ]));

  return (
    <motion.div 
      className="bg-bg-base h-full flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6 shrink-0">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-text-dim hover:text-text-primary transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vault (Esc)
        </button>
        
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {showSavedMsg && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-accent flex items-center gap-1 font-mono"
              >
                <Check className="w-3 h-3" /> Saved
              </motion.span>
            )}
          </AnimatePresence>
          <button 
            onClick={() => { triggerSave(); onGenerateReport(); }}
            className="flex items-center gap-2 px-4 py-2 bg-text-primary text-bg-base hover:opacity-90 rounded-md text-sm font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Col */}
        <div className="lg:col-span-3 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Name</label>
            <input 
              type="text" 
              value={data.name} 
              onChange={e => handleChange('name', e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g. Grandma Roleplay"
              className="w-full bg-bg-input border border-border-default rounded flex px-3 py-2 text-sm focus:outline-none focus:border-border-active transition-colors font-medium text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Category</label>
            <select 
              value={data.category} 
              onChange={e => handleChange('category', e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-bg-input border border-border-default rounded px-3 py-2 text-sm focus:outline-none focus:border-border-active transition-colors appearance-none text-text-primary"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Attack Vector</label>
            <select 
              value={data.vector} 
              onChange={e => handleChange('vector', e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-bg-input border border-border-default rounded px-3 py-2 text-sm focus:outline-none focus:border-border-active transition-colors appearance-none text-text-primary"
            >
              {VECTORS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Severity</label>
            <select 
              value={data.severity} 
              onChange={e => handleChange('severity', e.target.value)}
              onBlur={handleBlur}
              className={`w-full bg-bg-input border border-border-default rounded px-3 py-2 text-sm focus:outline-none focus:border-border-active transition-colors appearance-none font-medium ${
                data.severity === 'Critical' ? 'text-red-400' :
                data.severity === 'High' ? 'text-orange-400' :
                data.severity === 'Medium' ? 'text-yellow-400' :
                data.severity === 'Low' ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              {['Critical', 'High', 'Medium', 'Low', 'Informational'].map(s => <option key={s} value={s} className="text-text-primary">{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Description</label>
            <textarea 
              value={data.description} 
              onChange={e => handleChange('description', e.target.value)}
              onBlur={handleBlur}
              placeholder="Brief summary of what this accomplishes..."
              rows={3}
              className="w-full bg-bg-input border border-border-default rounded px-3 py-2 text-sm focus:outline-none focus:border-border-active transition-colors resize-none text-text-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Tags (comma separated)</label>
            <input 
              type="text" 
              value={data.tags.join(', ')} 
              onChange={handleTagsChange}
              onBlur={handleBlur}
              placeholder="e.g. system_prompt, bypass"
              className="w-full bg-bg-input border border-border-default rounded px-3 py-2 text-sm focus:outline-none focus:border-border-active transition-colors text-text-primary"
            />
          </div>

          <div className="pt-4 border-t border-border-default">
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-3">Bounty Tracker</label>
            <div className="space-y-3">
              <select
                value={data.bounty?.status || 'Not Submitted'}
                onChange={e => handleChange('bounty', { ...data.bounty, status: e.target.value })}
                onBlur={handleBlur}
                className={`w-full bg-bg-input border border-border-default rounded px-3 py-2 text-sm focus:outline-none focus:border-border-active transition-colors appearance-none font-medium ${
                  data.bounty?.status === 'Awarded' ? 'text-status-confirmed' :
                  data.bounty?.status === 'Pending' ? 'text-status-partial' :
                  data.bounty?.status === 'Rejected' ? 'text-status-patched' : 'text-text-dim'
                }`}
              >
                {['Not Submitted', 'Pending', 'Awarded', 'Rejected'].map(s => <option key={s} value={s} className="text-text-primary">{s}</option>)}
              </select>

              {data.bounty?.status !== 'Not Submitted' && (
                <>
                  <input
                    type="text"
                    value={data.bounty?.program || ''}
                    onChange={e => handleChange('bounty', { ...data.bounty, program: e.target.value })}
                    onBlur={handleBlur}
                    placeholder="Program (e.g. OpenAI, Google)"
                    className="w-full bg-bg-input border border-border-default rounded px-3 py-2 text-sm focus:outline-none focus:border-border-active transition-colors text-text-primary"
                  />
                  
                  {data.bounty?.status === 'Awarded' && (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">$</span>
                      <input
                        type="number"
                        min="0"
                        value={data.bounty?.amount || ''}
                        onChange={e => handleChange('bounty', { ...data.bounty, amount: parseFloat(e.target.value) || 0 })}
                        onBlur={handleBlur}
                        placeholder="Amount"
                        className="w-full bg-bg-input border border-border-default rounded px-3 py-2 pl-7 text-sm focus:outline-none focus:border-border-active transition-colors text-text-primary"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center Col */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          <div className="flex-1 flex flex-col min-h-[300px]">
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5 shrink-0 flex items-center justify-between">
              Technique / Prompt
              <span className="text-[10px] text-text-dim font-mono normal-case tracking-normal">Monospace</span>
            </label>
            <textarea 
              value={data.technique} 
              onChange={e => handleChange('technique', e.target.value)}
              onBlur={handleBlur}
              placeholder="Paste your prompt or injection string here..."
              className="flex-1 w-full bg-bg-elevated border border-border-default rounded p-4 text-sm focus:outline-none focus:border-border-active transition-colors font-mono tracking-tight text-accent-dim resize-none"
            />
          </div>
          
          <div className="h-48 shrink-0 flex flex-col">
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Notes</label>
            <textarea 
              value={data.notes} 
              onChange={e => handleChange('notes', e.target.value)}
              onBlur={handleBlur}
              placeholder="Observations, what breaks it, edge cases..."
              className="flex-1 w-full bg-bg-input border border-border-default rounded p-3 text-sm focus:outline-none focus:border-border-active transition-colors font-mono resize-none text-text-secondary"
            />
          </div>
        </div>

        {/* Right Col */}
        <div className="lg:col-span-4 flex flex-col pt-1">
          <div className="shrink-0 flex flex-col border border-border-default bg-bg-elevated rounded-lg p-3 mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-text-primary">Photos / Evidence</label>
              <label className="text-xs flex items-center gap-1 text-accent hover:text-accent-dim transition-colors px-2 py-1 bg-accent/10 hover:bg-accent/20 rounded cursor-pointer font-medium">
                <Plus className="w-3 h-3" /> Add Photo
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
              </label>
            </div>
            {data.photos && data.photos.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {data.photos.map((p, i) => (
                  <div key={i} className="relative group rounded border border-border-default overflow-hidden aspect-square bg-bg-input cursor-pointer" onClick={() => setPreviewIndex(i)}>
                    <img src={p} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                      className="absolute top-1 right-1 p-1 bg-bg-base/80 hover:bg-bg-elevated text-status-patched rounded opacity-0 group-hover:opacity-100 transition-colors backdrop-blur-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-center py-6 border border-dashed border-border-default rounded text-xs text-text-dim">
                  Upload screenshots of successful or failed runs.
                </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Model Tracking</h3>
            <span className="text-xs text-text-dim px-2 bg-bg-input rounded-full border border-border-default">
              Checklist
            </span>
          </div>

          <div className="space-y-3">
            {allModelNames.map((name) => {
              const modelEntry = data.models.find(m => m.name === name);
              const isChecked = !!modelEntry;

              return (
                <div key={name} className={`border border-border-default rounded p-3 transition-colors ${isChecked ? 'bg-bg-elevated' : 'bg-bg-base opacity-70 hover:opacity-100'}`}>
                  <div className={`flex gap-2 items-center ${isChecked ? 'mb-2' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={(e) => toggleModel(name, e.target.checked)}
                      className="w-4 h-4 bg-bg-input border-border-default rounded accent-accent shrink-0"
                    />
                    <span className={`text-sm flex-1 ${isChecked ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                      {name}
                    </span>
                    
                    {isChecked && (
                      <select 
                        value={modelEntry.status}
                        onChange={e => updateModel(modelEntry.id, 'status', e.target.value)}
                        onBlur={handleBlur}
                        className={`bg-bg-input border border-border-default rounded px-2 py-0.5 text-xs focus:outline-none focus:border-border-active transition-colors appearance-none pr-6
                          ${modelEntry.status === 'Confirmed' ? 'text-status-confirmed' : modelEntry.status === 'Partial' ? 'text-status-partial' : modelEntry.status === 'Patched' ? 'text-status-patched' : 'text-text-dim'}
                        `}
                      >
                        <option value="Confirmed" className="text-text-primary">Confirmed</option>
                        <option value="Partial" className="text-text-primary">Partial</option>
                        <option value="Patched" className="text-text-primary">Patched</option>
                        <option value="Untested" className="text-text-primary">Untested</option>
                      </select>
                    )}
                  </div>
                  
                  {isChecked && (
                    <input 
                      type="text" 
                      value={modelEntry.note || ''}
                      onChange={e => updateModel(modelEntry.id, 'note', e.target.value)}
                      onBlur={handleBlur}
                      placeholder="Optional note..."
                      className="w-full bg-bg-input border border-border-default rounded px-2 py-1 mt-1 text-xs focus:outline-none focus:border-border-active transition-colors text-text-secondary font-mono"
                    />
                  )}
                </div>
              );
            })}
            {allModelNames.length === 0 && (
              <div className="text-center py-8 border border-dashed border-border-default rounded text-xs text-text-dim px-4">
                No models to display. Add global models in the "Models Setup" tab.
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {previewIndex !== null && data.photos && data.photos[previewIndex] && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setPreviewIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-base/90 backdrop-blur-sm"
          >
            <button 
              onClick={() => setPreviewIndex(null)}
              className="absolute top-6 right-6 p-2 text-text-dim hover:text-text-primary bg-bg-elevated/50 hover:bg-bg-elevated rounded-full transition-colors backdrop-blur-md border border-border-default z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {data.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewIndex((previewIndex - 1 + data.photos!.length) % data.photos!.length); }}
                  className="absolute left-6 p-3 text-text-dim hover:text-text-primary bg-bg-elevated/50 hover:bg-bg-elevated rounded-full transition-colors backdrop-blur-md border border-border-default z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewIndex((previewIndex + 1) % data.photos!.length); }}
                  className="absolute right-6 p-3 text-text-dim hover:text-text-primary bg-bg-elevated/50 hover:bg-bg-elevated rounded-full transition-colors backdrop-blur-md border border-border-default z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.img 
              key={previewIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              src={data.photos[previewIndex]}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl border border-border-default bg-bg-base"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
