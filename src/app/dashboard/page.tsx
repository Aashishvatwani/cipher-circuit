'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';

interface TeamState {
  round:number;
  key4bit:string;
  key8bit:string;
  round1Complete:boolean;
  round2Complete:boolean;
  teammateOnline:boolean;
  role?: 'encrypt' | 'decrypt' | null;
  assignedNumber?: number | null;
  encryptionValue?: number | null;
}

export default function Dashboard() {

const router = useRouter();

const [teamName,setTeamName]=useState('');
const [teamId,setTeamId]=useState<string | null>(null);
const [role,setRole]=useState<'encrypt' | 'decrypt' | null>(null);
const [roleSelecting,setRoleSelecting]=useState(false);

const { teamState: socketTeamState } = useSocket(teamId, role);

const [teamState,setTeamState]=useState<TeamState>({
round:0,
key4bit:'',
key8bit:'',
round1Complete:false,
round2Complete:false,
teammateOnline:true
});

useEffect(()=>{
const id=localStorage.getItem('teamId');
const name=localStorage.getItem('teamName');
const storedRole=localStorage.getItem('role');
const token=localStorage.getItem('authToken');
if(!id||!name||!token){router.push('/');return;}
setTeamId(id);
setTeamName(name);
if(storedRole==='encrypt'||storedRole==='decrypt') setRole(storedRole);
},[router]);

useEffect(() => {
  if (!socketTeamState) return;

  setTeamState({
    round: socketTeamState.round,
    key4bit: socketTeamState.key4bit,
    key8bit: socketTeamState.key8bit,
    round1Complete: socketTeamState.round1Complete,
    round2Complete: socketTeamState.round2Complete,
    teammateOnline: socketTeamState.teammateOnline ?? (socketTeamState.memberCount ? socketTeamState.memberCount > 1 : false),
    role: socketTeamState.role ?? null,
    assignedNumber: socketTeamState.assignedNumber ?? null,
    encryptionValue: socketTeamState.encryptionValue ?? null
  });

  // Clear loading state when round becomes 1
  if (socketTeamState.round === 1 && roleSelecting) {
    setRoleSelecting(false);
  }
}, [socketTeamState, roleSelecting]);

const chooseRole=(nextRole:'encrypt' | 'decrypt')=>{
  localStorage.setItem('role', nextRole);
  setRole(nextRole);
  setRoleSelecting(true);
};

const handleLogout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('teamId');
  localStorage.removeItem('teamName');
  localStorage.removeItem('teamState');
  localStorage.removeItem('role');
  router.push('/');
};

return(

<main className="dashboard min-h-screen text-white overflow-hidden px-6 py-12">

{/* BACKGROUND */}

<div className="backdrop-orbit" />
<div className="backdrop-grid" />
<div className="backdrop-veil" />

{/* HERO */}

<motion.header
initial={{opacity:0,y:-40}}
animate={{opacity:1,y:0}}
className="hero max-w-7xl mx-auto mb-16">

<div className="hero-shell">
  <div className="hero-core">
    <p className="hero-kicker">MINISTRY OF MAGIC: DEPT. OF MYSTERIES</p>
    <h1 className="hero-title">
      ARITHMANCY
      <span className="hero-title-accent">PROTOCOL</span>
    </h1>
    <p className="hero-subtitle">Founders' logic. Ancient runes. Souls in sync</p>
    <div className="hero-meta">
      <div className="hero-tag">
        TEAM <span className="hero-tag-strong">{teamName}</span>
      </div>
      <div className="hero-tag">ID {teamId}</div>
      {role && <div className="hero-tag">ROLE {role.toUpperCase()}</div>}
    </div>
  </div>
  <div className="hero-status">
    <div className="status-row">
      <span className={`status-dot ${teamState.teammateOnline ? 'status-live' : 'status-idle'}`} />
      <div>
        <p className="status-label">Connection</p>
        <p className="status-value">{teamState.teammateOnline?'SYNCED':'WAITING'}</p>
      </div>
    </div>
    <button onClick={handleLogout} className="logout-btn">Logout</button>
  </div>
</div>

</motion.header>

{/* GRID */}

<section className="relative max-w-7xl mx-auto grid grid-cols-12 gap-10">

{/* LEFT */}

<div className="col-span-12 lg:col-span-3 space-y-8">

<div className="panel panel-metric">
<p className="label">Current Round</p>
<p className="value">{teamState.round}</p>
</div>

<div className="panel text-center">

<p className="label mb-4">Mission Progress</p>

<div className="relative w-28 h-28 mx-auto">
<div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-spin-slow"/>
<div className="absolute inset-3 rounded-full bg-black/70 flex items-center justify-center text-xl text-lime-300">
{teamState.round2Complete?100:teamState.round1Complete?50:0}%
</div>
</div>

</div>

<div className="panel panel-system">
<p className="label">Enchantment</p>
<p className="mt-3 text-sm">PROTECTION: AES-WARD</p>
<p className="text-sm">DEMENTOR-PROOFED</p>
</div>

</div>

{/* CENTER */}

<div className="col-span-12 lg:col-span-6 panel-big">

<h2 className="text-4xl font-bold section-title">THE PENSIEVE PURGE</h2>

<p className="mt-2 tracking-widest text-xs leading-relaxed text-white/50 text-justify font-bold uppercase">
  The Headmaster’s Pensieve has been corrupted by a rogue spirit. The memories 
  of Hogwarts are dissolving into dark, chaotic static. 
  <br /><br />
  The Ministry has summoned your House. You must align the Four Great Runes 
  within the Astral Plane to forge a 4-bit Essence. Once 
  the Elder Suffix is bound, your Master Key will be complete[cite: 6, 71].
  <br /><br />
  One shall bind the word, and the other shall seek the truth. Only through 
  perfect synchronization can the memory be restored[cite: 135, 136].
</p>


{teamState.round1Complete?

<div className="key-panel mt-8">
RUNE-CODE (4 BIT) : {teamState.key4bit}<br/>
MASTER-CHARM (8 BIT) : {teamState.key8bit}
</div>

:

<Link href="/round1">
<button className="main-btn mt-10">Begin Round 1</button>
</Link>

}

<div className="grid grid-cols-3 gap-6 mt-12 text-xs uppercase tracking-widest">
<div className="chip">XOR</div>
<div className="chip">VERIFY</div>
<div className="chip">EXPAND</div>
</div>

</div>

{/* RIGHT */}

<div className="col-span-12 lg:col-span-3 space-y-8">

{!role ? (
  <div className="panel text-center">
    <p className="label mb-4">Select Role</p>
    {roleSelecting ? (
      <div className="text-sm text-cyan-300 animate-pulse">
        <p>Connecting...</p>
        <p className="text-xs text-white/50 mt-2">Syncing with teammate</p>
      </div>
    ) : (
      <div className="flex gap-3 justify-center">
        <button onClick={()=>chooseRole('encrypt')} className="role-btn role-emerald">Encrypt</button>
        <button onClick={()=>chooseRole('decrypt')} className="role-btn role-purple">Decrypt</button>
      </div>
    )}
  </div>
) : teamState.round === 1 ? (
  <div className="panel text-center border border-green-400/50 bg-green-400/5">
    <p className="text-green-300 text-sm font-bold">✓ SYNCED</p>
    <p className="label mt-2">Both Players Ready</p>
    <p className="text-xs text-white/70 mt-2">Entering Round 1...</p>
    <p className="text-xs text-white/50 mt-1">Role: {role.toUpperCase()}</p>
  </div>
) : null}

<div className={`panel round2-panel ${!teamState.round1Complete&&'opacity-40'}`}>

<div className="round2-head">
  <div>
    <p className="label">Round 2</p>
    <p className="round2-sub">Dual Path Cipher Ops</p>
  </div>
  <span className={`round2-status ${teamState.round1Complete ? 'round2-ready' : 'round2-locked'}`}>
    {teamState.round1Complete ? 'UNLOCKED' : 'LOCKED'}
  </span>
</div>

{teamState.round1Complete?

<div className="round2-actions">
  {role==='encrypt' && (
    <Link href="/round2/encrypt" className="round2-btn round2-btn-emerald">
      <span className="round2-glow" />
      <span className="round2-btn-title">Encrypt</span>
      <span className="round2-btn-sub">Forge Cipher</span>
    </Link>
  )}
  {role==='decrypt' && (
    <Link href="/round2/decrypt" className="round2-btn round2-btn-purple">
      <span className="round2-glow" />
      <span className="round2-btn-title">Decrypt</span>
      <span className="round2-btn-sub">Break Signal</span>
    </Link>
  )}
  {!role && (
    <div className="round2-lock text-center">
      <p className="round2-lock-text mb-4">Select your role to continue</p>
      <div className="flex gap-3 justify-center">
        <button onClick={()=>chooseRole('encrypt')} className="role-btn role-emerald">Encrypt</button>
        <button onClick={()=>chooseRole('decrypt')} className="role-btn role-purple">Decrypt</button>
      </div>
    </div>
  )}
</div>

:<div className="round2-lock">
  <div className="round2-lock-core">
    <span className="round2-lock-ring" />
    <span className="round2-lock-text">Awaiting teammate verification</span>
  </div>
</div>}

</div>

<div className="panel">
<p className="label mb-4">Simulator</p>
<a href="https://circuitverse.org/" target="_blank">
<button className="side-btn amber">Enter CircuitVerse</button>
</a>
</div>

<div className="panel">
<p className="label mb-4">The Wizard's Oath</p>
<ol className="text-xs text-white/70 list-decimal list-inside space-y-2">
<li>Generate Key</li>
<li>Verify teammate</li>
<li>Unlock Round 2</li>
<li>Encrypt / Decrypt</li>
</ol>
</div>

</div>

</section>

<style jsx>{`
:global(:root){
  --ink:#05070c;
  --neon:#3bf6cf;
  --acid:#c7ff6b;
  --ember:#ff8b3d;
  --ice:#baf7ff;
  --shell:rgba(255,255,255,.08);
  --shell-strong:rgba(255,255,255,.16);
  --glass:rgba(8,12,20,.65);
}

:global(body){
  font-family:'Space Grotesk', 'Sora', 'Outfit', system-ui, sans-serif;
}

.dashboard{
  background:radial-gradient(1200px 800px at 10% -10%, rgba(59,246,207,.22), transparent),
             radial-gradient(900px 700px at 100% 20%, rgba(255,139,61,.18), transparent),
             #060812;
}

.backdrop-orbit{
  position:absolute;
  inset:-20% -10% auto auto;
  width:70vw;
  height:70vw;
  border-radius:50%;
  background:conic-gradient(from 90deg, rgba(59,246,207,.12), rgba(199,255,107,.08), rgba(59,246,207,.12));
  filter:blur(40px);
  opacity:.5;
  animation:orbit 24s linear infinite;
}

.backdrop-grid{
  position:absolute;
  inset:0;
  opacity:.25;
  background-image:linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
  background-size:64px 64px;
  mask-image:radial-gradient(circle at 30% 20%, rgba(0,0,0,1), rgba(0,0,0,.2) 50%, rgba(0,0,0,0) 70%);
}

.backdrop-veil{
  position:absolute;
  inset:0;
  background:linear-gradient(180deg, rgba(6,8,18,0) 0%, rgba(6,8,18,.7) 60%, rgba(6,8,18,1) 100%);
}

.hero{
  position:relative;
  padding:1.75rem;
}

.hero-shell{
  position:relative;
  display:flex;
  gap:2rem;
  align-items:center;
  justify-content:space-between;
  padding:2.5rem;
  border-radius:28px;
  border:1px solid var(--shell);
  background:linear-gradient(120deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
  box-shadow:0 30px 80px rgba(0,0,0,.45);
  overflow:hidden;
}

.hero-shell::before{
  content:'';
  position:absolute;
  inset:-40% 50% auto -10%;
  height:220%;
  background:radial-gradient(circle, rgba(59,246,207,.22), transparent 60%);
  opacity:.7;
}

.hero-core{position:relative;z-index:2;max-width:70%;}

.hero-kicker{
  text-transform:uppercase;
  letter-spacing:.35em;
  font-size:.65rem;
  color:rgba(255,255,255,.6);
}

.hero-title{
  margin-top:.75rem;
  font-size:clamp(2.5rem, 5vw, 4rem);
  font-weight:700;
  line-height:.95;
  letter-spacing:.12em;
  color:#f4fffb;
}

.hero-title-accent{
  display:block;
  font-weight:800;
  background:linear-gradient(90deg, var(--ice), var(--acid));
  -webkit-background-clip:text;
  color:transparent;
}

.hero-subtitle{
  margin-top:.75rem;
  color:rgba(255,255,255,.62);
}

.hero-meta{
  display:flex;
  gap:1rem;
  margin-top:1.25rem;
  flex-wrap:wrap;
}

.hero-tag{
  border:1px solid var(--shell);
  padding:.4rem .9rem;
  border-radius:999px;
  font-size:.7rem;
  letter-spacing:.2em;
  text-transform:uppercase;
  color:rgba(255,255,255,.65);
  background:rgba(0,0,0,.35);
}

.hero-tag-strong{color:var(--acid);}

.hero-status{
  position:relative;
  z-index:2;
  display:flex;
  flex-direction:column;
  gap:.7rem;
  align-items:flex-start;
  padding:.9rem 1.2rem;
  border-radius:18px;
  border:1px solid var(--shell-strong);
  background:rgba(6,10,16,.7);
  min-width:180px;
}

.status-row{
  display:flex;
  gap:.8rem;
  align-items:center;
}

.logout-btn{
  width:100%;
  padding:.45rem .9rem;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.2);
  background:rgba(0,0,0,.35);
  color:white;
  font-size:.7rem;
  letter-spacing:.2em;
  text-transform:uppercase;
  transition:.2s;
}

.logout-btn:hover{
  border-color:var(--acid);
  color:var(--acid);
  transform:translateY(-1px);
}

.status-dot{
  width:12px;
  height:12px;
  border-radius:50%;
  box-shadow:0 0 12px rgba(0,0,0,.4);
}

.status-live{background:var(--acid);box-shadow:0 0 20px rgba(199,255,107,.8);}
.status-idle{background:#6b7280;}

.status-label{
  font-size:.7rem;
  letter-spacing:.2em;
  text-transform:uppercase;
  color:rgba(255,255,255,.5);
}

.status-value{
  font-size:.9rem;
  font-weight:700;
  letter-spacing:.12em;
}

.panel{
  padding:1.5rem;
  border-radius:1.4rem;
  border:1px solid var(--shell);
  background:rgba(9,12,20,.7);
  backdrop-filter:blur(18px);
  transition:.35s;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.02);
}
.panel:hover{transform:translateY(-6px);box-shadow:0 18px 50px rgba(0,0,0,.45)}

.panel-big{
  padding:3rem;
  border-radius:2rem;
  border:1px solid var(--shell);
  background:linear-gradient(180deg, rgba(12,16,26,.85), rgba(6,8,14,.9));
  backdrop-filter:blur(20px);
  box-shadow:0 40px 90px rgba(0,0,0,.55);
}

.label{
  text-transform:uppercase;
  letter-spacing:.35em;
  font-size:10px;
  color:rgba(255,255,255,.55);
}

.value{
  font-size:3rem;
  margin-top:.5rem;
  color:var(--acid);
}

.chip{
  border:1px solid rgba(255,255,255,.1);
  padding:.6rem;
  text-align:center;
  border-radius:999px;
  background:linear-gradient(120deg, rgba(10,12,20,.9), rgba(20,28,40,.9));
  box-shadow:0 0 20px rgba(59,246,207,.18);
}

.main-btn{
  background:linear-gradient(120deg, var(--neon), var(--acid));
  color:#031017;
  padding:1rem 2rem;
  border-radius:999px;
  font-weight:700;
  letter-spacing:.08em;
  text-transform:uppercase;
  box-shadow:0 0 40px rgba(59,246,207,.45);
}

.side-btn{
  width:100%;
  padding:.8rem;
  border-radius:999px;
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.08);
  letter-spacing:.1em;
  text-transform:uppercase;
}

.emerald{background:linear-gradient(120deg, #34d399, #a7ff7b);color:#04110f}
.purple{background:linear-gradient(120deg, #cbd5f5, #9ee7ff);color:#081126}
.amber{background:linear-gradient(120deg, #ffb94f, #ffd36a);color:#2a1600}

.panel-metric{background:linear-gradient(140deg, rgba(12,16,26,.85), rgba(10,18,24,.95));}
.panel-system{background:linear-gradient(140deg, rgba(14,18,30,.85), rgba(8,10,18,.95));}

.round2-panel{
  position:relative;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.12);
  background:linear-gradient(140deg, rgba(14,18,30,.9), rgba(6,8,16,.95));
}

.round2-panel::after{
  content:'';
  position:absolute;
  inset:-40% -20% auto auto;
  width:220px;
  height:220px;
  border-radius:50%;
  background:radial-gradient(circle, rgba(59,246,207,.18), transparent 60%);
  opacity:.6;
}

.round2-head{
  position:relative;
  z-index:2;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:1rem;
  margin-bottom:1rem;
}

.round2-sub{
  margin-top:.4rem;
  font-size:.7rem;
  letter-spacing:.2em;
  text-transform:uppercase;
  color:rgba(255,255,255,.55);
}

.round2-status{
  font-size:.65rem;
  letter-spacing:.2em;
  text-transform:uppercase;
  padding:.35rem .7rem;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.2);
}

.round2-ready{color:var(--acid);border-color:rgba(199,255,107,.5);}
.round2-locked{color:rgba(255,255,255,.45);}

.round2-actions{
  position:relative;
  z-index:2;
  display:grid;
  gap:.8rem;
}

.round2-btn{
  position:relative;
  display:flex;
  flex-direction:column;
  gap:.25rem;
  padding:1rem 1.1rem;
  border-radius:16px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.18);
  background:linear-gradient(140deg, rgba(8,12,20,.95), rgba(18,26,38,.95));
  text-transform:uppercase;
  letter-spacing:.1em;
  transition:transform .3s ease, box-shadow .3s ease;
  box-shadow:0 16px 40px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.04);
}

.round2-btn:hover{
  transform:translateY(-4px);
  box-shadow:0 18px 40px rgba(0,0,0,.45);
}

.round2-btn-title{
  font-size:1rem;
  font-weight:700;
  color:#eaffff;
  text-shadow:0 0 16px rgba(59,246,207,.25);
}

.round2-btn-sub{
  font-size:.65rem;
  color:rgba(255,255,255,.65);
}

.round2-glow{
  position:absolute;
  inset:auto -20% -40% auto;
  width:140px;
  height:140px;
  border-radius:50%;
  background:radial-gradient(circle, rgba(255,255,255,.45), transparent 60%);
  opacity:.35;
}

.round2-btn-emerald{
  border-color:rgba(63,246,207,.4);
  box-shadow:0 18px 40px rgba(0,0,0,.45), 0 0 30px rgba(63,246,207,.25);
}
.round2-btn-purple{
  border-color:rgba(181,214,255,.45);
  box-shadow:0 18px 40px rgba(0,0,0,.45), 0 0 30px rgba(189,165,255,.25);
}

.round2-lock{
  position:relative;
  z-index:2;
  padding:1rem;
  border-radius:16px;
  border:1px dashed rgba(255,255,255,.18);
  background:rgba(0,0,0,.35);
  text-align:center;
}

.round2-lock-core{
  display:flex;
  flex-direction:column;
  gap:.6rem;
  align-items:center;
}

.round2-lock-ring{
  width:46px;
  height:46px;
  border-radius:50%;
  border:2px solid rgba(255,255,255,.2);
  border-top-color:rgba(255,255,255,.6);
  animation:spin 6s linear infinite;
}

.round2-lock-text{
  font-size:.7rem;
  text-transform:uppercase;
  letter-spacing:.2em;
  color:rgba(255,255,255,.55);
}

.role-btn{
  padding:.6rem 1rem;
  border-radius:999px;
  font-size:.7rem;
  letter-spacing:.2em;
  text-transform:uppercase;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(0,0,0,.35);
}

.role-emerald{color:#a7f3d0;border-color:rgba(16,185,129,.5);}
.role-purple{color:#c4b5fd;border-color:rgba(168,85,247,.5);}

.section-title{
  letter-spacing:.2em;
  text-transform:uppercase;
  background:linear-gradient(90deg, var(--ice), var(--acid));
  -webkit-background-clip:text;
  color:transparent;
}

.key-panel{
  padding:1rem 1.25rem;
  border-radius:14px;
  border:1px solid rgba(199,255,107,.3);
  background:linear-gradient(120deg, rgba(59,246,207,.08), rgba(199,255,107,.08));
  color:var(--acid);
  font-weight:600;
  letter-spacing:.08em;
}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes orbit{to{transform:rotate(360deg)}}
.animate-spin-slow{animation:spin 8s linear infinite}

@media (max-width: 900px){
  .hero-shell{flex-direction:column;align-items:flex-start;}
  .hero-core{max-width:100%;}
}

@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Sora:wght@400;600;700&display=swap');

`}</style>

</main>

);
}
