import { useEffect, useState } from 'react'
import './App.css'

interface Guest {
  invitedName: string
  confirmed: boolean | null
}

const API_URL = 'https://one5anos-camilly.onrender.com/invited'

function StatCard({ label, value, type }: { label: string; value: number; type: 'confirmed' | 'declined' | 'pending' }) {
  return (
    <div className={`stat-card stat-card--${type}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function GuestCard({ guest }: { guest: Guest }) {
  const status =
    guest.confirmed === true
      ? 'confirmed'
      : guest.confirmed === false
      ? 'declined'
      : 'pending'

  const statusLabel =
    status === 'confirmed'
      ? '✓ Confirmado'
      : status === 'declined'
      ? '✗ Não vai'
      : '⏳ Aguardando'

  const initials = guest.invitedName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className={`guest-card guest-card--${status}`}>
      <div className={`guest-avatar guest-avatar--${status}`}>
        {initials}
      </div>
      <div className="guest-info">
        <span className="guest-name">{guest.invitedName}</span>
        <span className={`guest-status guest-status--${status}`}>{statusLabel}</span>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="guest-card guest-card--skeleton">
      <div className="skeleton skeleton-avatar" />
      <div className="guest-info">
        <div className="skeleton skeleton-name" />
        <div className="skeleton skeleton-status" />
      </div>
    </div>
  )
}

export default function App() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all')

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setGuests(Array.isArray(data) ? data : [data])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const confirmed = guests.filter((g) => g.confirmed === true).length
  const declined = guests.filter((g) => g.confirmed === false).length
  const pending = guests.filter((g) => g.confirmed === null).length

  const filtered = guests.filter((g) => {
    if (filter === 'confirmed') return g.confirmed === true
    if (filter === 'declined') return g.confirmed === false
    if (filter === 'pending') return g.confirmed === null
    return true
  })

  return (
    <div className="app">
      {/* Decorative orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-badge">🎀 Lista de Convidados</div>
          <h1 className="header-title">
            15 anos da{' '}
            <span className="gradient-text">Camilly</span>
          </h1>
          <p className="header-sub">Acompanhe as confirmações em tempo real</p>
        </header>

        {/* Stats */}
        {!loading && !error && (
          <div className="stats-grid">
            <StatCard label="Confirmados" value={confirmed} type="confirmed" />
            <StatCard label="Não vão" value={declined} type="declined" />
            <StatCard label="Aguardando" value={pending} type="pending" />
          </div>
        )}

        {/* Filters */}
        {!loading && !error && guests.length > 0 && (
          <div className="filters">
            {(['all', 'confirmed', 'declined', 'pending'] as const).map((f) => (
              <button
                key={f}
                id={`filter-${f}`}
                className={`filter-btn filter-btn--${f} ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' && `Todos (${guests.length})`}
                {f === 'confirmed' && `✓ Confirmados (${confirmed})`}
                {f === 'declined' && `✗ Não vão (${declined})`}
                {f === 'pending' && `⏳ Aguardando (${pending})`}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <main className="main-content">
          {loading && (
            <div className="guests-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {error && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h2>Erro ao carregar convidados</h2>
              <p>{error}</p>
              <button
                id="retry-btn"
                className="retry-btn"
                onClick={() => {
                  setLoading(true)
                  setError(null)
                  fetch(API_URL)
                    .then((r) => r.json())
                    .then((d) => { setGuests(Array.isArray(d) ? d : [d]); setLoading(false) })
                    .catch((e) => { setError(e.message); setLoading(false) })
                }}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🎀</div>
              <p>Nenhum convidado nessa categoria ainda.</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="guests-grid">
              {filtered.map((guest, i) => (
                <GuestCard key={`${guest.invitedName}-${i}`} guest={guest} />
              ))}
            </div>
          )}
        </main>

        <footer className="footer">
          <span>🌸 Feito com amor para os 15 anos da Camilly 🌸</span>
        </footer>
      </div>
    </div>
  )
}
