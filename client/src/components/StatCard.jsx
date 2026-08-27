const styles = {
  neutral: 'bg-slate-100 text-slate-700',
  positive: 'bg-emerald-50 text-emerald-700',
  negative: 'bg-red-50 text-red-700',
}

export default function StatCard({ label, value, tone = 'neutral', icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${styles[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}
