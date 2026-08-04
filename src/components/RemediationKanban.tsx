import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import type { VulnerabilityFinding } from '../context/SecurityContext';
import { User, Upload, X } from 'lucide-react';

interface RemediationKanbanProps {
  onSelectFinding: (id: string) => void;
  onOpenVerifier: (id: string) => void; // QA verification interface
}

export const RemediationKanban: React.FC<RemediationKanbanProps> = ({ onSelectFinding, onOpenVerifier }) => {
  const { findings, assignFinding, uploadEvidence, updateFindingStatus, currentRole } = useSecurity();

  // Kanban Columns
  const columns: { id: VulnerabilityFinding['status']; label: string; border: string }[] = [
    { id: 'Open', label: 'open', border: 'border-zinc-800' },
    { id: 'Assigned', label: 'assigned', border: 'border-zinc-800' },
    { id: 'In Progress', label: 'in progress', border: 'border-orange-500/20' },
    { id: 'Patched', label: 'patched', border: 'border-blue-500/20' },
    { id: 'Verification Pending', label: 'verification pending', border: 'border-yellow-500/20' },
    { id: 'Closed', label: 'closed / verified', border: 'border-emerald-500/20' }
  ];

  // Modals & Action States
  const [selectedTask, setSelectedTask] = useState<VulnerabilityFinding | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // Assign inputs
  const [engineer, setEngineer] = useState('');
  const [notes, setNotes] = useState('');

  // Evidence inputs
  const [evidenceName, setEvidenceName] = useState('WebServer-01_Patch_Log.txt');
  const [evidenceType, setEvidenceType] = useState('Log Output');
  const [evidenceContent, setEvidenceContent] = useState('');

  const engineers = ['Dave (Sec-Eng)', 'Sarah (Cloud-Eng)', 'Alex (Sys-Eng)', 'Alice (Dev-Eng)'];

  // Role permissions
  const canAssign = currentRole === 'Admin';
  const canPatch = currentRole === 'Engineer';
  const canVerify = currentRole === 'QA Verifier';

  const handleOpenAssign = (task: VulnerabilityFinding) => {
    setSelectedTask(task);
    setEngineer(task.assignedEngineer || 'Dave (Sec-Eng)');
    setNotes(task.notes || '');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !engineer) return;
    assignFinding(selectedTask.id, engineer, notes);
    setShowAssignModal(false);
  };

  const handleOpenEvidence = (task: VulnerabilityFinding) => {
    setSelectedTask(task);
    // Autofill typical patch log based on CVE for quick simulation
    let mockLog = '';
    if (task.cveId === 'CVE-2024-4577') {
      mockLog = 'root@WebServer-01:~# apt-get update && apt-get install --only-upgrade php\nReading package lists... Done\nUpgraded php8.1-cgi to 8.1.29-1ubuntu4\nSystem: service php-cgi restart -> [OK]';
    } else if (task.cveId === 'CVE-2023-25690') {
      mockLog = 'root@WebServer-01:~# apache2ctl graceful\nSyntax OK\nUpgraded apache2 to 2.4.56-1\nListening on Port 80, 443 -> service active.';
    } else {
      mockLog = `root@host:~# systemctl stop vulnerable-service\nApplying security patch for ${task.cveId}\nUpgraded dependencies successfully.\nSystem: service restarted -> active (running).`;
    }
    setEvidenceContent(mockLog);
    setShowEvidenceModal(true);
  };

  const handleEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !evidenceName) return;
    uploadEvidence(selectedTask.id, evidenceName, evidenceType, evidenceContent);
    setShowEvidenceModal(false);
  };

  const getPriorityColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'text-severity-critical';
      case 'High': return 'text-severity-high';
      case 'Medium': return 'text-severity-medium';
      default: return 'text-severity-low';
    }
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8 select-none font-sans">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">REMEDIATION WORKFLOWS</span>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1 lowercase">patch orchestration board</h1>
      </div>

      {/* Kanban columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4 no-scrollbar">
        {columns.map((col) => {
          // Group findings by status (we merge Verified and Closed for simpler layout mapping)
          const colTasks = findings.filter(f => {
            if (col.id === 'Closed') {
              return f.status === 'Closed' || f.status === 'Verified';
            }
            return f.status === col.id;
          });

          return (
            <div key={col.id} className="min-w-[190px] flex flex-col space-y-4">
              
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">{col.label}</span>
                <span className="text-[10px] font-mono font-bold bg-white/5 px-2 py-0.5 rounded-full border border-white/5 text-zinc-300">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className={`space-y-3 min-h-[450px] p-2 rounded-2xl border border-dashed border-transparent bg-zinc-950/20 ${col.border}`}>
                {colTasks.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center py-12 text-[10px] text-zinc-600 font-mono">
                    Empty Queue
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="glass-card rounded-xl border border-white/5 p-4 space-y-3 hover:border-white/15 transition-all duration-200 relative group cursor-pointer"
                      onClick={() => onSelectFinding(task.id)}
                    >
                      {/* Priority and CVE */}
                      <div className="flex justify-between items-start font-mono text-[10px]">
                        <span className="font-bold text-white leading-none">{task.cveId}</span>
                        <span className={`font-bold ${getPriorityColor(task.severity)}`}>
                          {task.severity.slice(0, 4)}
                        </span>
                      </div>

                      <p className="text-zinc-400 text-[11px] leading-tight font-sans font-light truncate">
                        {task.cveDetails.title}
                      </p>

                      {/* Asset tag */}
                      <span className="text-[9px] font-mono text-zinc-500 block leading-none">
                        target: {task.assetId}
                      </span>

                      {/* Engineer assign tag */}
                      <div className="flex items-center gap-1 text-[9px] text-zinc-500 border-t border-white/5 pt-2">
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">
                          {task.assignedEngineer ? task.assignedEngineer.split(' ')[0] : 'Unassigned'}
                        </span>
                      </div>

                      {/* Workflow action buttons overlay */}
                      <div className="flex gap-1 justify-end border-t border-white/5 pt-2 mt-2 font-mono text-[9px]" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Assign (Admin only) */}
                        {task.status === 'Open' && canAssign && (
                          <button
                            onClick={() => handleOpenAssign(task)}
                            className="px-2 py-0.5 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors"
                          >
                            Assign
                          </button>
                        )}

                        {/* Upload Evidence (Engineer only) */}
                        {(task.status === 'Assigned' || task.status === 'In Progress') && canPatch && (
                          <button
                            onClick={() => handleOpenEvidence(task)}
                            className="px-2 py-0.5 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors flex items-center gap-0.5"
                          >
                            <Upload className="h-3 w-3" /> Patch
                          </button>
                        )}

                        {/* Shift to In-Progress (Engineer only, if assigned but not progress) */}
                        {task.status === 'Assigned' && canPatch && (
                          <button
                            onClick={() => updateFindingStatus(task.id, 'In Progress')}
                            className="px-2 py-0.5 border border-white/10 text-zinc-300 rounded hover:bg-white/5"
                          >
                            Start
                          </button>
                        )}

                        {/* Verify (QA Verifier only) */}
                        {(task.status === 'Verification Pending' || task.status === 'Patched') && canVerify && (
                          <button
                            onClick={() => onOpenVerifier(task.id)}
                            className="px-2 py-0.5 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors"
                          >
                            Verify
                          </button>
                        )}

                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* ASSIGN MODAL */}
      {showAssignModal && selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl overflow-hidden border border-white/10 p-6 shadow-2xl relative font-mono text-xs text-left">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/5 rounded-full text-zinc-400"
            >
              <X className="absolute" />
            </button>

            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">TASK ORCHESTRATION</span>
            <h3 className="text-lg font-bold text-white lowercase">Assign Remediation Engineer</h3>

            <form onSubmit={handleAssignSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-zinc-500 uppercase text-[9px]">Select Authorized Staff</label>
                <select
                  required
                  value={engineer}
                  onChange={(e) => setEngineer(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                >
                  {engineers.map(eng => (
                    <option key={eng} value={eng}>{eng}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-500 uppercase text-[9px]">Remediation Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Upgrade software package to secure version immediately. Validate service stability after rebuild."
                  rows={3}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD EVIDENCE MODAL */}
      {showEvidenceModal && selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 p-6 shadow-2xl relative font-mono text-xs text-left">
            <button
              onClick={() => setShowEvidenceModal(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-white/5 rounded-full text-zinc-400"
            >
              <X className="absolute" />
            </button>

            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">PATCH VERIFICATION SYSTEM</span>
            <h3 className="text-lg font-bold text-white lowercase">Submit Patch Evidence</h3>

            <form onSubmit={handleEvidenceSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-500 uppercase text-[9px]">Evidence Document Name</label>
                  <input
                    type="text"
                    required
                    value={evidenceName}
                    onChange={(e) => setEvidenceName(e.target.value)}
                    placeholder="remediation_log.txt"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-500 uppercase text-[9px]">Document Category</label>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                  >
                    <option value="Log Output">Console Log Output</option>
                    <option value="SSH Output">SSH Diagnostics Terminal</option>
                    <option value="Verification Script">Verification Script File</option>
                    <option value="Screenshot URL">Configuration Screenshot</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-500 uppercase text-[9px]">Terminal Shell Output / Logs (System verification trace)</label>
                <textarea
                  required
                  value={evidenceContent}
                  onChange={(e) => setEvidenceContent(e.target.value)}
                  rows={6}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-[11px] text-zinc-300 font-mono focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold flex items-center gap-1"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload & Submit for QA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
