import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase } from '../supabaseClient'

export default function SuperAdminDashboard({ profile }) {
  const [rows, setRows] = useState([])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, full_name, email, role, is_active')
      .in('role', ['admin', 'super_admin'])
      .order('role')

    if (error) {
      setError(error.message)
    } else {
      setRows(data)
    }
  }

  async function addAdmin() {
    if (!fullName.trim() || !email.trim() || !password) return

    setBusy(true)
    setError('')

    const { data, error } = await supabase.functions.invoke('create-account', {
      body: {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role: 'admin',
      },
    })

    setBusy(false)

    if (error) {
      setError(error.message)
      return
    }

    if (!data.ok) {
      setError(data.error || 'Could not create admin')
      return
    }

    setFullName('')
    setEmail('')
    setPassword('')
    load()
  }

  async function setActive(userId, active) {
    const { error } = await supabase
      .from('users')
      .update({ is_active: active })
      .eq('user_id', userId)

    if (error) {
      setError(error.message)
      return
    }

    load()
  }

  return (
    <DashboardLayout name={profile.full_name} role={profile.role}>
      <h2>Manage Admins</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <input
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Initial password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={addAdmin} disabled={busy}>
          {busy ? 'Creating...' : 'Add admin'}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.user_id}>
              <td>{r.full_name}</td>
              <td>{r.email}</td>
              <td>{r.role}</td>
              <td>{r.is_active ? 'Yes' : 'No'}</td>

              <td>
                {r.role === 'admin' && (
                  <button
                    onClick={() => setActive(r.user_id, !r.is_active)}
                  >
                    {r.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardLayout>
  )
}