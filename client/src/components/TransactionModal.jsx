import { useEffect, useState } from 'react'

function today() {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY = { category_id: '', amount: '', description: '', occurred_at: today() }

export default function TransactionModal({ open, initial, categories, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(
      initial
        ? { ...initial, amount: String(initial.amount) }
        : { ...EMPTY, category_id: categories[0]?.id ?? '' },
    )
    setError('')
  }, [initial, open, categories])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    const amountNumber = Number(form.amount)
    if (!form.category_id) return setError('Selecione uma categoria.')
    if (!amountNumber || amountNumber <= 0) return setError('Informe um valor maior que zero.')
    if (!form.occurred_at) return setError('Informe a data.')

    try {
      await onSubmit({ ...form, amount: amountNumber })
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível salvar a transação.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl2 bg-white p-6 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900">
          {initial ? 'Editar transação' : 'Nova transação'}
        </h3>

        <div className="mt-4 space-y-3">
          <div>
            <label className="label">Categoria</label>
            <select
              className="input"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'income' ? 'receita' : 'despesa'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Valor (R$)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="label">Descrição</label>
            <input
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Supermercado"
            />
          </div>

          <div>
            <label className="label">Data</label>
            <input
              className="input"
              type="date"
              value={form.occurred_at}
              onChange={(e) => setForm({ ...form, occurred_at: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">Salvar</button>
        </div>
      </form>
    </div>
  )
}
