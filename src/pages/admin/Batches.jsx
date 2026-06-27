import {
  useState,
  useEffect
} from 'react'

import { supabase } from '../../supabaseClient'

export default function Batches() {
  const [rows, setRows] = useState([])

  const [code, setCode] = useState('')
  const [year, setYear] = useState('')
  const [desc, setDesc] = useState('')

  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('batch_code')

    if (error) {
      setError(error.message)
    } else {
      setRows(data)
    }
  }

  async function add() {
    if (!code.trim()) {
      return
    }

    const { error } = await supabase
      .from('batches')
      .insert({
        batch_code: code.trim(),
        intake_year: year
          ? Number(year)
          : null,
        description: desc.trim() || null
      })

    if (error) {
      setError(error.message)
      return
    }

    setCode('')
    setYear('')
    setDesc('')

    load()
  }

  async function remove(batchCode) {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('batch_code', batchCode)

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
          marginBottom: 12,
          flexWrap: 'wrap'
        }}
      >
        <input
          placeholder="Batch code (e.g. 25.1)"
          value={code}
          onChange={(e) =>
            setCode(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Intake year"
          value={year}
          onChange={(e) =>
            setYear(e.target.value)
          }
        />

        <input
          placeholder="Description (optional)"
          value={desc}
          onChange={(e) =>
            setDesc(e.target.value)
          }
        />

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
            <th>Code</th>
            <th>Intake Year</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.batch_code}>
              <td>{row.batch_code}</td>

              <td>
                {row.intake_year || '—'}
              </td>

              <td>
                {row.description || '—'}
              </td>

              <td>
                <button
                  onClick={() =>
                    remove(row.batch_code)
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