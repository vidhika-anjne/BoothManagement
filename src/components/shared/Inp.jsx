export default function Inp({ error, ...props }) {
  return <input className={`cpf-input${error ? ' error' : ''}`} {...props} />
}
