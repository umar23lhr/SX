import { useState, useEffect, useMemo } from 'react';
import { 
  Scissors, 
  Settings2, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface SilenceRegion {
  id: string;
  start: number;
  end: number;
  duration: number;
}

// --- Mock CEP Interface ---
const CSInterface = {
  evalScript: (script: string, callback?: (result: string) => void) => {
    console.log('JSX Execute:', script);
    setTimeout(() => {
      if (callback) callback("Success");
    }, 1000);
  }
};

export default function App() {
  const [threshold, setThreshold] = useState(-35); 
  const [minDuration, setMinDuration] = useState(0.5);
  const [isScanning, setIsScanning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [regions, setRegions] = useState<SilenceRegion[]>([]);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'ready' | 'removing' | 'done'>('idle');
  const [statusMessage, setStatusMessage] = useState('System ready.');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log("SilenceX Component Mounted");
  }, []);

  const applyPreset = (type: 'low' | 'med' | 'high') => {
    if (type === 'low') { setThreshold(-45); setMinDuration(1.0); }
    if (type === 'med') { setThreshold(-35); setMinDuration(0.5); }
    if (type === 'high') { setThreshold(-20); setMinDuration(0.2); }
  };

  const handleScan = () => {
    setIsScanning(true);
    setStatus('scanning');
    setStatusMessage('Scanning timelines...');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => (p >= 100 ? 100 : p + 4));
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      const mocks = [
        { id: '1', start: 1.5, end: 2.8, duration: 1.3 },
        { id: '2', start: 6.2, end: 7.0, duration: 0.8 },
        { id: '3', start: 14.2, end: 17.0, duration: 2.8 },
      ].filter(r => r.duration >= minDuration);
      setRegions(mocks);
      setIsScanning(false);
      setStatus('ready');
      setStatusMessage(`Found ${mocks.length} gaps.`);
    }, 2000);
  };

  const handleRemove = () => {
    if (regions.length === 0) return;
    setIsRemoving(true);
    setStatus('removing');
    CSInterface.evalScript(`SilenceX.processSilence('${JSON.stringify(regions)}')`, () => {
      setIsRemoving(false);
      setStatus('done');
      setStatusMessage('Done!');
      setRegions([]);
    });
  };

  const totalSaved = useMemo(() => 
    regions.reduce((a, b) => a + b.duration, 0).toFixed(1), 
    [regions]
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0F1115] text-white select-none font-sans">
      <div className="bg-red-500 text-white p-1 text-center text-[10px] z-50">APPLICATION LOADED</div>
      {/* Header */}
      <header className="h-16 flex items-center px-6 justify-between shrink-0 glass-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold">
            SX
          </div>
          <div>
            <div className="text-lg font-bold">SilenceX</div>
            <div className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Umar Saeed</div>
          </div>
        </div>
        <div className="text-[10px] opacity-40 uppercase tracking-widest font-bold">
          Professional Edition
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Sidebar */}
        <aside className="w-80 glass-panel border-r border-white/5 p-6 flex flex-col gap-8 shrink-0">
          <div>
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-6">Detection</h2>
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium text-slate-300">
                  <span>Threshold</span>
                  <span className="text-indigo-400 font-mono">{threshold}dB</span>
                </div>
                <input type="range" min="-60" max="-10" value={threshold} onChange={e => setThreshold(+e.target.value)} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium text-slate-300">
                  <span>Duration</span>
                  <span className="text-indigo-400 font-mono">{minDuration}s</span>
                </div>
                <input type="range" min="0.2" max="3" step="0.1" value={minDuration} onChange={e => setMinDuration(+e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'med', 'high'].map((p: any) => (
                  <button key={p} onClick={() => applyPreset(p)} className="p-2 text-[10px] font-bold uppercase border border-white/5 bg-white/5 rounded hover:bg-white/10 transition-colors">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <button onClick={handleScan} disabled={isScanning} className="w-full py-3 bg-white/10 rounded-lg text-sm font-bold border border-white/5 hover:bg-white/20 transition-all">
              Scan Silence
            </button>
            <button onClick={handleRemove} disabled={regions.length === 0 || isRemoving} className="w-full py-4 accent-btn rounded-xl text-sm font-bold shadow-xl shadow-indigo-600/20">
              Remove & Ripple
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden bg-[#0a0c10]/50">
          <div className="flex justify-between items-center">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Preview</h2>
            {regions.length > 0 && (
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">
                SAVED: {totalSaved}s
              </span>
            )}
          </div>

          {/* Timeline Waveform Placeholder */}
          <div className="h-40 glass-panel rounded-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 flex items-center px-10 gap-2">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="flex-1 bg-slate-400 rounded-full" style={{ height: `${Math.random() * 80 + 20}%` }} />
              ))}
            </div>
            {regions.length > 0 ? (
              <div className="z-10 text-xs font-mono text-indigo-400 bg-indigo-400/10 px-4 py-2 rounded-full border border-indigo-500/20">
                Segment Analysis Ready
              </div>
            ) : (
              <div className="z-10 text-xs text-slate-600 tracking-wider">NO ACTIVE ANALYSIS</div>
            )}
          </div>

          {/* List Area */}
          <div className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col">
            <div className="grid grid-cols-4 p-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 border-b border-white/5">
              <span>#</span>
              <span>Start</span>
              <span>Gap</span>
              <span>Action</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
              {regions.map((r, i) => (
                <div key={r.id} className="grid grid-cols-4 p-3 text-xs font-mono border-b border-white/5 last:border-0 hover:bg-white/5 rounded-lg transition-colors items-center">
                  <span className="text-slate-500">{i+1}</span>
                  <span className="text-slate-300">{r.start.toFixed(2)}s</span>
                  <span className="text-slate-300">{r.duration.toFixed(2)}s</span>
                  <span className="text-pink-500 font-bold uppercase text-[9px]">Cut & Move</span>
                </div>
              ))}
              {regions.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-700 text-[11px] uppercase tracking-[0.2em]">
                  - Waiting for Scan -
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="h-10 px-6 glass-header border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-blue-500 animate-ping' : isRemoving ? 'bg-orange-500 animate-pulse' : 'bg-slate-600'}`} />
          <span>{statusMessage}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-indigo-500" />
          </div>
        </div>
      </footer>

      {/* Overlay */}
      <AnimatePresence>
        {(isScanning || isRemoving) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel p-12 rounded-[40px] max-w-sm w-full flex flex-col items-center gap-8 border border-white/10"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-white/5 border-t-indigo-500 animate-spin" />
                <Zap className="absolute inset-x-0 inset-y-0 m-auto text-indigo-500 animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold tracking-tight mb-2">{isScanning ? 'Analyzing...' : 'Processing...'}</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{progress}% COMPLETED</p>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-indigo-500 px-4" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
