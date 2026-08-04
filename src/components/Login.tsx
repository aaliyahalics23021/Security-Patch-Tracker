import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import type { UserRole } from '../context/SecurityContext';
import { Shield, Eye, EyeOff, Lock, Mail, ChevronRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { login } = useSecurity();

  const [email, setEmail] = useState('analyst@svpt.enterprise.io');
  const [password, setPassword] = useState('********');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Security Analyst');
  const [error, setError] = useState('');

  // Auto fill credentials based on role selection
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    let mockEmail = '';
    switch (role) {
      case 'Admin': mockEmail = 'admin@svpt.enterprise.io'; break;
      case 'Security Analyst': mockEmail = 'analyst@svpt.enterprise.io'; break;
      case 'Engineer': mockEmail = 'engineer.dave@svpt.enterprise.io'; break;
      case 'QA Verifier': mockEmail = 'qa.verifier@svpt.enterprise.io'; break;
      case 'Manager': mockEmail = 'executive.mgr@svpt.enterprise.io'; break;
    }
    setEmail(mockEmail);
    setPassword('enterprise_secure_pass_2026');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide a valid corporate email.');
      return;
    }
    
    // Simulate login and redirect
    login(selectedRole, rememberMe);
    onLoginSuccess();
  };

  const demoAccounts = [
    { role: 'Security Analyst' as UserRole, desc: 'Run scans, review CVE database findings' },
    { role: 'Admin' as UserRole, desc: 'Manage assets, assign engineers to CVEs' },
    { role: 'Engineer' as UserRole, desc: 'Upload patch evidence, fix findings' },
    { role: 'QA Verifier' as UserRole, desc: 'Interactive verification checklists & rescans' },
    { role: 'Manager' as UserRole, desc: 'Posture score, SLA charts, download PDF audit' }
  ];

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-black relative px-6 py-12 select-none">
      
      {/* Abstract scan-line grid background */}
      <div className="absolute inset-0 bg-grid-animation opacity-25 z-0" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-950/90 to-black z-1 pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-0 glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        
        {/* Left pane: Form & Role Selection */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-white/10 p-2 rounded-full border border-white/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold tracking-widest text-sm uppercase text-white font-mono">SVPT CONSOLE</span>
            </div>
            
            <h2 className="text-2xl font-light text-white tracking-tight mt-8">
              Access the patch tracking gateway.
            </h2>
            <p className="text-zinc-500 text-xs mt-2 font-mono">
              Provide credentials or select a simulation role profile to initiate testing.
            </p>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Security Email ID</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@svpt.enterprise.io"
                    className="w-full bg-zinc-950 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl py-3 pl-11 pr-4 text-xs font-mono focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Encryption Key / Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl py-3 pl-11 pr-12 text-xs font-mono focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forget Key */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-950 text-white focus:ring-0 focus:ring-offset-0 h-4 w-4"
                  />
                  <span>Remember Session</span>
                </label>
                <a href="#reset" onClick={() => setError('Contact corporate operations to reset SSO settings.')} className="hover:text-white transition-colors">
                  Lost credentials?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-white hover:bg-zinc-200 text-black py-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] mt-6"
              >
                <span>Authorize & Mount Dashboard</span>
                <ChevronRight className="h-4 w-4" />
              </button>

            </form>
          </div>

          <div className="mt-8 text-[10px] text-zinc-600 font-mono">
            SVPT CORE v1.0.0 // SHA-256 VERIFIED BINDINGS
          </div>
        </div>

        {/* Right pane: Role profiles selector (Demo Mode) */}
        <div className="md:col-span-5 bg-zinc-950/70 border-t md:border-t-0 md:border-l border-white/5 p-8 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase bg-white/5 text-zinc-400 px-3 py-1 rounded-full border border-white/10">
              Demo Environment Mode
            </span>
            
            <h3 className="text-sm font-semibold text-white mt-6 tracking-tight">
              Switch Simulation Profile
            </h3>
            <p className="text-zinc-500 text-xs mt-1 font-mono">
              Select an account to load realistic dashboard workspaces and perform role-specific duties.
            </p>

            <div className="mt-6 space-y-2">
              {demoAccounts.map((acc) => {
                const isSelected = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleRoleSelect(acc.role)}
                    className={`w-full p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-center ${
                      isSelected 
                        ? 'bg-white/10 border-white/30 text-white shadow-lg' 
                        : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/15 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono">{acc.role}</span>
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-severity-verified animate-pulse" />}
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 font-light leading-tight font-sans">
                      {acc.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 text-[10px] text-zinc-500 font-mono leading-tight">
            Selecting a role automatically populates secure simulation keys and redirects you to the matching workspace.
          </div>
        </div>

      </div>
    </div>
  );
};
