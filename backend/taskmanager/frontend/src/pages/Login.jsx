import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.title}>Welcome back</h1>
        <p style={s.sub}>Sign in to your TaskFlow account</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <input style={s.input} placeholder="Email" type="email" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} required />
          <input style={s.input} placeholder="Password" type="password" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required />
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={s.foot}>Don't have an account? <Link to="/signup" style={s.link}>Sign up</Link></p>
      </div>
    </div>
  );
}

const s = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080812' },
  card: { background:'#0f0f1a', border:'1px solid #1e1e35', borderRadius:16, padding:'40px 36px', width:380 },
  title: { color:'#fff', fontSize:26, fontWeight:700, margin:0, marginBottom:6, fontFamily:'monospace' },
  sub: { color:'#64748b', fontSize:14, marginBottom:28 },
  form: { display:'flex', flexDirection:'column', gap:14 },
  input: { background:'#1a1a2e', border:'1px solid #2d2d50', borderRadius:10, padding:'12px 16px', color:'#e2e8f0', fontSize:14, outline:'none' },
  btn: { background:'#6366f1', color:'#fff', border:'none', borderRadius:10, padding:'13px', fontSize:15, fontWeight:600, cursor:'pointer', marginTop:4 },
  foot: { color:'#64748b', fontSize:13, textAlign:'center', marginTop:20 },
  link: { color:'#6366f1' }
};