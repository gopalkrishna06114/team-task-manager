import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, UserPlus, Calendar } from 'lucide-react';

const STATUS_COLORS = { TODO: '#f59e0b', IN_PROGRESS: '#3b82f6', DONE: '#10b981' };
const PRIORITY_COLORS = { LOW: '#64748b', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title:'', description:'', priority:'MEDIUM', dueDate:'', assigneeId:'' });

  const isAdmin = project?.createdBy?.id === user?.userId;

  const fetchAll = async () => {
    const [proj, taskRes] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks/project/${id}`)
    ]);
    setProject(proj.data);
    setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
  };

  useEffect(() => {
    fetchAll();
    api.get('/projects/users').then(r => setAllUsers(Array.isArray(r.data) ? r.data : []));
  }, [id]);

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...taskForm, projectId: parseInt(id), assigneeId: taskForm.assigneeId || null });
      toast.success('Task created!');
      setShowTaskModal(false);
      setTaskForm({ title:'', description:'', priority:'MEDIUM', dueDate:'', assigneeId:'' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const updateStatus = async (taskId, status) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await api.put(`/tasks/${taskId}`, { title: task.title, status, projectId: parseInt(id) });
      fetchAll();
    } catch (err) { toast.error('Failed to update'); }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Deleted');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const addMember = async (userId) => {
    try {
      await api.post(`/projects/${id}/members/${userId}`);
      toast.success('Member added!');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const removeMember = async (userId) => {
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  if (!project) return <div style={{color:'#fff', textAlign:'center', paddingTop:80}}>Loading...</div>;

  // ✅ FIX — compare by id not by object reference
  const nonMembers = allUsers.filter(u => !project.members?.some(m => m.id === u.id));

  const columns = [
    { key:'TODO', label:'To Do' },
    { key:'IN_PROGRESS', label:'In Progress' },
    { key:'DONE', label:'Done' },
  ];

  return (
    <div style={s.page}>
      <Navbar/>
      <div style={s.content}>
        <div style={s.header}>
          <div>
            <h2 style={s.title}>{project.name}</h2>
            <p style={s.desc}>{project.description || 'No description'}</p>
          </div>
          <div style={s.actions}>
            {isAdmin && (
              <>
                <button style={s.memberBtn} onClick={() => setShowMemberModal(true)}>
                  <UserPlus size={15}/> Manage Members
                </button>
                <button style={s.addBtn} onClick={() => setShowTaskModal(true)}>
                  <Plus size={15}/> Add Task
                </button>
              </>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        <div style={s.kanban}>
          {columns.map(col => (
            <div key={col.key} style={s.column}>
              <div style={s.colHeader}>
                <span style={{...s.colDot, background: STATUS_COLORS[col.key]}}/>
                <span style={s.colTitle}>{col.label}</span>
                <span style={s.colCount}>{tasks.filter(t=>t.status===col.key).length}</span>
              </div>
              {tasks.filter(t => t.status === col.key).map(task => (
                <div key={task.id} style={s.taskCard}>
                  <div style={s.taskHeader}>
                    <span style={s.taskTitle}>{task.title}</span>
                    {isAdmin && <Trash2 size={14} color="#ef4444" style={{cursor:'pointer'}} onClick={() => deleteTask(task.id)}/>}
                  </div>
                  {task.description && <p style={s.taskDesc}>{task.description}</p>}
                  <div style={s.taskMeta}>
                    <span style={{...s.prio, background: PRIORITY_COLORS[task.priority]+'22', color: PRIORITY_COLORS[task.priority], border:`1px solid ${PRIORITY_COLORS[task.priority]}44`}}>{task.priority}</span>
                    {task.dueDate && <span style={s.due}><Calendar size={11}/> {task.dueDate}</span>}
                  </div>
                  {task.assignee && <div style={s.assignee}>👤 {task.assignee.name}</div>}
                  <select style={s.statusSelect} value={task.status} onChange={e => updateStatus(task.id, e.target.value)}>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>New Task</h3>
            <form onSubmit={createTask} style={s.form}>
              <input style={s.input} placeholder="Title" value={taskForm.title}
                onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
              <textarea style={{...s.input, height:70, resize:'none'}} placeholder="Description"
                value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})}/>
              <select style={s.input} value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
              <input style={s.input} type="date" value={taskForm.dueDate}
                onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})}/>
              <select style={s.input} value={taskForm.assigneeId} onChange={e => setTaskForm({...taskForm, assigneeId: e.target.value})}>
                <option value="">Unassigned</option>
                {project.members?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" style={s.submitBtn}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ FIXED Manage Members Modal */}
      {showMemberModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>Manage Members</h3>

            {/* Current Members */}
            <div style={{marginBottom:20}}>
              <p style={{color:'#94a3b8', fontSize:13, marginBottom:10}}>
                Current Members ({project.members?.length || 0})
              </p>
              {project.members?.map(m => (
                <div key={m.id} style={s.memberRow}>
                  <div style={s.mavatar}>{m.name[0].toUpperCase()}</div>
                  <span style={{color:'#e2e8f0', fontSize:14, flex:1}}>
                    {m.name}
                    {m.id === project.createdBy?.id &&
                      <span style={{color:'#6366f1', fontSize:11, marginLeft:6, fontWeight:600}}>(Admin)</span>}
                  </span>
                  {m.id !== project.createdBy?.id && (
                    <button style={s.removeBtn} onClick={() => removeMember(m.id)}>Remove</button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Members */}
            <div>
              <p style={{color:'#94a3b8', fontSize:13, marginBottom:10}}>
                Add Members ({nonMembers.length} available)
              </p>
              {nonMembers.length === 0 ? (
                <p style={{color:'#475569', fontSize:13, textAlign:'center', padding:'16px 0', background:'#0a0a17', borderRadius:8, border:'1px dashed #1e1e35'}}>
                  No other users found. Ask them to signup first.
                </p>
              ) : (
                nonMembers.map(u => (
                  <div key={u.id} style={s.memberRow}>
                    <div style={s.mavatar}>{u.name[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{color:'#e2e8f0', fontSize:14}}>{u.name}</div>
                      <div style={{color:'#64748b', fontSize:11}}>{u.email}</div>
                    </div>
                    <button style={s.addMemberBtn} onClick={() => addMember(u.id)}>+ Add</button>
                  </div>
                ))
              )}
            </div>

            <button
              style={{...s.submitBtn, width:'100%', marginTop:20}}
              onClick={() => setShowMemberModal(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page:{background:'#080812',minHeight:'100vh'},
  content:{maxWidth:1200,margin:'0 auto',padding:'32px 24px'},
  header:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:32},
  title:{color:'#fff',fontSize:22,fontWeight:700,margin:0,fontFamily:'monospace'},
  desc:{color:'#64748b',fontSize:13,marginTop:4},
  actions:{display:'flex',gap:10},
  addBtn:{display:'flex',alignItems:'center',gap:6,background:'#6366f1',color:'#fff',border:'none',borderRadius:10,padding:'10px 16px',fontSize:13,fontWeight:600,cursor:'pointer'},
  memberBtn:{display:'flex',alignItems:'center',gap:6,background:'transparent',color:'#6366f1',border:'1px solid #6366f1',borderRadius:10,padding:'10px 16px',fontSize:13,fontWeight:600,cursor:'pointer'},
  kanban:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16},
  column:{background:'#0a0a17',border:'1px solid #1e1e35',borderRadius:12,padding:16,minHeight:400},
  colHeader:{display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:12,borderBottom:'1px solid #1e1e35'},
  colDot:{width:8,height:8,borderRadius:'50%',flexShrink:0},
  colTitle:{color:'#e2e8f0',fontSize:14,fontWeight:600,flex:1},
  colCount:{background:'#1e1e35',color:'#64748b',borderRadius:20,padding:'2px 8px',fontSize:12},
  taskCard:{background:'#0f0f1a',border:'1px solid #1e1e35',borderRadius:10,padding:14,marginBottom:10},
  taskHeader:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6},
  taskTitle:{color:'#e2e8f0',fontSize:13,fontWeight:600,lineHeight:1.4},
  taskDesc:{color:'#64748b',fontSize:12,margin:'0 0 8px',lineHeight:1.5},
  taskMeta:{display:'flex',gap:8,alignItems:'center',marginBottom:8,flexWrap:'wrap'},
  prio:{fontSize:11,padding:'2px 8px',borderRadius:6,fontWeight:600},
  due:{display:'flex',alignItems:'center',gap:4,color:'#64748b',fontSize:11},
  assignee:{color:'#94a3b8',fontSize:11,marginBottom:8},
  statusSelect:{width:'100%',background:'#1a1a2e',border:'1px solid #2d2d50',borderRadius:8,padding:'6px 10px',color:'#e2e8f0',fontSize:12,cursor:'pointer',outline:'none'},
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200},
  modal:{background:'#0f0f1a',border:'1px solid #2d2d50',borderRadius:16,padding:32,width:420,maxHeight:'85vh',overflowY:'auto'},
  modalTitle:{color:'#fff',fontSize:18,fontWeight:700,marginBottom:20},
  form:{display:'flex',flexDirection:'column',gap:12},
  input:{background:'#1a1a2e',border:'1px solid #2d2d50',borderRadius:10,padding:'11px 14px',color:'#e2e8f0',fontSize:13,outline:'none',width:'100%',boxSizing:'border-box'},
  modalActions:{display:'flex',gap:10,justifyContent:'flex-end'},
  cancelBtn:{background:'transparent',color:'#64748b',border:'1px solid #2d2d50',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13},
  submitBtn:{background:'#6366f1',color:'#fff',border:'none',borderRadius:8,padding:'8px 18px',cursor:'pointer',fontSize:13,fontWeight:600},
  memberRow:{display:'flex',alignItems:'center',gap:10,marginBottom:10},
  mavatar:{width:32,height:32,borderRadius:'50%',background:'#6366f1',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,flexShrink:0},
  removeBtn:{background:'#ef444422',color:'#ef4444',border:'1px solid #ef444444',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12},
  addMemberBtn:{background:'#6366f122',color:'#6366f1',border:'1px solid #6366f144',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12}
};