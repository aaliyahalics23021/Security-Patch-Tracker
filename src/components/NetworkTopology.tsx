import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import type { Asset } from '../context/SecurityContext';
import { 
  Network, Server, Laptop, Cpu, ShieldCheck, 
  AlertTriangle, Database, Activity, MapPin, X, Info
} from 'lucide-react';

interface NodeData {
  id: string;
  name: string;
  x: number;
  y: number;
  type: Asset['type'];
}

export const NetworkTopology: React.FC = () => {
  const { assets, findings } = useSecurity();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Node placements
  const nodes: NodeData[] = [
    { id: 'WebServer-01', name: 'WebServer-01', x: 150, y: 120, type: 'Web Server' },
    { id: 'Database-01', name: 'Database-01', x: 150, y: 280, type: 'Database Server' },
    { id: 'CloudVM-01', name: 'CloudVM-01', x: 450, y: 120, type: 'Cloud VM' },
    { id: 'Finance-PC-01', name: 'Finance-PC-01', x: 450, y: 280, type: 'Workstation' },
    { id: 'HR-PC-01', name: 'HR-PC-01', x: 300, y: 340, type: 'Workstation' }
  ];

  // Core router node
  const coreNode = { name: 'Core Firewall Gateway', x: 300, y: 200 };

  const getAssetVulnerabilities = (assetId: string) => {
    return findings.filter(
      f => f.assetId === assetId && f.status !== 'Closed' && f.status !== 'Verified'
    );
  };

  const getAssetRiskMetrics = (assetId: string) => {
    const assetFindings = getAssetVulnerabilities(assetId);
    const critical = assetFindings.filter(f => f.severity === 'Critical').length;
    const high = assetFindings.filter(f => f.severity === 'High').length;
    const medium = assetFindings.filter(f => f.severity === 'Medium').length;
    const low = assetFindings.filter(f => f.severity === 'Low').length;

    const riskScore = Math.min(100, critical * 45 + high * 20 + medium * 8 + low * 2);
    return { count: assetFindings.length, riskScore };
  };



  const getIcon = (type: Asset['type']) => {
    switch (type) {
      case 'Web Server': return <Server className="h-5 w-5 text-white" />;
      case 'Database Server': return <Database className="h-5 w-5 text-white" />;
      case 'Cloud VM': return <Cpu className="h-5 w-5 text-white" />;
      default: return <Laptop className="h-5 w-5 text-white" />;
    }
  };

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const selectedMetrics = selectedAsset ? getAssetRiskMetrics(selectedAsset.id) : null;
  const selectedVuls = selectedAsset ? getAssetVulnerabilities(selectedAsset.id) : [];

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">INFRASTRUCTURE VISUALIZER</span>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1 lowercase">network topology & routing</h1>
      </div>

      {/* Main Grid: Visualizer + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Topology Map (Col Span 7) */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-white/5 relative flex flex-col items-center justify-center">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 font-mono text-[9px] text-zinc-500">
            <Activity className="h-3.5 w-3.5 text-zinc-600 animate-pulse" />
            <span>INTERACTIVE ROUTING GRAPH // CLICK TO PROBE</span>
          </div>

          <div className="absolute bottom-4 left-4 flex gap-4 text-[9px] font-mono text-zinc-500 border border-white/5 p-2 rounded-xl bg-black/40">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-severity-critical" /> crit/high risk</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> secure node</span>
          </div>

          {/* SVG Canvas */}
          <svg className="w-full max-w-lg h-auto" viewBox="0 0 600 400">
            {/* Defs for gradients & glowing filters */}
            <defs>
              <filter id="glow-danger" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-safe" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting lines between Core Router and nodes */}
            {nodes.map(node => {
              const metrics = getAssetRiskMetrics(node.id);
              const isDanger = metrics.riskScore >= 40;
              return (
                <g key={`link-${node.id}`}>
                  {/* Background connection */}
                  <line 
                    x1={coreNode.x} 
                    y1={coreNode.y} 
                    x2={node.x} 
                    y2={node.y} 
                    stroke={isDanger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.15)'} 
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  {/* Network traffic pulse circle moving along the lines */}
                  <circle r="2.5" fill={isDanger ? '#ef4444' : '#22c55e'}>
                    <animateMotion 
                      dur="3s" 
                      repeatCount="indefinite" 
                      path={`M ${coreNode.x} ${coreNode.y} L ${node.x} ${node.y}`} 
                    />
                  </circle>
                </g>
              );
            })}

            {/* Drawing Core Firewall Node */}
            <g transform={`translate(${coreNode.x}, ${coreNode.y})`} className="cursor-pointer">
              <circle r="26" fill="#000" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <circle r="20" fill="rgba(255,255,255,0.05)" />
              <foreignObject x="-10" y="-10" width="20" height="20">
                <Network className="h-5 w-5 text-white" />
              </foreignObject>
              <text x="0" y="38" textAnchor="middle" fill="#888c9e" fontSize="8" fontFamily="monospace">
                GATEWAY FIREWALL
              </text>
            </g>

            {/* Drawing Asset Nodes */}
            {nodes.map(node => {
              const metrics = getAssetRiskMetrics(node.id);
              const isSelected = selectedAssetId === node.id;
              const isDanger = metrics.riskScore >= 40;

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  onClick={() => setSelectedAssetId(node.id)}
                >
                  {/* Glowing perimeter circle */}
                  <circle 
                    r="24" 
                    fill="#0a0a0c" 
                    stroke={isDanger ? '#ef4444' : '#22c55e'} 
                    strokeWidth={isSelected ? '3' : '1.5'}
                    filter={isDanger ? 'url(#glow-danger)' : 'url(#glow-safe)'}
                    className="transition-all duration-300"
                  />
                  
                  {/* Center item icon */}
                  <foreignObject x="-10" y="-10" width="20" height="20">
                    <div className="flex items-center justify-center">
                      {getIcon(node.type)}
                    </div>
                  </foreignObject>

                  {/* Asset text labels */}
                  <text x="0" y="36" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                    {node.name}
                  </text>
                  <text x="0" y="45" textAnchor="middle" fill="#555866" fontSize="7" fontFamily="monospace">
                    {metrics.riskScore}% RISK
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sidebar Info Pane (Col Span 5) */}
        <div className="lg:col-span-5 h-[400px]">
          {selectedAsset ? (
            <div className="glass-card rounded-3xl border border-white/10 p-6 h-full flex flex-col justify-between overflow-y-auto no-scrollbar relative animate-in fade-in slide-in-from-right duration-300">
              
              <button
                onClick={() => setSelectedAssetId(null)}
                className="absolute right-4 top-4 p-1.5 hover:bg-white/5 rounded-full text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Asset header */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Selected Probe</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{selectedAsset.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono mt-1">
                    <MapPin className="h-3 w-3 text-zinc-600" />
                    <span>{selectedAsset.location}</span>
                  </div>
                </div>

                {/* Risk Gauge metric */}
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block leading-none">Exposure Index</span>
                    <span className="text-xl font-bold text-white font-mono">{selectedMetrics?.riskScore}%</span>
                  </div>
                  {selectedMetrics && selectedMetrics.riskScore >= 40 ? (
                    <span className="text-[10px] font-mono font-bold bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-xl flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> High Exposure
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Secured Post
                    </span>
                  )}
                </div>

                {/* Installed Packages */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-widest">Active Services</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedAsset.installedSoftware.map((pkg, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 bg-white/5 border border-white/5 rounded text-zinc-300">
                        {pkg.name} <span className="text-zinc-500">{pkg.version}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vulnerability Count / Findings */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-widest">Active Vulnerabilities</span>
                  {selectedVuls.length === 0 ? (
                    <div className="text-[10px] text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 font-mono flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Zero threat vectors detected on this server.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 no-scrollbar">
                      {selectedVuls.map((vul) => (
                        <div key={vul.id} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 flex items-center justify-between text-[10px] transition-colors">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white font-mono">{vul.cveId}</span>
                            <span className="text-[8px] text-zinc-500 block leading-tight truncate max-w-[160px]">
                              {vul.cveDetails.title}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            vul.severity === 'Critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {vul.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="text-[9.5px] font-mono text-zinc-500 mt-4 leading-tight flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                <span>double-click node to query routing diagnostics dashboard.</span>
              </div>

            </div>
          ) : (
            <div className="glass-card rounded-3xl border border-white/5 p-6 h-full flex flex-col items-center justify-center text-center">
              <Network className="h-8 w-8 text-zinc-600 mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-zinc-400 lowercase">no asset probed</h4>
              <p className="text-zinc-600 text-[10px] font-mono mt-1 max-w-[200px]">
                select any active node on the routing topology map to probe its configuration and CVE statuses.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
