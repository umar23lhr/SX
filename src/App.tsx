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
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface SilenceRegion {
  id: string;
  start: number;
  end: number;
  duration: number;
}

// --- Mock CEP Interface for Simulation ---
const CSInterface = {
  evalScript: (script: string, callback?: (result: string) => void) => {
    console.log('Executing JSX:', script);
    // Simulate async execution
    setTimeout(() => {
      if (callback) callback("Success: Mock script response");
    }, 1500);
  }
};

export default function SilenceX() {
  // --- State ---
  const [threshold, setThreshold] = useState(-35); // dB
  const [minDuration, setMinDuration] = useState(0.5); // seconds
  const [isScanning, setIsScanning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [regions, setRegions] = useState<SilenceRegion[]>([]);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'ready' | 'removing' | 'done'>('idle');
  const [statusMessage, setStatusMessage] = useState('Plugin ready. Open a sequence to start.');
  const [progress, setProgress] = useState(0);

  // --- Logic ---
  const applyPreset = (type: 'low' | 'med' | 'high') => {
    if (type === 'low') { setThreshold(-45); setMinDuration(1.0); }
    if (type === 'med') { setThreshold(-35); setMinDuration(0.5); }
    if (type === 'high') { setThreshold(-20); setMinDuration(0.2); }
  };

  const handleScan = () => {
    setIsScanning(true);
    setStatus('scanning');
    setStatusMessage('Analyzing audio track in active sequence...');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Simulate detection logic
    setTimeout(() => {
      clearInterval(interval);
      const mockRegions: SilenceRegion[] = [
        { id: '1', start: 1.2, end: 2.5, duration: 1.3 },
        { id: '2', start: 5.8, end: 6.4, duration: 0.6 },
        { id: '3', start: 12.0, end: 14.5, duration: 2.5 },
        { id: '4', start: 18.2, end: 19.1, duration: 0.9 },
        { id: '5', start: 25.5, end: 28.0, duration: 2.5 },
      ].filter(r => r.duration >= minDuration);

      setRegions(mockRegions);
      setIsScanning(false);
      setStatus('ready');
      setStatusMessage(`Detected ${mockRegions.length} silent regions.`);
    }, 2000);
  };

  const handleRemove = () => {
    if (regions.length === 0) return;

    setIsRemoving(true);
    setStatus('removing');
    setStatusMessage('Processing ripple delete in Premiere Pro...');

    // In a real CEP plugin, we would stringify the regions and send to JSX
    const script = `SilenceX.processSilence('${JSON.stringify(regions)}')`;
    
    CSInterface.evalScript(script, (result) => {
      setIsRemoving(false);
      setStatus('done');
      setStatusMessage('Silence removal complete! Clips ripples deleted.');
      setRegions([]);
    });
  };

  const totalSilenceDuration = useMemo(() => 
    regions.reduce((acc, curr) => acc + curr.duration, 0).toFixed(2), 
    [regions]
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0F1115]">
      {/* Header Area */}
      <header className="h-16 glass-header flex items-center px-6 justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            SX
          </div>
          <div>
            <span className="text-[17px] font-semibold tracking-tight text-white">SilenceX</span>
            <span className="text-[11px] text-slate-400 font-medium ml-2 opacity-60">v1.4.0</span>
          </div>
        </div>
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-widest opacity-60">
          Umar Saeed Professional Edition
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-[320px_1fr] overflow-hidden">
        {/* Sidebar Settings */}
        <aside className="glass-panel p-6 flex flex-col gap-8 border-r border-white/5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-5">
              Detection Settings
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-3">
                <label className="text-[13px] flex justify-between font-medium text-slate-200">
                  Threshold 
                  <span className="value-badge text-[#a855f7] font-mono">{threshold.toFixed(1)} dB</span>
                </label>
                <input 
                  type="range" 
                  min="-60" 
                  max="-10" 
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[13px] flex justify-between font-medium text-slate-200">
                  Min Duration 
                  <span className="value-badge text-[#a855f7] font-mono">{minDuration}s</span>
                </label>
                <input 
                  type="range" 
                  min="0.2" 
                  max="3" 
                  step="0.05" 
                  value={minDuration}
                  onChange={(e) => setMinDuration(parseFloat(e.target.value))}
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <label className="text-[12px] font-medium text-slate-400">Sensitivity Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'med', 'high'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => applyPreset(p)}
                      className={`py-2 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all border ${
                        (p === 'low' && threshold === -45) || (p === 'med' && threshold === -35) || (p === 'high' && threshold === -20)
                        ? 'bg-[#a855f7]/20 border-[#a855f7] text-white'
                        : 'bg-[#1e293b]/50 border-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <button 
              onClick={handleScan}
              disabled={isScanning || isRemoving}
              className="w-full py-3 rounded-lg border border-slate-600 text-[13px] font-semibold text-white hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Scan Silence
            </button>
            <button 
              onClick={handleRemove}
              disabled={isScanning || isRemoving || regions.length === 0}
              className="w-full accent-btn py-3.5 rounded-lg text-[14px] font-bold text-white shadow-xl shadow-indigo-600/20 disabled:grayscale disabled:opacity-30"
            >
              Remove Silence & Ripple
            </button>
            <div className="text-[10px] text-center text-slate-500 font-medium">
              Action will affect {regions.length || '--'} clips on track A1
            </div>
          </div>
        </aside>

        {/* Visualization Canvas Area */}
        <section className="bg-[#0F1115] flex flex-col p-6 gap-6 overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">
              Timeline Preview
            </div>
            {regions.length > 0 && (
              <div className="text-[10px] text-[#a855f7] font-mono font-bold bg-[#a855f7]/10 px-2 py-0.5 rounded border border-[#a855f7]/20">
                SAVED: {totalSilenceDuration}s
              </div>
            )}
          </div>

          <div className="h-40 bg-[#15181e] rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center group">
            {/* Waveform SVG representation */}
            <svg className="w-full h-full opacity-40 px-4" viewBox="0 0 700 160">
              <rect x="0" y="60" width="4" height="40" fill="#475569" rx="2" />
              <rect x="10" y="40" width="4" height="80" fill="#475569" rx="2" />
              <rect x="20" y="30" width="4" height="100" fill="#475569" rx="2" />
              <rect x="30" y="50" width="4" height="60" fill="#475569" rx="2" />
              <rect x="40" y="40" width="4" height="80" fill="#475569" rx="2" />
              <rect x="50" y="30" width="4" height="100" fill="#475569" rx="2" />
              
              {/* Dynamic Silence Blocks based on detected regions if scanning is done */}
              {regions.map((region, i) => (
                <g key={region.id}>
                  <motion.rect 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    x={region.start * 20 + 60} 
                    y="0" 
                    width={region.duration * 20} 
                    height="160" 
                    fill="#ef4444" 
                  />
                  <line x1={region.start * 20 + 60} y1="0" x2={region.start * 20 + 60} y2="160" stroke="#ef4444" strokeWidth="1" />
                  <line x1={(region.start + region.duration) * 20 + 60} y1="0" x2={(region.start + region.duration) * 20 + 60} y2="160" stroke="#ef4444" strokeWidth="1" />
                </g>
              ))}

              <g transform="translate(500,0)">
                <rect x="0" y="20" width="4" height="120" fill="#475569" rx="2" />
                <rect x="10" y="10" width="4" height="140" fill="#475569" rx="2" />
                <rect x="20" y="30" width="4" height="100" fill="#475569" rx="2" />
              </g>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
              <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-mono border border-white/10">Active Timeline Segment</span>
            </div>
          </div>

          <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col min-h-0">
            <div className="grid grid-cols-[40px_1fr_1fr_80px] px-5 py-3.5 bg-white/[0.03] text-[11px] font-bold text-slate-400 uppercase tracking-widest border-bottom border-white/5">
              <div>ID</div>
              <div>Start</div>
              <div>Duration</div>
              <div>Type</div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode='popLayout'>
                {regions.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 text-xs italic py-20">
                    No detections found in current segment.
                  </div>
                ) : (
                  regions.map((region, idx) => (
                    <motion.div
                      key={region.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`grid grid-cols-[40px_1fr_1fr_80px] px-5 py-3 text-[12px] items-center border-b border-white/5 ${idx % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                    >
                      <div className="text-slate-500 font-mono">{(idx + 1).toString().padStart(2, '0')}</div>
                      <div className="font-mono text-slate-400">{region.start.toFixed(2)}s</div>
                      <div className="font-mono text-slate-400">{region.duration.toFixed(2)}s</div>
                      <div className="text-[#ef4444] font-semibold">Silence</div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-10 bg-[#0a0c10] border-t border-white/5 px-6 flex items-center justify-between text-[11px] text-slate-400/80">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'scanning' ? 'bg-blue-500 animate-ping' : status === 'ready' || status === 'done' ? 'bg-green-500' : 'bg-slate-600'}`} />
          <span>Status: {statusMessage}</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-medium">Ripple mode active</span>
          <div className="w-48 h-1 bg-[#1e293b] rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]" 
            />
          </div>
        </div>
      </footer>

      {/* Simulation Overlay */}
      {(isScanning || isRemoving) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 p-10 rounded-3xl glass-panel border border-white/10 shadow-3xl max-w-xs w-full">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-white/5 border-t-[#a855f7] animate-spin" />
              <Zap size={24} className="absolute inset-x-0 inset-y-0 m-auto text-[#a855f7] animate-pulse" />
            </div>
            <div className="text-center w-full">
              <h3 className="text-white font-bold text-lg">{isScanning ? 'Analyzing Audio' : 'Removing Silence'}</h3>
              <p className="text-slate-400 text-xs mt-2 mb-6 select-none opacity-80 uppercase tracking-widest font-medium">
                {isScanning ? `Processing... ${progress}%` : 'Applying ripple cuts...'}
              </p>
              
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
