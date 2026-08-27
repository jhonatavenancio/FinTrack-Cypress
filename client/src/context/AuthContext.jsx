import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('fintrack_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user ?? data)
    } catch {
      localStorage.removeItem('fintrack_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('fintrack_token', data.token)
    await loadMe()
  }

  async function register(name, email, password) {
    await api.post('/auth/register', { name, email, password })
    await login(email, password)
  }

  function logout() {
    localStorage.removeItem('fintrack_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
