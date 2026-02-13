'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Zap, 
  ExternalLink, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  Lightbulb,
  CircuitBoard,
  Binary,
  Lock,
  Unlock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { apiGet } from '@/utils/api';
import { useSocket } from '@/hooks/useSocket';

// Types
type SwitchValues = { S0: number | null; S1: number | null; S2: number | null; S3: number | null };
type SwitchValuesReady = { S0: number; S1: number; S2: number; S3: number };

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

// Background Grid Component
const BackgroundGrid = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {/* Circuit grid pattern */}
    <div className="absolute inset-0 circuit-grid opacity-50" />
    
    {/* Gradient orbs */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
    
    {/* Scanline effect */}
    <div className="absolute inset-0 scanline opacity-30" />
  </div>
);

// Header Component
const Header = () => (
  <motion.header 
    className="relative mb-12"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30">
        <Cpu className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono text-cyan-400 tracking-wider">PHASE 01</span>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/30 via-white/10 to-transparent" />
    </div>
    
    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-white">
        ROUND 1
      </span>
    </h1>
    
    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
      <h2 className="text-xl md:text-2xl text-white/70 font-medium flex items-center gap-2">
        <CircuitBoard className="w-5 h-5 text-cyan-400" />
        Ancient Rune Alignment 
      </h2>
      <div className="flex items-center gap-2 text-sm text-white/50">
        <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
        CircuitVerse Simulation
      </div>
    </div>
    
    <p className="mt-4 text-white/60 max-w-2xl leading-relaxed">
      Build a digital logic circuit using XOR gates to generate your 4-bit secret key. 
      Both team members must independently verify and submit the key to advance.
    </p>
  </motion.header>
);

// Quick Actions Component
const QuickActions = () => (
  <motion.div 
    className="flex flex-wrap gap-3 mb-10"
    variants={itemVariants}
    initial="hidden"
    animate="visible"
  >
    <a 
      href="https://circuitverse.org/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="group"
    >
      <button className="btn-primary flex items-center gap-2 glow-cyan">
        <ExternalLink className="w-4 h-4" />
        Open CircuitVerse
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </a>
    
    <button className="btn-secondary flex items-center gap-2">
      <HelpCircle className="w-4 h-4" />
      Need Help?
    </button>
  </motion.div>
);

// Step Card Component
interface StepCardProps {
  step: number;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const StepCard = ({ step, title, children, icon }: StepCardProps) => (
  <motion.div 
    className="step-card"
    variants={cardVariants}
    whileHover="hover"
  >
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
        {icon || <span className="text-cyan-400 font-mono font-bold">{step}</span>}
      </div>
      <div className="flex-1">
        <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
          STEP {step} — {title}
        </h4>
        {children}
      </div>
    </div>
  </motion.div>
);

// Switch Display Component
const SwitchDisplay = ({ label, value }: { label: string; value: number | null }) => (
  <motion.div 
    className="relative p-4 rounded-xl bg-black/50 border border-white/10 overflow-hidden"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
  >
    <div className={`absolute inset-0 opacity-20 transition-colors duration-300 ${value === 1 ? 'bg-lime-400' : value === 0 ? 'bg-red-500' : ''}`} />
    <p className="text-xs text-white/50 mb-2 font-mono uppercase">{label}</p>
    <p className={`text-3xl font-bold font-mono ${value === 1 ? 'text-lime-400 text-glow-lime' : 'text-red-500'}`}>
      {value ?? '?'}
    </p>
    <div className="absolute top-2 right-2">
      <div className={`w-2 h-2 rounded-full ${value === 1 ? 'bg-lime-400 shadow-glow-lime' : value === 0 ? 'bg-red-500 shadow-glow-red' : 'bg-white/20'}`} />
    </div>
  </motion.div>
);

// LED Display Component
const LEDDisplay = ({ value, index }: { value: string; index: number }) => (
  <motion.div
    className={`led-display ${value === '1' ? 'active' : value === '0' ? 'inactive' : ''}`}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: index * 0.1 }}
  >
    {value || '?'}
  </motion.div>
);

// XOR Logic Card Component
const XORLogicCard = ({ label, formula, result, index }: { label: string; formula: string; result: number | null; index: number }) => (
  <motion.div 
    className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/10 hover:border-cyan-400/40 transition-colors"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <div className="flex items-center gap-3">
      <span className="text-xs text-cyan-400 font-mono font-bold">{label}</span>
      <span className="text-xs text-white/50 font-mono">{formula}</span>
    </div>
    <span className={`text-lg font-bold font-mono ${result === 1 ? 'text-lime-400 text-glow-lime' : result === 0 ? 'text-red-500' : 'text-white/30'}`}>
      {result ?? '?'}
    </span>
  </motion.div>
);

// Main Round1 Component
export default function Round1() {
  const [keyBits, setKeyBits] = useState<string[]>(['', '', '', '']);
  const [switchValues, setSwitchValues] = useState<SwitchValues>({ S0: null, S1: null, S2: null, S3: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [role, setRole] = useState<'encrypt' | 'decrypt' | null>(null);

  const { connected, submitRound1Key, round1Result } = useSocket(teamId, role);

  useEffect(() => {
    const teamId = localStorage.getItem('teamId');
    const token = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('role');
    if (!teamId || !token) {
      window.location.href = '/';
      return;
    }
    if (storedRole !== 'encrypt' && storedRole !== 'decrypt') {
      window.location.href = '/dashboard';
      return;
    }
    setTeamId(teamId);
    setRole(storedRole);
    fetchTeamAssignment(teamId);
  }, []);

  useEffect(() => {
    if (!round1Result) return;

    setSubmitting(false);

    if (!round1Result.success) {
      setSuccess(false);
      setSuccessMessage('');
      setError(round1Result.message || 'Incorrect key.');
      return;
    }

    setError('');
    setSuccess(true);
    setSuccessMessage(round1Result.message || 'Key verified.');

    if (!round1Result.waitingForTeammate) {
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1800);
    }
  }, [round1Result]);

  const fetchTeamAssignment = async (teamId: string) => {
    try {
      const response = await apiGet<{ switchValues?: SwitchValues }>(`/api/team/${teamId}`);
      setSwitchValues(response.switchValues ?? { S0: null, S1: null, S2: null, S3: null });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching team assignment:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch team assignment');
      setLoading(false);
    }
  };

  

  const handleBit = (i: number, v: string) => {
    if (v === '' || v === '0' || v === '1') {
      const copy = [...keyBits];
      copy[i] = v;
      setKeyBits(copy);
      setError('');
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!connected) {
      setError('Not connected to server. Please wait a moment and try again.');
      setSubmitting(false);
      return;
    }

    if (keyBits.some(b => b === '')) {
      setError('Enter all 4 bits to proceed');
      setSubmitting(false);
      return;
    }

    const key4bit = keyBits.join('');
    submitRound1Key(key4bit);
    
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050608] text-white flex items-center justify-center relative overflow-hidden">
        <BackgroundGrid />
        <motion.div 
          className="text-center relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative mb-6">
            <div className="w-16 h-16 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-lime-400 rounded-full animate-spin mx-auto" style={{ animationDuration: '1.5s' }} />
          </div>
          <p className="text-xl text-cyan-400 font-mono animate-pulse">Loading team assignment...</p>
          <p className="text-sm text-white/40 mt-2">Fetching switch configurations</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050608] text-white relative overflow-x-hidden">
      <BackgroundGrid />
      
      <div className="relative z-10 px-6 md:px-10 py-10 max-w-7xl mx-auto">
        <Header />
        <QuickActions />

        {/* Instructions Section */}
        <motion.section 
          className="mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="glass-panel rounded-2xl p-8 neon-border">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-6 h-6 text-cyan-400" />
              <h3 className="text-2xl font-bold text-white">OBJECTIVE</h3>
            </div>
            
            <p className="text-white/70 mb-8 leading-relaxed">
              Generate a 4-bit secret key using a digital logic circuit in CircuitVerse with XOR gates. 
              Both team members must independently verify and submit the correct key to advance to Round 2.
            </p>

            <div className="space-y-4">
              <StepCard step={1} title="Open CircuitVerse" icon={<ExternalLink className="w-5 h-5 text-cyan-400" />}>
                <p className="text-white/60 text-sm mb-4">Use one laptop per team for simulation. Both teammates should observe the output together.</p>
                <a href="https://circuitverse.org/" target="_blank" rel="noopener noreferrer">
                  <button className="btn-primary text-sm">
                    Launch CircuitVerse
                  </button>
                </a>
              </StepCard>

              <StepCard step={2} title="Build the Circuit" icon={<CircuitBoard className="w-5 h-5 text-cyan-400" />}>
                <p className="text-white/60 text-sm mb-4">Construct the circuit using these components:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                    <p className="text-lime-400 text-xs mb-2 font-bold uppercase tracking-wider">Magical Elements</p>
                    <ul className="text-white/70 text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400" />
                        4 Switches (S0, S1, S2, S3)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400" />
                        4 XOR Gates
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-lime-400" />
                        4 LEDs (Key0-Key3)
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-black/30 border border-white/10">
                    <p className="text-cyan-400 text-xs mb-2 font-bold uppercase tracking-wider">XOR Connections</p>
                    <ul className="text-white/70 text-sm space-y-2 font-mono">
                      <li className="flex items-center justify-between">
                        <span>Key0</span>
                        <span className="text-cyan-400">S0 ⊕ S1</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Key1</span>
                        <span className="text-cyan-400">S1 ⊕ S2</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Key2</span>
                        <span className="text-cyan-400">S2 ⊕ S3</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Key3</span>
                        <span className="text-cyan-400">S3 ⊕ S0</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </StepCard>

              <StepCard step={3} title="Set Your Team's Switches" icon={<Binary className="w-5 h-5 text-cyan-400" />}>
                <p className="text-white/60 text-sm mb-4">Configure these switch values in CircuitVerse:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {switchValues && Object.entries(switchValues).map(([key, val]) => (
                    <SwitchDisplay key={key} label={key} value={val} />
                  ))}
                </div>
                <p className="text-white/40 text-xs mt-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Turn switches ON (1) or OFF (0) in CircuitVerse accordingly
                </p>
              </StepCard>

              <StepCard step={4} title="Read the Output Key" icon={<Zap className="w-5 h-5 text-cyan-400" />}>
                <p className="text-white/60 text-sm mb-4">Observe the LEDs in this order (MSB to LSB):</p>
                <div className="p-6 rounded-xl bg-black/50 border border-cyan-400/30">
                  <p className="text-center text-white/50 mb-3 text-sm">Read from left to right</p>
                  <p className="text-center text-3xl font-mono font-bold text-cyan-400 text-glow-cyan">
                    Key = Key3 Key2 Key1 Key0
                  </p>
                  <p className="text-center text-white/40 text-sm mt-3 font-mono">Example: 1010</p>
                </div>
              </StepCard>

              <StepCard step={5} title="Submit Your 4-Bit Key" icon={<Lock className="w-5 h-5 text-cyan-400" />}>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-lime-400/5 border border-lime-400/20">
                  <Sparkles className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-lime-400 font-bold text-sm mb-1">IMPORTANT</p>
                    <p className="text-white/60 text-sm">Both Technomancers must cast the spell independently. The Pensieve only opens if the words are identical.</p>
                  </div>
                </div>
              </StepCard>
            </div>
          </div>
        </motion.section>

        {/* Main Submission Area */}
        <motion.section 
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Switch Values Panel */}
          <motion.div className="lg:col-span-3" variants={itemVariants}>
            <div className="glass-panel rounded-2xl p-6 h-full">
              <div className="flex items-center gap-2 mb-6">
                <Binary className="w-5 h-5 text-lime-400" />
                <p className="text-xs text-lime-400 font-bold uppercase tracking-wider">Your Switches</p>
              </div>
              
              <div className="space-y-3">
                {Object.entries(switchValues).map(([k, v], i) => (
                  <motion.div 
                    key={k} 
                    className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="font-mono font-bold text-white/70">{k}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${v === 1 ? 'text-lime-400' : 'text-red-500'}`}>
                        {v === 1 ? '●' : '○'}
                      </span>
                      <span className={`font-mono font-bold ${v === 1 ? 'text-lime-400' : 'text-red-500'}`}>
                        {v}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <button 
                  onClick={() => setShowHint(!showHint)}
                  className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                
                <AnimatePresence>
                  {showHint && (
                    <motion.div 
                      className="mt-4 p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p className="text-xs text-cyan-400/80 leading-relaxed">
                        XOR returns 1 when inputs are different, 0 when same. 
                        0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Key Submission Console */}
          <motion.div className="lg:col-span-6" variants={itemVariants}>
            <div className="glass-panel rounded-2xl p-8 neon-border glow-cyan">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Unlock className="w-5 h-5 text-cyan-400" />
                    Ritual Altar
                  </h2>
                  <p className="text-white/50 text-sm mt-1">Enter your generated 4-bit key</p>
                </div>
                <div className="status-badge pending">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Awaiting Incantation
                </div>
              </div>

              {/* LED Preview */}
              <div className="flex justify-center gap-3 mb-8">
                {keyBits.map((b, i) => (
                  <LEDDisplay key={i} value={b} index={i} />
                ))}
              </div>

              <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-4 gap-3">
                  {keyBits.map((b, i) => (
                    <motion.div 
                      key={i} 
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <label className="block text-xs text-white/50 mb-2 text-center font-mono">
                        Key{i}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[01]?"
                        value={b}
                        maxLength={1}
                        onChange={e => handleBit(i, e.target.value)}
                        placeholder="?"
                        disabled={submitting || success}
                        data-value={b}
                        className="bit-input"
                      />
                    </motion.div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div 
                      className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div 
                      className="p-4 rounded-lg bg-lime-400/10 border border-lime-400/30 flex items-center gap-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-lime-400 flex-shrink-0" />
                      <div>
                        <p className="text-lime-400 font-bold text-sm">Key Verified!</p>
                        <p className="text-lime-400/70 text-xs">{successMessage || 'Advancing to Round 2...'}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={submitting || success}
                  className="w-full btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Ritual Stabilized
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Submit Key
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* XOR Logic Reference */}
          <motion.div className="lg:col-span-3" variants={itemVariants}>
            <div className="glass-panel rounded-2xl p-6 h-full">
              <div className="flex items-center gap-2 mb-6">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">The Arithmancy Scroll</p>
              </div>

              

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-white/40 mb-3">Incantation Outcomes</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-black/40 text-white/60 flex justify-between">
                    <span>0 ⊕ 0</span>
                    <span className="text-lime-400">= 0</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 text-white/60 flex justify-between">
                    <span>0 ⊕ 1</span>
                    <span className="text-lime-400">= 1</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 text-white/60 flex justify-between">
                    <span>1 ⊕ 0</span>
                    <span className="text-lime-400">= 1</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 text-white/60 flex justify-between">
                    <span>1 ⊕ 1</span>
                    <span className="text-lime-400">= 0</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          className="mt-12 pt-8 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Cpu className="w-4 h-4" />
              <span className="font-mono">Hogwarts Arithmancy Dept.</span>
            </div>
            <div className="flex items-center gap-6 text-white/40 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-400" />
                Magic Stabilized
              </span>
              <span className="font-mono">Round 1 of 2</span>
            </div>
          </div>
        </motion.footer>
      </div>
    </main>
  );
}
