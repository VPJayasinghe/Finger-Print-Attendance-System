import { useState } from 'react'

import Shell from '../components/Shell'

import Faculties from './admin/Faculties'
import Batches from './admin/Batches'
import Cohorts from './admin/Cohorts'
import Halls from './admin/Halls'
import Modules from './admin/Modules'
import Lecturers from './admin/Lecturers'
import Students from './admin/Students'
import Sessions from './admin/Sessions'
import Devices from './admin/Devices'
import Attendance from './admin/Attendance'
import Analytics from './admin/Analytics'

const GROUPS = [
  {
    label: 'Foundation setup',
    items: [
      'Faculties',
      'Batches',
      'Cohorts',
      'Halls',
    ],
  },
  {
    label: 'Academic flow',
    items: [
      'Modules',
      'Lecturers',
      'Students',
      'Sessions',
      'Devices',
    ],
  },
  {
    label: 'Operations',
    items: [
      'Attendance',
      'Analytics',
    ],
  },
]

export default function AdminDashboard() {
  const [section, setSection] = useState('Faculties')

  const VIEWS = {
    Faculties: <Faculties />,
    Batches: <Batches />,
    Cohorts: <Cohorts />,
    Halls: <Halls />,
    Modules: <Modules />,
    Lecturers: <Lecturers />,
    Students: <Students />,
    Sessions: <Sessions />,
    Devices: <Devices />,
    Attendance: <Attendance />,
    Analytics: <Analytics />,
  }

  return (
    <Shell
      groups={GROUPS}
      active={section}
      onSelect={setSection}
      eyebrow="Admin workspace"
      title={section}
      subtitle="Manage your attendance system"
    >
      <div className="screen">
        {VIEWS[section] || (
          <p>{section}: coming soon.</p>
        )}
      </div>
    </Shell>
  )
}