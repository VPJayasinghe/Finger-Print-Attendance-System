import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Faculties() {
  const [rows, setRows] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // open row + edit state
  const [openId, setOpenId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data, error } = await supabase.from('faculties').select('*').order('faculty_id')
    if (error) setError(error.message)
    else setRows(data)
  }

  async function add() {
    if (!name.trim()) return
    const { error } = await supabase.from('faculties').insert({ faculty_name: name.trim() })
    if (error) { setError(error.message); return }
    setName(''); load()
  }

  function openRow(row) {
    if (openId === row.faculty_id) {
      setOpenId(null); setEditing(false); return
    }
    setOpenId(row.faculty_id)
    setEditing(false)
    setEditName(row.faculty_name)
  }

  async function save(id) {
    if (!editName.trim()) return
    const { error } = await supabase
      .from('faculties')
      .update({ faculty_name: editName.trim() })
      .eq('faculty_id', id)
    if (error) { setError(error.message); return }
    setEditing(false); setOpenId(null); load()
  }

  async function remove(id) {
    const { error } = await supabase.from('faculties').delete().eq('faculty_id', id)
    if (error) { setError(error.message); return }
    setOpenId(null); load()
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input placeholder="Faculty name" value={name} onChange={e => setName(e.target.value)} />
          <button onClick={add}>Add</button>
        </div>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>ID</th><th>Name</th></tr></thead>
          <tbody>
            {rows.map(row => (
              <FacultyRow
                key={row.faculty_id}
                row={row}
                isOpen={openId === row.faculty_id}
                editing={editing}
                onOpen={() => openRow(row)}
                onStartEdit={() => setEditing(true)}
                onCancel={() => setEditing(false)}
                onSave={() => save(row.faculty_id)}
                onDelete={() => remove(row.faculty_id)}
                editName={editName}
                setEditName={setEditName}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FacultyRow({
  row, isOpen, editing, onOpen, onStartEdit, onCancel, onSave, onDelete,
  editName, setEditName,
}) {
  return (
    <>
      <tr onClick={onOpen}
          style={{ cursor: 'pointer',
                   background: isOpen ? 'rgba(174, 181, 157, 0.18)' : 'transparent' }}>
        <td>{row.faculty_id}</td>
        <td>{row.faculty_name}</td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={2} style={{ background: '#f6f4ec' }}>
            {!editing ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span><strong>{row.faculty_name}</strong></span>
                <button onClick={onStartEdit}>Edit</button>
                <button className="btn-danger" onClick={onDelete}>Delete</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  placeholder="Faculty name"
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