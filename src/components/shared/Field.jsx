export default function Field({ label, error, hint, children, full }) {
  return (
    <div className={`cpf-field${full ? ' full' : ''}`}>
      <label>{label}</label>
      {children}
      {error && <span className="cpf-error">{error}</span>}
      {hint && !error && <span className="cpf-hint">{hint}</span>}
    </div>
  )
}
