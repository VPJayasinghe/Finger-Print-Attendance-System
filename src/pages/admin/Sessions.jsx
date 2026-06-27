import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Sessions() {
  const [rows, setRows] = useState([])

  const [modules, setModules] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [halls, setHalls] = useState([])
  const [cohorts, setCohorts] = useState([])

  const [moduleCode, setModuleCode] = useState('')
  const [lecturerId, setLecturerId] = useState('')
  const [hallNo, setHallNo] = useState('')

  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const [selectedCohorts, setSelectedCohorts] = useState([])

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
      .order('session_date', {
        ascending: false
      })

    if (error) {
      setError(error.message)
    } else {
      setRows(data)
    }
  }

  async function loadDropdowns() {
    const [m, l, h, c] = await Promise.all([
      supabase
        .from('modules')
        .select('module_code, module_name')
        .order('module_code'),

      supabase
        .from('users')
        .select('user_id, full_name')
        .eq('role', 'lecturer')
        .order('full_name'),

      supabase
        .from('halls')
        .select('hall_no')
        .order('hall_no'),

      supabase
        .from('cohorts')
        .select('cohort_id, label')
        .order('label')
    ])

    setModules(m.data || [])
    setLecturers(l.data || [])
    setHalls(h.data || [])
    setCohorts(c.data || [])
  }

  function toggleCohort(id) {
    setSelectedCohorts((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  async function add() {
    if (
      !moduleCode ||
      !hallNo ||
      !date ||
      !startTime ||
      !endTime
    ) {
      setError(
        'Fill module, hall, date and both times'
      )
      return
    }

    if (selectedCohorts.length === 0) {
      setError(
        'Tick at least one cohort this session serves'
      )
      return
    }

    setBusy(true)
    setError('')

    const {
      data: ses,
      error: e1
    } = await supabase
      .from('sessions')
      .insert({
        module_code: moduleCode,
        lecturer_id: lecturerId || null,
        hall_no: hallNo,
        session_date: date,
        start_time: startTime,
        end_time: endTime
      })
      .select('session_id')
      .single()

    if (e1) {
      setBusy(false)
      setError(e1.message)
      return
    }

    const links = selectedCohorts.map(
      (cid) => ({
        session_id: ses.session_id,
        cohort_id: cid
      })
    )

    const { error: e2 } =
      await supabase
        .from('session_cohorts')
        .insert(links)

    if (e2) {
      await supabase
        .from('sessions')
        .delete()
        .eq(
          'session_id',
          ses.session_id
        )

      setBusy(false)
      setError(e2.message)
      return
    }

    setBusy(false)

    setModuleCode('')
    setLecturerId('')
    setHallNo('')
    setDate('')
    setStartTime('')
    setEndTime('')
    setSelectedCohorts([])

    load()
  }

  async function remove(id) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('session_id', id)

    if (error) {
      setError(error.message)
      return
    }

    load()
  }
    return (
    <div>
      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 8,
          flexWrap: 'wrap'
        }}
      >
        <select
          value={moduleCode}
          onChange={(e) =>
            setModuleCode(e.target.value)
          }
        >
          <option value="">
            — module —
          </option>

          {modules.map((module) => (
            <option
              key={module.module_code}
              value={module.module_code}
            >
              {module.module_code} — {module.module_name}
            </option>
          ))}
        </select>

        <select
          value={lecturerId}
          onChange={(e) =>
            setLecturerId(e.target.value)
          }
        >
          <option value="">
            — lecturer —
          </option>

          {lecturers.map((lecturer) => (
            <option
              key={lecturer.user_id}
              value={lecturer.user_id}
            >
              {lecturer.full_name}
            </option>
          ))}
        </select>

        <select
          value={hallNo}
          onChange={(e) =>
            setHallNo(e.target.value)
          }
        >
          <option value="">
            — hall —
          </option>

          {halls.map((hall) => (
            <option
              key={hall.hall_no}
              value={hall.hall_no}
            >
              {hall.hall_no}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) =>
            setDate(e.target.value)
          }
        />

        <input
          type="time"
          value={startTime}
          onChange={(e) =>
            setStartTime(e.target.value)
          }
        />

        <input
          type="time"
          value={endTime}
          onChange={(e) =>
            setEndTime(e.target.value)
          }
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize: 13,
            marginBottom: 4
          }}
        >
          Cohorts this session serves:
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          {cohorts.map((cohort) => (
            <label
              key={cohort.cohort_id}
              style={{ fontSize: 14 }}
            >
              <input
                type="checkbox"
                checked={selectedCohorts.includes(
                  cohort.cohort_id
                )}
                onChange={() =>
                  toggleCohort(
                    cohort.cohort_id
                  )
                }
              />

              {' '}
              {cohort.label}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={add}
        disabled={busy}
      >
        {busy
          ? 'Saving...'
          : 'Add session'}
      </button>

      <table
        border="1"
        cellPadding="6"
        style={{
          borderCollapse: 'collapse',
          marginTop: 16
        }}
      >
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Module</th>
            <th>Hall</th>
            <th>Lecturer</th>
            <th>Serves Cohorts</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.session_id}>
              <td>{row.session_date}</td>

              <td>
                {row.start_time?.slice(0, 5)}
                {' - '}
                {row.end_time?.slice(0, 5)}
              </td>

              <td>{row.module_code}</td>

              <td>{row.hall_no}</td>

              <td>
                {row.users?.full_name || '—'}
              </td>

              <td>
                {row.session_cohorts
                  .map(
                    (sc) =>
                      sc.cohorts?.label
                  )
                  .join(', ') || '—'}
              </td>

              <td>
                <button
                  onClick={() =>
                    remove(row.session_id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}