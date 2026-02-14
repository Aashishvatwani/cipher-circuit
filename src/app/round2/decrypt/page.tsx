'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';

export default function Decrypt() {

const router = useRouter();

const [cipher,setCipher]=useState('');
const [binary,setBinary]=useState('');
const [decimal,setDecimal]=useState('');
const [input,setInput]=useState('');
const [key,setKey]=useState('');
const [success,setSuccess]=useState(false);
const [waiting,setWaiting]=useState(true);
const [error,setError]=useState('');
const [teamId, setTeamId] = useState<string | null>(null);
const [role, setRole] = useState<'encrypt' | 'decrypt' | null>(null);
const [submitting, setSubmitting] = useState(false);

const { connected, submitDecryption, teamState } = useSocket(teamId, role);

const CODING_PLATFORM_URL = process.env.NEXT_PUBLIC_CODING_PLATFORM_URL || 'https://frontend-sigma-virid-71.vercel.app';

function toBinary(d:number){
return d.toString(2).padStart(8,'0');
}

function xor(a:string,b:string){
let r='';
for(let i=0;i<8;i++) r+=(+a[i]^+b[i]);
return r;
}

useEffect(()=>{
const state=JSON.parse(localStorage.getItem('teamState')||'{}');
if(!state.round1Complete) router.push('/dashboard');
if(state.role!=='decrypt') router.push('/dashboard');

const storedTeamId = localStorage.getItem('teamId');
const storedRole = (localStorage.getItem('role') as 'encrypt' | 'decrypt' | null) || null;
setTeamId(storedTeamId);
setRole(storedRole || 'decrypt');

setKey(state.key8bit||'00000000');
const encryptedValue=typeof state.encryptionValue==='number' ? state.encryptionValue : null;
if(encryptedValue!==null){
const c=toBinary(encryptedValue);
setCipher(c);
const d=xor(c,state.key8bit||'00000000');
setBinary(d);
setDecimal(parseInt(d,2).toString());
setWaiting(false);
}
},[router]);

// Listen for completion event
useEffect(() => {
  if (teamState?.round2Complete) {
    setSuccess(true);
    setTimeout(() => router.push('/round2/result'), 500);
  }
}, [teamState, router]);

const submit=()=>{
if(!connected) {
  setError('Not connected. Please wait...');
  return;
}
if(input!==decimal){
setError('Incorrect value');
return;
}

setSubmitting(true);
submitDecryption(input);
};

return(

<main className="min-h-screen bg-[#05070c] text-white px-6 py-12">

<div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:60px_60px]"/>

<div className="max-w-6xl mx-auto relative">

{/* HERO */}

<motion.div initial={{opacity:0,y:-30}} animate={{opacity:1,y:0}}
className="mb-12 p-8 rounded-3xl border border-purple-400/20 bg-white/5 backdrop-blur-xl">

<h1 className="text-5xl font-bold tracking-widest bg-gradient-to-r from-purple-300 to-cyan-300 text-transparent bg-clip-text">
ROUND 2 — DECRYPTION
</h1>

<p className="mt-3 uppercase tracking-widest text-xs text-white/50">
Ciphertext → XOR → Plaintext
</p>

<div className="absolute top-8 right-8 text-right">
<div className="text-xs tracking-widest text-lime-300">ACTIVE KEY</div>
<div className="font-mono text-xl text-cyan-200">{key}</div>
</div>

</motion.div>

{waiting?

<motion.div initial={{opacity:0}} animate={{opacity:1}}
className="panel p-20 text-center">

<h2 className="text-3xl tracking-widest text-cyan-300">AWAITING ENCRYPTED VALUE</h2>
<p className="mt-4 opacity-60">Teammate A transmitting…</p>

<div className="mt-10 w-16 h-16 mx-auto border-4 border-cyan-300 border-t-transparent rounded-full animate-spin"/>

</motion.div>

:

<div className="grid lg:grid-cols-2 gap-10">

{/* XOR PIPELINE */}

<div className="panel p-8">

<h2 className="title text-purple-300">XOR PIPELINE</h2>

<XORRow label="CIPHERTEXT" value={cipher}/>
<XORRow label="KEY" value={key} lime/>
<XORRow label="PLAINTEXT" value={binary} glow/>

<div className="mt-6 p-4 border border-purple-400/30 bg-purple-400/10 rounded-xl text-center">
<p className="text-purple-300 tracking-widest text-sm">
ENCRYPTED DECIMAL: {cipher ? parseInt(cipher,2) : ''}
</p>
</div>

</div>

{/* VERIFY */}

<div className="panel p-8">

<h2 className="title text-cyan-300">VERIFY OUTPUT</h2>

<input
value={input}
onChange={e=>{
if(/^\d*$/.test(e.target.value)){
setInput(e.target.value);
setError('');
}
}}
placeholder="Enter decimal"
className="w-full mt-8 text-center text-4xl bg-black/50 border border-cyan-300/40 rounded-xl py-4 outline-none"/>

{error && <p className="text-red-400 mt-3">{error}</p>}

<button
onClick={submit}
disabled={!input||success}
className="main-btn mt-10 w-full">

{success?'VERIFIED ✓':'SUBMIT'}

</button>

</div>

</div>
}

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
.panel:hover{transform:translateY(-6px);box-shadow:0 0 40px rgba(168,85,247,.25)}

.title{
letter-spacing:.3em;
font-size:14px;
}

.bit{
width:42px;height:42px;
display:flex;align-items:center;justify-content:center;
border-radius:10px;
border:1px solid #22d3ee55;
color:#22d3ee;
}

.on{
background:#22d3ee;
color:black;
}

.main-btn{
background:#22d3ee;
color:black;
padding:1rem;
border-radius:999px;
font-weight:700;
box-shadow:0 0 30px rgba(34,211,238,.6);
}

`}</style>

</main>
);
}

function XORRow({label,value,lime,glow}:{label:string,value?:string,lime?:boolean,glow?:boolean}){

return(
<div className="mt-6">

<div className="label text-center">{label}</div>

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
