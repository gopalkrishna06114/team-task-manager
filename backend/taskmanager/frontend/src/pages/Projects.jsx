import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Plus, FolderKanban, ArrowRight } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const fetchProjects = () => api.get('/projects').then(r => setProjects(Array.isArray(r.data) ? r.data : []));
  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchProjects();

      const stored = JSON.parse(localStorage.getItem('user'));
      stored.role = 'ADMIN';
      localStorage.setItem('user', JSON.stringify(stored));
      login(stored); // update context so navbar re-renders
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div style={s.page}>
      <Navbar/>
      <div style={s.content}>
        <div style={s.header}>
          <h2 style={s.heading}>Projects</h2>
          <button style={s.createBtn} onClick={() => setShowModal(true)}>
            <Plus size={16}/> New Project
          </button>
        </div>
        <div style={s.grid}>
          {projects.map(p => (
            <div key={p.id} style={s.card} onClick={() => navigate(`/projects/${p.id}`)}>
              <FolderKanban size={22} color="#6366f1" style={{marginBottom:10}}/>
              <div style={s.pname}>{p.name}</div>
              <div style={s.pdesc}>{p.description || 'No description'}</div>
              <div style={s.footer}>
                <span style={s.members}>{p.members?.length || 0} members</span>
                <ArrowRight size={16} color="#6366f1"/>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div style={s.empty}>No projects yet. Create one!</div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>New Project</h3>
            <form onSubmit={handleCreate} style={s.form}>
              <input style={s.input} placeholder="Project name" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} required />
              <textarea style={{...s.input, height:80, resize:'none'}} placeholder="Description (optional)"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})}/>
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={s.submitBtn}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { background:'#080812', minHeight:'100vh' },
  content: { maxWidth:1100, margin:'0 auto', padding:'32px 24px' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 },
  heading: { color:'#fff', fontSize:24, fontWeight:700, fontFamily:'monospace' },
  createBtn: { display:'flex', alignItems:'center', gap:6, background:'#6366f1', color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontSize:14, fontWeight:600, cursor:'pointer' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:16 },
  card: { background:'#0f0f1a', border:'1px solid #1e1e35', borderRadius:12, padding:22, cursor:'pointer', transition:'border-color 0.2s' },
  pname: { color:'#fff', fontSize:16, fontWeight:600, marginBottom:6 },
  pdesc: { color:'#64748b', fontSize:13, marginBottom:16, lineHeight:1.5 },
  footer: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  members: { color:'#6366f1', fontSize:12, background:'#1a1a2e', padding:'3px 10px', borderRadius:20, border:'1px solid #2d2d50' },
  empty: { color:'#64748b', gridColumn:'1/-1', textAlign:'center', padding:40, fontSize:15 },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 },
  modal: { background:'#0f0f1a', border:'1px solid #2d2d50', borderRadius:16, padding:32, width:400 },
  modalTitle: { color:'#fff', fontSize:18, fontWeight:700, marginBottom:20 },
  form: { display:'flex', flexDirection:'column', gap:14 },
  input: { background:'#1a1a2e', border:'1px solid #2d2d50', borderRadius:10, padding:'12px 16px', color:'#e2e8f0', fontSize:14, outline:'none', width:'100%', boxSizing:'border-box' },
  modalActions: { display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 },
  cancelBtn: { background:'transparent', color:'#64748b', border:'1px solid #2d2d50', borderRadius:8, padding:'8px 18px', cursor:'pointer', fontSize:14 },
  submitBtn: { background:'#6366f1', color:'#fff', border:'none', borderRadius:8, padding:'8px 20px', cursor:'pointer', fontSize:14, fontWeight:600 }
};