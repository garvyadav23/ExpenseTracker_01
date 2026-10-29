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
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-gray-300">{label}</label>}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? messageId : undefined}
        className={`h-11 w-full rounded-md border bg-white dark:bg-gray-900 px-3 text-sm text-slate-900 dark:text-gray-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-gray-800 ${
          error ? 'border-rose-400 dark:border-red-900 focus:border-rose-500 dark:focus:border-red-900 focus:ring-rose-100 dark:focus:ring-red-400' : 'border-slate-300 dark:border-gray-700 focus:border-emerald-700 dark:focus:border-emerald-700 focus:ring-emerald-100 dark:focus:ring-emerald-400'
        } ${className}`}
        {...props}
      />
      {(error || helperText) && (
        <p id={messageId} className={`text-sm ${error ? 'text-rose-700 dark:text-red-400' : 'text-slate-500 dark:text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

export default Input