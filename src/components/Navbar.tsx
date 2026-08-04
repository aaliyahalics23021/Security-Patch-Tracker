import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import type { UserRole } from '../context/SecurityContext';
import { Shield, Bell, LogOut, User, Activity } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { 
    currentRole, 
    currentUserEmail, 
    isLoggedIn, 
    logout, 
    login,
    notifications,
    markNotificationsAsRead
  } = useSecurity();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRoleSwitch = (role: UserRole) => {
    login(role, true);
    setShowProfileMenu(false);
  };

  const navLinks = [
    { id: 'dashboard', label: 'platform' },
    { id: 'vulnerabilities', label: 'vulnerabilities' },
    { id: 'remediation', label: 'remediation' },
    { id: 'compliance', label: 'compliance' },
    { id: 'assets', label: 'support' }, // Support points to Asset/System support
  ];

  if (!isLoggedIn) return null;

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <div className="glass-card px-6 py-3 rounded-full flex items-center justify-between shadow-2xl transition-all duration-300">
        
        {/* Logo / Brand */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setCurrentView('dashboard')}
        >
          <div className="bg-white/10 p-1.5 rounded-full border border-white/20 group-hover:border-white/50 transition-colors">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold tracking-widest text-sm uppercase text-white">SVPT</span>
          <span className="hidden sm:inline text-xs text-zinc-500 font-mono tracking-normal border-l border-zinc-800 pl-2">v1.0.0</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1 font-mono">
          {navLinks.map((link) => {
            const isActive = currentView === link.id || 
              (link.id === 'vulnerabilities' && currentView === 'vulnerabilities') ||
              (link.id === 'remediation' && currentView === 'remediation') ||
              (link.id === 'compliance' && currentView === 'compliance');
            
            return (
              <button
                key={link.id}
                onClick={() => setCurrentView(link.id)}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 lowercase ${
                  isActive 
                    ? 'bg-white text-black font-semibold shadow-md' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          
          {/* Sub menu links for utilities */}
          <button
            onClick={() => setCurrentView('assets')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 lowercase ${
              currentView === 'assets' 
                ? 'bg-white text-black font-semibold' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            assets
          </button>
          <button
            onClick={() => setCurrentView('topology')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 lowercase ${
              currentView === 'topology' 
                ? 'bg-white text-black font-semibold' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            topology
          </button>
          <button
            onClick={() => setCurrentView('scanner')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 lowercase ${
              currentView === 'scanner' 
                ? 'bg-white text-black font-semibold' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            scanner
          </button>
          <button
            onClick={() => setCurrentView('audit')}
            className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 lowercase ${
              currentView === 'audit' 
                ? 'bg-white text-black font-semibold' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            audit
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowProfileMenu(false);
                if (!showNotifMenu) markNotificationsAsRead();
              }}
              className="p-2 hover:bg-white/5 rounded-full transition-colors relative border border-white/5"
            >
              <Bell className="h-4.5 w-4.5 text-zinc-300 hover:text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-severity-critical animate-ping" />
              )}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-severity-critical" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl shadow-3xl overflow-hidden z-50 border border-white/10">
                <div className="px-4 py-3 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Security Events</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-mono">{unreadCount} new</span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-white/5 no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-zinc-500">
                      No notifications recorded.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-3 hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-2">
                          <Activity className="h-3.5 w-3.5 mt-0.5 text-zinc-400" />
                          <div>
                            <p className="text-xs font-medium text-white">{notif.title}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{notif.message}</p>
                            <p className="text-[9px] text-zinc-600 mt-1 font-mono">
                              {new Date(notif.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown & Active Role Indicator */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
              <User className="h-4 w-4 text-zinc-400" />
              <div className="text-left hidden lg:block">
                <p className="text-[10px] text-zinc-500 font-mono leading-none">ACTIVE ROLE</p>
                <p className="text-[11px] font-bold text-white leading-tight lowercase">{currentRole}</p>
              </div>
              <span className="text-[10px] lg:hidden bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full lowercase font-mono">
                {currentRole}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 glass-panel rounded-2xl shadow-3xl overflow-hidden z-50 border border-white/10 p-2 space-y-1">
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <p className="text-[10px] text-zinc-500 font-mono">AUTHORIZED ID</p>
                  <p className="text-xs font-semibold text-white truncate">{currentUserEmail}</p>
                </div>

                <div className="text-[10px] text-zinc-500 font-mono px-3 py-1">SIMULATE ROLE</div>
                {(['Admin', 'Security Analyst', 'Engineer', 'QA Verifier', 'Manager'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      currentRole === r 
                        ? 'bg-white/10 text-white font-medium' 
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{r}</span>
                    {currentRole === r && <span className="h-1.5 w-1.5 rounded-full bg-severity-verified" />}
                  </button>
                ))}

                <div className="h-px bg-white/5 my-2" />
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Exit Session</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
};
