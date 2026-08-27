export default function ConfirmDialog({ open, title, description, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-sm rounded-xl2 bg-white p-6 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn-danger" onClick={onConfirm}>Excluir</button>
        </div>
      </div>
    </div>
  )
}
