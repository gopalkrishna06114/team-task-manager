import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background:'#1a1a2e', color:'#e2e8f0', border:'1px solid #2d2d50' }}}/>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
          <Route path="/projects" element={<ProtectedRoute><Projects/></ProtectedRoute>}/>
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail/></ProtectedRoute>}/>
          <Route path="*" element={<Navigate to="/dashboard"/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}