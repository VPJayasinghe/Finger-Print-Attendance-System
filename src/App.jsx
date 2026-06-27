import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import LecturerDashboard from './pages/LecturerDashboard'
import StudentDashboard from './pages/StudentDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) loadProfile(data.session.user.id)
      else setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess)
      if (sess) loadProfile(sess.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    setLoading(true)
    const { data: staff } = await supabase
      .from('users').select('full_name, role').eq('user_id', userId).maybeSingle()
    if (staff) { setProfile(staff); setLoading(false); return }
    const { data: stu } = await supabase
      .from('students').select('full_name').eq('auth_user_id', userId).maybeSingle()
    if (stu) { setProfile({ full_name: stu.full_name, role: 'student' }); setLoading(false); return }
    setProfile({ full_name: 'Unknown', role: 'none' })
    setLoading(false)
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>
  if (!session) return <Login />
  if (!profile) return <p style={{ padding: 20 }}>Loading profile...</p>

  const home =
    profile.role === 'super_admin' ? '/super' :
    profile.role === 'admin'       ? '/admin' :
    profile.role === 'lecturer'    ? '/lecturer' :
    profile.role === 'student'     ? '/student' : '/none'

  const guard = (role, element) =>
    profile.role === role ? element : <Navigate to={home} replace />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin"    element={guard('admin', <AdminDashboard profile={profile} />)} />
        <Route path="/super"    element={guard('super_admin', <SuperAdminDashboard profile={profile} />)} />
        <Route path="/lecturer" element={guard('lecturer', <LecturerDashboard profile={profile} />)} />
        <Route path="/student"  element={guard('student', <StudentDashboard profile={profile} />)} />
        <Route path="/none" element={
          <div style={{ padding: 20 }}>
            <p>Your login isn't linked to a profile yet.</p>
            <button onClick={() => supabase.auth.signOut()}>Log out</button>
          </div>
        } />
        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
    </BrowserRouter>
  )
}