'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, LoaderCircle, Radio, ShieldAlert } from 'lucide-react';

export function SetupScreen() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'testing' | 'error' | 'saved'>('idle');
  const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('testing'); setMessage('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const payload: unknown = await response.json();
    if (response.ok) { setState('saved'); setMessage('Configuration saved in an encrypted, HTTP-only session cookie.'); window.setTimeout(() => router.replace('/search'), 700); return; }
    setState('error'); setMessage(typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Unable to save configuration.');
  }
  return <main className="setup"><section className="setupcard"><div className="setupmark"><Radio size={22}/></div><h1>Connect to Soulseek</h1><p>Connect a compatible gateway to search, queue, and monitor Soulseek transfers.</p><form onSubmit={submit} className="setupform"><label> Soulseek username<input name="username" required autoComplete="username"/></label><label> Soulseek password<input name="password" type="password" required autoComplete="current-password"/></label><label> Port<input name="port" type="number" defaultValue="2234" min="1" max="65535" required/></label><label> Backend URL<input name="apiUrl" type="url" placeholder="https://gateway.example"/></label><label> API token <span>optional</span><input name="apiToken" type="password" autoComplete="off"/></label><button className="primary setupbutton" disabled={state === 'testing' || state === 'saved'}>{state === 'testing' ? <><LoaderCircle className="spin" size={16}/>Saving</> : state === 'saved' ? 'Saved' : 'Save configuration'}</button></form>{state==='error'&&<div className="setupnotice" role="alert"><ShieldAlert size={17}/><div><strong>Unable to save configuration</strong><br/>{message}</div></div>}{state==='saved'&&<div className="setupnotice setupsuccess" role="status"><CheckCircle2 size={17}/><div>{message}</div></div>}<div className="setupfoot"><CheckCircle2 size={15}/> Credentials are never stored in browser storage.</div></section></main>;
}
