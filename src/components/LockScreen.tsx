import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import { CUSTOM_LOGO_BASE64 } from './WelcomeScreen';

interface LockScreenProps {
  onUnlock: (id: string, pin: string) => boolean;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [id, setId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onUnlock(id, pin)) {
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-bg-base z-50 flex items-center justify-center p-4 selection:bg-accent-muted">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-bg-surface border border-border-default rounded-xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-muted via-accent to-accent-muted"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-bg-elevated border border-border-default rounded-full flex items-center justify-center mb-4 overflow-hidden">
            {CUSTOM_LOGO_BASE64 ? (
              <img src={CUSTOM_LOGO_BASE64} alt="Custom Logo" className="w-10 h-10 object-contain" />
            ) : (
              <Shield className="w-8 h-8 text-accent" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary uppercase">arkenSTONE</h1>
          <p className="text-sm text-text-dim mt-2 tracking-widest uppercase">System Locked</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary tracking-wider uppercase mb-1.5">Identifier</label>
            <input 
              type="text" 
              value={id}
              onChange={e => setId(e.target.value)}
              className="w-full bg-bg-input border border-border-default rounded-md px-3 py-2 text-text-primary focus:outline-none focus:border-border-active focus:ring-1 focus:ring-accent/20 transition-all font-mono text-sm"
              placeholder="Enter ID"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary tracking-wider uppercase mb-1.5">Passcode</label>
            <input 
              type="password" 
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full bg-bg-input border border-border-default rounded-md px-3 py-2 text-text-primary focus:outline-none focus:border-border-active focus:ring-1 focus:ring-accent/20 transition-all font-mono text-sm tracking-widest"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-500 text-center font-medium"
            >
              Authentication Failed.
            </motion.p>
          )}

          <button 
            type="submit"
            className="w-full bg-accent text-bg-base hover:bg-accent-muted font-semibold py-2.5 rounded-md transition-colors mt-2"
          >
            DECRYPT & ACCESS
          </button>
        </form>
      </motion.div>
    </div>
  );
}
