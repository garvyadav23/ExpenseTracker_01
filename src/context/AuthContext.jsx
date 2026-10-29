import { useEffect, useState } from 'react'
import { getMe, login as loginApi, register as registerApi } from '../api/auth.api.js'
import { AuthContext } from './authContext.js'
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, clearStoredAuth } from '../utils/authStorage.js'

function readStoredUser() {
	if (!localStorage.getItem(AUTH_TOKEN_KEY)) return null
	try {
		const storedUser = localStorage.getItem(AUTH_USER_KEY)
		return storedUser ? JSON.parse(storedUser) : null
	} catch {
		return null
	}
}

function storeAuth({ token, user }) {
	localStorage.setItem(AUTH_TOKEN_KEY, token)
	localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(readStoredUser)
	const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(AUTH_TOKEN_KEY)))

	useEffect(() => {
		const token = localStorage.getItem(AUTH_TOKEN_KEY)
		if (!token) return undefined

		let active = true
		getMe(token)
			.then((result) => {
				if (!active) return
				storeAuth(result)
				setUser(result.user)
			})
			.catch(() => {
				if (!active) return
				clearStoredAuth()
				setUser(null)
			})
			.finally(() => {
				if (active) setLoading(false)
			})

		return () => { active = false }
	}, [])

	async function login(email, password) {
		const result = await loginApi(email, password)
		storeAuth(result)
		setUser(result.user)
		return result.user
	}

	async function register(name, email, password) {
		const result = await registerApi(name, email, password)
		storeAuth(result)
		setUser(result.user)
		return result.user
	}

	function logout() {
		clearStoredAuth()
		setUser(null)
	}

	return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}
