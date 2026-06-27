import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Attendance() {
  const [sessions, setSessions] = useState([])
  const [sessionId, setSessionId] = useState('')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  // Load the session list once
  useEffect(() => {
    async function loadSessions() {
      const { data, error } = await supabase
        .from('sessions')
        .select(
          'session_id, module_code, hall_no, session_date, start_time, end_time'
        )
        .order('session_date', {
          ascending: false
        })

      if (error) {
        setError(error.message)
      } else {
        setSessions(data)
      }
    }

    loadSessions()
  }, [])

  // Load attendance whenever a session is selected
  useEffect(() => {
    if (!sessionId) {
      setRows([])
      return
    }

    async function loadAttendance() {
      const { data, error } = await supabase
        .from('attendance')
        .select(
          'attendance_id, student_id, match_score, marked_at, students(full_name, cohorts(label))'
        )
        .eq('session_id', sessionId)
        .order('marked_at')

      if (error) {
        setError(error.message)
      } else {
        setRows(data)
      }
    }

    loadAttendance()
  }, [sessionId])

  return (
    <div>
      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      <select
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        style={{ marginBottom: 12 }}
      >
        <option value="">— pick a session —</option>

        {sessions.map((session) => (
          <option
            key={session.session_id}
            value={session.session_id}
          >
            {session.session_date}{' '}
            {session.start_time?.slice(0, 5)} ·{' '}
            {session.module_code} ·{' '}
            {session.hall_no}
          </option>
        ))}
      </select>

      {sessionId && (
        <>
          <p>
            {rows.length} student
            {rows.length === 1 ? '' : 's'} marked
            present.
          </p>

          <table
            border="1"
            cellPadding="6"
            style={{
              borderCollapse: 'collapse'
            }}
          >
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Cohort</th>
                <th>Score</th>
                <th>Marked At</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.attendance_id}>
                  <td>{row.student_id}</td>

                  <td>
                    {row.students?.full_name || '—'}
                  </td>

                  <td>
                    {row.students?.cohorts?.label ||
                      '—'}
                  </td>

                  <td>
                    {row.match_score ?? '—'}
                  </td>

                  <td>
                    {new Date(
                      row.marked_at
                    ).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}