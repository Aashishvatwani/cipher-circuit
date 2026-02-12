'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ParticleAnomaly from '@/components/ParticleAnomaly';
import { login } from '@/utils/api';

export default function Home() {
  const router = useRouter();

  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/dashboard');
    }

    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !teamName) {
      setError('Missing credentials');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const data = await login(teamId, teamName);
      
      // Store the JWT token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('teamId', data.teamId);
      localStorage.setItem('teamName', data.teamName);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#050608] text-white overflow-hidden">

      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Particles */}
      <div className="fixed inset-0 opacity-30">
        <ParticleAnomaly />
      </div>

      {/* TOP BAR */}
      <nav className="relative z-20 px-10 py-6 border-b border-cyan-500/20 flex justify-between items-end mt-3">

        <div className='mt-2.5'>
          <div className="flex items-center gap-4 ">
            <div className="virtual-led pulse">CC</div>
            <h1 className="text-4xl font-black italic text-cyan-400">
              CIPHER<span className="text-white">CIRCUIT</span>
            </h1>
          </div>
          <p className="text-[10px] tracking-widest text-lime-400 mt-2">
            SECURE TERMINAL NODE // 2026
          </p>
        </div>

        <div className="hidden lg:block text-right font-mono text-[11px] text-white/40">
          <div>SYSTEM_TIME: {time}</div>
          <div>LOCATION: 12.9716°N 77.5946°E</div>
          <div className="text-cyan-400">AES_ENCRYPTION_ACTIVE</div>
        </div>
      </nav>

      {/* MAIN GRID */}
      <div className="relative z-10 h-[calc(100vh-120px)] grid grid-cols-1 lg:grid-cols-[260px_1fr_340px] gap-12 px-10">

        {/* LEFT STATUS */}
        <section className="hidden lg:flex flex-col justify-center gap-6 font-mono text-[10px] opacity-60">
          <p className="text-lime-400">[OK] Kernel linked</p>
          <p>[INFO] Hardware scan</p>
          <p>[BUSY] Awaiting credentials</p>
          <p className="text-red-500">READY_FOR_UPLINK</p>
        </section>

        {/* CENTER HERO */}
        <section className="flex flex-col justify-center gap-8">

          <h2 className="terminal-title">
            CRACK THE<br />CIRCUITRY_
          </h2>

          <p className="text-lg text-white/50 max-w-lg border-l-2 border-cyan-400 pl-6">
            High-fidelity cryptographic challenges.
            Synchronize your team. Dominate the mainframe.
          </p>

          <div className="flex gap-6 text-xs uppercase tracking-widest mt-6">
            <span className="text-lime-400">Latency 12ms</span>
            <span className="text-cyan-400">Nodes FF</span>
            <span className="text-red-500">Threat Low</span>
          </div>

        </section>

        {/* RIGHT AUTH PANEL */}
        <motion.section
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-center"
        >

          <div className="auth-panel w-full max-w-md">

            <h3 className="auth-header">Team Authentication</h3>
            <p className="auth-sub">Secure access required to proceed.</p>

            <form onSubmit={handleLogin} className="space-y-6">

              <div>
                <label className="auth-label">TEAM ID</label>
                <input
                  value={teamId}
                  onChange={(e)=>setTeamId(e.target.value)}
                  className="auth-input"
                  placeholder="CC-XXXXX-2026"
                />
              </div>

              <div>
                <label className="auth-label">TEAM NAME</label>
                <input
                  value={teamName}
                  onChange={(e)=>setTeamName(e.target.value)}
                  className="auth-input"
                  placeholder="Nom de guerre"
                />
              </div>

              {error && (
                <div className="auth-error">
                  Authentication failed. Verify credentials.
                </div>
              )}

              <button className="auth-button">
                {loading ? 'Verifying…' : 'Authenticate'}
              </button>

            </form>

            <div className="mt-8 text-[10px] opacity-40 flex justify-between">
              <span>IEEE Protocol 7</span>
              <span>v26.4</span>
            </div>

          </div>

        </motion.section>

      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-0 w-full border-t border-white/10 py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-xs tracking-widest text-white/20 font-mono">
          ESTABLISHING LINK • BUFFER 98% • QUANTUM SAFE •
        </div>
      </footer>

    </main>
  );
}
