import { useState } from 'react';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { AssetInventory } from './components/AssetInventory';
import { NetworkTopology } from './components/NetworkTopology';
import { VulnerabilityScanner } from './components/VulnerabilityScanner';
import { VulnerabilityList } from './components/VulnerabilityList';
import { VulnerabilityDetails } from './components/VulnerabilityDetails';
import { RemediationKanban } from './components/RemediationKanban';
import { VerificationModule } from './components/VerificationModule';
import { AuditTrail } from './components/AuditTrail';
import { ComplianceReport } from './components/ComplianceReport';
import { DemoWorkflowHelper } from './components/DemoWorkflowHelper';

function SVPTApp() {
  const { isLoggedIn, login, demoStep, setDemoStep } = useSecurity();
  const [currentView, setCurrentView] = useState<string>('landing'); // 'landing', 'login', 'dashboard', 'assets', 'topology', 'scanner', 'vulnerabilities', 'vulnerability-details', 'remediation', 'audit', 'compliance'
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  
  // Verification Modal Toggle
  const [verifierFindingId, setVerifierFindingId] = useState<string | null>(null);

  // Authentication Router
  if (!isLoggedIn) {
    if (currentView === 'login') {
      return (
        <Login 
          onLoginSuccess={() => {
            setCurrentView('dashboard');
            // Advance demo step if relevant
            if (demoStep === 1) setDemoStep(2);
          }} 
        />
      );
    }
    return (
      <LandingPage 
        onLaunch={() => setCurrentView('login')}
        onViewDemo={() => {
          // Preset to Security Analyst, skip to login
          login('Security Analyst', true);
          setCurrentView('dashboard');
          setDemoStep(2);
        }}
      />
    );
  }

  // Active view routing
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'assets':
        return <AssetInventory />;
      case 'topology':
        return <NetworkTopology />;
      case 'scanner':
        return <VulnerabilityScanner />;
      case 'vulnerabilities':
        return (
          <VulnerabilityList 
            onSelectFinding={(id) => {
              setSelectedFindingId(id);
              setCurrentView('vulnerability-details');
              // Advance demo step if relevant
              if (demoStep === 3) setDemoStep(4);
            }} 
          />
        );
      case 'vulnerability-details':
        return selectedFindingId ? (
          <VulnerabilityDetails 
            findingId={selectedFindingId} 
            onBack={() => setCurrentView('vulnerabilities')} 
          />
        ) : (
          <VulnerabilityList 
            onSelectFinding={(id) => {
              setSelectedFindingId(id);
              setCurrentView('vulnerability-details');
            }} 
          />
        );
      case 'remediation':
        return (
          <RemediationKanban 
            onSelectFinding={(id) => {
              setSelectedFindingId(id);
              setCurrentView('vulnerability-details');
            }}
            onOpenVerifier={(id) => {
              setVerifierFindingId(id);
              // Advance demo step if relevant
              if (demoStep === 10) setDemoStep(11);
            }}
          />
        );
      case 'audit':
        return <AuditTrail />;
      case 'compliance':
        return <ComplianceReport />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-white selection:text-black">
      
      {/* Primary Navigation */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Workspace Frame */}
      <main className="transition-all duration-300">
        {renderView()}
      </main>

      {/* Verification module modal overlay */}
      {verifierFindingId && (
        <VerificationModule 
          findingId={verifierFindingId} 
          onClose={() => setVerifierFindingId(null)} 
        />
      )}

      {/* Floating Demo Onboarding Assistant */}
      <DemoWorkflowHelper setCurrentView={setCurrentView} />

    </div>
  );
}

export default function App() {
  return (
    <SecurityProvider>
      <SVPTApp />
    </SecurityProvider>
  );
}
