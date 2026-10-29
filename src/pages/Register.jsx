import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth.js'

const registerSchema = z.object({
	name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
	email: z.string().trim().pipe(z.email('Enter a valid email address.')),
	password: z.string().min(8, 'Password must be at least 8 characters.'),
})

function Field({ label, name, type = 'text', register, error, autoComplete }) {
	const fieldId = `register-${name}`
	return (
		<div className="space-y-1.5">
			<label htmlFor={fieldId} className="block text-sm font-medium text-slate-700 dark:text-gray-300">{label}</label>
			<input
				id={fieldId}
				type={type}
				autoComplete={autoComplete}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? `${fieldId}-error` : undefined}
				className={`h-11 w-full rounded-md border bg-white dark:bg-gray-900 px-3 text-sm text-slate-900 dark:text-gray-100 outline-none transition focus:ring-2 ${
					error ? 'border-rose-400 dark:border-red-900 focus:border-rose-500 dark:focus:border-red-900 focus:ring-rose-100 dark:focus:ring-red-400' : 'border-slate-300 dark:border-gray-700 focus:border-emerald-700 dark:focus:border-emerald-700 focus:ring-emerald-100 dark:focus:ring-emerald-400'
				}`}
				{...register(name)}
			/>
			{error && <p id={`${fieldId}-error`} className="text-sm text-rose-700 dark:text-red-400">{error.message}</p>}
		</div>
	)
}

export default function Register() {
	const { register: registerAccount } = useAuth()
	const navigate = useNavigate()
	const [formError, setFormError] = useState('')
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
		resolver: zodResolver(registerSchema),
		defaultValues: { name: '', email: '', password: '' },
	})

	async function onSubmit(values) {
		setFormError('')
		try {
			await registerAccount(values.name, values.email, values.password)
			navigate('/', { replace: true })
		} catch (error) {
			setFormError(error.message || 'Unable to create your account. Please try again.')
		}
	}

	return (
		<main className="grid min-h-screen place-items-center bg-slate-100 dark:bg-gray-950 px-4 py-10 sm:px-6">
			<section className="w-full max-w-md rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm sm:p-8">
				<div className="mb-7">
					<Link to="/login" className="text-sm font-bold tracking-tight text-slate-900 dark:text-gray-100">
						Expense<span className="text-emerald-700 dark:text-green-400">Tracker</span>
					</Link>
					<h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-gray-100">Create your account</h1>
					<p className="mt-1.5 text-sm text-slate-600 dark:text-gray-400">Start keeping shared costs clear and balanced.</p>
				</div>

				<form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
					{formError && (
						<p role="alert" className="rounded-md border border-rose-200 dark:border-red-900 bg-rose-50 dark:bg-red-950/40 px-3 py-2.5 text-sm text-rose-800 dark:text-red-400">
							{formError}
						</p>
					)}
					<Field label="Name" name="name" autoComplete="name" register={register} error={errors.name} />
					<Field label="Email" name="email" type="email" autoComplete="email" register={register} error={errors.email} />
					<Field label="Password" name="password" type="password" autoComplete="new-password" register={register} error={errors.password} />
					<button
						type="submit"
						disabled={isSubmitting}
						className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-800 dark:bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 dark:hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-65"
					>
						{isSubmitting && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
						{isSubmitting ? 'Creating account...' : 'Create account'}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-slate-600 dark:text-gray-400">
					Already have an account? <Link to="/login" className="font-semibold text-emerald-800 dark:text-green-400 hover:text-emerald-950 dark:hover:text-green-400">Sign in</Link>
				</p>
			</section>
		</main>
	)
}
