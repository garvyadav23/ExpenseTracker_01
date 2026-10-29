import { mockState } from '../mocks/state.js'
import { AUTH_USER_KEY } from '../utils/authStorage.js'
import { delay, nextId } from './mockApi.js'

function authResult(user) {
	return { token: `mock-token-${user.id}`, user: { ...user } }
}

export async function login(email, password) {
	await delay()
	const user = mockState.users.find((item) => item.email.toLowerCase() === String(email).trim().toLowerCase())
	if (!user || typeof password !== 'string') throw new Error('Invalid email or password')
	return authResult(user)
}

export async function register(name, email, password) {
	await delay()
	const normalizedEmail = String(email).trim().toLowerCase()
	if (mockState.users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
		throw new Error('An account with this email already exists.')
	}
	if (!String(name).trim() || !password) throw new Error('Name and password are required.')

	const user = {
		id: nextId('u', mockState.users),
		name: String(name).trim(),
		email: normalizedEmail,
	}
	mockState.users.push(user)
	return authResult(user)
}

export async function getMe(token) {
	await delay()
	const userId = String(token ?? '').replace(/^mock-token-/, '')
	let user = mockState.users.find((item) => item.id === userId)
	if (!user && typeof localStorage !== 'undefined') {
		try {
			const storedUser = JSON.parse(localStorage.getItem(AUTH_USER_KEY) ?? 'null')
			if (storedUser?.id === userId && token === `mock-token-${storedUser.id}`) {
				user = storedUser
				mockState.users.push(user)
			}
		} catch {
			user = null
		}
	}
	if (!user || token !== `mock-token-${user.id}`) throw new Error('Invalid authentication token.')
	return authResult(user)
}
