import { supabase } from '../supabaseClient'

export default function Shell({
  groups,
  active,
  onSelect,
  eyebrow,
  title,
  subtitle,
  children,
}) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f6f4ec"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 10a2 2 0 0 0-2 2c0 1.5.5 3 .5 4.5" />
              <path d="M8.5 8.5A5 5 0 0 1 17 12c0 1 0 2 .2 3" />
              <path d="M6.5 12a5.5 5.5 0 0 1 .8-3" />
              <path d="M14.5 12c0 2 .3 4 .8 5.5" />
              <path d="M5 15c.4 1.5.6 3 .6 4" />
              <path d="M12 6a6 6 0 0 1 6 6c0 .7 0 1.4.1 2" />
            </svg>
          </div>

          <div>
            <div className="sb-brand-eyebrow">
              Coordinator Panel
            </div>

            <div className="sb-brand-title">
              Smart Attendance
            </div>
          </div>
        </div>

        {groups.map((g) => (
          <div
            className="sb-group"
            key={g.label}
          >
            <div className="sb-group-label">
              {g.label}
            </div>

            {g.items.map((item) => (
              <button
                key={item}
                className={
                  'sb-item' +
                  (active === item ? ' is-active' : '')
                }
                onClick={() => onSelect(item)}
              >
                {item}
              </button>
            ))}
          </div>
        ))}
      </aside>

      <main className="main">
        <div className="main-head">
          <div>
            {eyebrow && (
              <div className="screen-eyebrow">
                {eyebrow}
              </div>
            )}

            <h1 className="main-title">
              {title}
            </h1>

            {subtitle && (
              <div className="main-sub">
                {subtitle}
              </div>
            )}
          </div>

          <div className="head-actions">
            <button onClick={() => supabase.auth.signOut()}>
              Logout
            </button>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}