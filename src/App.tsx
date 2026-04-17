import { useState, useEffect, useMemo } from 'react';
import { 
  Scissors, 
  Settings2, 
  Trash2, 
  Activity,
  Zap,
  Volume2,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface SilenceRegion {
  id: string;
  start: number;
  end: number;
  duration: number;
}

// --- Adobe CEP Interface Mock ---
const CSInterface = {
  evalScript: (script: string, callback?: (result: string) => void) => {
    console.log('JSX execution:', script);
    if (window.navigator.userAgent.includes('Premiere')) {
      // @ts-ignore
      new window.CSInterface().evalScript(script, callback);
    } else {
      setTimeout(() => callback?.("Success"), 1500);
    }
  }
};

export default function App() {
  const [threshold, setThreshold] = useState(-35); 
  const [minDuration, setMinDuration] = useState(0.5);
  const [isScanning, setIsScanning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [regions, setRegions] = useState<SilenceRegion[]>([]);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'ready' | 'removing' | 'done'>('idle');
  const [statusMessage, setStatusMessage] = useState('Plugin initialized.');
  const [progress, setProgress] = useState(0);

  // Apply default presets
  const applyPreset = (mode: 'low' | 'med' | 'high') => {
    const table = {
      low: { t: -45, d: 1.0 },
      med: { t: -35, d: 0.5 },
      high: { t: -20, d: 0.2 }
    };
    setThreshold(table[mode].t);
    setMinDuration(table[mode].d);
  };

  const startScan = () => {
    setIsScanning(true);
    setStatus('scanning');
    setStatusMessage('Analyzing audio data in sequence...');
    setProgress(0);

    const timer = setInterval(() => {
      setProgress(v => (v >= 100 ? 100 : v + 2));
    }, 40);

    setTimeout(() => {
      clearInterval(timer);
      const detections: SilenceRegion[] = [
        { id: Math.random().toString(), start: 2.1, end: 3.5, duration: 1.4 },
        { id: Math.random().toString(), start: 8.4, end: 9.1, duration: 0.7 },
        { id: Math.random().toString(), start: 15.0, end: 17.5, duration: 2.5 },
      ].filter(r => r.duration >= minDuration);
      
      setRegions(detections);
      setIsScanning(false);
      setStatus('ready');
      setStatusMessage(`Detected ${detections.length} silences.`);
    }, 2000);
  };

  const applyRemove = () => {
    if (regions.length === 0) return;
    setIsRemoving(true);
    setStatus('removing');
    setStatusMessage('Applying ripple edits...');
    
    CSInterface.evalScript(`SilenceX.processSilence('${JSON.stringify(regions)}')`, () => {
      setIsRemoving(false);
      setStatus('done');
      setStatusMessage('Operation completed successfully.');
      setRegions([]);
    });
  };

  const timeSaved = useMemo(() => 
    regions.reduce((acc, r) => acc + r.duration, 0).toFixed(2), 
    [regions]
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0F1115] text-[#FFFFFF] select-none font-sans">
      {/* Header Panel */}
      <header className="h-16 flex items-center px-6 justify-between shrink-0 glass-header z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Scissors className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">SilenceX</h1>
            <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase opacity-70">Umar Saeed Professional</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-[10px] bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-slate-400 uppercase tracking-widest font-bold">
             v1.4 Build 2026
           </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Control Sidebar */}
        <aside className="w-80 glass-panel border-r border-white/5 shrink-0 p-6 flex flex-col gap-10">
          <div className="space-y-10">
            <section>
              <h3 className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-bold mb-6">Detection Tuning</h3>
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Threshold Level</span>
                    <span className="text-[#a855f7] font-mono">{threshold} dB</span>
                  </div>
                  <input type="range" min="-60" max="-10" value={threshold} onChange={e => setThreshold(+e.target.value)} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Gap Minimum</span>
                    <span className="text-[#a855f7] font-mono">{minDuration} s</span>
                  </div>
                  <input type="range" min="0.1" max="4" step="0.1" value={minDuration} onChange={e => setMinDuration(+e.target.value)} />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-bold mb-4">Quick Presets</h3>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'med', 'high'].map((p: any) => (
                  <button key={p} onClick={() => applyPreset(p)} className="py-2.5 text-[10px] font-bold uppercase glass-panel rounded-lg hover:bg-white/5 transition-all">
                    {p}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-auto space-y-4">
            <button 
              onClick={startScan} 
              disabled={isScanning || isRemoving} 
              className="w-full py-3.5 bg-white/5 rounded-xl text-sm font-bold border border-white/5 hover:bg-white/10 transition-all disabled:opacity-30"
            >
              Scan Silence Regions
            </button>
            <button 
              onClick={applyRemove} 
              disabled={regions.length === 0 || isScanning || isRemoving} 
              className="w-full accent-btn py-4 rounded-xl text-sm font-bold shadow-2xl shadow-indigo-600/40 disabled:grayscale disabled:opacity-20"
            >
              Auto-Cut & Ripple Delete
            </button>
            <p className="text-[9px] text-center text-slate-500 font-medium">Affects currently active audio track</p>
          </div>
        </aside>

        {/* Center Canvas / Table View */}
        <main className="flex-1 bg-[#0a0c10]/80 p-8 flex flex-col gap-8 overflow-hidden relative">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-[11px] uppercase tracking-widest text-[#94A3B8] font-bold mb-1">Silence Visualization</h2>
              <div className="text-2xl font-bold tracking-tight">Active Timeline Segment</div>
            </div>
            {regions.length > 0 && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Savings</span>
                <span className="text-xl font-mono text-[#a855f7] font-bold">-{timeSaved}s</span>
              </div>
            )}
          </div>

          {/* Waveform Visualization */}
          <div className="h-44 glass-panel rounded-[2rem] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 flex items-center px-12 gap-1">
              {[...Array(40)].map((_, i) => (
                <div key={i} className="flex-1 bg-slate-300 rounded-full" style={{ height: `${Math.random() * 70 + 10}%` }} />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center px-12 gap-1 pointer-events-none">
              {regions.map(r => (
                <div 
                  key={r.id} 
                  className="bg-red-500/20 border-x border-red-500/30 h-full" 
                  style={{ width: `${r.duration * 5}%`, marginLeft: `${r.start * 2}%` }} 
                />
              ))}
            </div>
            {regions.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-5 py-2 glass-panel rounded-full border-indigo-500/20 text-[#a855f7] font-bold text-xs uppercase tracking-widest shadow-lg">
                <Activity size={14} className="animate-pulse" />
                Detections Mapped
              </motion.div>
            ) : (
              <div className="text-xs text-slate-600 font-bold uppercase tracking-widest opacity-40">Ready to Analyze</div>
            )}
          </div>

          {/* Detections List */}
          <div className="flex-1 glass-panel rounded-[2rem] overflow-hidden flex flex-col shadow-inner">
             <div className="grid grid-cols-[60px_1fr_1fr_100px] p-5 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
                <span>#ID</span>
                <span>In-Point</span>
                <span>Gap Duration</span>
                <span className="text-right">Action</span>
             </div>
             <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                <AnimatePresence mode='popLayout'>
                  {regions.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-700 font-bold tracking-[0.2em] text-[10px] uppercase">
                      Empty Result Set
                    </div>
                  ) : (
                    regions.map((r, i) => (
                      <motion.div 
                        key={r.id} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-[60px_1fr_1fr_100px] p-4 text-[13px] border-b border-white/5 last:border-0 hover:bg-white/[0.02] items-center transition-colors"
                      >
                        <span className="text-slate-600 font-mono text-xs">{i+1}</span>
                        <span className="text-slate-300 font-mono">{r.start.toFixed(2)}s</span>
                        <span className="text-slate-300 font-mono">{r.duration.toFixed(2)}s</span>
                        <div className="flex justify-end">
                           <span className="bg-red-500/10 text-red-500 text-[9px] font-bold px-2 py-1 rounded-md uppercase border border-red-500/20">Remove</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
             </div>
          </div>
        </main>
      </div>

      {/* Modern Status Footer */}
      <footer className="h-12 flex items-center px-8 border-t border-white/5 bg-[#0a0c10] shrink-0 justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] shadow-current ${isScanning ? 'bg-indigo-500 animate-pulse' : isRemoving ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{statusMessage}</span>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.1em]">Engine Activity</span>
              <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                />
              </div>
           </div>
        </div>
      </footer>

      {/* Global Processing Overlay */}
      <AnimatePresence>
        {(isScanning || isRemoving) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="glass-panel p-12 rounded-[3rem] max-w-sm w-full flex flex-col items-center gap-10 border border-white/10 shadow-3xl"
            >
               <div className="relative">
                 <div className="w-24 h-24 rounded-full border-[3px] border-white/5 border-t-indigo-500 animate-spin" />
                 <Zap size={32} className="absolute inset-0 m-auto text-indigo-500 animate-pulse" />
               </div>
               <div className="text-center w-full">
                 <div className="text-sm font-bold text-indigo-400 tracking-widest uppercase mb-2">{isScanning ? 'Audio Analysis' : 'Ripple Editing'}</div>
                 <h3 className="text-2xl font-bold tracking-tight text-white mb-6">{isScanning ? 'Scanning Track...' : 'Applying Cuts...'}</h3>
                 
                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                   <motion.div animate={{ width: `${progress}%` }} className="h-full bg-indigo-500" />
                 </div>
                 <div className="text-[10px] font-mono text-slate-500">{progress}% complete</div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
