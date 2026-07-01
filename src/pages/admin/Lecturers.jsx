import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Lecturers() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  // add-form fields (creating a lecturer = login + profile via the Edge Function)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  // open row + edit state
  const [openId, setOpenId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, full_name, email')
      .eq('role', 'lecturer')
      .order('full_name')
    if (error) setError(error.message)
    else setRows(data)
  }

  async function add() {
    if (!name.trim() || !email.trim() || !password) {
      setError('Fill name, email and password')
      return
    }
    setBusy(true); setError('')

    const { data, error } = await supabase.functions.invoke('create-account', {
      body: { role: 'lecturer', full_name: name.trim(), email: email.trim(), password },
    })

    if (error) {
      // the real reason is in the response body, not error.message
      let detail = error.message
      try {
        const body = await error.context.json()
        detail = body.error || JSON.stringify(body)
      } catch { /* ignore */ }
      setBusy(false); setError(detail); return
    }
    if (!data.ok) { setBusy(false); setError(data.error || 'Could not create lecturer'); return }

    setBusy(false)
    setName(''); setEmail(''); setPassword('')
    load()
  }

  function openRow(row) {
    if (openId === row.user_id) {
      setOpenId(null); setEditing(false); return
    }
    setOpenId(row.user_id)
    setEditing(false)
    setEditName(row.full_name)
  }

  async function save(id) {
    if (!editName.trim()) return
    const { error } = await supabase
      .from('users')
      .update({ full_name: editName.trim() })
      .eq('user_id', id)
    if (error) { setError(error.message); return }
    setEditing(false); setOpenId(null); load()
  }

  async function remove(id) {
    const ok = confirm('Delete this lecturer and their login? This cannot be undone.')
    if (!ok) return
    setError('')

    const { data, error } = await supabase.functions.invoke('create-account', {
      body: { action: 'delete_user', user_id: id },
    })

    if (error) {
      let detail = error.message
      try {
        const body = await error.context.json()
        detail = body.error || JSON.stringify(body)
      } catch { /* ignore */ }
      setError(detail); return
    }
    if (!data.ok) { setError(data.error || 'Could not delete lecturer'); return }

    setOpenId(null); load()
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input placeholder="Full name" value={name}
               onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" value={email}
               onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password}
               onChange={(e) => setPassword(e.target.value)} />
        <button onClick={add} disabled={busy}>
          {busy ? 'Creating...' : 'Add lecturer'}
        </button>
      </div>

      <table>
        <thead>
          <tr><th>Name</th><th>Email</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <LecturerRow
              key={row.user_id}
              row={row}
              isOpen={openId === row.user_id}
              editing={editing}
              onOpen={() => openRow(row)}
              onStartEdit={() => setEditing(true)}
              onCancel={() => setEditing(false)}
              onSave={() => save(row.user_id)}
              onDelete={() => remove(row.user_id)}
              editName={editName}
              setEditName={setEditName}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LecturerRow({
  row, isOpen, editing, onOpen, onStartEdit, onCancel, onSave, onDelete,
  editName, setEditName,
}) {
  return (
    <>
      <tr onClick={onOpen}
          style={{ cursor: 'pointer',
                   background: isOpen ? 'rgba(174, 181, 157, 0.18)' : 'transparent' }}>
        <td>{row.full_name}</td>
        <td>{row.email}</td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={2} style={{ background: '#f6f4ec' }}>
            {!editing ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span><strong>{row.full_name}</strong> · {row.email}</span>
                <button onClick={onStartEdit}>Edit</button>
                <button className="btn-danger" onClick={onDelete}>Delete</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  placeholder="Full name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button onClick={onSave}>Save</button>
                <button className="btn-ghost" onClick={onCancel}>Cancel</button>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}