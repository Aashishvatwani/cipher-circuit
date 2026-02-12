"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Round2Result() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070c] text-white px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_10%,rgba(0,255,200,.18),transparent),radial-gradient(900px_600px_at_90%_80%,rgba(124,58,237,.2),transparent)]" />
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Cipher Circuit</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-lime-200 to-amber-300 text-transparent bg-clip-text">
            Mission Complete
          </h1>
          <p className="mt-3 text-sm text-white/60">Your submission is locked in and verified.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="panel relative overflow-hidden"
        >
          <div className="absolute -top-24 right-6 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-6 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-3xl" />

          <div className="relative text-center py-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mb-6 h-20 w-20 rounded-full border border-lime-300/40 bg-lime-300/10 flex items-center justify-center"
            >
              <span className="text-3xl">✓</span>
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold">Thanks for participating</h2>
            <p className="mt-3 text-white/60 max-w-xl mx-auto">
              Results will be announced soon. Stay synced for the final rankings and awards.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <button onClick={() => router.push('/dashboard')} className="cta cta-primary">
                Back to Dashboard
              </button>
              <button onClick={() => router.push('/')} className="cta cta-ghost">
                Exit
              </button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-center text-[11px] uppercase tracking-[0.4em] text-white/40"
        >
          Results incoming. Monitor the dashboard for the final release.
        </motion.div>
      </div>

      <style jsx>{`
        .panel{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);backdrop-filter:blur(20px);border-radius:2rem;padding:2.5rem}
        .cta{padding:.9rem 1.8rem;border-radius:999px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;font-size:.75rem;transition:.2s}
        .cta-primary{background:#22d3ee;color:black;box-shadow:0 0 30px rgba(34,211,238,.6)}
        .cta-primary:hover{transform:translateY(-2px)}
        .cta-ghost{border:1px solid rgba(255,255,255,.2);color:white;background:transparent}
        .cta-ghost:hover{border-color:rgba(255,255,255,.4)}
      `}</style>
    </main>
  );
}
