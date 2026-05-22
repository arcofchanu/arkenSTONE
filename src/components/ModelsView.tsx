import { useState } from 'react';
import { GlobalModel } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Plus, Cpu, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  models: GlobalModel[];
  onModelsChange: (models: GlobalModel[]) => void;
}

export function ModelsView({ models, onModelsChange }: Props) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newName.trim()) return;
    const newModel = { id: uuidv4(), name: newName.trim() };
    onModelsChange([...models, newModel]);
    setNewName('');
  };

  const handleDelete = (id: string) => {
    onModelsChange(models.filter(m => m.id !== id));
  };

  const startEdit = (m: GlobalModel) => {
    setEditingId(m.id);
    setEditName(m.name);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editingId) {
      setEditingId(null);
      return;
    }
    onModelsChange(models.map(m => m.id === editingId ? { ...m, name: editName.trim() } : m));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-accent flex items-center gap-3">
          <Cpu className="w-6 h-6" /> Models Setup
        </h2>
        <p className="text-text-secondary mt-2 text-sm">
          Define the list of LLMs you want to test against. These will appear as a quick-select checklist when you create or edit a technique.
        </p>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-lg p-6 shadow-sm">
        <form onSubmit={handleAdd} className="flex gap-3 mb-6 relative">
          <input 
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. GPT-4 Turbo"
            className="flex-1 bg-bg-input border border-border-default rounded py-2 px-3 text-sm focus:outline-none focus:border-border-active transition-colors text-text-primary"
          />
          <button 
            type="submit"
            disabled={!newName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed border border-accent/20 rounded text-sm transition-colors font-medium"
          >
            <Plus className="w-4 h-4" /> Add Model
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {models.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-10 text-text-dim text-sm border border-dashed border-border-default rounded"
              >
                No models defined. Add one above.
              </motion.div>
            ) : (
              models.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  className="flex items-center justify-between p-3 bg-bg-elevated border border-border-default rounded group"
                >
                  {editingId === m.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input 
                        type="text"
                        value={editName}
                        autoFocus
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' ? saveEdit() : e.key === 'Escape' ? cancelEdit() : null}
                        className="flex-1 bg-bg-input border border-border-active rounded px-2 py-1 text-sm focus:outline-none text-text-primary"
                      />
                      <button 
                        onClick={saveEdit}
                        className="p-1.5 text-text-dim hover:text-status-confirmed hover:bg-bg-base rounded transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="p-1.5 text-text-dim hover:text-status-patched hover:bg-bg-base rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-text-primary font-medium text-sm truncate pr-2">{m.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button 
                          onClick={() => startEdit(m)}
                          className="p-1.5 text-text-dim hover:text-accent hover:bg-bg-base rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 text-text-dim hover:text-status-patched hover:bg-bg-base rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
