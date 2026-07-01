import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Modules() {
  const [rows, setRows] = useState([])
  const [faculties, setFaculties] = useState([])
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [facultyId, setFacultyId] = useState('')
  const [error, setError] = useState('')

  // open row + edit state
  const [openId, setOpenId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editFaculty, setEditFaculty] = useState('')

  useEffect(() => { load(); loadFaculties() }, [])

  async function load() {
    const { data, error } = await supabase
      .from('modules')
      .select('module_code, module_name, faculty_id, faculties(faculty_name)')
      .order('module_code')
    if (error) setError(error.message)
    else setRows(data)
  }

  async function loadFaculties() {
    const { data } = await supabase.from('faculties').select('*').order('faculty_name')
    setFaculties(data || [])
  }

  async function add() {
    if (!code.trim() || !name.trim()) return
    const { error } = await supabase.from('modules').insert({
      module_code: code.trim(),
      module_name: name.trim(),
      faculty_id: facultyId ? Number(facultyId) : null,
    })
    if (error) { setError(error.message); return }
    setCode(''); setName(''); setFacultyId(''); load()
  }

  function openRow(row) {
    if (openId === row.module_code) {
      setOpenId(null); setEditing(false); return
    }
    setOpenId(row.module_code)
    setEditing(false)
    setEditName(row.module_name)
    setEditFaculty(row.faculty_id ?? '')
  }

  async function save(moduleCode) {
    if (!editName.trim()) return
    const { error } = await supabase
      .from('modules')
      .update({
        module_name: editName.trim(),
        faculty_id: editFaculty ? Number(editFaculty) : null,
      })
      .eq('module_code', moduleCode)
    if (error) { setError(error.message); return }
    setEditing(false); setOpenId(null); load()
  }

  async function remove(moduleCode) {
    const { error } = await supabase.from('modules').delete().eq('module_code', moduleCode)
    if (error) { setError(error.message); return }
    setOpenId(null); load()
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input placeholder="Module code (e.g. CS101)" value={code} onChange={e => setCode(e.target.value)} />
        <input placeholder="Module name" value={name} onChange={e => setName(e.target.value)} />
        <select value={facultyId} onChange={e => setFacultyId(e.target.value)}>
          <option value="">— faculty —</option>
          {faculties.map(f => <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name}</option>)}
        </select>
        <button onClick={add}>Add</button>
      </div>

      <table>
        <thead><tr><th>Code</th><th>Name</th><th>Faculty</th></tr></thead>
        <tbody>
          {rows.map(row => (
            <ModuleRow
              key={row.module_code}
              row={row}
              faculties={faculties}
              isOpen={openId === row.module_code}
              editing={editing}
              onOpen={() => openRow(row)}
              onStartEdit={() => setEditing(true)}
              onCancel={() => setEditing(false)}
              onSave={() => save(row.module_code)}
              onDelete={() => remove(row.module_code)}
              editName={editName} setEditName={setEditName}
              editFaculty={editFaculty} setEditFaculty={setEditFaculty}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ModuleRow({
  row, faculties, isOpen, editing,
  onOpen, onStartEdit, onCancel, onSave, onDelete,
  editName, setEditName, editFaculty, setEditFaculty,
}) {
  return (
    <>
      <tr onClick={onOpen}
          style={{ cursor: 'pointer',
                   background: isOpen ? 'rgba(174, 181, 157, 0.18)' : 'transparent' }}>
        <td>{row.module_code}</td>
        <td>{row.module_name}</td>
        <td>{row.faculties?.faculty_name || '—'}</td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={3} style={{ background: '#f6f4ec' }}>
            {!editing ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>
                  <strong>{row.module_code}</strong> · {row.module_name} ·
                  {' '}{row.faculties?.faculty_name || 'no faculty'}
                </span>
                <button onClick={onStartEdit}>Edit</button>
                <button className="btn-danger" onClick={onDelete}>Delete</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>Module <strong>{row.module_code}</strong></span>
                <input
                  placeholder="Module name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <select value={editFaculty} onChange={(e) => setEditFaculty(e.target.value)}>
                  <option value="">— faculty —</option>
                  {faculties.map((f) => (
                    <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_name}</option>
                  ))}
                </select>
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