import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Sessions() {
  const [rows, setRows] = useState([])

  const [modules, setModules] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [halls, setHalls] = useState([])
  const [cohorts, setCohorts] = useState([])

  // add-form fields
  const [moduleCode, setModuleCode] = useState('')
  const [lecturerId, setLecturerId] = useState('')
  const [hallNo, setHallNo] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedCohorts, setSelectedCohorts] = useState([])

  // filter values (empty = "all")
  const [fModule, setFModule] = useState('')
  const [fLecturer, setFLecturer] = useState('')
  const [fHall, setFHall] = useState('')
  const [fCohort, setFCohort] = useState('')
  const [fDate, setFDate] = useState('')
  const [fTime, setFTime] = useState('')

  // open row + edit state
  const [openId, setOpenId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [eModule, setEModule] = useState('')
  const [eLecturer, setELecturer] = useState('')
  const [eHall, setEHall] = useState('')
  const [eDate, setEDate] = useState('')
  const [eStart, setEStart] = useState('')
  const [eEnd, setEEnd] = useState('')
  const [eCohorts, setECohorts] = useState([])

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    load()
    loadDropdowns()
  }, [])

  async function load() {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        session_id,
        module_code,
        lecturer_id,
        hall_no,
        session_date,
        start_time,
        end_time,
        users(full_name),
        session_cohorts(
          cohort_id,
          cohorts(label)
        )
      `)
      .order('session_date', { ascending: false })

    if (error) setError(error.message)
    else setRows(data)
  }

  async function loadDropdowns() {
    const [m, l, h, c] = await Promise.all([
      supabase.from('modules').select('module_code, module_name').order('module_code'),
      supabase.from('users').select('user_id, full_name').eq('role', 'lecturer').order('full_name'),
      supabase.from('halls').select('hall_no').order('hall_no'),
      supabase.from('cohorts').select('cohort_id, label').order('label'),
    ])
    setModules(m.data || [])
    setLecturers(l.data || [])
    setHalls(h.data || [])
    setCohorts(c.data || [])
  }

  function toggleCohort(id) {
    setSelectedCohorts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // toggle for the EDIT panel's cohort checkboxes
  function toggleECohort(id) {
    setECohorts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function add() {
    if (!moduleCode || !hallNo || !date || !startTime || !endTime) {
      setError('Fill module, hall, date and both times'); return
    }
    if (selectedCohorts.length === 0) {
      setError('Tick at least one cohort this session serves'); return
    }

    setBusy(true); setError('')

    const { data: ses, error: e1 } = await supabase
      .from('sessions')
      .insert({
        module_code: moduleCode,
        lecturer_id: lecturerId || null,
        hall_no: hallNo,
        session_date: date,
        start_time: startTime,
        end_time: endTime,
      })
      .select('session_id')
      .single()

    if (e1) { setBusy(false); setError(e1.message); return }

    const links = selectedCohorts.map((cid) => ({
      session_id: ses.session_id, cohort_id: cid,
    }))
    const { error: e2 } = await supabase.from('session_cohorts').insert(links)

    if (e2) {
      await supabase.from('sessions').delete().eq('session_id', ses.session_id)
      setBusy(false); setError(e2.message); return
    }

    setBusy(false)
    setModuleCode(''); setLecturerId(''); setHallNo('')
    setDate(''); setStartTime(''); setEndTime(''); setSelectedCohorts([])
    load()
  }

  function openRow(row) {
    if (openId === row.session_id) {
      setOpenId(null); setEditing(false); return
    }
    setOpenId(row.session_id)
    setEditing(false)
    // preload edit fields from this row
    setEModule(row.module_code)
    setELecturer(row.lecturer_id || '')
    setEHall(row.hall_no)
    setEDate(row.session_date)
    setEStart(row.start_time?.slice(0, 5) || '')
    setEEnd(row.end_time?.slice(0, 5) || '')
    setECohorts(row.session_cohorts.map((sc) => sc.cohort_id))
  }

  async function save(id) {
    if (eCohorts.length === 0) {
      setError('A session must serve at least one cohort'); return
    }
    setBusy(true); setError('')

    // 1) update the session row
    const { error: e1 } = await supabase
      .from('sessions')
      .update({
        module_code: eModule,
        lecturer_id: eLecturer || null,
        hall_no: eHall,
        session_date: eDate,
        start_time: eStart,
        end_time: eEnd,
      })
      .eq('session_id', id)

    if (e1) { setBusy(false); setError(e1.message); return }

    // 2) replace the cohort links: delete the old ones, insert the new set
    const { error: e2 } = await supabase
      .from('session_cohorts')
      .delete()
      .eq('session_id', id)

    if (e2) { setBusy(false); setError(e2.message); return }

    const links = eCohorts.map((cid) => ({ session_id: id, cohort_id: cid }))
    const { error: e3 } = await supabase.from('session_cohorts').insert(links)

    if (e3) { setBusy(false); setError(e3.message); return }

    setBusy(false); setEditing(false); setOpenId(null); load()
  }

  async function remove(id) {
    const { error } = await supabase.from('sessions').delete().eq('session_id', id)
    if (error) { setError(error.message); return }
    setOpenId(null); load()
  }

  const visibleRows = rows.filter((row) => {
    if (fModule   && row.module_code  !== fModule)   return false
    if (fHall     && row.hall_no      !== fHall)     return false
    if (fLecturer && row.lecturer_id  !== fLecturer) return false
    if (fDate     && row.session_date !== fDate)     return false
    if (fTime) {
      const s = row.start_time?.slice(0, 5)
      const e = row.end_time?.slice(0, 5)
      if (!(s <= fTime && fTime <= e)) return false
    }
    if (fCohort) {
      const serves = row.session_cohorts.some((sc) => sc.cohort_id === Number(fCohort))
      if (!serves) return false
    }
    return true
  })

  function clearFilters() {
    setFModule(''); setFLecturer(''); setFHall('')
    setFCohort(''); setFDate(''); setFTime('')
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* add form */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <select value={moduleCode} onChange={(e) => setModuleCode(e.target.value)}>
          <option value="">— module —</option>
          {modules.map((m) => (
            <option key={m.module_code} value={m.module_code}>
              {m.module_code} — {m.module_name}
            </option>
          ))}
        </select>

        <select value={lecturerId} onChange={(e) => setLecturerId(e.target.value)}>
          <option value="">— lecturer —</option>
          {lecturers.map((l) => (
            <option key={l.user_id} value={l.user_id}>{l.full_name}</option>
          ))}
        </select>

        <select value={hallNo} onChange={(e) => setHallNo(e.target.value)}>
          <option value="">— hall —</option>
          {halls.map((h) => (
            <option key={h.hall_no} value={h.hall_no}>{h.hall_no}</option>
          ))}
        </select>

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 13, marginBottom: 4 }}>Cohorts this session serves:</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {cohorts.map((c) => (
            <label key={c.cohort_id} style={{ fontSize: 14 }}>
              <input
                type="checkbox"
                checked={selectedCohorts.includes(c.cohort_id)}
                onChange={() => toggleCohort(c.cohort_id)}
              />{' '}
              {c.label}
            </label>
          ))}
        </div>
      </div>

      <button onClick={add} disabled={busy}>
        {busy ? 'Saving...' : 'Add session'}
      </button>

      {/* filter bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
                    marginTop: 20, marginBottom: 8 }}>
        <strong style={{ marginRight: 4 }}>Filter:</strong>
        <select value={fModule} onChange={(e) => setFModule(e.target.value)}>
          <option value="">All modules</option>
          {modules.map((m) => (
            <option key={m.module_code} value={m.module_code}>{m.module_code}</option>
          ))}
        </select>
        <select value={fLecturer} onChange={(e) => setFLecturer(e.target.value)}>
          <option value="">All lecturers</option>
          {lecturers.map((l) => (
            <option key={l.user_id} value={l.user_id}>{l.full_name}</option>
          ))}
        </select>
        <select value={fHall} onChange={(e) => setFHall(e.target.value)}>
          <option value="">All halls</option>
          {halls.map((h) => (
            <option key={h.hall_no} value={h.hall_no}>{h.hall_no}</option>
          ))}
        </select>
        <select value={fCohort} onChange={(e) => setFCohort(e.target.value)}>
          <option value="">All cohorts</option>
          {cohorts.map((c) => (
            <option key={c.cohort_id} value={c.cohort_id}>{c.label}</option>
          ))}
        </select>
        <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
        <input type="time" value={fTime} onChange={(e) => setFTime(e.target.value)} />
        <button className="btn-ghost" onClick={clearFilters}>Clear</button>
        <span style={{ color: 'var(--olive)', fontSize: 14 }}>
          {visibleRows.length} of {rows.length}
        </span>
      </div>

      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th>Date</th><th>Time</th><th>Module</th>
            <th>Hall</th><th>Lecturer</th><th>Serves Cohorts</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <SessionRow
              key={row.session_id}
              row={row}
              isOpen={openId === row.session_id}
              editing={editing}
              busy={busy}
              modules={modules} lecturers={lecturers} halls={halls} cohorts={cohorts}
              onOpen={() => openRow(row)}
              onStartEdit={() => setEditing(true)}
              onCancel={() => setEditing(false)}
              onSave={() => save(row.session_id)}
              onDelete={() => remove(row.session_id)}
              eModule={eModule} setEModule={setEModule}
              eLecturer={eLecturer} setELecturer={setELecturer}
              eHall={eHall} setEHall={setEHall}
              eDate={eDate} setEDate={setEDate}
              eStart={eStart} setEStart={setEStart}
              eEnd={eEnd} setEEnd={setEEnd}
              eCohorts={eCohorts} toggleECohort={toggleECohort}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SessionRow({
  row, isOpen, editing, busy,
  modules, lecturers, halls, cohorts,
  onOpen, onStartEdit, onCancel, onSave, onDelete,
  eModule, setEModule, eLecturer, setELecturer, eHall, setEHall,
  eDate, setEDate, eStart, setEStart, eEnd, setEEnd, eCohorts, toggleECohort,
}) {
  const cohortLabels = row.session_cohorts.map((sc) => sc.cohorts?.label).join(', ') || '—'

  return (
    <>
      <tr onClick={onOpen}
          style={{ cursor: 'pointer',
                   background: isOpen ? 'rgba(174, 181, 157, 0.18)' : 'transparent' }}>
        <td>{row.session_date}</td>
        <td>{row.start_time?.slice(0, 5)} - {row.end_time?.slice(0, 5)}</td>
        <td>{row.module_code}</td>
        <td>{row.hall_no}</td>
        <td>{row.users?.full_name || '—'}</td>
        <td>{cohortLabels}</td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={6} style={{ background: '#f6f4ec' }}>
            {!editing ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>
                  <strong>{row.module_code}</strong> in {row.hall_no} ·
                  {' '}{row.session_date} {row.start_time?.slice(0, 5)}–{row.end_time?.slice(0, 5)} ·
                  {' '}serves {cohortLabels}
                </span>
                <button onClick={onStartEdit}>Edit</button>
                <button className="btn-danger" onClick={onDelete}>Delete</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <select value={eModule} onChange={(e) => setEModule(e.target.value)}>
                    {modules.map((m) => (
                      <option key={m.module_code} value={m.module_code}>{m.module_code}</option>
                    ))}
                  </select>
                  <select value={eLecturer} onChange={(e) => setELecturer(e.target.value)}>
                    <option value="">— lecturer —</option>
                    {lecturers.map((l) => (
                      <option key={l.user_id} value={l.user_id}>{l.full_name}</option>
                    ))}
                  </select>
                  <select value={eHall} onChange={(e) => setEHall(e.target.value)}>
                    {halls.map((h) => (
                      <option key={h.hall_no} value={h.hall_no}>{h.hall_no}</option>
                    ))}
                  </select>
                  <input type="date" value={eDate} onChange={(e) => setEDate(e.target.value)} />
                  <input type="time" value={eStart} onChange={(e) => setEStart(e.target.value)} />
                  <input type="time" value={eEnd} onChange={(e) => setEEnd(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {cohorts.map((c) => (
                    <label key={c.cohort_id} style={{ fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={eCohorts.includes(c.cohort_id)}
                        onChange={() => toggleECohort(c.cohort_id)}
                      />{' '}
                      {c.label}
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={onSave} disabled={busy}>
                    {busy ? 'Saving...' : 'Save'}
                  </button>
                  <button className="btn-ghost" onClick={onCancel}>Cancel</button>
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}