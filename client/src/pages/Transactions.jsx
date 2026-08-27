import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import CategoryBadge from '../components/CategoryBadge'
import TransactionModal from '../components/TransactionModal'
import ConfirmDialog from '../components/ConfirmDialog'
import api from '../api/client'

function formatBRL(value) {
  return Number(value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category_id: '', from: '', to: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  async function load() {
    setLoading(true)
    const params = {}
    if (filters.category_id) params.category_id = filters.category_id
    if (filters.from) params.from = filters.from
    if (filters.to) params.to = filters.to

    const [{ data: txData }, { data: catData }] = await Promise.all([
      api.get('/transactions', { params }),
      api.get('/categories'),
    ])
    setTransactions(txData.transactions ?? txData)
    setCategories(catData.categories ?? catData)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  function categoryFor(id) {
    return categories.find((c) => c.id === id)
  }

  async function handleSubmit(form) {
    if (editing) {
      await api.put(`/transactions/${editing.id}`, form)
    } else {
      await api.post('/transactions', form)
    }
    setModalOpen(false)
    setEditing(null)
    await load()
  }

  async function handleDelete() {
    await api.delete(`/transactions/${toDelete.id}`)
    setToDelete(null)
    await load()
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transações</h1>
          <p className="mt-1 text-sm text-slate-500">Todos os seus lançamentos.</p>
        </div>
        <button
          className="btn-primary"
          data-testid="add-transaction-btn"
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          + Nova transação
        </button>
      </div>

      <div className="card mt-6 flex flex-wrap gap-3" data-testid="transaction-filters">
        <select
          className="input max-w-[220px]"
          data-testid="filter-category"
          value={filters.category_id}
          onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          className="input max-w-[160px]"
          data-testid="filter-from"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />
        <input
          type="date"
          className="input max-w-[160px]"
          data-testid="filter-to"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />
      </div>

      <div className="card mt-4 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-slate-400">Carregando...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma transação encontrada.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2">Data</th>
                <th className="py-2">Categoria</th>
                <th className="py-2">Descrição</th>
                <th className="py-2 text-right">Valor</th>
                <th className="py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const category = categoryFor(tx.category_id)
                const isIncome = category?.type === 'income'
                return (
                  <tr key={tx.id} data-testid="transaction-row" className="border-b border-slate-50 last:border-0">
                    <td className="py-3 text-slate-500">{tx.occurred_at}</td>
                    <td className="py-3">
                      {category && <CategoryBadge name={category.name} color={category.color} />}
                    </td>
                    <td className="py-3 text-slate-700">{tx.description || '—'}</td>
                    <td className={`py-3 text-right font-medium ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'} {formatBRL(tx.amount)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        className="mr-3 text-sm font-medium text-brand-600 hover:underline"
                        data-testid="edit-transaction-btn"
                        onClick={() => {
                          setEditing(tx)
                          setModalOpen(true)
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="text-sm font-medium text-red-600 hover:underline"
                        data-testid="delete-transaction-btn"
                        onClick={() => setToDelete(tx)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        initial={editing}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir transação"
        description="Tem certeza que deseja excluir esta transação?"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </Layout>
  )
}
