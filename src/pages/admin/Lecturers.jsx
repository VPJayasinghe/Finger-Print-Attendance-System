import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Lecturers() {
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
      .select('user_id, full_name, email, is_active')
      .eq('role', 'lecturer')
      .order('full_name')

    if (error) {
      setError(error.message)
    } else {
      setRows(data)
    }
  }

  async function add() {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password
    ) {
      return
    }

    setBusy(true)
    setError('')

    const { data, error } =
      await supabase.functions.invoke(
        'create-account',
        {
          body: {
            full_name: fullName.trim(),
            email: email.trim(),
            password,
            role: 'lecturer'
          }
        }
      )

    setBusy(false)

    if (error) {
      setError(error.message)
      return
    }

    if (!data.ok) {
      setError(
        data.error ||
        'Could not create lecturer'
      )
      return
    }

    setFullName('')
    setEmail('')
    setPassword('')

    load()
  }

  return (
    <div>
      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 12,
          flexWrap: 'wrap'
        }}
      >
        <input
          placeholder="Full name"
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Initial password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={add}
          disabled={busy}
        >
          {busy
            ? 'Creating...'
            : 'Add lecturer'}
        </button>
      </div>

      <table
        border="1"
        cellPadding="6"
        style={{
          borderCollapse: 'collapse'
        }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Active</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.user_id}>
              <td>{row.full_name}</td>

              <td>{row.email}</td>

              <td>
                {row.is_active
                  ? 'Yes'
                  : 'No'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}