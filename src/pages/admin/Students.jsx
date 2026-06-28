import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Students() {
  const [rows, setRows] = useState([])
  const [cohorts, setCohorts] = useState([])
  const [error, setError] = useState('')

  // add-form fields
  const [studentId, setStudentId] = useState('')
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [cohortId, setCohortId] = useState('')

  // open row + edit state
  const [openId, setOpenId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editFullName, setEditFullName] = useState('')
  const [editDob, setEditDob] = useState('')
  const [editCohortId, setEditCohortId] = useState('')

  useEffect(() => {
    load()
    loadCohorts()
  }, [])

 async function load() {
  const { data, error } = await supabase
    .from('students_view')
    .select('student_id, full_name, dob, cohort_id, auth_user_id, has_fp, cohorts(label)')
    .order('student_id')

  if (error) setError(error.message)
  else setRows(data)
}

  async function loadCohorts() {
    const { data } = await supabase
      .from('cohorts')
      .select('cohort_id, label')
      .order('label')
    setCohorts(data || [])
  }

  async function add() {
    if (!studentId.trim() || !fullName.trim()) return
    const { error } = await supabase
      .from('students')
      .insert({
        student_id: studentId.trim(),
        full_name: fullName.trim(),
        dob: dob || null,
        cohort_id: cohortId ? Number(cohortId) : null,
      })

    if (error) { setError(error.message); return }
    setStudentId(''); setFullName(''); setDob(''); setCohortId('')
    load()
  }

  function openRow(row) {
    if (openId === row.student_id) {
      setOpenId(null); setEditing(false); return
    }
    setOpenId(row.student_id)
    setEditing(false)
    setEditFullName(row.full_name)
    setEditDob(row.dob || '')
    setEditCohortId(row.cohort_id ?? '')
  }

  async function save(id) {
    const { error } = await supabase
      .from('students')
      .update({
        full_name: editFullName.trim(),
        dob: editDob || null,
        cohort_id: editCohortId ? Number(editCohortId) : null,
      })
      .eq('student_id', id)

    if (error) { setError(error.message); return }
    setEditing(false); setOpenId(null); load()
  }

  async function remove(id) {
    const { error } = await supabase.from('students').delete().eq('student_id', id)
    if (error) { setError(error.message); return }
    setOpenId(null); load()
  }

  async function clearFingerprint(id) {
    const ok = confirm(
      'Clear this student\'s fingerprint? They will need to re-enroll from the device.'
    )
    if (!ok) return
    const { error } = await supabase
      .from('students')
      .update({ template_b64: null })
      .eq('student_id', id)

    if (error) { setError(error.message); return }
    load()   // refresh so the "enrolled" status updates
  }

  async function createLogin(id) {
    const email = prompt('Login email for this student:')
    if (!email) return
    const password = prompt('Initial password (they can change it later):')
    if (!password) return

    const { data, error } = await supabase.functions.invoke('create-account', {
      body: { role: 'student', student_id: id, email: email.trim(), password },
    })

    if (error) {
      // the real message is in the response body, not error.message
      let detail = error.message
      try {
        const body = await error.context.json()
        detail = body.error || JSON.stringify(body)
      } catch { /* ignore */ }
      setError(detail)
      console.log('create-account error:', detail)
      return
    }
    if (!data.ok) { setError(data.error || 'Could not create login'); return }
    load()
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="toolbar">
        <input placeholder="Student ID (e.g. 12345)" value={studentId}
               onChange={(e) => setStudentId(e.target.value)} />
        <input placeholder="Full name" value={fullName}
               onChange={(e) => setFullName(e.target.value)} />
        <input type="date" value={dob}
               onChange={(e) => setDob(e.target.value)} />
        <select value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
          <option value="">— cohort —</option>
          {cohorts.map((c) => (
            <option key={c.cohort_id} value={c.cohort_id}>{c.label}</option>
          ))}
        </select>
        <button onClick={add}>Add</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Cohort</th>
            <th>Fingerprint</th>
            <th>Login</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <StudentRow
              key={row.student_id}
              row={row}
              cohorts={cohorts}
              isOpen={openId === row.student_id}
              editing={editing}
              onOpen={() => openRow(row)}
              onStartEdit={() => setEditing(true)}
              onCancel={() => setEditing(false)}
              onSave={() => save(row.student_id)}
              onDelete={() => remove(row.student_id)}
              onClearFp={() => clearFingerprint(row.student_id)}
              onCreateLogin={() => createLogin(row.student_id)}
              editFullName={editFullName} setEditFullName={setEditFullName}
              editDob={editDob} setEditDob={setEditDob}
              editCohortId={editCohortId} setEditCohortId={setEditCohortId}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StudentRow({
  row, cohorts, isOpen, editing,
  onOpen, onStartEdit, onCancel, onSave, onDelete, onClearFp, onCreateLogin,
  editFullName, setEditFullName, editDob, setEditDob, editCohortId, setEditCohortId,
}) {
  return (
    <>
      <tr onClick={onOpen}
          style={{ cursor: 'pointer',
                   background: isOpen ? 'rgba(174, 181, 157, 0.18)' : 'transparent' }}>
        <td>{row.student_id}</td>
        <td>{row.full_name}</td>
        <td>{row.cohorts?.label || '—'}</td>
        <td>{row.has_fp ? '✓ enrolled' : '— none'}</td>
        <td>{row.auth_user_id ? '✓ has login' : '— none'}</td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={5} style={{ background: '#f6f4ec' }}>
            {!editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <strong>{row.full_name}</strong> ({row.student_id})<br />
                  Cohort: {row.cohorts?.label || '—'} · DOB: {row.dob || '—'}<br />
                  Fingerprint: {row.has_fp ? 'enrolled' : 'not enrolled'} ·
                  Login: {row.auth_user_id ? 'yes' : 'no'}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={onStartEdit}>Edit</button>
                  {!row.auth_user_id && (
                    <button onClick={onCreateLogin}>Create login</button>
                  )}
                  {row.has_fp && (
                    <button className="btn-danger" onClick={onClearFp}>
                      Clear fingerprint
                    </button>
                  )}
                  <button className="btn-danger" onClick={onDelete}>Delete student</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>{row.student_id}</span>
                <input placeholder="Full name" value={editFullName}
                       onChange={(e) => setEditFullName(e.target.value)} />
                <input type="date" value={editDob}
                       onChange={(e) => setEditDob(e.target.value)} />
                <select value={editCohortId} onChange={(e) => setEditCohortId(e.target.value)}>
                  <option value="">— cohort —</option>
                  {cohorts.map((c) => (
                    <option key={c.cohort_id} value={c.cohort_id}>{c.label}</option>
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