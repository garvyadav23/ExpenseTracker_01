import { useParams } from 'react-router-dom'

export default function GroupDetail() {
	const { id } = useParams()
	return <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Group {id}</h1>
}
