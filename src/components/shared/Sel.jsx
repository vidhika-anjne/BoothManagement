export default function Sel({ error, children, ...props }) {
  return (
    <select className={`cpf-input${error ? ' error' : ''}`} {...props}>
      {children}
    </select>
  )
}
