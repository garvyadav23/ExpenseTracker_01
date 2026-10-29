import { CURRENT_USER_ID } from '../mocks/users.js'
import { mockState } from '../mocks/state.js'
import { addActivity, clone, delay, nextId } from './mockApi.js'

export async function getGroups() {
	await delay()
	return clone(mockState.groups)
}

export async function getGroup(id) {
	await delay()
	const group = mockState.groups.find(({ id: groupId }) => groupId === id)
	return group ? clone(group) : null
}

export async function createGroup(input) {
	await delay()
	if (!input || typeof input.name !== 'string' || !input.name.trim()) {
		throw new Error('A group name is required.')
	}

	const memberIds = [...new Set([CURRENT_USER_ID, ...(input.memberIds ?? [])])]
	if (memberIds.some((userId) => typeof userId !== 'string' || !mockState.users.some((user) => user.id === userId))) {
		throw new Error('Group members must be existing users with string IDs.')
	}

	const group = {
		id: nextId('g', mockState.groups),
		name: input.name.trim(),
		type: input.type ?? 'Other',
		description: input.description ?? '',
		memberIds,
		createdBy: CURRENT_USER_ID,
		createdAt: new Date().toISOString(),
	}
	mockState.groups.unshift(group)
	addActivity({
		type: 'group.created',
		actorId: CURRENT_USER_ID,
		groupId: group.id,
		message: `Garv created ${group.name}`,
	})

	return clone(group)
}
