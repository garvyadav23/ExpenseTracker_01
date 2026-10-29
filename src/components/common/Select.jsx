import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(function Select({
  label,
  error,
  helperText,
  id,
  className = '',
  children,
  ...props
}, ref) {
  const selectId = id ?? props.name
  const messageId = `${selectId}-message`

  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helperText ? messageId : undefined}
          className={`h-11 w-full appearance-none rounded-md border bg-white px-3 pr-9 text-sm text-slate-900 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300 focus:border-emerald-700 focus:ring-emerald-100'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
      </div>
      {(error || helperText) && (
        <p id={messageId} className={`text-sm ${error ? 'text-rose-700' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

export default Select