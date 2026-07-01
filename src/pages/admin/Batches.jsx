import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Batches() {
  const [rows, setRows] = useState([])
  const [code, setCode] = useState('')
  const [year, setYear] = useState('')
  const [desc, setDesc] = useState('')
  const [error, setError] = useState('')

  // open row + edit state
  const [openId, setOpenId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editYear, setEditYear] = useState('')
  const [editDesc, setEditDesc] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('batch_code')
    if (error) setError(error.message)
    else setRows(data)
  }

  async function add() {
    if (!code.trim()) return
    const { error } = await supabase
      .from('batches')
      .insert({
        batch_code: code.trim(),
        intake_year: year ? Number(year) : null,
        description: desc.trim() || null,
      })
    if (error) { setError(error.message); return }
    setCode(''); setYear(''); setDesc(''); load()
  }

  function openRow(row) {
    if (openId === row.batch_code) {
      setOpenId(null); setEditing(false); return
    }
    setOpenId(row.batch_code)
    setEditing(false)
    setEditYear(row.intake_year ?? '')
    setEditDesc(row.description || '')
  }

  async function save(batchCode) {
    const { error } = await supabase
      .from('batches')
      .update({
        intake_year: editYear ? Number(editYear) : null,
        description: editDesc.trim() || null,
      })
      .eq('batch_code', batchCode)
    if (error) { setError(error.message); return }
    setEditing(false); setOpenId(null); load()
  }

  async function remove(batchCode) {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('batch_code', batchCode)
    if (error) { setError(error.message); return }
    setOpenId(null); load()
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          placeholder="Batch code (e.g. 25.1)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <input
          type="number"
          placeholder="Intake year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <input
          placeholder="Description (optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button onClick={add}>Add</button>
      </div>

      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Intake Year</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <BatchRow
              key={row.batch_code}
              row={row}
              isOpen={openId === row.batch_code}
              editing={editing}
              onOpen={() => openRow(row)}
              onStartEdit={() => setEditing(true)}
              onCancel={() => setEditing(false)}
              onSave={() => save(row.batch_code)}
              onDelete={() => remove(row.batch_code)}
              editYear={editYear} setEditYear={setEditYear}
              editDesc={editDesc} setEditDesc={setEditDesc}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BatchRow({
  row, isOpen, editing, onOpen, onStartEdit, onCancel, onSave, onDelete,
  editYear, setEditYear, editDesc, setEditDesc,
}) {
  return (
    <>
      <tr onClick={onOpen}
          style={{ cursor: 'pointer',
                   background: isOpen ? 'rgba(174, 181, 157, 0.18)' : 'transparent' }}>
        <td>{row.batch_code}</td>
        <td>{row.intake_year ?? '—'}</td>
        <td>{row.description || '—'}</td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={3} style={{ background: '#f6f4ec' }}>
            {!editing ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>
                  <strong>{row.batch_code}</strong> ·
                  {' '}{row.intake_year ?? 'no year'} ·
                  {' '}{row.description || 'no description'}
                </span>
                <button onClick={onStartEdit}>Edit</button>
                <button className="btn-danger" onClick={onDelete}>Delete</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>Batch <strong>{row.batch_code}</strong></span>
                <input
                  type="number"
                  placeholder="Intake year"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                />
                <input
                  placeholder="Description"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
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