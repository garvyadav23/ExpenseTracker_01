import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme.js'

const themeOrder = ['light', 'dark', 'system']
const themeIcons = { light: Sun, dark: Moon, system: Monitor }
const nextThemeNames = { light: 'dark', dark: 'system', system: 'light' }

export default function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const Icon = themeIcons[theme]
	const nextTheme = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length]
	return (
		<button
			type="button"
			aria-label={`Theme: ${theme}. Switch to ${nextThemeNames[theme]}.`}
			title={`Theme: ${theme} (switch to ${nextThemeNames[theme]})`}
			onClick={() => setTheme(nextTheme)}
			className="grid size-10 place-items-center rounded-md text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:focus-visible:ring-emerald-400"
		>
			<Icon aria-hidden="true" size={19} />
		</button>
	)
}