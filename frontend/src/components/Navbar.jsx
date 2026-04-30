import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FolderKanban, CheckSquare } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <CheckSquare size={22} color="#6366f1" />
        <span style={styles.brandText}>TaskFlow</span>
      </div>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}><LayoutDashboard size={16}/> Dashboard</Link>
        <Link to="/projects" style={styles.link}><FolderKanban size={16}/> Projects</Link>
      </div>
      <div style={styles.user}>
        <span style={styles.username}>{user?.name} <span style={styles.role}>({user?.role})</span></span>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16}/> Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 28px', background:'#0f0f1a', borderBottom:'1px solid #1e1e35', position:'sticky', top:0, zIndex:100 },
  brand: { display:'flex', alignItems:'center', gap:8 },
  brandText: { color:'#fff', fontWeight:700, fontSize:18, fontFamily:'monospace' },
  links: { display:'flex', gap:24 },
  link: { color:'#94a3b8', textDecoration:'none', display:'flex', alignItems:'center', gap:6, fontSize:14, fontWeight:500, transition:'color 0.2s' },
  user: { display:'flex', alignItems:'center', gap:16 },
  username: { color:'#e2e8f0', fontSize:13 },
  role: { color:'#6366f1', fontSize:11 },
  logoutBtn: { display:'flex', alignItems:'center', gap:6, background:'#1e1e35', color:'#f87171', border:'1px solid #2d2d50', padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:13 }
};