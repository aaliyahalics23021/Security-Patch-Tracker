import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { 
  ShieldAlert, CheckCircle, Clock, AlertTriangle, 
  TrendingUp, BarChart2, Shield, Calendar, Terminal, Grid
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const { findings, auditLogs, assets } = useSecurity();

  const now = new Date();

  // 1. KPI Calculations
  const totalFindings = findings.length;
  
  const openFindings = findings.filter(
    f => f.status !== 'Closed' && f.status !== 'Verified'
  );
  const openCount = openFindings.length;

  const criticalOpen = openFindings.filter(f => f.severity === 'Critical').length;
  const highOpen = openFindings.filter(f => f.severity === 'High').length;
  const mediumOpen = openFindings.filter(f => f.severity === 'Medium').length;
  const lowOpen = openFindings.filter(f => f.severity === 'Low').length;

  const verifiedClosed = findings.filter(
    f => f.status === 'Closed' || f.status === 'Verified'
  ).length;

  // SLA Breaches: due date is in the past, and it is not verified/closed
  const slaBreaches = openFindings.filter(
    f => new Date(f.dueDate) < now
  ).length;

  // Compliance Score: Max 100, deduct based on open findings weighted by severity
  const rawCompliance = 100 - (criticalOpen * 12 + highOpen * 6 + mediumOpen * 3 + lowOpen * 1);
  const complianceScore = Math.max(0, Math.min(100, Math.round(rawCompliance)));

  // Security Posture Score:
  // - 40% based on open Critical CVEs (40 - (criticalOpen * 10))
  // - 40% based on patch success rate (verifiedClosed / totalFindings)
  // - 10% based on SLA compliance (non-breached open findings / total open findings)
  // - 10% based on QA verification speed (verified / (patched + verification pending))
  const getSecurityPosture = () => {
    if (totalFindings === 0) return 100;
    const critDeduction = Math.max(0, 40 - (criticalOpen * 10));
    const patchSuccess = (verifiedClosed / totalFindings) * 40;
    const nonBreachedRate = openCount > 0 ? ((openCount - slaBreaches) / openCount) * 10 : 10;
    
    const verificationPendingCount = findings.filter(f => f.status === 'Verification Pending' || f.status === 'Patched').length;
    const qaScore = (verifiedClosed + verificationPendingCount) > 0 
      ? (verifiedClosed / (verifiedClosed + verificationPendingCount)) * 10 
      : 10;

    return Math.max(0, Math.min(100, Math.round(critDeduction + patchSuccess + nonBreachedRate + qaScore)));
  };

  const postureScore = getSecurityPosture();

  // Get color for posture score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (score >= 60) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5';
    if (score >= 40) return 'text-orange-400 border-orange-500/30 bg-orange-500/5';
    return 'text-red-400 border-red-500/30 bg-red-500/5';
  };

  // 2. Chart Data Gatherers
  // A. Severity distribution counts
  const totalCritical = findings.filter(f => f.severity === 'Critical').length;
  const totalHigh = findings.filter(f => f.severity === 'High').length;
  const totalMedium = findings.filter(f => f.severity === 'Medium').length;
  const totalLow = findings.filter(f => f.severity === 'Low').length;

  // B. Vulnerabilities by Asset (Top 5)
  const assetCounts = assets.map(asset => {
    const count = findings.filter(f => f.assetId === asset.id && f.status !== 'Closed').length;
    return { name: asset.name, count };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  // (Historical trend charts and workload grids are rendered using mock SVG visual baselines)

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">OPERATIONAL COMMAND CENTER</span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1 lowercase">security operations dashboard</h1>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <Terminal className="h-4 w-4 text-zinc-500" />
          <span>system: operational</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Posture Score */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between glass-card ${getScoreColor(postureScore)}`}>
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">SECURITY POSTURE</span>
              <Shield className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="text-4xl font-extrabold tracking-tighter mt-4">{postureScore}%</div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-4 leading-normal font-sans">
            weighted health factor of critical findings, verification rates, and SLA adherence.
          </p>
        </div>

        {/* Total & Critical */}
        <div className="p-6 rounded-2xl border border-white/5 flex flex-col justify-between glass-card">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">VULNERABILITIES</span>
              <ShieldAlert className="h-5 w-5 text-severity-critical" />
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <div className="text-4xl font-extrabold tracking-tighter text-white">{openCount}</div>
              <div className="text-xs font-mono text-zinc-500">/ {totalFindings} total</div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-3">
            <span className="text-severity-critical font-bold">{criticalOpen} critical</span>
            <span className="text-zinc-600">•</span>
            <span className="text-severity-high font-bold">{highOpen} high</span>
          </div>
        </div>

        {/* SLA & Deadlines */}
        <div className="p-6 rounded-2xl border border-white/5 flex flex-col justify-between glass-card">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">SLA METRIC</span>
              <Clock className="h-5 w-5 text-severity-high" />
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <div className="text-4xl font-extrabold tracking-tighter text-white">{slaBreaches}</div>
              <div className="text-xs font-mono text-zinc-500">active breaches</div>
            </div>
          </div>
          <div className="mt-4 text-[10px] font-mono flex items-center gap-1.5 text-zinc-500 border-t border-white/5 pt-3">
            {slaBreaches > 0 ? (
              <span className="text-severity-critical flex items-center gap-1 font-bold">
                <AlertTriangle className="h-3.5 w-3.5" /> SLA breaches detected
              </span>
            ) : (
              <span className="text-emerald-400 font-bold">all schedules compliant</span>
            )}
          </div>
        </div>

        {/* Compliance Rating */}
        <div className="p-6 rounded-2xl border border-white/5 flex flex-col justify-between glass-card">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">COMPLIANCE INDEX</span>
              <CheckCircle className="h-5 w-5 text-severity-verified" />
            </div>
            <div className="text-4xl font-extrabold tracking-tighter mt-4 text-white">{complianceScore}%</div>
          </div>
          <div className="mt-4 w-full bg-zinc-900 rounded-full h-1.5 border border-white/5">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#ffffff]"
              style={{ width: `${complianceScore}%` }}
            />
          </div>
        </div>

      </div>

      {/* Main Charts & Activity Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Charts Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Chart 1: Severity Distribution (SVG Donut) */}
          <div className="p-6 rounded-2xl border border-white/5 glass-card flex flex-col justify-between h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">SEVERITY DISTRIBUTION</span>
                <TrendingUp className="h-4 w-4 text-zinc-500" />
              </div>

              <div className="flex items-center justify-between h-40">
                {/* SVG Donut */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                    
                    {/* Critical (Red) */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="8" 
                      strokeDasharray="251" 
                      strokeDashoffset={251 - (251 * (totalCritical / (totalFindings || 1)))} 
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    {/* High (Orange) */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f97316" strokeWidth="8" 
                      strokeDasharray="251" 
                      strokeDashoffset={251 - (251 * ((totalCritical + totalHigh) / (totalFindings || 1)))} 
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-bold">{totalFindings}</span>
                    <span className="text-[8px] font-mono text-zinc-500">CVE TOTAL</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-1.5 text-[10px] font-mono w-1/2 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-severity-critical" /> Critical</span>
                    <span className="text-zinc-400 font-bold">{totalCritical}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-severity-high" /> High</span>
                    <span className="text-zinc-400 font-bold">{totalHigh}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-severity-medium" /> Medium</span>
                    <span className="text-zinc-400 font-bold">{totalMedium}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-severity-low" /> Low</span>
                    <span className="text-zinc-400 font-bold">{totalLow}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-zinc-500 font-sans border-t border-white/5 pt-2">
              live distribution of identified CVEs in active software deployments.
            </p>
          </div>

          {/* Chart 2: Vulnerabilities by Asset (SVG Bars) */}
          <div className="p-6 rounded-2xl border border-white/5 glass-card flex flex-col justify-between h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">TOP EXPOSED ASSETS</span>
                <BarChart2 className="h-4 w-4 text-zinc-500" />
              </div>

              <div className="space-y-3 h-40 flex flex-col justify-center">
                {assetCounts.map((asset, idx) => (
                  <div key={asset.name} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-zinc-300">{asset.name}</span>
                      <span className="text-white font-bold">{asset.count} open</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full border border-white/5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          idx === 0 ? 'bg-severity-critical' : idx === 1 ? 'bg-severity-high' : 'bg-severity-medium'
                        }`}
                        style={{ width: `${Math.min(100, (asset.count / 6) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[9px] text-zinc-500 font-sans border-t border-white/5 pt-2">
              ranking of infrastructure nodes with the highest concentration of active findings.
            </p>
          </div>

          {/* Chart 3: Monthly Remediation Trend (SVG Area) */}
          <div className="p-6 rounded-2xl border border-white/5 glass-card flex flex-col justify-between h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">REMEDIATION HISTORY</span>
                <Calendar className="h-4 w-4 text-zinc-500" />
              </div>

              <div className="h-44 relative">
                <svg className="w-full h-full" viewBox="0 0 200 100">
                  <defs>
                    <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="10" y1="10" x2="190" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="10" y1="50" x2="190" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="10" y1="90" x2="190" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                  {/* Trend Area Path (Open) */}
                  <path 
                    d="M 10 90 L 10 70 L 55 50 L 100 60 L 145 35 L 190 40 L 190 90 Z" 
                    fill="url(#gradient-area)" 
                  />

                  {/* Lines */}
                  <path 
                    d="M 10 70 L 55 50 L 100 60 L 145 35 L 190 40" 
                    fill="none" 
                    stroke="#ef4444" 
                    strokeWidth="1.5"
                    className="stroke-dash" 
                  />
                  <path 
                    d="M 10 85 L 55 75 L 100 65 L 145 45 L 190 35" 
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="1.5"
                    className="stroke-dash" 
                  />

                  {/* Data Points */}
                  <circle cx="190" cy="40" r="3" fill="#ef4444" />
                  <circle cx="190" cy="35" r="3" fill="#22c55e" />

                  {/* Labels */}
                  <text x="10" y="98" fill="#555866" fontSize="6" fontFamily="monospace">Mar</text>
                  <text x="55" y="98" fill="#555866" fontSize="6" fontFamily="monospace">Apr</text>
                  <text x="100" y="98" fill="#555866" fontSize="6" fontFamily="monospace">May</text>
                  <text x="145" y="98" fill="#555866" fontSize="6" fontFamily="monospace">Jun</text>
                  <text x="190" y="98" fill="#555866" fontSize="6" fontFamily="monospace">Jul</text>
                </svg>

                {/* Floating legend overlay */}
                <div className="absolute top-2 left-2 flex gap-4 text-[9px] font-mono">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-severity-critical" /> open risks</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-severity-low" /> resolved patches</span>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-zinc-500 font-sans border-t border-white/5 pt-2">
              historical progression of discovered risk vectors versus successfully applied verification cycles.
            </p>
          </div>

          {/* Chart 4: Risk Heatmap Matrix */}
          <div className="p-6 rounded-2xl border border-white/5 glass-card flex flex-col justify-between h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">SECURITY RISK HEATMAP</span>
                <Grid className="h-4 w-4 text-zinc-500" />
              </div>

              {/* Heatmap Grid */}
              <div className="grid grid-cols-5 gap-1.5 font-mono text-[9px] h-36 items-center">
                {/* Headers */}
                <div className="col-span-1 text-zinc-600 uppercase text-right pr-2">Sev</div>
                <div className="col-span-1 text-zinc-500 text-center font-bold">Web</div>
                <div className="col-span-1 text-zinc-500 text-center font-bold">DB</div>
                <div className="col-span-1 text-zinc-500 text-center font-bold">VM</div>
                <div className="col-span-1 text-zinc-500 text-center font-bold">PC</div>

                {/* Critical Row */}
                <div className="text-red-500 text-right pr-2 font-bold font-mono">CRIT</div>
                <div className={`p-2.5 rounded text-center font-bold ${criticalOpen > 0 ? 'bg-red-500/30 text-red-400' : 'bg-zinc-900/40 text-zinc-700'}`}>
                  {findings.filter(f => f.severity === 'Critical' && f.status !== 'Closed' && f.assetId.includes('WebServer')).length}
                </div>
                <div className={`p-2.5 rounded text-center font-bold ${criticalOpen > 0 ? 'bg-red-500/10 text-red-400' : 'bg-zinc-900/40 text-zinc-700'}`}>
                  {findings.filter(f => f.severity === 'Critical' && f.status !== 'Closed' && f.assetId.includes('Database')).length}
                </div>
                <div className={`p-2.5 rounded text-center font-bold ${criticalOpen > 0 ? 'bg-red-500/20 text-red-400' : 'bg-zinc-900/40 text-zinc-700'}`}>
                  {findings.filter(f => f.severity === 'Critical' && f.status !== 'Closed' && f.assetId.includes('CloudVM')).length}
                </div>
                <div className="p-2.5 rounded text-center bg-zinc-900/40 text-zinc-700 font-bold">0</div>

                {/* High Row */}
                <div className="text-orange-500 text-right pr-2 font-bold font-mono">HIGH</div>
                <div className={`p-2.5 rounded text-center font-bold ${highOpen > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-900/40 text-zinc-700'}`}>
                  {findings.filter(f => f.severity === 'High' && f.status !== 'Closed' && f.assetId.includes('WebServer')).length}
                </div>
                <div className={`p-2.5 rounded text-center font-bold ${highOpen > 0 ? 'bg-orange-500/30 text-orange-400' : 'bg-zinc-900/40 text-zinc-700'}`}>
                  {findings.filter(f => f.severity === 'High' && f.status !== 'Closed' && f.assetId.includes('Database')).length}
                </div>
                <div className={`p-2.5 rounded text-center font-bold ${highOpen > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-900/40 text-zinc-700'}`}>
                  {findings.filter(f => f.severity === 'High' && f.status !== 'Closed' && f.assetId.includes('CloudVM')).length}
                </div>
                <div className={`p-2.5 rounded text-center font-bold ${highOpen > 0 ? 'bg-orange-500/10 text-orange-400' : 'bg-zinc-900/40 text-zinc-700'}`}>
                  {findings.filter(f => f.severity === 'High' && f.status !== 'Closed' && f.assetId.includes('PC')).length}
                </div>

                {/* Medium Row */}
                <div className="text-yellow-500 text-right pr-2 font-bold font-mono">MED</div>
                <div className="p-2.5 rounded text-center bg-zinc-900/40 text-zinc-700 font-bold">0</div>
                <div className="p-2.5 rounded text-center bg-zinc-900/40 text-zinc-700 font-bold">0</div>
                <div className="p-2.5 rounded text-center bg-zinc-900/40 text-zinc-700 font-bold">0</div>
                <div className="p-2.5 rounded text-center bg-zinc-900/40 text-zinc-700 font-bold">0</div>
              </div>
            </div>
            <p className="text-[9px] text-zinc-500 font-sans border-t border-white/5 pt-2">
              vulnerability risk exposure matrix grouped by asset category and vulnerability severity.
            </p>
          </div>

        </div>

        {/* Right Col: Real-time Activity Feed */}
        <div className="p-6 rounded-2xl border border-white/5 glass-card flex flex-col justify-between h-[624px] lg:col-span-1">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">SYSTEM SECURITY LOGS</span>
              <Terminal className="h-4 w-4 text-zinc-500" />
            </div>

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar max-h-[500px]">
              {auditLogs.slice(0, 15).map((log) => (
                <div key={log.id} className="text-xs space-y-1 font-mono hover:bg-white/5 p-2 rounded-lg transition-colors border border-transparent hover:border-white/5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400 font-bold uppercase">{log.action}</span>
                    <span className="text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">{log.details}</p>
                  <div className="flex items-center gap-1.5 text-[9px] text-zinc-600">
                    <span>operator:</span>
                    <span className="text-zinc-400 font-semibold">{log.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 text-center">
            <span className="text-[10px] text-zinc-500 font-mono">
              showing last {Math.min(15, auditLogs.length)} events // syslog connection established
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
