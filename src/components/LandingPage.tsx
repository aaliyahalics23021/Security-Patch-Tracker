import React, { useEffect, useRef } from 'react';
import { Shield, ArrowRight, Play } from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
  onViewDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, onViewDemo }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-performance cybersecurity canvas animation (Matrix / Scanning Node Grid)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Nodes
    const particleCount = 60;
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulse: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * 0.05
      });
    }

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw scanning radar lines occasionally
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 80) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Draw glowing scanning circle
      const scanY = (Date.now() * 0.05) % (height + 400) - 200;
      const gradient = ctx.createLinearGradient(0, scanY, 0, scanY + 150);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY, width, 150);

      // Update & Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        p.alpha += p.pulse;
        if (p.alpha > 0.8 || p.alpha < 0.2) p.pulse *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });

      // Draw lines between close particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.08;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black flex flex-col items-center justify-center px-6">
      
      {/* Video Background (Stock Cyber theme loop) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-15 pointer-events-none mix-blend-screen"
        src="https://assets.mixkit.co/videos/preview/mixkit-matrix-style-code-computer-screen-background-28498-large.mp4"
      />

      {/* Cyber Grid & Node Network Canvas Overlay */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" />
      
      {/* Dark vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80 z-1 pointer-events-none" />

      {/* Landing Floating Navbar */}
      <header className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-20">
        <div className="glass-card px-6 py-3 rounded-full flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-white" />
            <span className="font-bold tracking-widest text-xs uppercase text-white font-mono">SVPT</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            <a href="#platform" onClick={onLaunch} className="hover:text-white transition-colors">platform</a>
            <a href="#vulnerabilities" onClick={onLaunch} className="hover:text-white transition-colors">vulnerabilities</a>
            <a href="#remediation" onClick={onLaunch} className="hover:text-white transition-colors">remediation</a>
            <a href="#compliance" onClick={onLaunch} className="hover:text-white transition-colors">compliance</a>
            <a href="#support" onClick={onLaunch} className="hover:text-white transition-colors">support</a>
          </nav>

          <button 
            onClick={onLaunch}
            className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-zinc-200 transition-all font-mono"
          >
            get started
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 text-center max-w-4xl flex flex-col items-center justify-center mt-12 select-none">
        
        {/* Large Staggered lowercase typography */}
        <h1 className="text-5xl md:text-8xl font-light tracking-tighter text-white flex flex-col leading-tight md:leading-none select-none">
          <span className="opacity-40 font-mono tracking-tight lowercase">secure</span>
          <span className="font-semibold lowercase glow-white my-1 md:my-3">your</span>
          <span className="opacity-90 tracking-widest font-bold lowercase">infrastructure</span>
        </h1>

        {/* Hero description */}
        <p className="mt-8 text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed font-light font-sans">
          track vulnerabilities, verify patches, maintain audit visibility, and strengthen your security posture.
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onLaunch}
            className="w-48 bg-white hover:bg-zinc-200 text-black py-3 rounded-full text-xs font-semibold font-mono flex items-center justify-center gap-2 group transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={onViewDemo}
            className="w-48 bg-transparent hover:bg-white/5 text-white py-3 rounded-full text-xs font-semibold font-mono border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>View Demo Workflow</span>
          </button>
        </div>

        {/* Hero statistics */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl border-t border-white/5 pt-10 font-mono">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-white tracking-tight">+250k</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">vulnerabilities tracked</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-white tracking-tight">+98%</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">patch compliance</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-white tracking-tight">+15k</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">organizations secured</p>
          </div>
        </div>

      </main>

      {/* Floating cybersecurity notice at bottom */}
      <div className="absolute bottom-4 left-6 z-10 flex items-center gap-2 font-mono text-[9px] text-zinc-600 tracking-wider">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>SEC-OPS CLOUD NODE ACTIVE // ENCRYPTED SESSION</span>
      </div>

    </div>
  );
};
