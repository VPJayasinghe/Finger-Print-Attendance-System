import {
  useState,
  useEffect
} from 'react'

import { supabase } from '../../supabaseClient'

export default function Halls() {
  const [rows, setRows] = useState([])

  const [hallNo, setHallNo] = useState('')
  const [capacity, setCapacity] = useState('')

  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data, error } = await supabase
      .from('halls')
      .select('*')
      .order('hall_no')

    if (error) {
      setError(error.message)
    } else {
      setRows(data)
    }
  }

  async function add() {
    if (!hallNo.trim()) {
      return
    }

    const { error } = await supabase
      .from('halls')
      .insert({
        hall_no: hallNo.trim(),
        capacity: capacity
          ? Number(capacity)
          : null
      })

    if (error) {
      setError(error.message)
      return
    }

    setHallNo('')
    setCapacity('')

    load()
  }

  async function remove(hallNumber) {
    const { error } = await supabase
      .from('halls')
      .delete()
      .eq('hall_no', hallNumber)

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
          placeholder="Hall No (e.g. A101)"
          value={hallNo}
          onChange={(e) =>
            setHallNo(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) =>
            setCapacity(e.target.value)
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
            <th>Hall</th>
            <th>Capacity</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.hall_no}>
              <td>{row.hall_no}</td>

              <td>
                {row.capacity || '—'}
              </td>

              <td>
                <button
                  onClick={() =>
                    remove(row.hall_no)
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