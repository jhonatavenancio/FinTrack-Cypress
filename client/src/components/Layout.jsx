import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/transacoes', label: 'Transações', icon: '💸' },
  { to: '/categorias', label: 'Categorias', icon: '🏷️' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-100 bg-white px-4 py-6 sm:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            F
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">FinTrack</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              data-testid={`nav-${link.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="truncate px-3 text-sm font-medium text-slate-700">{user?.name}</p>
          <p className="truncate px-3 text-xs text-slate-400">{user?.email}</p>
          <button
            onClick={logout}
            data-testid="logout-btn"
            className="mt-3 w-full px-3 text-left text-sm text-slate-500 hover:text-red-600"
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 sm:hidden">
          <span className="text-lg font-bold text-brand-700">FinTrack</span>
          <button onClick={logout} className="text-sm text-slate-500">Sair</button>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
