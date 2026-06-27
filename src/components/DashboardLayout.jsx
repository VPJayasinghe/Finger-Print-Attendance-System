import { supabase } from '../supabaseClient'

export default function DashboardLayout({ name, role, children }) {
  return (
    <div>
      <header style={{
        background: '#394931', color: '#f6f4ec', padding: '14px 22px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <strong>NSBM Attendance</strong>
        <span>{name} ({role}) &nbsp;
          <button onClick={() => supabase.auth.signOut()}>Log out</button>
        </span>
      </header>
      <main style={{ padding: 20 }}>{children}</main>
    </div>
  )
}