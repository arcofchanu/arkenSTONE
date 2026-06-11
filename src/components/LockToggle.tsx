import { useState, useRef, useEffect, FormEvent } from 'react';
import { Lock, Unlock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LockConfig {
  id: string;
  pin: string;
}

interface LockToggleProps {
  config: LockConfig | null;
  onSaveConfig: (config: LockConfig | null) => void;
  onLockNow: () => void;
}

export function LockToggle({ config, onSaveConfig, onLockNow }: LockToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [id, setId] = useState('');
  const [pin, setPin] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (id && pin) {
      onSaveConfig({ id, pin });
      setIsOpen(false);
      setId('');
      setPin('');
    }
  };

  const handleDisable = () => {
    onSaveConfig(null);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-colors ${config ? 'text-accent bg-accent/10 border-accent/20' : 'text-text-dim hover:text-text-primary bg-bg-elevated/50 hover:bg-bg-elevated border-border-default'} border`}
        title="Security Settings"
      >
        {config ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 bg-bg-surface border border-border-default rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-border-default bg-bg-elevated">
              <h3 className="text-sm font-semibold tracking-wider text-text-primary uppercase">Security Lock</h3>
              <button onClick={() => setIsOpen(false)} className="text-text-dim hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4">
              {config ? (
                <div className="space-y-4">
                  <p className="text-xs text-text-dim leading-relaxed">
                    System requires authentication to access the vault. You can lock immediately or disable the lock.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onLockNow();
                      }}
                      className="w-full bg-bg-elevated hover:bg-bg-input border border-border-default text-text-primary py-1.5 rounded text-sm transition-colors cursor-pointer"
                    >
                      Lock App Now
                    </button>
                    <button
                      onClick={handleDisable}
                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-1.5 rounded text-sm transition-colors"
                    >
                      Disable Lock
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-3">
                  <p className="text-xs text-text-dim leading-relaxed mb-4">
                    Enable lock screen to secure your red team vault.
                  </p>
                  <div>
                    <label className="block text-[10px] font-semibold text-text-secondary tracking-wider uppercase mb-1">Custom ID</label>
                    <input 
                      type="text" 
                      value={id}
                      onChange={e => setId(e.target.value)}
                      className="w-full bg-bg-input border border-border-default rounded px-2 py-1.5 text-text-primary focus:outline-none focus:border-border-active transition-all text-sm font-mono"
                      placeholder="e.g. admin"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-text-secondary tracking-wider uppercase mb-1">Password</label>
                    <input 
                      type="password" 
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      className="w-full bg-bg-input border border-border-default rounded px-2 py-1.5 text-text-primary focus:outline-none focus:border-border-active transition-all text-sm font-mono tracking-widest"
                      placeholder="••••••"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-accent text-bg-base hover:bg-accent-muted font-semibold py-1.5 rounded text-sm transition-colors mt-2"
                  >
                    Enable Lock
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
