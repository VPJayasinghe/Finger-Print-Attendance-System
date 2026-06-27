import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="lp">
      <nav className="lp-nav">
        <div className="lp-brand">
          <div className="lp-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#f6f4ec" strokeWidth="1.6"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 10a2 2 0 0 0-2 2c0 1.5.5 3 .5 4.5"/>
              <path d="M8.5 8.5A5 5 0 0 1 17 12c0 1 0 2 .2 3"/>
              <path d="M6.5 12a5.5 5.5 0 0 1 .8-3"/>
              <path d="M14.5 12c0 2 .3 4 .8 5.5"/>
              <path d="M5 15c.4 1.5.6 3 .6 4"/>
              <path d="M12 6a6 6 0 0 1 6 6c0 .7 0 1.4.1 2"/>
            </svg>
          </div>
          <div>
            <div className="lp-brand-eyebrow">University Biometric Platform</div>
            <div className="lp-brand-title">Smart Attendance</div>
          </div>
        </div>
        <div className="lp-nav-right">
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#contact">Contact</a>
          </div>
          <Link className="lp-btn" to="/login">Admin Login</Link>
        </div>
      </nav>

      <header className="lp-section lp-hero">
        <div className="lp-eyebrow">University Biometric Platform</div>
        <h1>Smart University Attendance System</h1>
        <p>Fingerprint-verified attendance for every class, synced to the cloud
           and visible the moment a student scans in.</p>
        <div className="lp-cta-row">
          <Link className="lp-btn" to="/login">Admin Login</Link>
          <a className="lp-btn lp-btn-ghost" href="#features">See features</a>
        </div>
      </header>

      <section id="features" className="lp-features">
        <div className="lp-section">
          <div className="lp-eyebrow">Features</div>
          <h2 className="lp-section-title">Everything attendance needs, in one place</h2>
          <div className="lp-grid">
            <div className="lp-card">
              <div className="lp-card-icon">🔒</div>
              <h3>Fingerprint verification</h3>
              <p>Every mark is a live 1:1 fingerprint match on the device — no proxy attendance.</p>
            </div>
            <div className="lp-card">
              <div className="lp-card-icon">👥</div>
              <h3>Cohort-aware sessions</h3>
              <p>One session can serve many cohorts at once; eligibility is worked out automatically.</p>
            </div>
            <div className="lp-card">
              <div className="lp-card-icon">🗂️</div>
              <h3>Role-based dashboards</h3>
              <p>Separate, secure views for super admins, admins, lecturers, and students.</p>
            </div>
            <div className="lp-card">
              <div className="lp-card-icon">⚡</div>
              <h3>Real-time records</h3>
              <p>Scans reach the cloud instantly, so attendance appears as it happens.</p>
            </div>
            <div className="lp-card">
              <div className="lp-card-icon">📊</div>
              <h3>Per-module analytics</h3>
              <p>Attendance percentages by module and match-score distributions for review.</p>
            </div>
            <div className="lp-card">
              <div className="lp-card-icon">🛡️</div>
              <h3>Secure by design</h3>
              <p>Devices talk to the cloud over HTTPS, with row-level security guarding every table.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="lp-section">
        <div className="lp-eyebrow">How it works</div>
        <h2 className="lp-section-title">Scan, sync, see</h2>
        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-num">STEP 1</div>
            <h3>Scan</h3>
            <p>A student places their finger on the device, which matches it against their stored template.</p>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">STEP 2</div>
            <h3>Sync</h3>
            <p>The device sends the result to the cloud, where the server checks eligibility and records it.</p>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">STEP 3</div>
            <h3>See</h3>
            <p>Lecturers, students, and admins see attendance and analytics in their own dashboards.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="lp-section lp-contact">
        <div className="lp-eyebrow">Contact</div>
        <h2 className="lp-section-title">Questions about the system?</h2>
        <p>Get in touch and we'll be glad to help.</p>
        <a className="lp-btn" href="mailto:you@nsbm.lk">Email us</a>
      </section>

      <footer className="lp-footer">
        Smart University Attendance System · Built at NSBM Green University · © 2026
      </footer>
    </div>
  )
}