import { Component } from 'react'
import { TriangleAlert } from 'lucide-react'
import Button from './Button.jsx'

export default class ErrorBoundary extends Component {
	state = { hasError: false }

	static getDerivedStateFromError() {
		return { hasError: true }
	}

	render() {
		if (this.state.hasError) {
			return (
				<main className="grid min-h-screen place-items-center bg-slate-50 dark:bg-gray-950 px-5 py-10 text-center">
					<div className="max-w-md">
						<span className="mx-auto grid size-12 place-items-center rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
							<TriangleAlert aria-hidden="true" size={23} />
						</span>
						<h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-gray-100">Something went wrong</h1>
						<p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-400">The page could not be displayed. Reload to try again.</p>
						<Button className="mt-5" onClick={() => window.location.reload()}>Reload</Button>
					</div>
				</main>
			)
		}
		return this.props.children
	}
}