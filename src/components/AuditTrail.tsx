import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { Search, Download, User, Filter } from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const { auditLogs } = useSecurity();

  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('All');

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = userFilter === 'All' || 
      (userFilter === 'SYSTEM' && log.user === 'SYSTEM' || log.user === 'SYSTEM_SCANNER') ||
      (userFilter === 'Operators' && log.user !== 'SYSTEM' && log.user !== 'SYSTEM_SCANNER');

    return matchesSearch && matchesUser;
  });

  // Export handlers
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Timestamp', 'Operator', 'Action Event', 'Log details'];
    const rows = filteredLogs.map(log => [
      log.timestamp,
      log.user,
      log.action,
      `"${log.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `svpt_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8 select-none font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">REGULATORY COMPLIANCE</span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1 lowercase">security audit logs trail</h1>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-card p-4 rounded-2xl border border-white/5 font-mono text-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search logs by action, detail, operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950/50 border border-white/5 hover:border-white/15 focus:border-white/20 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none transition-all"
          />
        </div>

        {/* User filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="bg-zinc-950/50 border border-white/5 rounded-xl py-1.5 px-3 text-[11px] font-mono text-zinc-300 focus:outline-none"
            >
              <option value="All">All Operators</option>
              <option value="SYSTEM">System/Scanner Logs</option>
              <option value="Operators">Staff Operators Only</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl border border-white/5 flex items-center gap-1.5 transition-colors font-bold text-[11px]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV Audit Export</span>
          </button>
        </div>

      </div>

      {/* Grid Logs Table */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-zinc-900/30 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Operator ID</th>
                <th className="px-6 py-4">Security Action</th>
                <th className="px-6 py-4">Detailed Audit Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 font-mono">
                    No matching audit records cataloged.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-300 whitespace-nowrap flex items-center gap-1">
                      <User className="h-3 w-3 text-zinc-500" />
                      <span>{log.user}</span>
                    </td>
                    <td className="px-6 py-4 text-white font-bold whitespace-nowrap">
                      {log.action.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-sans leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
