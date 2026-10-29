export default function Skeleton({ className = '', as = 'div' }) {
	const Element = as
	return <Element aria-hidden="true" className={`animate-pulse rounded bg-slate-200 ${className}`} />
}