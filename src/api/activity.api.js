import { mockState } from '../mocks/state.js'
import { clone, delay } from './mockApi.js'

export async function getActivities() {
	await delay()
	return clone([...mockState.activities].sort(
		(first, second) => new Date(second.createdAt) - new Date(first.createdAt),
	))
}
