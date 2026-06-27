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

  useEffect(() => {
    load()
    loadBatches()
  }, [])

  async function load() {
    const { data, error } = await supabase
      .from('cohorts')
      .select('cohort_id, label, batch_code, pathway, program')
      .order('label')

    if (error) {
      setError(error.message)
    } else {
      setRows(data)
    }
  }

  async function loadBatches() {
    const { data } = await supabase
      .from('batches')
      .select('batch_code')
      .order('batch_code')

    setBatches(data || [])
  }

  async function add() {
    if (!label.trim()) {
      return
    }

    const { error } = await supabase
      .from('cohorts')
      .insert({
        label: label.trim(),
        batch_code: batchCode || null,
        pathway: pathway || null,
        program: program || null
      })

    if (error) {
      setError(error.message)
      return
    }

    setLabel('')
    setBatchCode('')
    setPathway('')
    setProgram('')

    load()
  }

  async function remove(id) {
    const { error } = await supabase
      .from('cohorts')
      .delete()
      .eq('cohort_id', id)

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
          placeholder="Label (e.g. 25.1 PLY SE)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        <select
          value={batchCode}
          onChange={(e) => setBatchCode(e.target.value)}
        >
          <option value="">— batch —</option>

          {batches.map((batch) => (
            <option
              key={batch.batch_code}
              value={batch.batch_code}
            >
              {batch.batch_code}
            </option>
          ))}
        </select>

        <select
          value={pathway}
          onChange={(e) => setPathway(e.target.value)}
        >
          <option value="">— pathway —</option>

          {PATHWAYS.map((path) => (
            <option
              key={path}
              value={path}
            >
              {path}
            </option>
          ))}
        </select>

        <select
          value={program}
          onChange={(e) => setProgram(e.target.value)}
        >
          <option value="">— program —</option>

          {PROGRAMS.map((prog) => (
            <option
              key={prog}
              value={prog}
            >
              {prog}
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
            <th>Label</th>
            <th>Batch</th>
            <th>Pathway</th>
            <th>Program</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.cohort_id}>
              <td>{row.label}</td>

              <td>{row.batch_code || '—'}</td>

              <td>{row.pathway || '—'}</td>

              <td>{row.program || '—'}</td>

              <td>
                <button
                  onClick={() =>
                    remove(row.cohort_id)
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