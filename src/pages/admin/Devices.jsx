import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Devices() {
  const [rows, setRows] = useState([])
  const [halls, setHalls] = useState([])

  const [deviceId, setDeviceId] = useState('')
  const [label, setLabel] = useState('')
  const [hallNo, setHallNo] = useState('')

  const [error, setError] = useState('')

  useEffect(() => {
    load()
    loadHalls()
  }, [])

  async function load() {
    const { data, error } = await supabase
      .from('devices')
      .select('device_id, label, hall_no, last_seen')
      .order('device_id')

    if (error) {
      setError(error.message)
    } else {
      setRows(data)
    }
  }

  async function loadHalls() {
    const { data } = await supabase
      .from('halls')
      .select('hall_no')
      .order('hall_no')

    setHalls(data || [])
  }

  async function add() {
    if (!deviceId.trim()) return

    const { error } = await supabase
      .from('devices')
      .insert({
        device_id: deviceId.trim(),
        label: label.trim() || null,
        hall_no: hallNo || null
      })

    if (error) {
      setError(error.message)
      return
    }

    setDeviceId('')
    setLabel('')
    setHallNo('')

    load()
  }

  async function setHall(id, newHall) {
    const { error } = await supabase
      .from('devices')
      .update({
        hall_no: newHall || null
      })
      .eq('device_id', id)

    if (error) {
      setError(error.message)
      return
    }

    load()
  }

  async function remove(id) {
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('device_id', id)

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
          placeholder="Device ID (e.g. dev01)"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        />

        <input
          placeholder="Label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        <select
          value={hallNo}
          onChange={(e) => setHallNo(e.target.value)}
        >
          <option value="">— hall —</option>

          {halls.map((hall) => (
            <option
              key={hall.hall_no}
              value={hall.hall_no}
            >
              {hall.hall_no}
            </option>
          ))}
        </select>

        <button onClick={add}>
          Add device
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
            <th>Device</th>
            <th>Label</th>
            <th>Hall</th>
            <th>Last Seen</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.device_id}>
              <td>{row.device_id}</td>

              <td>{row.label || '—'}</td>

              <td>
                <select
                  value={row.hall_no || ''}
                  onChange={(e) =>
                    setHall(row.device_id, e.target.value)
                  }
                >
                  <option value="">— none —</option>

                  {halls.map((hall) => (
                    <option
                      key={hall.hall_no}
                      value={hall.hall_no}
                    >
                      {hall.hall_no}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                {row.last_seen
                  ? new Date(row.last_seen).toLocaleString()
                  : '—'}
              </td>

              <td>
                <button
                  onClick={() => remove(row.device_id)}
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