import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth.js'

const loginSchema = z.object({
	email: z.string().trim().pipe(z.email('Enter a valid email address.')),
	password: z.string().min(1, 'Enter your password.'),
})

function Field({ label, name, type = 'text', register, error, autoComplete }) {
	const fieldId = `login-${name}`
	return (
		<div className="space-y-1.5">
			<label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">{label}</label>
			<input
				id={fieldId}
				type={type}
				autoComplete={autoComplete}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? `${fieldId}-error` : undefined}
				className={`h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
					error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300 focus:border-emerald-700 focus:ring-emerald-100'
				}`}
				{...register(name)}
			/>
			{error && <p id={`${fieldId}-error`} className="text-sm text-rose-700">{error.message}</p>}
		</div>
	)
}

export default function Login() {
	const { login } = useAuth()
	const navigate = useNavigate()
	const [formError, setFormError] = useState('')
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
	})

	async function onSubmit(values) {
		setFormError('')
		try {
			await login(values.email, values.password)
			navigate('/', { replace: true })
		} catch (error) {
			setFormError(error.message || 'Unable to sign in. Please try again.')
		}
	}

	return (
		<main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10 sm:px-6">
			<section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
				<div className="mb-7">
					<Link to="/login" className="text-sm font-bold tracking-tight text-slate-900">
						Expense<span className="text-emerald-700">Tracker</span>
					</Link>
					<h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
					<p className="mt-1.5 text-sm text-slate-600">Sign in to keep your shared expenses in order.</p>
				</div>

				<form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
					{formError && (
						<p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
							{formError}
						</p>
					)}
					<Field label="Email" name="email" type="email" autoComplete="email" register={register} error={errors.email} />
					<Field label="Password" name="password" type="password" autoComplete="current-password" register={register} error={errors.password} />
					<button
						type="submit"
						disabled={isSubmitting}
						className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-65"
					>
						{isSubmitting && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
						{isSubmitting ? 'Signing in...' : 'Sign in'}
					</button>
				</form>
				<p className="mt-6 text-center text-sm text-slate-600">
					New here? <Link to="/register" className="font-semibold text-emerald-800 hover:text-emerald-950">Create an account</Link>
				</p>
			</section>
		</main>
	)
}
