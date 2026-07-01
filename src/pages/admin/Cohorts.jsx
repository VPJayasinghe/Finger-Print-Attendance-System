import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

const PATHWAYS = ['UGC', 'PLY', 'VU']
const PROGRAMS = ['SE', 'CS', 'MIS', 'DS', 'CN', 'AI']

export default function Cohorts() {
  const [rows, setRows] = useState([])
  const [batches, setBatches] = useState([])

  const [label, setLabel] = useState('')
  const [batchCode, setBatchCode] = useState('')
  const [pathway, setPathway] = useState('')
  const [program, setProgram] = useState('')

  const [error, setError] = useState('')

  // open row + edit state
  const [openId, setOpenId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editLabel, setEditLabel] = useState('')
  const [editBatch, setEditBatch] = useState('')
  const [editPathway, setEditPathway] = useState('')
  const [editProgram, setEditProgram] = useState('')

  useEffect(() => {
    load()
    loadBatches()
  }, [])

  async function load() {
    const { data, error } = await supabase
      .from('cohorts')
      .select('cohort_id, label, batch_code, pathway, program')
      .order('label')

    if (error) setError(error.message)
    else setRows(data)
  }

  async function loadBatches() {
    const { data } = await supabase
      .from('batches')
      .select('batch_code')
      .order('batch_code')
    setBatches(data || [])
  }

  async function add() {
    if (!label.trim()) return
    const { error } = await supabase
      .from('cohorts')
      .insert({
        label: label.trim(),
        batch_code: batchCode || null,
        pathway: pathway || null,
        program: program || null,
      })
    if (error) { setError(error.message); return }
    setLabel(''); setBatchCode(''); setPathway(''); setProgram('')
    load()
  }

  function openRow(row) {
    if (openId === row.cohort_id) {
      setOpenId(null); setEditing(false); return
    }
    setOpenId(row.cohort_id)
    setEditing(false)
    setEditLabel(row.label)
    setEditBatch(row.batch_code || '')
    setEditPathway(row.pathway || '')
    setEditProgram(row.program || '')
  }

  async function save(id) {
    if (!editLabel.trim()) return
    const { error } = await supabase
      .from('cohorts')
      .update({
        label: editLabel.trim(),
        batch_code: editBatch || null,
        pathway: editPathway || null,
        program: editProgram || null,
      })
      .eq('cohort_id', id)
    if (error) { setError(error.message); return }
    setEditing(false); setOpenId(null); load()
  }

  async function remove(id) {
    const { error } = await supabase
      .from('cohorts')
      .delete()
      .eq('cohort_id', id)
    if (error) { setError(error.message); return }
    setOpenId(null); load()
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          placeholder="Label (e.g. 25.1 PLY SE)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <select value={batchCode} onChange={(e) => setBatchCode(e.target.value)}>
          <option value="">— batch —</option>
          {batches.map((b) => (
            <option key={b.batch_code} value={b.batch_code}>{b.batch_code}</option>
          ))}
        </select>
        <select value={pathway} onChange={(e) => setPathway(e.target.value)}>
          <option value="">— pathway —</option>
          {PATHWAYS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={program} onChange={(e) => setProgram(e.target.value)}>
          <option value="">— program —</option>
          {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={add}>Add</button>
      </div>

      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Label</th>
            <th>Batch</th>
            <th>Pathway</th>
            <th>Program</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <CohortRow
              key={row.cohort_id}
              row={row}
              batches={batches}
              isOpen={openId === row.cohort_id}
              editing={editing}
              onOpen={() => openRow(row)}
              onStartEdit={() => setEditing(true)}
              onCancel={() => setEditing(false)}
              onSave={() => save(row.cohort_id)}
              onDelete={() => remove(row.cohort_id)}
              editLabel={editLabel} setEditLabel={setEditLabel}
              editBatch={editBatch} setEditBatch={setEditBatch}
              editPathway={editPathway} setEditPathway={setEditPathway}
              editProgram={editProgram} setEditProgram={setEditProgram}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CohortRow({
  row, batches, isOpen, editing,
  onOpen, onStartEdit, onCancel, onSave, onDelete,
  editLabel, setEditLabel, editBatch, setEditBatch,
  editPathway, setEditPathway, editProgram, setEditProgram,
}) {
  return (
    <>
      <tr onClick={onOpen}
          style={{ cursor: 'pointer',
                   background: isOpen ? 'rgba(174, 181, 157, 0.18)' : 'transparent' }}>
        <td>{row.label}</td>
        <td>{row.batch_code || '—'}</td>
        <td>{row.pathway || '—'}</td>
        <td>{row.program || '—'}</td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={4} style={{ background: '#f6f4ec' }}>
            {!editing ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>
                  <strong>{row.label}</strong> ·
                  {' '}{row.batch_code || 'no batch'} ·
                  {' '}{row.pathway || '—'} / {row.program || '—'}
                </span>
                <button onClick={onStartEdit}>Edit</button>
                <button className="btn-danger" onClick={onDelete}>Delete</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  placeholder="Label"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                />
                <select value={editBatch} onChange={(e) => setEditBatch(e.target.value)}>
                  <option value="">— batch —</option>
                  {batches.map((b) => (
                    <option key={b.batch_code} value={b.batch_code}>{b.batch_code}</option>
                  ))}
                </select>
                <select value={editPathway} onChange={(e) => setEditPathway(e.target.value)}>
                  <option value="">— pathway —</option>
                  {PATHWAYS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={editProgram} onChange={(e) => setEditProgram(e.target.value)}>
                  <option value="">— program —</option>
                  {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
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