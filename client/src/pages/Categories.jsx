import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import CategoryBadge from '../components/CategoryBadge'
import CategoryModal from '../components/CategoryModal'
import ConfirmDialog from '../components/ConfirmDialog'
import api from '../api/client'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    const { data } = await api.get('/categories')
    setCategories(data.categories ?? data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(form) {
    if (editing) {
      await api.put(`/categories/${editing.id}`, form)
    } else {
      await api.post('/categories', form)
    }
    setModalOpen(false)
    setEditing(null)
    await load()
  }

  async function handleDelete() {
    try {
      await api.delete(`/categories/${toDelete.id}`)
      setToDelete(null)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível excluir esta categoria.')
      setToDelete(null)
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorias</h1>
          <p className="mt-1 text-sm text-slate-500">Organize suas receitas e despesas.</p>
        </div>
        <button
          className="btn-primary"
          data-testid="add-category-btn"
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          + Nova categoria
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="card mt-6 overflow-x-auto">
        {loading ? (
          <p className="text-sm text-slate-400">Carregando...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma categoria cadastrada ainda.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2">Nome</th>
                <th className="py-2">Tipo</th>
                <th className="py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} data-testid="category-row" className="border-b border-slate-50 last:border-0">
                  <td className="py-3">
                    <CategoryBadge name={c.name} color={c.color} />
                  </td>
                  <td className="py-3 text-slate-500">{c.type === 'income' ? 'Receita' : 'Despesa'}</td>
                  <td className="py-3 text-right">
                    <button
                      className="mr-3 text-sm font-medium text-brand-600 hover:underline"
                      data-testid="edit-category-btn"
                      onClick={() => {
                        setEditing(c)
                        setModalOpen(true)
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="text-sm font-medium text-red-600 hover:underline"
                      data-testid="delete-category-btn"
                      onClick={() => setToDelete(c)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CategoryModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir categoria"
        description={`Tem certeza que deseja excluir "${toDelete?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </Layout>
  )
}
