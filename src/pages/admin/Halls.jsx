import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Halls() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  // add-form fields
  const [hallNo, setHallNo] = useState('')
  const [capacity, setCapacity] = useState('')

  // which row is open, and the value being edited
  const [openId, setOpenId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editCapacity, setEditCapacity] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data, error } = await supabase
      .from('halls')
      .select('hall_no, capacity')
      .order('hall_no')

    if (error) setError(error.message)
    else setRows(data)
  }

  async function add() {
    if (!hallNo.trim()) return
    const { error } = await supabase
      .from('halls')
      .insert({
        hall_no: hallNo.trim(),
        capacity: capacity ? Number(capacity) : null,
      })

    if (error) { setError(error.message); return }
    setHallNo('')
    setCapacity('')
    load()
  }

  function openRow(row) {
    if (openId === row.hall_no) {
      setOpenId(null)
      setEditing(false)
      return
    }
    setOpenId(row.hall_no)
    setEditing(false)
    setEditCapacity(row.capacity ?? '')
  }

  async function save(originalHallNo) {
    const { error } = await supabase
      .from('halls')
      .update({ capacity: editCapacity ? Number(editCapacity) : null })
      .eq('hall_no', originalHallNo)

    if (error) { setError(error.message); return }
    setEditing(false)
    setOpenId(null)
    load()
  }

  async function remove(hallNo) {
    const { error } = await supabase
      .from('halls')
      .delete()
      .eq('hall_no', hallNo)

    if (error) { setError(error.message); return }
    setOpenId(null)
    load()
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="toolbar">
        <input
          placeholder="Hall no (e.g. A101)"
          value={hallNo}
          onChange={(e) => setHallNo(e.target.value)}
        />
        <input
          type="number"
          placeholder="Capacity (optional)"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
        <button onClick={add}>Add</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Hall</th>
            <th>Capacity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <RowWithDetail
              key={row.hall_no}
              row={row}
              isOpen={openId === row.hall_no}
              editing={editing}
              onOpen={() => openRow(row)}
              onStartEdit={() => setEditing(true)}
              onCancel={() => setEditing(false)}
              onSave={() => save(row.hall_no)}
              onDelete={() => remove(row.hall_no)}
              editCapacity={editCapacity}
              setEditCapacity={setEditCapacity}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RowWithDetail({
  row, isOpen, editing, onOpen, onStartEdit, onCancel, onSave, onDelete,
  editCapacity, setEditCapacity,
}) {
  return (
    <>
      <tr
        onClick={onOpen}
        style={{
          cursor: 'pointer',
          background: isOpen ? 'rgba(174, 181, 157, 0.18)' : 'transparent',
        }}
      >
        <td>{row.hall_no}</td>
        <td>{row.capacity ?? '—'}</td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={2} style={{ background: '#f6f4ec' }}>
            {!editing ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span><strong>{row.hall_no}</strong> · capacity {row.capacity ?? 'not set'}</span>
                <button onClick={onStartEdit}>Edit</button>
                <button className="btn-danger" onClick={onDelete}>Delete</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>Hall <strong>{row.hall_no}</strong></span>
                <input
                  type="number"
                  placeholder="Capacity"
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value)}
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