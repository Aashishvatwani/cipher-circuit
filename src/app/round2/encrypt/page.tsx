'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';

export default function Encrypt() {

const CODING_PLATFORM_URL = process.env.NEXT_PUBLIC_CODING_PLATFORM_URL || 'https://www.onlinegdb.com/online_c_compiler';

const router = useRouter();

const [assignedNumber,setAssignedNumber]=useState<number | null>(null);
const [teamId, setTeamId] = useState<string | null>(null);
const [role, setRole] = useState<'encrypt' | 'decrypt' | null>(null);
const [ciphertext, setCiphertext] = useState('');
const [submitting, setSubmitting] = useState(false);
const [submitError, setSubmitError] = useState('');
const [submitSuccess, setSubmitSuccess] = useState(false);

const { connected, submitEncryption, teamState } = useSocket(teamId, role);

useEffect(()=>{
const state=JSON.parse(localStorage.getItem('teamState')||'{}');
if(!state.round1Complete) router.push('/dashboard');
if(state.role!=='encrypt') router.push('/dashboard');

const storedTeamId = localStorage.getItem('teamId');
const storedRole = (localStorage.getItem('role') as 'encrypt' | 'decrypt' | null) || null;
setTeamId(storedTeamId);
setRole(storedRole || 'encrypt');

const assigned=typeof state.assignedNumber==='number' ? state.assignedNumber : null;
setAssignedNumber(assigned);
if(assigned!==null){
	setAssignedNumber(assigned);
}
},[]);

useEffect(() => {
if (teamState?.round2Complete) {
	router.push('/round2/result');
}
}, [teamState, router]);

const submitCiphertext = () => {
if (!connected) {
	setSubmitError('Not connected to server. Please wait and try again.');
	return;
}
if (!ciphertext.trim()) {
	setSubmitError('Enter the encrypted value to submit.');
	return;
}
if (assignedNumber === null) {
	setSubmitError('No assigned number available yet.');
	return;
}

setSubmitting(true);
setSubmitError('');
submitEncryption(ciphertext.trim(), String(assignedNumber));
setSubmitSuccess(true);
setSubmitting(false);
};

return(

<main className="min-h-screen bg-[#05070c] text-white px-6 py-12">

<div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:60px_60px]"/>

<div className="max-w-6xl mx-auto relative">

{/* HERO */}

<motion.div initial={{y:-30,opacity:0}} animate={{y:0,opacity:1}}
className="mb-12 p-8 rounded-3xl border border-cyan-300/20 bg-white/5 backdrop-blur-xl">

<h1 className="text-5xl font-bold tracking-widest bg-gradient-to-r from-cyan-300 to-lime-300 text-transparent bg-clip-text">
ROUND 2 — ENCRYPTION
</h1>

<p className="mt-3 uppercase tracking-widest text-xs text-white/50">
Assigned number ready for encryption
</p>

</motion.div>

{/* GRID */}

<div className="panel p-8">

<h2 className="title">ASSIGNED NUMBER</h2>

{assignedNumber!==null ? (
	<div className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-6 text-center">
		<p className="text-emerald-200 text-xs tracking-widest">NUMBER</p>
		<p className="text-5xl font-mono text-emerald-200 mt-3">{assignedNumber}</p>
	</div>
) : (
  <p className="mt-6 text-sm text-white/60">Waiting for assigned number...</p>
)}

</div>

<div className="panel p-8 mt-10">

<h2 className="title">SUBMIT ENCRYPTED VALUE</h2>

<p className="mt-4 text-sm text-white/60">
Paste the ciphertext produced by your encryption step.
</p>

<input
value={ciphertext}
onChange={(e)=>{setCiphertext(e.target.value);setSubmitError('');}}
placeholder="Enter ciphertext"
className="w-full mt-6 text-center text-xl bg-black/50 border border-cyan-300/40 rounded-xl py-4 outline-none font-mono"
/>

{submitError && <p className="text-red-400 mt-3">{submitError}</p>}
{submitSuccess && <p className="text-lime-300 mt-3">Ciphertext submitted. Waiting for teammate...</p>}

<button
onClick={submitCiphertext}
disabled={submitting || submitSuccess}
className="main-btn mt-6 w-full">

{submitting ? 'Submitting...' : submitSuccess ? 'Submitted ✓' : 'Submit Ciphertext'}

</button>

</div>

<a href={CODING_PLATFORM_URL} target="_blank" rel="noreferrer"
className="mt-10 inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/40 px-6 py-3 text-cyan-200 hover:border-cyan-200">
Go to Coding Platform
</a>

<button onClick={()=>router.push('/dashboard')}
className="mt-10 text-cyan-300 text-sm hover:underline">
← Back to Dashboard
</button>

</div>

<style jsx>{`

.panel{
border:1px solid rgba(255,255,255,.08);
background:rgba(255,255,255,.05);
backdrop-filter:blur(20px);
border-radius:2rem;
transition:.4s;
}
.panel:hover{transform:translateY(-6px);box-shadow:0 0 40px rgba(34,211,238,.25)}

.title{
letter-spacing:.3em;
font-size:14px;
color:#67e8f9;
}


`}</style>

</main>
);
}

function XORRow({label,value,lime,glow}:{label:string,value?:string,lime?:boolean,glow?:boolean}){

return(

<div>
<div className="label">{label}</div>

<div className="flex justify-center gap-2 mt-2">
{(value||'00000000').split('').map((b,i)=>(
<div key={i}
className={`bit ${b==='1'?'on':''} ${lime?'!border-lime-400 !text-lime-300':''} ${glow?'animate-pulse':''}`}>
{b}
</div>
))}
</div>

</div>

);
}
