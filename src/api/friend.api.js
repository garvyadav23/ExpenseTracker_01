import { CURRENT_USER_ID } from '../mocks/users.js'
import { mockState } from '../mocks/state.js'
import { addActivity, clone, delay, nextId } from './mockApi.js'

export async function getFriends() {
	await delay()
	return clone(mockState.friendIds
		.map((userId) => mockState.users.find((user) => user.id === userId))
		.filter(Boolean))
}

export async function addFriend(input) {
	await delay()
	const friendInput = typeof input === 'string' ? { userId: input } : input
	if (!friendInput || typeof friendInput !== 'object') {
		throw new Error('Provide a user ID or friend details.')
	}

	let friend = friendInput.userId
		? mockState.users.find((user) => user.id === friendInput.userId)
		: mockState.users.find((user) => friendInput.email && user.email.toLowerCase() === friendInput.email.toLowerCase())
	if (!friend && friendInput.userId) throw new Error('User not found.')
	if (friend?.id === CURRENT_USER_ID) throw new Error('You cannot add yourself as a friend.')

	if (!friend) {
		if (typeof friendInput.name !== 'string' || !friendInput.name.trim()) {
			throw new Error('A name is required to add a new friend.')
		}
		friend = {
			id: nextId('u', mockState.users),
			name: friendInput.name.trim(),
			email: friendInput.email ?? '',
		}
		mockState.users.push(friend)
	}

	if (!mockState.friendIds.includes(friend.id)) {
		mockState.friendIds.push(friend.id)
		addActivity({
			type: 'friend.added',
			actorId: CURRENT_USER_ID,
			friendId: friend.id,
			message: `Garv added ${friend.name} as a friend`,
		})
	}
	return clone(friend)
}
