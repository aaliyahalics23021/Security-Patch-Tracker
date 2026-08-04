import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import type { Asset } from '../context/SecurityContext';
import { 
  Search, Plus, Edit2, Trash2, Cpu, 
  Layers, Globe, AlertTriangle, Filter, X 
} from 'lucide-react';

export const AssetInventory: React.FC = () => {
  const { 
    assets, addAsset, updateAsset, deleteAsset, findings, currentRole 
  } = useSecurity();

  const [activeTab, setActiveTab] = useState<'inventory' | 'attackSurface'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  
  // Modals / Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAssetId, setCurrentAssetId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<Asset['type']>('Web Server');
  const [os, setOs] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [department, setDepartment] = useState('');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState<Asset['status']>('Active');
  const [location, setLocation] = useState('');
  const [softwareText, setSoftwareText] = useState(''); // comma-separated software: version (e.g. PHP:8.1.0, Apache:2.4.55)

  // Roles verification
  const isWritable = currentRole === 'Admin';

  const resetForm = () => {
    setName('');
    setType('Web Server');
    setOs('');
    setIpAddress('');
    setDepartment('');
    setOwner('');
    setStatus('Active');
    setLocation('');
    setSoftwareText('');
    setCurrentAssetId('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setName(asset.name);
    setType(asset.type);
    setOs(asset.operatingSystem);
    setIpAddress(asset.ipAddress);
    setDepartment(asset.department);
    setOwner(asset.owner);
    setStatus(asset.status);
    setLocation(asset.location);
    setSoftwareText(
      asset.installedSoftware.map((s: { name: string; version: string }) => `${s.name} ${s.version}`).join(', ')
    );
    setCurrentAssetId(asset.id);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ipAddress || !os) return;

    // Parse software packages
    const installedSoftware = softwareText
      .split(',')
      .map(item => {
        const parts = item.trim().split(/\s+/);
        const name = parts[0] || '';
        const version = parts.slice(1).join(' ') || '1.0.0';
        return { name, version };
      })
      .filter(item => item.name !== '');

    const assetData = {
      name,
      type,
      operatingSystem: os,
      installedSoftware,
      department,
      owner,
      status,
      ipAddress,
      location
    };

    if (isEditing) {
      updateAsset({ ...assetData, id: currentAssetId });
    } else {
      addAsset(assetData);
    }

    setShowFormModal(false);
    resetForm();
  };

  // Calculations for Attack Surface Exposure
  const getAssetExposureMetrics = (assetId: string) => {
    const assetFindings = findings.filter(
      f => f.assetId === assetId && f.status !== 'Closed' && f.status !== 'Verified'
    );
    const critical = assetFindings.filter(f => f.severity === 'Critical').length;
    const high = assetFindings.filter(f => f.severity === 'High').length;
    const medium = assetFindings.filter(f => f.severity === 'Medium').length;
    const low = assetFindings.filter(f => f.severity === 'Low').length;

    // Risk Score: Sum weighted open findings
    const rawScore = critical * 40 + high * 20 + medium * 8 + low * 2;
    const riskScore = Math.min(100, rawScore);

    return {
      count: assetFindings.length,
      critical,
      high,
      medium,
      low,
      riskScore
    };
  };

  // Filter Assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'All' || asset.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">HARDWARE & SOFTWARE REGISTRY</span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1 lowercase">asset exposure workbench</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-white/5 p-1 rounded-full border border-white/10 flex">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-1.5 rounded-full text-xs font-mono lowercase transition-all ${
                activeTab === 'inventory' 
                  ? 'bg-white text-black font-semibold' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              inventory list
            </button>
            <button
              onClick={() => setActiveTab('attackSurface')}
              className={`px-4 py-1.5 rounded-full text-xs font-mono lowercase transition-all ${
                activeTab === 'attackSurface' 
                  ? 'bg-white text-black font-semibold' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              attack surface view
            </button>
          </div>

          {/* Add Asset (Only visible to Admin) */}
          {activeTab === 'inventory' && isWritable && (
            <button
              onClick={handleOpenAdd}
              className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <Plus className="h-4 w-4" />
              <span>add asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-card p-4 rounded-2xl border border-white/5">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search assets by name, IP, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950/50 border border-white/5 hover:border-white/15 focus:border-white/20 rounded-xl py-2 pl-10 pr-4 text-xs font-mono focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-zinc-500 hidden sm:block" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-950/50 border border-white/5 rounded-xl py-2 px-3 text-xs font-mono text-zinc-300 focus:outline-none w-full sm:w-44"
          >
            <option value="All">All Categories</option>
            <option value="Web Server">Web Servers</option>
            <option value="Database Server">Database Servers</option>
            <option value="Cloud VM">Cloud VMs</option>
            <option value="Workstation">Workstations</option>
          </select>
        </div>
      </div>

      {/* TAB 1: ASSET INVENTORY GRID */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl">
              <Layers className="h-10 w-10 text-zinc-600 mx-auto" />
              <p className="text-zinc-500 text-xs font-mono mt-3">No matching assets located in secure directories.</p>
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const metrics = getAssetExposureMetrics(asset.id);
              return (
                <div key={asset.id} className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col justify-between hover:border-white/15 transition-all duration-300 relative group">
                  
                  {/* Top Header details */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                          <Cpu className="h-4 w-4 text-zinc-300" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">{asset.name}</h3>
                          <span className="text-[9px] text-zinc-500 font-mono tracking-wide">{asset.type} // {asset.ipAddress}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                        asset.status === 'Active' 
                          ? 'border-emerald-500/25 text-emerald-400 bg-emerald-500/5' 
                          : 'border-yellow-500/25 text-yellow-400 bg-yellow-500/5'
                      }`}>
                        {asset.status}
                      </span>
                    </div>

                    {/* Installed packages */}
                    <div className="space-y-1.5 border-t border-white/5 pt-4">
                      <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Installed Software</p>
                      <div className="flex flex-wrap gap-1">
                        {asset.installedSoftware.map((pkg, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 bg-white/5 rounded border border-white/5 text-zinc-300">
                            {pkg.name} <span className="text-zinc-500 text-[9px]">{pkg.version}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Department, Owner, Location */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 bg-zinc-950/40 p-2.5 rounded-xl border border-white/5">
                      <div>
                        <span className="text-zinc-600 block text-[9px] uppercase">DEPT</span>
                        <span className="text-zinc-300 truncate block">{asset.department}</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block text-[9px] uppercase">OWNER</span>
                        <span className="text-zinc-300 truncate block">{asset.owner}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Risk brief */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="text-zinc-500">exposure index:</span>
                      <span className={`font-bold ${
                        metrics.riskScore >= 70 ? 'text-severity-critical' : metrics.riskScore >= 40 ? 'text-severity-high' : 'text-emerald-400'
                      }`}>
                        {metrics.riskScore}
                      </span>
                    </div>

                    {/* Admin actions */}
                    {isWritable && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(asset)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteAsset(asset.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: ATTACK SURFACE EXPOSURE MAP */}
      {activeTab === 'attackSurface' && (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 bg-zinc-950/40 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Infrastructure Exposure Matrix</span>
            <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full font-mono">
              Live threat vector tracking
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-900/30 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Asset Details</th>
                  <th className="px-6 py-4 text-center">Threat Vector Count</th>
                  <th className="px-6 py-4 text-center">Vulnerabilities (Crit / High / Med / Low)</th>
                  <th className="px-6 py-4 text-center">Risk Vector Score</th>
                  <th className="px-6 py-4">Threat Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assets.map((asset) => {
                  const metrics = getAssetExposureMetrics(asset.id);
                  return (
                    <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Cpu className="h-4 w-4 text-zinc-400" />
                          <div>
                            <p className="font-bold text-white leading-none">{asset.name}</p>
                            <p className="text-[10px] text-zinc-500 mt-1">{asset.ipAddress} // {asset.operatingSystem}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center font-bold">
                        {metrics.count} CVEs
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1 text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold ${metrics.critical > 0 ? 'bg-severity-critical/20 text-severity-critical' : 'bg-zinc-950 text-zinc-700'}`}>
                            {metrics.critical}C
                          </span>
                          <span className={`px-2 py-0.5 rounded font-bold ${metrics.high > 0 ? 'bg-severity-high/20 text-severity-high' : 'bg-zinc-950 text-zinc-700'}`}>
                            {metrics.high}H
                          </span>
                          <span className={`px-2 py-0.5 rounded font-bold ${metrics.medium > 0 ? 'bg-severity-medium/20 text-severity-medium' : 'bg-zinc-950 text-zinc-700'}`}>
                            {metrics.medium}M
                          </span>
                          <span className={`px-2 py-0.5 rounded font-bold ${metrics.low > 0 ? 'bg-severity-low/20 text-severity-low' : 'bg-zinc-950 text-zinc-700'}`}>
                            {metrics.low}L
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center justify-center gap-1 w-32 mx-auto">
                          <span className="font-bold">{metrics.riskScore}%</span>
                          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                metrics.riskScore >= 70 ? 'bg-severity-critical' : metrics.riskScore >= 40 ? 'bg-severity-high' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${metrics.riskScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {metrics.riskScore >= 70 ? (
                          <span className="text-severity-critical flex items-center gap-1.5 font-bold animate-pulse">
                            <AlertTriangle className="h-4 w-4" /> CRITICAL EXPOSURE
                          </span>
                        ) : metrics.riskScore >= 40 ? (
                          <span className="text-severity-high flex items-center gap-1.5 font-semibold">
                            <AlertTriangle className="h-4 w-4" /> ELEVATED TARGET
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                            <Globe className="h-4 w-4" /> DEFENSIBLE post
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORM MODAL (Admin Add/Edit Asset) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">ASSET MANAGER</span>
            <h3 className="text-lg font-bold text-white mt-1 lowercase">
              {isEditing ? 'modify registered asset' : 'log new hardware asset'}
            </h3>

            <form onSubmit={handleSave} className="mt-4 space-y-4 font-mono text-xs">
              
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-500 uppercase text-[9px]">Asset Tag / Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="WebServer-01"
                    className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-white/20 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-500 uppercase text-[9px]">Asset Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Asset['type'])}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Web Server">Web Server</option>
                    <option value="Database Server">Database Server</option>
                    <option value="Cloud VM">Cloud VM</option>
                    <option value="Workstation">Workstation</option>
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-500 uppercase text-[9px]">IP Address</label>
                  <input
                    type="text"
                    required
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="10.100.1.10"
                    className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-white/20 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-500 uppercase text-[9px]">Operating System</label>
                  <input
                    type="text"
                    required
                    value={os}
                    onChange={(e) => setOs(e.target.value)}
                    placeholder="Ubuntu Server 22.04"
                    className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-white/20 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-500 uppercase text-[9px]">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="IT Operations"
                    className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-white/20 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-500 uppercase text-[9px]">Owner / Steward</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Sarah Connor"
                    className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-white/20 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Software and Versions */}
              <div className="space-y-1.5">
                <label className="text-zinc-500 uppercase text-[9px]">Installed Software packages (comma separated: Name Version)</label>
                <textarea
                  value={softwareText}
                  onChange={(e) => setSoftwareText(e.target.value)}
                  placeholder="PHP 8.1.0, Apache 2.4.55, OpenSSH 8.9p1"
                  rows={3}
                  className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-white/20 rounded-xl p-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              {/* Location & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-500 uppercase text-[9px]">Physical / Cloud Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="AWS US-East-1 VM"
                    className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-white/20 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-500 uppercase text-[9px]">Steward Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Asset['status'])}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Isolated">Isolated</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold font-mono"
                >
                  Save Configuration
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
