import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { supabase } from '../../supabaseClient'

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [hist, setHist] = useState([])
  const [perDay, setPerDay] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('attendance')
        .select('match_score, marked_at')

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // scores exist only on accepted marks; some may be null
      const scores = data
        .map((d) => d.match_score)
        .filter((s) => s !== null && s !== undefined)

      const sum = scores.reduce((a, b) => a + b, 0)

      setStats({
        count: data.length,
        scored: scores.length,
        avg: scores.length ? Math.round(sum / scores.length) : 0,
        min: scores.length ? Math.min(...scores) : 0,
        max: scores.length ? Math.max(...scores) : 0,
      })

      // bucket the match scores into ranges
      const buckets = [
        { label: '<50', lo: 0, hi: 49 },
        { label: '50–99', lo: 50, hi: 99 },
        { label: '100–149', lo: 100, hi: 149 },
        { label: '150–199', lo: 150, hi: 199 },
        { label: '200+', lo: 200, hi: Infinity },
      ]

      setHist(
        buckets.map((b) => ({
          range: b.label,
          count: scores.filter((s) => s >= b.lo && s <= b.hi).length,
        }))
      )

      // group marks by day
      const byDay = {}

      data.forEach((d) => {
        const day = (d.marked_at || '').slice(0, 10)
        if (day) {
          byDay[day] = (byDay[day] || 0) + 1
        }
      })

      setPerDay(
        Object.keys(byDay)
          .sort()
          .map((day) => ({
            day,
            count: byDay[day],
          }))
      )

      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {stats && (
        <p>
          <b>{stats.count}</b> total marks · <b>{stats.scored}</b> with a score ·
          avg <b>{stats.avg}</b> · min <b>{stats.min}</b> · max{' '}
          <b>{stats.max}</b>
        </p>
      )}

      <h4>Match-score distribution (accepted matches only)</h4>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={hist}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#226e3c" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h4 style={{ marginTop: 24 }}>Scans per day</h4>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={perDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#3a8a5a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}