import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import type { UserRole } from '../context/SecurityContext';
import { 
  HelpCircle, ChevronRight, ChevronLeft, 
  X, Shield, RotateCcw 
} from 'lucide-react';

interface DemoWorkflowHelperProps {
  setCurrentView: (view: string) => void;
}

export const DemoWorkflowHelper: React.FC<DemoWorkflowHelperProps> = ({ setCurrentView }) => {
  const { demoStep, setDemoStep, resetDemoWorkflow } = useSecurity();
  const [minimized, setMinimized] = useState(false);

  const steps = [
    {
      step: 1,
      title: 'Analyst Authentication',
      role: 'Security Analyst' as UserRole,
      view: 'dashboard',
      prompt: 'Select your active simulator role as "Security Analyst". You can switch roles using the dropdown at the top right of the navigation bar.',
      highlight: 'Profile dropdown -> Select "Security Analyst"'
    },
    {
      step: 2,
      title: 'Run Vulnerability Scan',
      role: 'Security Analyst' as UserRole,
      view: 'scanner',
      prompt: 'Navigate to the "scanner" page and trigger a "Deep Threat Scan" to probe active packages and match CVEs.',
      highlight: 'Click "scanner" on navbar -> Click "Run Scan" on Deep Threat Scan'
    },
    {
      step: 3,
      title: 'Review Detected CVEs',
      role: 'Security Analyst' as UserRole,
      view: 'vulnerabilities',
      prompt: 'Scan complete! Head over to the "vulnerabilities" tab to inspect the newly created finding logs.',
      highlight: 'Click "vulnerabilities" on navbar'
    },
    {
      step: 4,
      title: 'Admin Authentication',
      role: 'Admin' as UserRole,
      view: 'dashboard',
      prompt: 'Switch your active role to "Admin" at the top right to gain management and assignment controls.',
      highlight: 'Profile dropdown -> Select "Admin"'
    },
    {
      step: 5,
      title: 'Assign Remediation task',
      role: 'Admin' as UserRole,
      view: 'remediation',
      prompt: 'Navigate to "remediation" Kanban board. Click "Assign" on CVE-2024-4577 (PHP CGI) and select "Dave (Sec-Eng)".',
      highlight: 'Click "remediation" on navbar -> Click "Assign" on CVE-2024-4577'
    },
    {
      step: 6,
      title: 'Engineer Authentication',
      role: 'Engineer' as UserRole,
      view: 'dashboard',
      prompt: 'Switch your active simulator role to "Engineer" to access the assigned remediation task.',
      highlight: 'Profile dropdown -> Select "Engineer"'
    },
    {
      step: 7,
      title: 'Begin Task Remediation',
      role: 'Engineer' as UserRole,
      view: 'remediation',
      prompt: 'Navigate to the "remediation" Kanban board. Locate the assigned PHP CGI RCE task and click "Start" to set it to In Progress.',
      highlight: 'Click "remediation" on navbar -> Click "Start" on CVE-2024-4577'
    },
    {
      step: 8,
      title: 'Upload Patch Evidence',
      role: 'Engineer' as UserRole,
      view: 'remediation',
      prompt: 'Click the "Patch" button on the card. Review the simulated upgrade shell logs and click "Upload & Submit for QA".',
      highlight: 'Click "Patch" -> Click "Upload & Submit"'
    },
    {
      step: 9,
      title: 'QA Authentication',
      role: 'QA Verifier' as UserRole,
      view: 'dashboard',
      prompt: 'Switch your simulator role to "QA Verifier" to execute verification scans and approve the patch.',
      highlight: 'Profile dropdown -> Select "QA Verifier"'
    },
    {
      step: 10,
      title: 'Open Verification module',
      role: 'QA Verifier' as UserRole,
      view: 'remediation',
      prompt: 'Navigate to the "remediation" Kanban board. Locate the PHP CGI task in "Verification Pending" and click "Verify".',
      highlight: 'Click "remediation" on navbar -> Click "Verify" on CVE-2024-4577'
    },
    {
      step: 11,
      title: 'Verify Checks & Rescan',
      role: 'QA Verifier' as UserRole,
      view: 'remediation',
      prompt: 'Tick off the first checklist items. Click "Run Verification Scan" to run a delta rescan, then tick the remaining items and click "Approve & Close".',
      highlight: 'Check checkboxes -> Run Verification Scan -> Click "Approve & Close"'
    },
    {
      step: 12,
      title: 'Executive Posture Audit',
      role: 'Manager' as UserRole,
      view: 'dashboard',
      prompt: 'Switch your active role to "Manager". Inspect the "platform" dashboard to watch the compliance score climb and review the activity logs.',
      highlight: 'Profile dropdown -> Select "Manager" -> Click "platform" on navbar'
    },
    {
      step: 13,
      title: 'Export Compliance PDF',
      role: 'Manager' as UserRole,
      view: 'compliance',
      prompt: 'Head to the "compliance" reports view and click "Export Compliance PDF" to finalize the remediation sequence audit trail.',
      highlight: 'Click "compliance" on navbar -> Click "Export Compliance PDF"'
    }
  ];

  const currentStepInfo = steps[demoStep - 1] || steps[0];

  const handleNext = () => {
    if (demoStep < 13) {
      setDemoStep(demoStep + 1);
      // Auto redirect view for better UX if they click manual next
      const nextStep = steps[demoStep];
      if (nextStep) setCurrentView(nextStep.view);
    } else {
      setDemoStep(1);
      setCurrentView('dashboard');
    }
  };

  const handlePrev = () => {
    if (demoStep > 1) {
      setDemoStep(demoStep - 1);
      const prevStep = steps[demoStep - 2];
      if (prevStep) setCurrentView(prevStep.view);
    }
  };

  const handleJumpToView = () => {
    setCurrentView(currentStepInfo.view);
  };

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-40 bg-white text-black p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-zinc-200"
      >
        <HelpCircle className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-severity-verified text-[8px] text-white font-bold font-mono rounded-full flex items-center justify-center">
          {demoStep}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[350px] glass-panel border border-white/10 rounded-2xl shadow-3xl overflow-hidden p-4 space-y-3 font-mono text-[11px] animate-in slide-in-from-bottom duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider">
          <Shield className="h-4 w-4 text-zinc-400" />
          <span>Demo Guide [{demoStep}/13]</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={resetDemoWorkflow}
            title="Reset simulation database"
            className="p-1 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="p-1 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Step Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white font-bold font-sans text-xs">{currentStepInfo.title}</span>
          <span className="text-[9px] uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5 text-zinc-400">
            {currentStepInfo.role}
          </span>
        </div>
        
        <p className="text-zinc-400 font-sans leading-relaxed text-[10.5px]">
          {currentStepInfo.prompt}
        </p>

        <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-white/5 space-y-1">
          <span className="text-zinc-500 uppercase text-[8px] block">PROBE ACTION POINT</span>
          <span className="text-white text-[9.5px] leading-tight block">{currentStepInfo.highlight}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <button
          disabled={demoStep === 1}
          onClick={handlePrev}
          className="p-1.5 hover:bg-white/5 rounded text-zinc-300 disabled:text-zinc-800 transition-colors flex items-center"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>

        <button
          onClick={handleJumpToView}
          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 lowercase text-[10px]"
        >
          go to view
        </button>

        <button
          onClick={handleNext}
          className="p-1.5 hover:bg-white/5 rounded text-zinc-300 transition-colors flex items-center"
        >
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
      </div>

    </div>
  );
};
