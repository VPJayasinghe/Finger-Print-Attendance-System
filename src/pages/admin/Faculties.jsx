import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Faculties() {
  const [rows, setRows] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data, error } = await supabase.from('faculties').select('*').order('faculty_id')
    if (error) setError(error.message); else setRows(data)
  }
  async function add() {
    if (!name.trim()) return
    const { error } = await supabase.from('faculties').insert({ faculty_name: name.trim() })
    if (error) { setError(error.message); return }
    setName(''); load()
  }
  async function remove(id) {
    const { error } = await supabase.from('faculties').delete().eq('faculty_id', id)
    if (error) { setError(error.message); return }
    load()
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Faculty name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={add}>Add</button>
      </div>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.faculty_id}>
              <td>{r.faculty_id}</td>
              <td>{r.faculty_name}</td>
              <td><button onClick={() => remove(r.faculty_id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
