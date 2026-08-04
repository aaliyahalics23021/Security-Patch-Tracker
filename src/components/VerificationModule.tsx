import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { 
  X, CheckSquare, Square, Play, RotateCw, FileText 
} from 'lucide-react';

interface VerificationModuleProps {
  findingId: string;
  onClose: () => void;
}

export const VerificationModule: React.FC<VerificationModuleProps> = ({ findingId, onClose }) => {
  const { findings, updateVerificationChecklist, verifyFinding, demoStep, setDemoStep } = useSecurity();

  const finding = findings.find(f => f.id === findingId);

  // Verification Rescan simulation state
  const [isRescanning, setIsRescanning] = useState(false);
  const [rescanProgress, setRescanProgress] = useState(0);
  const [rescanRun, setRescanRun] = useState(false);
  const [comments, setComments] = useState('');

  if (!finding) return null;

  const checks = finding.verifiedChecks;
  const score = finding.verificationScore;

  const toggleCheck = (key: keyof typeof checks) => {
    // If it's vulnerability rescanned, prevent manual toggle unless rescan runs
    if (key === 'vulnerabilityRescanned' && !rescanRun) return;
    
    updateVerificationChecklist(findingId, { [key]: !checks[key] });
  };

  const handleRunRescan = () => {
    setIsRescanning(true);
    setRescanProgress(0);
    
    const interval = setInterval(() => {
      setRescanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRescanning(false);
          setRescanRun(true);
          
          // Automatically set rescanned check to true
          updateVerificationChecklist(findingId, { vulnerabilityRescanned: true });
          
          // Progress Demo step if relevant
          if (demoStep === 9) {
            setDemoStep(10);
          }
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handleAction = (action: 'Approve' | 'Reject' | 'Rework') => {
    verifyFinding(findingId, action, comments);
    
    // Progress Demo step if approved
    if (action === 'Approve' && demoStep === 10) {
      setDemoStep(11);
    }
    
    onClose();
  };

  const allChecked = Object.values(checks).every(Boolean);

  // SVG Progress Ring calculations
  const radius = 30;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-filter backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="glass-panel w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 p-6 shadow-2xl relative grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 hover:bg-white/5 rounded-full text-zinc-400"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Column: Details & Evidence (Col Span 5) */}
        <div className="md:col-span-5 space-y-4 border-r border-white/5 pr-4 text-left">
          <div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Verification Target</span>
            <h3 className="text-lg font-bold text-white mt-0.5">{finding.cveId}</h3>
            <span className="text-[10px] text-zinc-500 font-mono block mt-1">Asset Target: {finding.assetId}</span>
          </div>

          {/* Evidence Viewer */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-widest">Remediation Evidence</span>
            
            {finding.evidence.length === 0 ? (
              <div className="text-[10px] text-zinc-500 font-mono bg-zinc-950 p-4 rounded-xl border border-white/5">
                No patch evidence uploaded. Task status must be "Patched" to verify.
              </div>
            ) : (
              <div className="space-y-3">
                {finding.evidence.map((ev) => (
                  <div key={ev.id} className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between text-zinc-400 bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="font-bold flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {ev.fileName}</span>
                      <span className="text-zinc-500">{ev.fileType}</span>
                    </div>
                    {/* Log Terminal Block */}
                    <div className="bg-zinc-950 p-3 rounded-xl border border-white/5 h-36 overflow-y-auto font-mono text-[10px] text-zinc-400 leading-normal no-scrollbar">
                      <span className="text-zinc-600 block border-b border-white/5 pb-1 mb-1">// UPLOADED LOG DETAILS:</span>
                      {ev.contentSnippet}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comment text area */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[9px] font-mono text-zinc-500 uppercase">QA Auditor Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide verification signature notes..."
              rows={2}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-[11px] font-mono text-white focus:outline-none resize-none focus:border-white/10"
            />
          </div>
        </div>

        {/* Right Column: Checklist & Rescan (Col Span 7) */}
        <div className="md:col-span-7 space-y-6 flex flex-col justify-between text-left">
          
          {/* Top block: Checklist & Score Dial */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-white/5 pb-4">
            
            {/* Checklist cards */}
            <div className="flex-1 space-y-2.5">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Interactive Checklist</span>
              
              <div className="space-y-2 font-mono text-xs text-zinc-300">
                
                {/* Check 1 */}
                <button
                  onClick={() => toggleCheck('patchInstalled')}
                  className="w-full flex items-center gap-2.5 p-2.5 bg-zinc-950/40 border border-white/5 rounded-xl hover:bg-white/5 transition-all text-left"
                >
                  {checks.patchInstalled ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4 text-zinc-600" />}
                  <span className={checks.patchInstalled ? 'text-white font-bold' : ''}>Patch Installed</span>
                </button>

                {/* Check 2 */}
                <button
                  onClick={() => toggleCheck('versionVerified')}
                  className="w-full flex items-center gap-2.5 p-2.5 bg-zinc-950/40 border border-white/5 rounded-xl hover:bg-white/5 transition-all text-left"
                >
                  {checks.versionVerified ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4 text-zinc-600" />}
                  <span className={checks.versionVerified ? 'text-white font-bold' : ''}>Version Verified</span>
                </button>

                {/* Check 3 */}
                <button
                  disabled={!rescanRun}
                  onClick={() => toggleCheck('vulnerabilityRescanned')}
                  className={`w-full flex items-center gap-2.5 p-2.5 bg-zinc-950/40 border border-white/5 rounded-xl text-left ${
                    rescanRun ? 'hover:bg-white/5 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  {checks.vulnerabilityRescanned ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4 text-zinc-600" />}
                  <span className={checks.vulnerabilityRescanned ? 'text-white font-bold' : ''}>Vulnerability Rescanned</span>
                </button>

                {/* Check 4 */}
                <button
                  onClick={() => toggleCheck('serviceRunningNormally')}
                  className="w-full flex items-center gap-2.5 p-2.5 bg-zinc-950/40 border border-white/5 rounded-xl hover:bg-white/5 transition-all text-left"
                >
                  {checks.serviceRunningNormally ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4 text-zinc-600" />}
                  <span className={checks.serviceRunningNormally ? 'text-white font-bold' : ''}>Service Running Normally</span>
                </button>

                {/* Check 5 */}
                <button
                  onClick={() => toggleCheck('noRegressionDetected')}
                  className="w-full flex items-center gap-2.5 p-2.5 bg-zinc-950/40 border border-white/5 rounded-xl hover:bg-white/5 transition-all text-left"
                >
                  {checks.noRegressionDetected ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4 text-zinc-600" />}
                  <span className={checks.noRegressionDetected ? 'text-white font-bold' : ''}>No Regression Detected</span>
                </button>

              </div>
            </div>

            {/* Score Ring indicator */}
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/40 border border-white/5 rounded-2xl w-40 h-44 text-center shrink-0">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2">VERIFIED RATIO</span>
              
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r={normalizedRadius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth={stroke} />
                  <circle cx="30" cy="30" r={normalizedRadius} fill="transparent" strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="stroke-emerald-400 transition-all duration-500"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base font-extrabold text-white font-mono">{score}%</span>
                </div>
              </div>
              <span className="text-[8px] font-mono text-zinc-500 mt-3 leading-normal uppercase">
                {score === 100 ? 'ready for resolve' : 'audit pending'}
              </span>
            </div>

          </div>

          {/* Verification Rescan Simulator */}
          <div className="glass-card bg-zinc-950/60 p-4 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center font-mono">
              <span className="text-[10px] text-zinc-500 uppercase">Verification Threat Rescan</span>
              
              <button
                disabled={isRescanning}
                onClick={handleRunRescan}
                className={`px-3 py-1 bg-white text-black font-mono text-[10px] font-bold rounded-full transition-all flex items-center gap-1 ${
                  isRescanning ? 'cursor-wait bg-zinc-800 text-zinc-500' : 'hover:bg-zinc-200'
                }`}
              >
                {isRescanning ? (
                  <>
                    <RotateCw className="h-3 w-3 animate-spin" />
                    <span>scanning... {rescanProgress}%</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-current" />
                    <span>Run Verification Scan</span>
                  </>
                )}
              </button>
            </div>

            {/* Comparison graphs details once scan runs */}
            {rescanRun ? (
              <div className="grid grid-cols-3 gap-4 font-mono text-[10px] items-center animate-in fade-in duration-500 border-t border-white/5 pt-3">
                <div className="space-y-1">
                  <span className="text-zinc-500 uppercase text-[8px] block">Threat count</span>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-severity-critical">Before: 4</span>
                    <span className="text-zinc-600">→</span>
                    <span className="text-emerald-400">After: 0</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-500 uppercase text-[8px] block">Risk Exposure</span>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-severity-critical">92%</span>
                    <span className="text-zinc-600">→</span>
                    <span className="text-emerald-400">0%</span>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-zinc-500 uppercase text-[8px] block">Threat reduction</span>
                  <span className="text-emerald-400 font-bold text-xs">Risk Reduced: 92%</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-zinc-600 font-mono text-center py-2">
                Launch the verification scan to verify package versions and trigger auto-tests.
              </p>
            )}
          </div>

          {/* Action Resolve buttons */}
          <div className="flex justify-between items-center gap-3 pt-4 border-t border-white/5 font-mono text-xs">
            <button
              onClick={() => handleAction('Reject')}
              className="px-4 py-2 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded-xl transition-all font-bold"
            >
              Reject Patch
            </button>
            <button
              onClick={() => handleAction('Rework')}
              className="px-4 py-2 border border-yellow-500/20 hover:bg-yellow-500/10 text-yellow-400 rounded-xl transition-all"
            >
              Request Rework
            </button>
            <button
              disabled={!allChecked}
              onClick={() => handleAction('Approve')}
              className={`px-6 py-2 font-bold rounded-xl transition-all ${
                allChecked 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-zinc-900 text-zinc-600 border border-white/5 cursor-not-allowed'
              }`}
            >
              Approve & Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
