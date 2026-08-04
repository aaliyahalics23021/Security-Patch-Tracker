import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialAssets } from '../data/initialAssets';
import type { Asset } from '../data/initialAssets';
import { cveDatabase } from '../data/cveDatabase';
import type { CVEInfo } from '../data/cveDatabase';

export type { Asset, CVEInfo };
export type { SoftwarePackage } from '../data/initialAssets';

export type UserRole = 'Admin' | 'Security Analyst' | 'Engineer' | 'QA Verifier' | 'Manager';

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface PatchEvidence {
  id: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  timestamp: string;
  contentSnippet: string;
}

export interface VulnerabilityFinding {
  id: string; // assetId_cveId
  cveId: string;
  cveDetails: CVEInfo;
  assetId: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Assigned' | 'In Progress' | 'Patched' | 'Verification Pending' | 'Verified' | 'Closed';
  assignedEngineer: string;
  dueDate: string; // ISO date string
  notes: string;
  evidence: PatchEvidence[];
  timeline: {
    status: string;
    timestamp: string;
    user: string;
    details: string;
  }[];
  verifiedChecks: {
    patchInstalled: boolean;
    versionVerified: boolean;
    vulnerabilityRescanned: boolean;
    serviceRunningNormally: boolean;
    noRegressionDetected: boolean;
  };
  verificationScore: number;
}

interface SecurityContextType {
  // Authentication & Demo Roles
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUserEmail: string;
  login: (role: UserRole, remember: boolean) => void;
  logout: () => void;
  isLoggedIn: boolean;

  // Assets Management
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;

  // Vulnerability Findings (CVE instance on assets)
  findings: VulnerabilityFinding[];
  addManualVulnerability: (assetId: string, cveId: string, assignedEngineer?: string, dueDate?: string) => void;
  assignFinding: (findingId: string, engineer: string, notes?: string) => void;
  updateFindingStatus: (findingId: string, status: VulnerabilityFinding['status'], notes?: string) => void;
  uploadEvidence: (findingId: string, fileName: string, fileType: string, contentSnippet: string) => void;
  updateVerificationChecklist: (findingId: string, checks: Partial<VulnerabilityFinding['verifiedChecks']>) => void;
  verifyFinding: (findingId: string, action: 'Approve' | 'Reject' | 'Rework', comments?: string) => void;

  // Scan simulation
  isScanning: boolean;
  scanType: 'Quick' | 'Deep' | 'Compliance' | null;
  scanProgress: number;
  scanStage: string;
  runVulnerabilityScan: (type: 'Quick' | 'Deep' | 'Compliance') => void;
  lastScanTime: string | null;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Demo Workflow Helper State
  demoStep: number;
  setDemoStep: (step: number) => void;
  resetDemoWorkflow: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('svpt_role');
    return (saved as UserRole) || 'Security Analyst';
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('svpt_logged_in') === 'true';
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return localStorage.getItem('svpt_email') || 'analyst@svpt.enterprise.io';
  });

  // Database states
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('svpt_assets');
    return saved ? JSON.parse(saved) : initialAssets;
  });

  const [findings, setFindings] = useState<VulnerabilityFinding[]>(() => {
    const saved = localStorage.getItem('svpt_findings');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('svpt_audit_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'log_init',
        user: 'SYSTEM',
        action: 'System Initialized',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        details: 'Security vulnerability and asset tracking components established.'
      }
    ];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('svpt_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif_init',
        title: 'Platform Initialized',
        message: 'Welcome to SVPT. Select your active role to simulate patch management.',
        read: false,
        timestamp: new Date().toISOString()
      }
    ];
  });

  // Scan simulation states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanType, setScanType] = useState<SecurityContextType['scanType']>(null);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStage, setScanStage] = useState<string>('');
  const [lastScanTime, setLastScanTime] = useState<string | null>(() => {
    return localStorage.getItem('svpt_last_scan_time');
  });

  // Demo step wizard
  const [demoStep, setDemoStep] = useState<number>(() => {
    const saved = localStorage.getItem('svpt_demo_step');
    return saved ? parseInt(saved) : 1;
  });

  // Sync to Local Storage
  useEffect(() => {
    localStorage.setItem('svpt_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('svpt_findings', JSON.stringify(findings));
  }, [findings]);

  useEffect(() => {
    localStorage.setItem('svpt_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('svpt_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('svpt_demo_step', demoStep.toString());
  }, [demoStep]);

  // Auth Operations
  const login = (role: UserRole, remember: boolean) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
    let email = '';
    switch (role) {
      case 'Admin': email = 'admin@svpt.enterprise.io'; break;
      case 'Security Analyst': email = 'analyst@svpt.enterprise.io'; break;
      case 'Engineer': email = 'engineer.dave@svpt.enterprise.io'; break;
      case 'QA Verifier': email = 'qa.verifier@svpt.enterprise.io'; break;
      case 'Manager': email = 'executive.mgr@svpt.enterprise.io'; break;
    }
    setCurrentUserEmail(email);
    if (remember) {
      localStorage.setItem('svpt_role', role);
      localStorage.setItem('svpt_email', email);
      localStorage.setItem('svpt_logged_in', 'true');
    }
    
    // Add audit log
    addAuditLogInternal('User Login', `User logged in with role [${role}]`, email);
  };

  const logout = () => {
    addAuditLogInternal('User Logout', `User logged out`, currentUserEmail);
    setIsLoggedIn(false);
    localStorage.removeItem('svpt_logged_in');
  };

  // Audit Logs Internal helper
  const addAuditLogInternal = (action: string, details: string, user: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      user,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addAuditLog = (action: string, details: string) => {
    addAuditLogInternal(action, details, currentUserEmail);
  };

  // Notification Helper
  const addNotification = (title: string, message: string) => {
    const newNotif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title,
      message,
      read: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Asset Management
  const addAsset = (assetData: Omit<Asset, 'id'>) => {
    const id = `${assetData.name.replace(/\s+/g, '-')}-${Math.floor(100 + Math.random() * 900)}`;
    const newAsset: Asset = { ...assetData, id };
    setAssets(prev => [...prev, newAsset]);
    addAuditLog('Asset Created', `Asset ${newAsset.name} added to inventory.`);
  };

  const updateAsset = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    addAuditLog('Asset Updated', `Asset ${updatedAsset.name} details modified.`);
  };

  const deleteAsset = (id: string) => {
    const asset = assets.find(a => a.id === id);
    setAssets(prev => prev.filter(a => a.id !== id));
    addAuditLog('Asset Deleted', `Asset ${asset?.name || id} removed from inventory.`);
  };

  // SLA Calculation Helper
  const getSLADays = (severity: CVEInfo['severity']) => {
    switch (severity) {
      case 'Critical': return 7;
      case 'High': return 14;
      case 'Medium': return 30;
      case 'Low': return 60;
    }
  };

  // Vulnerability Findings Actions
  const addManualVulnerability = (assetId: string, cveId: string, assignedEngineer = '', dueDate = '') => {
    const asset = assets.find(a => a.id === assetId);
    const cve = cveDatabase.find(c => c.cveId === cveId);
    if (!asset || !cve) return;

    const findingId = `${assetId}_${cveId}`;
    // Check duplicate
    if (findings.some(f => f.id === findingId)) return;

    const limitDays = getSLADays(cve.severity);
    const finalDueDate = dueDate || new Date(Date.now() + limitDays * 24 * 3600000).toISOString();

    const newFinding: VulnerabilityFinding = {
      id: findingId,
      cveId,
      cveDetails: cve,
      assetId,
      severity: cve.severity,
      status: assignedEngineer ? 'Assigned' : 'Open',
      assignedEngineer,
      dueDate: finalDueDate,
      notes: 'Manually logged by Security Analyst.',
      evidence: [],
      timeline: [
        {
          status: 'Open',
          timestamp: new Date().toISOString(),
          user: currentUserEmail,
          details: 'Vulnerability manually created and logged in the tracking engine.'
        }
      ],
      verifiedChecks: {
        patchInstalled: false,
        versionVerified: false,
        vulnerabilityRescanned: false,
        serviceRunningNormally: false,
        noRegressionDetected: false
      },
      verificationScore: 0
    };

    setFindings(prev => [newFinding, ...prev]);
    addNotification('New CVE Finding Logged', `${cveId} has been manually added to ${assetId}.`);
    addAuditLog('CVE Finding Logged', `Logged ${cveId} on asset ${assetId}. Status: ${newFinding.status}`);
  };

  const assignFinding = (findingId: string, engineer: string, notes = '') => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        const nextStatus = f.status === 'Open' ? 'Assigned' : f.status;
        return {
          ...f,
          status: nextStatus,
          assignedEngineer: engineer,
          notes: notes || f.notes,
          timeline: [
            ...f.timeline,
            {
              status: nextStatus,
              timestamp: new Date().toISOString(),
              user: currentUserEmail,
              details: `Task assigned to engineer: ${engineer}. ${notes ? `Notes: ${notes}` : ''}`
            }
          ]
        };
      }
      return f;
    }));

    const finding = findings.find(f => f.id === findingId);
    addNotification('Remediation Task Assigned', `Vulnerability on ${finding?.assetId} assigned to ${engineer}.`);
    addAuditLog('Task Assigned', `Assigned remediation task for ${finding?.cveId} on ${finding?.assetId} to ${engineer}.`);
  };

  const updateFindingStatus = (findingId: string, status: VulnerabilityFinding['status'], notes = '') => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        return {
          ...f,
          status,
          timeline: [
            ...f.timeline,
            {
              status,
              timestamp: new Date().toISOString(),
              user: currentUserEmail,
              details: notes || `Status updated to ${status}.`
            }
          ]
        };
      }
      return f;
    }));

    const finding = findings.find(f => f.id === findingId);
    addNotification('Vulnerability Status Updated', `Status of ${finding?.cveId} changed to ${status}.`);
    addAuditLog('CVE Status Modified', `Updated status of ${finding?.cveId} on ${finding?.assetId} to ${status}.`);
  };

  const uploadEvidence = (findingId: string, fileName: string, fileType: string, contentSnippet: string) => {
    const evidenceItem: PatchEvidence = {
      id: `ev_${Date.now()}`,
      fileName,
      fileType,
      uploadedBy: currentUserEmail,
      timestamp: new Date().toISOString(),
      contentSnippet
    };

    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        return {
          ...f,
          status: 'Verification Pending',
          evidence: [...f.evidence, evidenceItem],
          timeline: [
            ...f.timeline,
            {
              status: 'Patched',
              timestamp: new Date().toISOString(),
              user: currentUserEmail,
              details: `Evidence uploaded: ${fileName} (${fileType}). Ready for QA review.`
            }
          ]
        };
      }
      return f;
    }));

    const finding = findings.find(f => f.id === findingId);
    addNotification('Patch Evidence Uploaded', `Engineer uploaded evidence for ${finding?.cveId}. Status: Verification Pending.`);
    addAuditLog('Evidence Uploaded', `Uploaded evidence "${fileName}" for ${finding?.cveId} on ${finding?.assetId}.`);
  };

  const updateVerificationChecklist = (findingId: string, checks: Partial<VulnerabilityFinding['verifiedChecks']>) => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        const nextChecks = { ...f.verifiedChecks, ...checks };
        
        // Calculate verification score
        const totalChecks = Object.values(nextChecks).length;
        const checkedCount = Object.values(nextChecks).filter(Boolean).length;
        const score = Math.round((checkedCount / totalChecks) * 100);

        return {
          ...f,
          verifiedChecks: nextChecks,
          verificationScore: score
        };
      }
      return f;
    }));
  };

  const verifyFinding = (findingId: string, action: 'Approve' | 'Reject' | 'Rework', comments = '') => {
    const finding = findings.find(f => f.id === findingId);
    if (!finding) return;

    let nextStatus: VulnerabilityFinding['status'] = 'Open';
    let detailText = '';

    if (action === 'Approve') {
      nextStatus = 'Closed';
      detailText = `Patch verified and approved by QA. Comments: ${comments || 'No feedback provided'}. Finding marked as Closed.`;
    } else if (action === 'Reject') {
      nextStatus = 'Open';
      detailText = `Patch rejected by QA. Comments: ${comments || 'Vulnerability remains active'}. Finding reset to Open.`;
    } else {
      nextStatus = 'In Progress';
      detailText = `Patch rework requested by QA. Comments: ${comments || 'Requires modifications'}. Finding set to In Progress.`;
    }

    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        // Reset checklist if rejected/rework
        const resetChecks = action === 'Approve' ? f.verifiedChecks : {
          patchInstalled: false,
          versionVerified: false,
          vulnerabilityRescanned: false,
          serviceRunningNormally: false,
          noRegressionDetected: false
        };

        return {
          ...f,
          status: nextStatus,
          verifiedChecks: resetChecks,
          verificationScore: action === 'Approve' ? 100 : 0,
          timeline: [
            ...f.timeline,
            {
              status: nextStatus,
              timestamp: new Date().toISOString(),
              user: currentUserEmail,
              details: detailText
            }
          ]
        };
      }
      return f;
    }));

    addNotification(`Patch Verification ${action}d`, `${finding.cveId} on ${finding.assetId} has been ${action}d.`);
    addAuditLog('Patch Verification', `QA ${action}d patch for ${finding.cveId} on ${finding.assetId}.`);
    
    // Simulate updating software package in asset if approved
    if (action === 'Approve') {
      const fixedVer = finding.cveDetails.fixedVersion;
      const softwareName = finding.cveDetails.affectedSoftware;
      
      setAssets(prev => prev.map(asset => {
        if (asset.id === finding.assetId) {
          const updatedPackages = asset.installedSoftware.map(pkg => {
            if (pkg.name === softwareName) {
              return { ...pkg, version: fixedVer };
            }
            return pkg;
          });
          return { ...asset, installedSoftware: updatedPackages };
        }
        return asset;
      }));
      
      addAuditLog('Asset Software Patched', `Upgraded ${softwareName} to ${fixedVer} on ${finding.assetId}.`);
    }
  };

  // Simulated Vulnerability Scan Engine
  const runVulnerabilityScan = (type: 'Quick' | 'Deep' | 'Compliance') => {
    setIsScanning(true);
    setScanType(type);
    setScanProgress(0);
    setScanStage('Initializing scanning parameters...');
    addAuditLog('Scan Started', `Initiated ${type} scanning across network topology.`);

    const stages = [
      { progress: 15, stage: 'Enumerating network host assets...' },
      { progress: 40, stage: 'Probing installed software packages and API registries...' },
      { progress: 65, stage: 'Cross-referencing databases with CVE global vulnerability library...' },
      { progress: 85, stage: 'Calculating risk vectors, severity distributions, and SLA metrics...' },
      { progress: 100, stage: 'Scan complete. Generating security posture reports...' }
    ];

    let currentStageIndex = 0;

    const interval = setInterval(() => {
      if (currentStageIndex < stages.length) {
        const nextStage = stages[currentStageIndex];
        setScanProgress(nextStage.progress);
        setScanStage(nextStage.stage);
        currentStageIndex++;
      } else {
        clearInterval(interval);
        
        // Scan logic execution: Compare packages in assets vs CVEs in cveDatabase
        let findingsDetected = 0;
        
        assets.forEach(asset => {
          asset.installedSoftware.forEach(pkg => {
            // Find if there's matching CVE
            cveDatabase.forEach(cve => {
              if (cve.affectedSoftware.toLowerCase() === pkg.name.toLowerCase() &&
                  cve.affectedVersion === pkg.version) {
                
                // Exclude Compliance scan from scanning general non-compliant items unless deep
                if (type === 'Quick' && (cve.severity === 'Medium' || cve.severity === 'Low')) {
                  // Skip lower severities in Quick Scan
                  return;
                }
                
                // Add finding
                const findingId = `${asset.id}_${cve.cveId}`;
                setFindings(prev => {
                  if (prev.some(f => f.id === findingId)) return prev;

                  findingsDetected++;
                  const limitDays = getSLADays(cve.severity);
                  const dueDate = new Date(Date.now() + limitDays * 24 * 3600000).toISOString();

                  const newFinding: VulnerabilityFinding = {
                    id: findingId,
                    cveId: cve.cveId,
                    cveDetails: cve,
                    assetId: asset.id,
                    severity: cve.severity,
                    status: 'Open',
                    assignedEngineer: '',
                    dueDate,
                    notes: `System detected during ${type} scan.`,
                    evidence: [],
                    timeline: [
                      {
                        status: 'Open',
                        timestamp: new Date().toISOString(),
                        user: 'SYSTEM_SCANNER',
                        details: `Vulnerability detected by automated ${type} scanner.`
                      }
                    ],
                    verifiedChecks: {
                      patchInstalled: false,
                      versionVerified: false,
                      vulnerabilityRescanned: false,
                      serviceRunningNormally: false,
                      noRegressionDetected: false
                    },
                    verificationScore: 0
                  };

                  return [newFinding, ...prev];
                });
              }
            });
          });
        });

        setIsScanning(false);
        setLastScanTime(new Date().toISOString());
        localStorage.setItem('svpt_last_scan_time', new Date().toISOString());

        addNotification('Scan Completed', `${type} scan finished. Identified ${findingsDetected} vulnerabilities.`);
        addAuditLog('Scan Finished', `Completed network scan. Found ${findingsDetected} new vulnerabilities.`);

        // Progress Demo Workflow Step if relevant
        if (demoStep === 2) {
          setDemoStep(3);
        }
      }
    }, 1200);
  };

  // Demo Workflow State Handlers
  const resetDemoWorkflow = () => {
    // Clear findings, reset assets to default, log reset
    setFindings([]);
    setAssets(initialAssets);
    setDemoStep(1);
    setCurrentRole('Security Analyst');
    localStorage.removeItem('svpt_findings');
    localStorage.setItem('svpt_assets', JSON.stringify(initialAssets));
    localStorage.setItem('svpt_demo_step', '1');
    localStorage.setItem('svpt_role', 'Security Analyst');
    
    // Clear notifications & logs
    setNotifications([
      {
        id: 'notif_init',
        title: 'Platform Initialized',
        message: 'Welcome to SVPT. Select your active role to simulate patch management.',
        read: false,
        timestamp: new Date().toISOString()
      }
    ]);

    setAuditLogs([
      {
        id: 'log_reset',
        user: 'SYSTEM',
        action: 'Demo Environment Reset',
        timestamp: new Date().toISOString(),
        details: 'Mock database cleared. Initial assets reloaded.'
      }
    ]);
  };

  return (
    <SecurityContext.Provider value={{
      currentRole,
      setCurrentRole,
      currentUserEmail,
      login,
      logout,
      isLoggedIn,
      
      assets,
      addAsset,
      updateAsset,
      deleteAsset,
      
      findings,
      addManualVulnerability,
      assignFinding,
      updateFindingStatus,
      uploadEvidence,
      updateVerificationChecklist,
      verifyFinding,
      
      isScanning,
      scanType,
      scanProgress,
      scanStage,
      runVulnerabilityScan,
      lastScanTime,
      
      auditLogs,
      addAuditLog,
      
      notifications,
      markNotificationsAsRead,
      clearNotifications,
      
      demoStep,
      setDemoStep,
      resetDemoWorkflow
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
