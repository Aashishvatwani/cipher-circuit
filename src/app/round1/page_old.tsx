'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiGet } from '@/utils/api';

export default function Round1() {

const router = useRouter();

type SwitchValues = { S0: number | null; S1: number | null; S2: number | null; S3: number | null };
type SwitchValuesReady = { S0: number; S1: number; S2: number; S3: number };

const [keyBits,setKeyBits]=useState<string[]>(['','','','']);
const [switchValues, setSwitchValues] = useState<SwitchValues>({ S0: null, S1: null, S2: null, S3: null });
const [loading, setLoading] = useState(true);
const [error,setError]=useState('');
const [success,setSuccess]=useState(false);
const [submitting,setSubmitting]=useState(false);

useEffect(()=>{
  const teamId=localStorage.getItem('teamId');
  if(!teamId) {
    router.push('/');
    return;
  }

  fetchTeamAssignment(teamId);
},[router]);

const fetchTeamAssignment = async (teamId: string) => {
  try {
    const response = await apiGet<{ switchValues?: SwitchValues }>(`/api/team/${teamId}`);
    setSwitchValues(response.switchValues ?? { S0: null, S1: null, S2: null, S3: null });
    setLoading(false);
  } catch (err) {
    console.error('Error fetching team assignment:', err);
    setError('Failed to load team assignment');
    setLoading(false);
  }
};

const correctKey = useMemo<number[] | null>(() => {
  if ([switchValues.S0, switchValues.S1, switchValues.S2, switchValues.S3].some(v => v === null)) {
    return null;
  }
  const { S0, S1, S2, S3 } = switchValues as SwitchValuesReady;
  return [
    S0 ^ S1,
    S1 ^ S2,
    S2 ^ S3,
    S3 ^ S0
  ];
}, [switchValues]);

const handleBit=(i:number,v:string)=>{
if(v===''||v==='0'||v==='1'){
const copy=[...keyBits];
copy[i]=v;
setKeyBits(copy);
setError('');
}
};

const submit=(e:any)=>{
e.preventDefault();
setSubmitting(true);

if(!correctKey){
setError('Switch values not loaded yet. Please wait a moment.');
setSubmitting(false);return;
}

if(keyBits.some(b=>b==='')){
setError('Enter all bits');
setSubmitting(false);return;
}

if(JSON.stringify(keyBits.map(Number))!==JSON.stringify(correctKey)){
setError('Incorrect key');
setSubmitting(false);return;
}

const key4bit=keyBits.join('');
const key8bit=key4bit+'1000';

localStorage.setItem('teamState',JSON.stringify({
round:2,key4bit,key8bit,
round1Complete:true,
round2Complete:false,
teammateOnline:true
}));

setSuccess(true);
setTimeout(()=>router.push('/round2/encrypt'),1800);
};

if (loading) {
  return (
    <main className="min-h-screen bg-[#050608] text-white px-10 py-10 flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-cyan-400">Loading team assignment...</p>
      </div>
    </main>
  );
}

return(

<main className="min-h-screen bg-[#050608] text-white px-6 md:px-10 py-10 overflow-y-auto">

<header className="mb-8 md:mb-10">
  <h1 className="text-5xl md:text-6xl tracking-widest text-cyan-400 font-bold">
    ROUND 1
  </h1>

  <h2 className="text-2xl md:text-3xl mt-2 text-white/80 tracking-wide">
    4-Bit Key Generation (CircuitVerse)
  </h2>

  <p className="text-sm md:text-base opacity-70 mt-3 max-w-3xl leading-relaxed">
    Build a digital logic circuit using XOR gates to generate your 4-bit secret key.
  </p>

</header>

{/* Quick Actions */}
<div className="flex flex-col md:flex-row gap-3 mb-10">
  <a href="https://circuitverse.org/" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
    <button className="w-full md:w-auto px-5 py-3 bg-cyan-500 text-black font-bold rounded border border-cyan-300 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition">
      Open CircuitVerse Template →
    </button>
  </a>
  <div className="flex-1 hidden md:block" />
  <div className="flex gap-2 w-full md:w-auto">
    <button className="flex-1 md:flex-none px-4 py-3 bg-zinc-900 border border-white/10 rounded text-white/80 hover:border-cyan-400 hover:text-white transition">
      Need Help? Follow Steps Below
    </button>
  </div>
</div>

{/* INSTRUCTIONS SECTION */}
<section className="mb-12 border border-cyan-500/30 rounded-xl p-8 bg-linear-to-br from-cyan-500/10 via-transparent to-cyan-500/10 shadow-xl shadow-cyan-500/10">
  <h3 className="text-2xl text-cyan-400 mb-6 font-bold">OBJECTIVE</h3>
  <p className="text-white/80 mb-4">
    Generate a 4-bit secret key using a digital logic circuit in CircuitVerse with XOR gates. Both team members must independently submit the key.
  </p>

  <div className="space-y-6 mt-8">
    {/* STEP 1 */}
    <div className="border border-white/10 rounded-lg p-6 bg-black/40">
      <h4 className="text-cyan-400 font-bold mb-3">STEP 1 — Open CircuitVerse</h4>
      <p className="text-white/70 text-sm mb-4">Use one laptop per team for simulation. Both teammates should observe the output together.</p>
      <a href="https://circuitverse.org/" target="_blank" rel="noopener noreferrer">
        <button className="px-6 py-2 bg-cyan-500 text-black font-bold rounded hover:bg-cyan-400 transition">
          Open CircuitVerse →
        </button>
      </a>
    </div>

    {/* STEP 2 */}
    <div className="border border-white/10 rounded-lg p-6 bg-black/40">
      <h4 className="text-cyan-400 font-bold mb-3">STEP 2 — Build the Circuit</h4>
      <p className="text-white/70 text-sm mb-4">Construct the circuit using:</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-lime-400 text-xs mb-2">Components:</p>
          <ul className="text-white/60 text-sm space-y-1">
            <li>✓ 4 Switches (S0, S1, S2, S3)</li>
            <li>✓ 4 XOR Gates</li>
            <li>✓ 4 LEDs (Key0-Key3)</li>
          </ul>
        </div>
        <div>
          <p className="text-cyan-400 text-xs mb-2">Connections:</p>
          <ul className="text-white/60 text-sm space-y-1 font-mono">
            <li>Key0 = S0 ⊕ S1</li>
            <li>Key1 = S1 ⊕ S2</li>
            <li>Key2 = S2 ⊕ S3</li>
            <li>Key3 = S3 ⊕ S0</li>
          </ul>
        </div>
      </div>
    </div>

    {/* STEP 3 */}
    <div className="border border-white/10 rounded-lg p-6 bg-black/40">
      <h4 className="text-cyan-400 font-bold mb-3">STEP 3 — Set Your Team's Switches</h4>
      <p className="text-white/70 text-sm mb-4">Configure switches in CircuitVerse:</p>
      <div className="grid grid-cols-4 gap-4">
        {switchValues && Object.entries(switchValues).map(([key, val]) => (
          <div key={key} className="bg-black/50 p-4 rounded border border-white/20">
            <p className="text-white/50 text-xs mb-2 uppercase">{key}</p>
            <p className={`text-3xl font-bold ${val === 1 ? 'text-lime-400' : 'text-red-500'}`}>
              {val}
            </p>
          </div>
        ))}
      </div>
      <p className="text-white/60 text-xs mt-4">Turn switches ON (1) or OFF (0) in CircuitVerse accordingly.</p>
    </div>

    {/* STEP 4 */}
    <div className="border border-white/10 rounded-lg p-6 bg-black/40">
      <h4 className="text-cyan-400 font-bold mb-3">STEP 4 — Read the Output Key</h4>
      <p className="text-white/70 text-sm mb-4">Observe the LEDs in this order:</p>
      <div className="bg-black/70 p-6 rounded border border-cyan-500/30">
        <p className="text-center text-white/60 mb-3">Read from left to right:</p>
        <p className="text-center text-3xl font-mono font-bold text-cyan-400">
          Key = Key3 Key2 Key1 Key0
        </p>
        <p className="text-center text-white/60 text-sm mt-3">Example: 1010</p>
      </div>
    </div>

    {/* STEP 5 */}
    <div className="border border-white/10 rounded p-6 bg-black/30">
      <h4 className="text-cyan-400 font-bold mb-3">STEP 5 — Submit Your 4-Bit Key</h4>
      <p className="text-white/70 text-sm mb-3">
        <span className="text-lime-400 font-bold">IMPORTANT:</span> Each teammate must submit separately.
      </p>
      <p className="text-white/60 text-sm">Both members need to verify and enter your 4-bit key independently.</p>
    </div>
  </div>
</section>

{/* MAIN SUBMISSION AREA */}
<section className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">

{/* SWITCHES DISPLAY */}
<div className="lg:col-span-3">

<div className="auth-panel p-6">
<p className="text-xs opacity-50 mb-4 text-lime-400 font-bold">YOUR SWITCH VALUES</p>

{Object.entries(switchValues).map(([k,v])=>(
<div key={k} className="flex justify-between items-center text-sm mb-3 p-2 bg-black/30 rounded">
<span className="font-mono font-bold">{k}</span>
<span className={`text-xl font-bold ${v === 1 ? 'text-lime-400' : 'text-red-500'}`}>
  {v === 1 ? '●' : '○'} {v}
</span>
</div>
))}

</div>

</div>

{/* KEY SUBMISSION CONSOLE */}
<div className="lg:col-span-6 auth-panel p-10 border border-cyan-500/20 bg-black/60 rounded-xl shadow-lg shadow-cyan-500/10">

<h2 className="text-xl text-cyan-400 font-bold mb-2">Key Console</h2>
<p className="auth-sub mb-8">Enter your generated 4-bit key</p>

<div className="flex justify-center gap-4 sm:gap-6 mb-8">

{keyBits.map((b,i)=>(
<div
  key={i}
  className={`virtual-led ${b==='1'?'active':b==='0'?'inactive':''} w-14 h-14 sm:w-16 sm:h-16 text-2xl shadow-lg shadow-cyan-500/20 border border-white/10`}
>
  {b||'?'}
</div>
))}

</div>

<form onSubmit={submit} className="space-y-6">
<div className="grid grid-cols-4 gap-4">

{keyBits.map((b,i)=>(
<div key={i} className="relative">
<label className="block text-xs opacity-70 mb-2 text-center font-mono">Key{i}</label>
<input
value={b}
maxLength={1}
onChange={e=>handleBit(i,e.target.value)}
placeholder="?"
disabled={submitting}
className="auth-input text-center text-2xl font-mono h-16 w-full border border-white/15 bg-black/40 focus:border-cyan-400"
style={{
  backgroundColor: b === '' ? 'transparent' : b === '1' ? 'rgba(163, 230, 53, 0.1)' : 'rgba(239, 68, 68, 0.1)',
  borderColor: b === '' ? '' : b === '1' ? 'rgb(163, 230, 53)' : 'rgb(239, 68, 68)'
}}
/>
</div>
))}

</div>

{error&&<div className="auth-error text-center border border-red-500/40 bg-red-500/10 text-red-200">{error}</div>}

{success&&(
<div className="auth-error border-lime-400 text-lime-400 text-center bg-lime-500/10">
✓ Key verified → Advancing to Round 2
</div>
)}

<button
  disabled={submitting||success}
  className="w-full px-4 py-4 mt-2 rounded font-bold bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 border border-cyan-300"
>
  {submitting?'Verifying…':success?'Complete':'Submit Key'}
</button>

</form>

</div>

{/* XOR LOGIC REFERENCE */}
<div className="lg:col-span-3 space-y-6">

<div className="auth-panel p-6">

<p className="text-xs opacity-50 mb-4 text-cyan-400 font-bold">XOR LOGIC GUIDE</p>

<div className="space-y-3">
  {[
    { label: 'Key0', formula: 'S0 ⊕ S1', idx: 0 },
    { label: 'Key1', formula: 'S1 ⊕ S2', idx: 1 },
    { label: 'Key2', formula: 'S2 ⊕ S3', idx: 2 },
    { label: 'Key3', formula: 'S3 ⊕ S0', idx: 3 }
  ].map(({ label, formula, idx }) => {
    const result = correctKey ? correctKey[idx] : null;
    return (
      <div key={label} className="flex items-center justify-between p-3 bg-black/30 rounded border border-zinc-800 hover:border-cyan-500/50 transition">
        <span className="text-xs text-cyan-400 font-mono font-bold">{label}</span>
        <span className="text-xs opacity-70 font-mono">{formula}</span>
        <span className={`text-lg font-bold ${result === 1 ? 'text-lime-400' : 'text-red-500'}`}>
          {result ?? '?'}
        </span>
      </div>
    );
  })}
</div>

</div>

</div>

</section>

</main>
);
}
