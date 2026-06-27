import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Students() {
  const [rows, setRows] = useState([])
  const [cohorts, setCohorts] = useState([])

  const [studentId, setStudentId] = useState('')
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [cohortId, setCohortId] = useState('')

  const [error, setError] = useState('')

  useEffect(() => {
    load()
    loadCohorts()
  }, [])

  async function load() {
    const { data, error } = await supabase
      .from('students')
      .select(
        'student_id, full_name, dob, cohort_id, auth_user_id, cohorts(label)'
      )
      .order('student_id')

    if (error) {
      setError(error.message)
    } else {
      setRows(data)
    }
  }

  async function loadCohorts() {
    const { data } = await supabase
      .from('cohorts')
      .select('cohort_id, label')
      .order('label')

    setCohorts(data || [])
  }

  async function add() {
    if (!studentId.trim() || !fullName.trim()) {
      return
    }

    const { error } = await supabase
      .from('students')
      .insert({
        student_id: studentId.trim(),
        full_name: fullName.trim(),
        dob: dob || null,
        cohort_id: cohortId
          ? Number(cohortId)
          : null
      })

    if (error) {
      setError(error.message)
      return
    }

    setStudentId('')
    setFullName('')
    setDob('')
    setCohortId('')

    load()
  }

  async function remove(id) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('student_id', id)

    if (error) {
      setError(error.message)
      return
    }

    load()
  }

  async function createLogin(studentId) {

  const email = prompt(
    "Student email:"
  )

  if (!email) return

  const password = prompt(
    "Initial password:"
  )

  if (!password) return

  const { data, error } =
    await supabase.functions.invoke(
      "create-account",
      {
        body: {
          role: "student",
          student_id: studentId,
          email: email.trim(),
          password,
        },
      }
    )

  if (error) {
    setError(error.message)
    return
  }

  if (!data.ok) {
    setError(data.error)
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
          marginBottom: 12,
          flexWrap: 'wrap'
        }}
      >
        <input
          placeholder="Student ID (e.g. 12345)"
          value={studentId}
          onChange={(e) =>
            setStudentId(e.target.value)
          }
        />

        <input
          placeholder="Full name"
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
        />

        <input
          type="date"
          value={dob}
          onChange={(e) =>
            setDob(e.target.value)
          }
        />

        <select
          value={cohortId}
          onChange={(e) =>
            setCohortId(e.target.value)
          }
        >
          <option value="">
            — cohort —
          </option>

          {cohorts.map((cohort) => (
            <option
              key={cohort.cohort_id}
              value={cohort.cohort_id}
            >
              {cohort.label}
            </option>
          ))}
        </select>

        <button onClick={add}>
          Add
        </button>
      </div>

      <table
        border="1"
        cellPadding="6"
        style={{
          borderCollapse: 'collapse'
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>DOB</th>
            <th>Cohort</th>
            <th>Login</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.student_id}>
              <td>{row.student_id}</td>

              <td>{row.full_name}</td>

              <td>{row.dob || '—'}</td>

              <td>
                {row.cohorts?.label || '—'}
              </td>
              <td>

              {
              row.auth_user_id

              ?

              <span>
              ✓ Has Login
              </span>

              :

              <button
              onClick={() =>
              createLogin(row.student_id)
              }
              >
              Create Login
              </button>

              }

              </td>
              <td>
                <button
                  onClick={() =>
                    remove(row.student_id)
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