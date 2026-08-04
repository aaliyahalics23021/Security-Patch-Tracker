import React, { useRef } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { FileText, ShieldCheck, Printer } from 'lucide-react';

export const ComplianceReport: React.FC = () => {
  const { findings, demoStep, setDemoStep } = useSecurity();
  const printRef = useRef<HTMLDivElement | null>(null);

  // SLA & general metrics
  const totalFindings = findings.length;
  
  const openFindings = findings.filter(
    f => f.status !== 'Closed' && f.status !== 'Verified'
  );
  const openCount = openFindings.length;
  
  const closedCount = findings.filter(
    f => f.status === 'Closed' || f.status === 'Verified'
  ).length;

  const criticalOpen = openFindings.filter(f => f.severity === 'Critical').length;
  const highOpen = openFindings.filter(f => f.severity === 'High').length;
  const mediumOpen = openFindings.filter(f => f.severity === 'Medium').length;
  const lowOpen = openFindings.filter(f => f.severity === 'Low').length;

  const now = new Date();
  const breachedCount = openFindings.filter(
    f => new Date(f.dueDate) < now
  ).length;

  const getSlaComplianceRate = () => {
    if (totalFindings === 0) return 100;
    return Math.round(((totalFindings - breachedCount) / totalFindings) * 100);
  };

  const getVerificationRate = () => {
    const totalPatched = findings.filter(f => f.status === 'Patched' || f.status === 'Verification Pending' || f.status === 'Closed' || f.status === 'Verified').length;
    if (totalPatched === 0) return 100;
    return Math.round((closedCount / totalPatched) * 100);
  };

  const getSecurityPosture = () => {
    if (totalFindings === 0) return 100;
    const critDeduction = Math.max(0, 40 - (criticalOpen * 10));
    const patchSuccess = (closedCount / totalFindings) * 40;
    const nonBreachedRate = openCount > 0 ? ((openCount - breachedCount) / openCount) * 10 : 10;
    const totalPatched = findings.filter(f => f.status === 'Patched' || f.status === 'Verification Pending' || f.status === 'Closed' || f.status === 'Verified').length;
    const qaScore = totalPatched > 0 ? (closedCount / totalPatched) * 10 : 10;
    return Math.max(0, Math.min(100, Math.round(critDeduction + patchSuccess + nonBreachedRate + qaScore)));
  };

  const postureScore = getSecurityPosture();
  const slaComplianceRate = getSlaComplianceRate();
  const verificationRate = getVerificationRate();

  const handlePrint = () => {
    // Print window
    window.print();
    
    // Progress demo step if relevant
    if (demoStep === 13) {
      setDemoStep(1); // loop back
    }
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8 select-none font-sans">
      
      {/* Print styles override */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, header, footer, button, .no-print {
            display: none !important;
          }
          .print-area {
            background: white !important;
            color: black !important;
            padding: 20px !important;
            border: none !important;
            box-shadow: none !important;
          }
          .glass-card, .glass-panel {
            background: white !important;
            color: black !important;
            border: 1px solid #ccc !important;
            box-shadow: none !important;
          }
          span, p, h1, h2, h3, h4, td, th {
            color: black !important;
          }
          .badge-print {
            border: 1px solid black !important;
            background: white !important;
            color: black !important;
          }
        }
      `}} />

      {/* Header & Print Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6 no-print">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">EXECUTIVE COMPLIANCE</span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1 lowercase">security posture reporting</h1>
        </div>

        <button
          onClick={handlePrint}
          className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
        >
          <Printer className="h-4 w-4" />
          <span>Export Compliance PDF</span>
        </button>
      </div>

      {/* Printable Report Document Wrapper */}
      <div ref={printRef} className="glass-card rounded-3xl border border-white/5 p-8 max-w-4xl mx-auto space-y-8 print-area shadow-2xl">
        
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-white no-print" />
              <span className="font-extrabold tracking-widest text-lg uppercase text-white font-mono">SVPT REPORT</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-none lowercase">executive vulnerability compliance audit</h2>
            <p className="text-[10px] text-zinc-500 font-mono">Generated: {new Date().toLocaleDateString()} // Confidential Internal Use Only</p>
          </div>
          
          <div className="text-right font-mono text-xs">
            <span className="text-zinc-500 uppercase block text-[9px]">SLA post</span>
            <span className={breachedCount > 0 ? 'text-severity-critical font-bold' : 'text-emerald-400 font-bold'}>
              {breachedCount > 0 ? 'NON-COMPLIANT' : 'COMPLIANT'}
            </span>
          </div>
        </div>

        {/* 3 Metric cards for printing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Posture */}
          <div className="p-4 bg-zinc-950/40 rounded-2xl border border-white/5 text-center flex flex-col justify-between h-28 glass-card">
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Posture Score</span>
            <span className="text-3xl font-extrabold text-white font-mono mt-2">{postureScore}%</span>
            <span className="text-[8px] text-zinc-500 font-mono mt-2">weighted risk average</span>
          </div>

          {/* SLA rate */}
          <div className="p-4 bg-zinc-950/40 rounded-2xl border border-white/5 text-center flex flex-col justify-between h-28 glass-card">
            <span className="text-[9px] font-mono text-zinc-500 uppercase">SLA Compliance</span>
            <span className="text-3xl font-extrabold text-white font-mono mt-2">{slaComplianceRate}%</span>
            <span className="text-[8px] text-zinc-500 font-mono mt-2">{breachedCount} breached items</span>
          </div>

          {/* QA verified */}
          <div className="p-4 bg-zinc-950/40 rounded-2xl border border-white/5 text-center flex flex-col justify-between h-28 glass-card">
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Verification Rate</span>
            <span className="text-3xl font-extrabold text-white font-mono mt-2">{verificationRate}%</span>
            <span className="text-[8px] text-zinc-500 font-mono mt-2">{closedCount} verified patches</span>
          </div>

        </div>

        {/* Vulnerability Counts Grid */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">Risk Profile Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-zinc-950/20 rounded-xl border border-white/5 text-center">
              <span className="text-severity-critical font-bold">Critical</span>
              <p className="text-white text-base font-extrabold mt-1">{criticalOpen}</p>
            </div>
            <div className="p-3 bg-zinc-950/20 rounded-xl border border-white/5 text-center">
              <span className="text-severity-high font-bold">High</span>
              <p className="text-white text-base font-extrabold mt-1">{highOpen}</p>
            </div>
            <div className="p-3 bg-zinc-950/20 rounded-xl border border-white/5 text-center">
              <span className="text-severity-medium font-bold">Medium</span>
              <p className="text-white text-base font-extrabold mt-1">{mediumOpen}</p>
            </div>
            <div className="p-3 bg-zinc-950/20 rounded-xl border border-white/5 text-center">
              <span className="text-severity-low font-bold">Low</span>
              <p className="text-white text-base font-extrabold mt-1">{lowOpen}</p>
            </div>
          </div>
        </div>

        {/* Active Open Findings details */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">Active Exposure Points ({openCount})</h3>
          
          {openFindings.length === 0 ? (
            <p className="text-emerald-400 font-mono text-xs p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              [SUCCESS] No outstanding active vulnerability exposure points cataloged.
            </p>
          ) : (
            <div className="border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left font-mono text-xs bg-zinc-950/20">
                <thead className="bg-zinc-900/30 text-zinc-500 uppercase text-[9px] border-b border-white/5">
                  <tr>
                    <th className="px-4 py-2">CVE ID</th>
                    <th className="px-4 py-2">Infrastructure Asset</th>
                    <th className="px-4 py-2">Severity</th>
                    <th className="px-4 py-2">CVSS Score</th>
                    <th className="px-4 py-2">Remediation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {openFindings.map((f) => (
                    <tr key={f.id}>
                      <td className="px-4 py-2.5 font-bold text-white">{f.cveId}</td>
                      <td className="px-4 py-2.5 text-zinc-300">{f.assetId}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{f.severity}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{f.cveDetails.cvssScore.toFixed(1)}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resolved/Closed Findings details */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">Patched & Verified Records ({closedCount})</h3>
          
          {closedCount === 0 ? (
            <p className="text-zinc-500 font-mono text-xs p-3 bg-zinc-900/10 rounded-xl border border-white/5 text-center">
              Zero patch verifications filed during this audit session.
            </p>
          ) : (
            <div className="border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left font-mono text-xs bg-zinc-950/20">
                <thead className="bg-zinc-900/30 text-zinc-500 uppercase text-[9px] border-b border-white/5">
                  <tr>
                    <th className="px-4 py-2">CVE ID</th>
                    <th className="px-4 py-2">Infrastructure Asset</th>
                    <th className="px-4 py-2">Severity</th>
                    <th className="px-4 py-2">Remediation Date</th>
                    <th className="px-4 py-2">Sign-Off Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-400">
                  {findings.filter(f => f.status === 'Closed' || f.status === 'Verified').map((f) => (
                    <tr key={f.id}>
                      <td className="px-4 py-2.5 font-bold text-white">{f.cveId}</td>
                      <td className="px-4 py-2.5">{f.assetId}</td>
                      <td className="px-4 py-2.5">{f.severity}</td>
                      <td className="px-4 py-2.5">{f.timeline[f.timeline.length - 1]?.timestamp.split('T')[0]}</td>
                      <td className="px-4 py-2.5 text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Auditor Sign-Off footer */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-800 font-mono text-[9px] text-zinc-500">
          <div>
            <p className="uppercase">Auditor Verification Signature</p>
            <div className="h-10 border-b border-zinc-800 my-2" />
            <p>AUTHORIZED SEC-OPS AUDIT DELEGATE</p>
          </div>
          <div>
            <p className="uppercase">Corporate Posture Alignment Seal</p>
            <div className="h-10 border-b border-zinc-800 my-2" />
            <p>SVPT ALIGNMENT METRICS VALIDATED</p>
          </div>
        </div>

      </div>

    </div>
  );
};
