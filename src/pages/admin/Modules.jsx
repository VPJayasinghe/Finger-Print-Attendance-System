import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Modules() {
  const [rows, setRows] = useState([])
  const [faculties, setFaculties] = useState([])
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [facultyId, setFacultyId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { load(); loadFaculties() }, [])

  async function load() {
    const { data, error } = await supabase
      .from('modules')
      .select('module_code, module_name, faculty_id, faculties(faculty_name)')
      .order('module_code')
    if (error) setError(error.message); else setRows(data)
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
      faculty_id: facultyId ? Number(facultyId) : null
    })
    if (error) { setError(error.message); return }
    setCode(''); setName(''); setFacultyId(''); load()
  }
  async function remove(moduleCode) {
    const { error } = await supabase.from('modules').delete().eq('module_code', moduleCode)
    if (error) { setError(error.message); return }
    load()
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
        <thead><tr><th>Code</th><th>Name</th><th>Faculty</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.module_code}>
              <td>{r.module_code}</td>
              <td>{r.module_name}</td>
              <td>{r.faculties?.faculty_name || '—'}</td>
              <td><button onClick={() => remove(r.module_code)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
