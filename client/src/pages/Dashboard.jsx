import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import api from '../api/client'

function formatBRL(value) {
  return Number(value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [byCategory, setByCategory] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: summaryData }, { data: byCategoryData }, { data: txData }] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/by-category'),
        api.get('/transactions'),
      ])
      setSummary(summaryData)
      setByCategory(byCategoryData.categories ?? byCategoryData)
      setTransactions(txData.transactions ?? txData)
      setLoading(false)
    }
    load()
  }, [])

  const monthlyTrend = useMemo(() => {
    const buckets = {}
    for (const tx of transactions) {
      const month = tx.occurred_at?.slice(0, 7)
      if (!month) continue
      buckets[month] ??= { month, income: 0, expense: 0 }
      const category = byCategory.find((c) => c.category_id === tx.category_id)
      const isIncome = tx.type === 'income' || category?.type === 'income'
      buckets[month][isIncome ? 'income' : 'expense'] += Number(tx.amount)
    }
    return Object.values(buckets).sort((a, b) => a.month.localeCompare(b.month))
  }, [transactions, byCategory])

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-400">Carregando dashboard...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Visão geral das suas finanças.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3" data-testid="summary-cards">
        <div data-testid="balance-card">
          <StatCard
            label="Saldo"
            value={formatBRL(summary?.balance)}
            tone={summary?.balance >= 0 ? 'positive' : 'negative'}
            icon="💰"
          />
        </div>
        <div data-testid="income-card">
          <StatCard label="Receitas" value={formatBRL(summary?.total_income)} tone="positive" icon="📈" />
        </div>
        <div data-testid="expense-card">
          <StatCard label="Despesas" value={formatBRL(summary?.total_expense)} tone="negative" icon="📉" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card" data-testid="chart-by-category">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Despesas por categoria</h2>
          {byCategory.length === 0 ? (
            <p className="text-sm text-slate-400">Sem lançamentos ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCategory} dataKey="total" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatBRL(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card" data-testid="chart-trend">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Evolução mensal</h2>
          {monthlyTrend.length === 0 ? (
            <p className="text-sm text-slate-400">Sem lançamentos ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatBRL(v)} />
                <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Layout>
  )
}
