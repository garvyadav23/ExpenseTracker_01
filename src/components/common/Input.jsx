import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}, ref) {
  const inputId = id ?? props.name
  const messageId = `${inputId}-message`

  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">{label}</label>}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? messageId : undefined}
        className={`h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
          error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300 focus:border-emerald-700 focus:ring-emerald-100'
        } ${className}`}
        {...props}
      />
      {(error || helperText) && (
        <p id={messageId} className={`text-sm ${error ? 'text-rose-700' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

export default Input