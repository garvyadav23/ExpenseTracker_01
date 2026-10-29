import { useEffect, useState } from 'react'
import { ThemeContext } from './themeContext.js'

const THEME_STORAGE_KEY = 'expense-tracker-theme'
const themes = new Set(['light', 'dark', 'system'])

function readTheme() {
	try {
		const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
		return themes.has(storedTheme) ? storedTheme : 'system'
	} catch {
		return 'system'
	}
}

export function ThemeProvider({ children }) {
	const [theme, setThemeState] = useState(readTheme)

	function setTheme(nextTheme) {
		if (!themes.has(nextTheme)) return
		setThemeState(nextTheme)
		try {
			window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
		} catch {
			return
		}
	}

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const applyTheme = () => {
			const shouldUseDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches)
			document.documentElement.classList.toggle('dark', shouldUseDark)
		}
		applyTheme()
		mediaQuery.addEventListener('change', applyTheme)
		return () => mediaQuery.removeEventListener('change', applyTheme)
	}, [theme])

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}