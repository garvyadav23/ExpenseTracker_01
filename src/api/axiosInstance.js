import axios from 'axios'
import { AUTH_TOKEN_KEY, clearStoredAuth } from '../utils/authStorage.js'

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
})

axiosInstance.interceptors.request.use((config) => {
	const token = localStorage.getItem(AUTH_TOKEN_KEY)
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			clearStoredAuth()
			if (window.location.pathname !== '/login') window.location.assign('/login')
		}
		return Promise.reject(error)
	},
)

export default axiosInstance
