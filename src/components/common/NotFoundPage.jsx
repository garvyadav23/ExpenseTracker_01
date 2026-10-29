import { CircleHelp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage({ embedded = false }) {
	const Container = embedded ? 'section' : 'main'
	return (
		<Container className="grid min-h-[60vh] place-items-center px-5 py-10 text-center">
			<div className="max-w-md">
				<span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-800">
					<CircleHelp aria-hidden="true" size={24} />
				</span>
				<p className="mt-4 text-sm font-semibold uppercase tracking-wide text-emerald-800">404</p>
				<h1 className="mt-2 text-2xl font-semibold text-slate-900">We couldn’t find that page</h1>
				<p className="mt-2 text-sm leading-6 text-slate-600">It may have moved, or the address may be incorrect.</p>
				<Link to="/" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
					Back to dashboard
				</Link>
			</div>
		</Container>
	)
}