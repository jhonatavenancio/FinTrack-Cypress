import { useEffect, useState } from 'react'

const EMPTY = { name: '', type: 'expense', color: '#6366f1' }

export default function CategoryModal({ open, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(initial ?? EMPTY)
    setError('')
  }, [initial, open])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Informe um nome para a categoria.')
      return
    }
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível salvar a categoria.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl2 bg-white p-6 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900">
          {initial ? 'Editar categoria' : 'Nova categoria'}
        </h3>

        <div className="mt-4 space-y-3">
          <div>
            <label className="label">Nome</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Alimentação"
            />
          </div>

          <div>
            <label className="label">Tipo</label>
            <div className="flex gap-2">
              {['expense', 'income'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    form.type === t
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {t === 'expense' ? 'Despesa' : 'Receita'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Cor</label>
            <input
              type="color"
              className="h-10 w-full cursor-pointer rounded-lg border border-slate-200"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
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
