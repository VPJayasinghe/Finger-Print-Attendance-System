import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import Faculties from './admin/Faculties'
import Modules from './admin/Modules'
import Batches from './admin/Batches'
import Halls from './admin/Halls'
import Cohorts from './admin/Cohorts'
import Students from './admin/Students'
import Lecturers from './admin/Lecturers'
import Sessions from './admin/Sessions'
import Devices from './admin/Devices'
import Attendance from './admin/Attendance'
import Analytics from './admin/Analytics'


const SECTIONS = [
  'Faculties', 'Batches', 'Cohorts', 'Modules', 'Halls',
  'Students', 'Lecturers', 'Sessions', 'Devices', 'Attendance', 'Analytics'
]

const VIEWS = {
  Faculties: <Faculties />,
  Batches: <Batches />,
  Cohorts: <Cohorts />,
  Modules: <Modules />,
  Halls: <Halls />,
  Students: <Students />,
  Lecturers: <Lecturers />,
  Devices: <Devices />,
  Attendance: <Attendance />,
  Analytics: <Analytics />,
  Sessions: <Sessions />
}

export default function AdminDashboard({ profile }) {
  const [section, setSection] = useState('Faculties')
  return (
    <DashboardLayout name={profile.full_name} role={profile.role}>
      <div style={{ display: 'flex', gap: 20 }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140 }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setSection(s)}>{s}</button>
          ))}
        </nav>
        <div style={{ flex: 1 }}>
          <h2>{section}</h2>
          {VIEWS[section] || <p>Coming soon.</p>}
        </div>
      </div>
    </DashboardLayout>
  )
}