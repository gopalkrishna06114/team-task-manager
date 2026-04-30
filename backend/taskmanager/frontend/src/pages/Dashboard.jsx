import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { LayoutDashboard, CheckCheck, Clock, AlertCircle, FolderOpen, ChevronRight, User } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data));
    api.get('/tasks/my').then(r => setMyTasks(Array.isArray(r.data) ? r.data : []));
  }, []);

  if (!data) return <div style={{color:'#fff',textAlign:'center',paddingTop:80}}>Loading...</div>;

  const STATUS_COLORS = { TODO: '#f59e0b', IN_PROGRESS: '#3b82f6', DONE: '#10b981' };
  const PRIORITY_COLORS = { LOW: '#64748b', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

  const cards = [
    { label: 'Total Tasks', value: data.totalTasks, icon: <LayoutDashboard size={22}/>, color: '#6366f1' },
    { label: 'To Do', value: data.todoCount, icon: <Clock size={22}/>, color: '#f59e0b' },
    { label: 'In Progress', value: data.inProgressCount, icon: <Clock size={22}/>, color: '#3b82f6' },
    { label: 'Done', value: data.doneCount, icon: <CheckCheck size={22}/>, color: '#10b981' },
    { label: 'Overdue', value: data.overdueCount, icon: <AlertCircle size={22}/>, color: '#ef4444' },
    { label: 'Projects', value: data.totalProjects, icon: <FolderOpen size={22}/>, color: '#8b5cf6', onClick: () => navigate('/projects') },
  ];

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={s.page}>
      <Navbar/>
      <div style={s.content}>
        <h2 style={s.heading}>Dashboard</h2>

        {/* Stat Cards */}
        <div style={s.grid}>
          {cards.map(c => (
            <div key={c.label} style={{...s.card, borderTop:`3px solid ${c.color}`, cursor: c.onClick ? 'pointer' : 'default'}}
              onClick={c.onClick}>
              <div style={{...s.icon, color: c.color}}>{c.icon}</div>
              <div style={s.val}>{c.value}</div>
              <div style={s.lbl}>{c.label}</div>
              {c.onClick && <ChevronRight size={14} color={c.color} style={{position:'absolute',top:12,right:12}}/>}
            </div>
          ))}
        </div>

        {/* My Assigned Tasks */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <User size={16} color="#6366f1"/>
            <h3 style={s.sectionTitle}>My Assigned Tasks</h3>
            <span style={s.taskCount}>{myTasks.length} tasks</span>
          </div>

          {myTasks.length === 0 ? (
            <div style={s.empty}>No tasks assigned to you yet.</div>
          ) : (
            <div style={s.taskList}>
              {myTasks.map(task => {
                const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'DONE';
                return (
                  <div key={task.id} style={s.taskRow}
                    onClick={() => task.project?.id && navigate(`/projects/${task.project.id}`)}>
                    <div style={{...s.statusDot, background: STATUS_COLORS[task.status]}}/>
                    <div style={s.taskInfo}>
                      <div style={s.taskTitle}>{task.title}</div>
                      <div style={s.taskMeta}>
                        <span style={s.projectName}>📁 {task.project?.name}</span>
                        {task.dueDate && (
                          <span style={{...s.dueDate, color: isOverdue ? '#ef4444' : '#64748b'}}>
                            📅 {task.dueDate} {isOverdue && '⚠ Overdue'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={s.taskRight}>
                      <span style={{...s.prio, background: PRIORITY_COLORS[task.priority]+'22', color: PRIORITY_COLORS[task.priority], border:`1px solid ${PRIORITY_COLORS[task.priority]}44`}}>
                        {task.priority}
                      </span>
                      <span style={{...s.status, background: STATUS_COLORS[task.status]+'22', color: STATUS_COLORS[task.status]}}>
                        {task.status?.replace('_', ' ')}
                      </span>
                      <ChevronRight size={14} color="#475569"/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks by User (visible to admin) */}
        {Object.keys(data.tasksByUser || {}).length > 0 && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <h3 style={s.sectionTitle}>Tasks by User</h3>
            </div>
            <div style={s.userList}>
              {Object.entries(data.tasksByUser).map(([name, count]) => (
                <div key={name} style={s.userRow}>
                  <div style={s.avatar}>{name[0].toUpperCase()}</div>
                  <span style={s.uname}>{name}</span>
                  <span style={s.badge}>{count} tasks</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { background:'#080812', minHeight:'100vh' },
  content: { maxWidth:1100, margin:'0 auto', padding:'32px 24px' },
  heading: { color:'#fff', fontSize:24, fontWeight:700, marginBottom:28, fontFamily:'monospace' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:16, marginBottom:28 },
  card: { background:'#0f0f1a', border:'1px solid #1e1e35', borderRadius:12, padding:'20px', textAlign:'center', position:'relative', transition:'border-color 0.2s' },
  icon: { marginBottom:10, display:'flex', justifyContent:'center' },
  val: { color:'#fff', fontSize:32, fontWeight:800, lineHeight:1 },
  lbl: { color:'#64748b', fontSize:13, marginTop:6 },
  section: { background:'#0f0f1a', border:'1px solid #1e1e35', borderRadius:12, padding:24, marginBottom:20 },
  sectionHeader: { display:'flex', alignItems:'center', gap:8, marginBottom:16 },
  sectionTitle: { color:'#fff', fontSize:16, fontWeight:600, flex:1, margin:0 },
  taskCount: { background:'#1a1a2e', color:'#6366f1', border:'1px solid #2d2d50', padding:'2px 10px', borderRadius:20, fontSize:12 },
  empty: { color:'#475569', textAlign:'center', padding:'24px 0', fontSize:14 },
  taskList: { display:'flex', flexDirection:'column', gap:10 },
  taskRow: { display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'#0a0a17', borderRadius:10, border:'1px solid #1e1e35', cursor:'pointer', transition:'border-color 0.2s' },
  statusDot: { width:10, height:10, borderRadius:'50%', flexShrink:0 },
  taskInfo: { flex:1, minWidth:0 },
  taskTitle: { color:'#e2e8f0', fontSize:14, fontWeight:600, marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  taskMeta: { display:'flex', gap:16, flexWrap:'wrap' },
  projectName: { color:'#64748b', fontSize:12 },
  dueDate: { fontSize:12 },
  taskRight: { display:'flex', alignItems:'center', gap:8, flexShrink:0 },
  prio: { fontSize:11, padding:'2px 8px', borderRadius:6, fontWeight:600 },
  status: { fontSize:11, padding:'2px 8px', borderRadius:6, fontWeight:600 },
  userList: { display:'flex', flexDirection:'column', gap:12 },
  userRow: { display:'flex', alignItems:'center', gap:12 },
  avatar: { width:36, height:36, borderRadius:'50%', background:'#6366f1', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 },
  uname: { color:'#e2e8f0', fontSize:14, flex:1 },
  badge: { background:'#1a1a2e', color:'#6366f1', border:'1px solid #2d2d50', padding:'3px 10px', borderRadius:20, fontSize:12 }
};