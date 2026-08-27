import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível criar a conta.')
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
          <h1 className="text-2xl font-bold text-slate-900">Criar conta</h1>
          <p className="mt-1 text-sm text-slate-500">Leva menos de um minuto.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4" data-testid="register-form">
          <div>
            <label className="label">Nome</label>
            <input
              className="input"
              required
              data-testid="register-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              type="email"
              required
              data-testid="register-email"
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
              minLength={8}
              data-testid="register-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 8 caracteres, letra + número"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" data-testid="register-error">
              {error}
            </p>
          )}

          <button className="btn-primary w-full" data-testid="register-submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
