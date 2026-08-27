import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-lg shadow-brand-600/20">
            F
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Entrar no FinTrack</h1>
          <p className="mt-1 text-sm text-slate-500">Controle suas finanças com clareza.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4" data-testid="login-form">
          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              type="email"
              required
              data-testid="login-email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="voce@email.com"
            />
          </div>
          <div>
            <label className="label">Senha</label>
            <input
              className="input"
              type="password"
              required
              data-testid="login-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" data-testid="login-error">
              {error}
            </p>
          )}

          <button className="btn-primary w-full" data-testid="login-submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Não tem conta?{' '}
          <Link to="/registro" className="font-medium text-brand-600 hover:underline">
            Criar conta
          </Link>
        </p>

        <p className="mt-6 rounded-lg bg-white/60 p-3 text-center text-xs text-slate-400">
          Demo: <span className="font-mono">demo@fintrack.local</span> / <span className="font-mono">Demo1234!</span>
        </p>
      </div>
    </div>
  )
}
