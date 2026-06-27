import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { supabase } from '../supabaseClient'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export default function StudentDashboard({ profile }) {
  const [perModule, setPerModule] = useState([])
  const [overall, setOverall] = useState(null)
  const [history, setHistory] = useState([])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')

      // 1. Who am I?
      const {
        data: me,
        error: e0,
      } = await supabase
        .from('students')
        .select('student_id, cohort_id')
        .eq(
          'auth_user_id',
          (await supabase.auth.getUser()).data.user.id
        )
        .single()

      if (e0 || !me) {
        setError(e0?.message || 'No student profile')
        setLoading(false)
        return
      }

      if (!me.cohort_id) {
        setError('You are not assigned to a cohort yet.')
        setLoading(false)
        return
      }

      // 2. Sessions my cohort should attend
      const today = new Date()
        .toISOString()
        .slice(0, 10)

      const {
        data: held,
        error: e1,
      } = await supabase
        .from('session_cohorts')
        .select(`
          sessions(
            session_id,
            module_code,
            session_date
          )
        `)
        .eq('cohort_id', me.cohort_id)

      if (e1) {
        setError(e1.message)
        setLoading(false)
        return
      }

      const heldSessions = held
        .map((row) => row.sessions)
        .filter(
          (session) =>
            session &&
            session.session_date <= today
        )

      // 3. Sessions I actually attended
      const {
        data: mine,
        error: e2,
      } = await supabase
        .from('attendance')
        .select(`
          session_id,
          marked_at,
          sessions(
            module_code,
            session_date
          )
        `)
        .eq('student_id', me.student_id)

      if (e2) {
        setError(e2.message)
        setLoading(false)
        return
      }

      const attendedIds = new Set(
        mine.map((attendance) => attendance.session_id)
      )

      // 4. Count attendance per module
      const byModule = {}

      heldSessions.forEach((session) => {
        const module = session.module_code

        if (!byModule[module]) {
          byModule[module] = {
            held: 0,
            attended: 0,
          }
        }

        byModule[module].held++

        if (attendedIds.has(session.session_id)) {
          byModule[module].attended++
        }
      })

      // 5. Convert counts into chart rows
      const moduleRows = Object.keys(byModule)
        .sort()
        .map((module) => ({
          module,
          held: byModule[module].held,
          attended: byModule[module].attended,
          pct: Math.round(
            (100 * byModule[module].attended) /
              byModule[module].held
          ),
        }))

      setPerModule(moduleRows)

      // 6. Overall attendance
      const totalHeld = heldSessions.length

      const totalAttended = heldSessions.filter(
        (session) =>
          attendedIds.has(session.session_id)
      ).length

      setOverall(
        totalHeld
          ? Math.round(
              (100 * totalAttended) / totalHeld
            )
          : null
      )

      // 7. Attendance history
      setHistory(
        mine
          .map((attendance) => ({
            module:
              attendance.sessions?.module_code ||
              '—',
            date:
              attendance.sessions?.session_date ||
              '',
            marked: attendance.marked_at,
          }))
          .sort(
            (a, b) =>
              new Date(b.marked) -
              new Date(a.marked)
          )
      )

      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <DashboardLayout
        name={profile.full_name}
        role={profile.role}
      >
        <p>Loading...</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      name={profile.full_name}
      role={profile.role}
    >
      <h2>My Attendance</h2>

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {overall !== null && (
        <p style={{ fontSize: 22 }}>
          Overall: <strong>{overall}%</strong>
        </p>
      )}

      {perModule.length > 0 && (
        <div
          style={{
            width: '100%',
            height: 280,
          }}
        >
          <ResponsiveContainer>
            <BarChart data={perModule}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="module" />

              <YAxis domain={[0, 100]} />

              <Tooltip />

              <Bar
                dataKey="pct"
                fill="#226e3c"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {perModule.length > 0 && (
        <table
          border="1"
          cellPadding="6"
          style={{
            borderCollapse: 'collapse',
            marginTop: 12,
          }}
        >
          <thead>
            <tr>
              <th>Module</th>
              <th>Attended</th>
              <th>Held</th>
              <th>%</th>
            </tr>
          </thead>

          <tbody>
            {perModule.map((row) => (
              <tr key={row.module}>
                <td>{row.module}</td>
                <td>{row.attended}</td>
                <td>{row.held}</td>
                <td>{row.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: 20 }}>
        History
      </h3>

      {history.length === 0 ? (
        <p>No attendance recorded yet.</p>
      ) : (
        <table
          border="1"
          cellPadding="6"
          style={{
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th>Module</th>
              <th>Session Date</th>
              <th>Marked At</th>
            </tr>
          </thead>

          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td>{item.module}</td>
                <td>{item.date}</td>
                <td>
                  {new Date(
                    item.marked
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  )
}