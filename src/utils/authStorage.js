export const AUTH_TOKEN_KEY = 'expense-tracker-token'
export const AUTH_USER_KEY = 'expense-tracker-user'

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}