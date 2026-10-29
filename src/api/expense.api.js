import { CURRENT_USER_ID } from '../mocks/users.js'
import { mockState } from '../mocks/state.js'
import { addActivity, clone, delay, fromPaise, nextId } from './mockApi.js'

function amountToPaise(amount, { allowZero = false } = {}) {
	if (!Number.isFinite(amount) || amount < 0 || (!allowZero && amount === 0)) {
		throw new Error('Expense amount must be a positive number.')
	}
	const paise = amount * 100
	const roundedPaise = Math.round(paise)
	if (!Number.isSafeInteger(roundedPaise) || Math.abs(paise - roundedPaise) > 1e-8) {
		throw new Error('Expense amounts must have at most two decimal places.')
	}
	return roundedPaise
}

function splitEqually(totalPaise, userIds) {
	const basePaise = Math.floor(totalPaise / userIds.length)
	const remainder = totalPaise % userIds.length
	return userIds.map((userId, index) => ({
		userId,
		owedAmount: fromPaise(basePaise + (index < remainder ? 1 : 0)),
	}))
}

export async function getGroupExpenses(groupId) {
	await delay()
	return clone(mockState.expenses.filter((expense) => expense.groupId === groupId))
}

export async function getAllExpenses() {
	await delay()
	return clone(mockState.expenses)
}

export async function createExpense(input) {
	await delay()
	if (!input || typeof input.description !== 'string' || !input.description.trim()) {
		throw new Error('An expense description is required.')
	}

	const groupId = input.groupId ?? null
	const group = groupId ? mockState.groups.find((item) => item.id === groupId) : null
	if (groupId && !group) throw new Error('Group not found.')

	const paidBy = input.paidBy ?? CURRENT_USER_ID
	if (typeof paidBy !== 'string' || !mockState.users.some((user) => user.id === paidBy)) {
		throw new Error('Payer must be an existing user with a string ID.')
	}

	const totalPaise = amountToPaise(input.amount)
	const splitType = input.splitType ?? 'equal'
	let splits = input.splits
	if (!splits) {
		const userIds = input.userIds ?? group?.memberIds ?? [paidBy]
		if (!Array.isArray(userIds) || userIds.length === 0 || userIds.some((id) => typeof id !== 'string')) {
			throw new Error('Expense participants must be provided as string IDs.')
		}
		splits = splitEqually(totalPaise, [...new Set(userIds)])
	}

	if (!Array.isArray(splits) || splits.length === 0) {
		throw new Error('At least one expense split is required.')
	}
	const seenUserIds = new Set()
	const normalizedSplits = splits.map((split) => {
		if (!split || typeof split.userId !== 'string' || seenUserIds.has(split.userId)) {
			throw new Error('Split user IDs must be unique strings.')
		}
		if (!mockState.users.some((user) => user.id === split.userId)) {
			throw new Error(`Unknown split user: ${split.userId}`)
		}
		if (group && !group.memberIds.includes(split.userId)) {
			throw new Error('Expense splits must belong to group members.')
		}
		seenUserIds.add(split.userId)
		return { userId: split.userId, paise: amountToPaise(split.owedAmount, { allowZero: true }) }
	})

	const splitTotal = normalizedSplits.reduce((sum, split) => sum + split.paise, 0)
	if (splitTotal !== totalPaise) throw new Error('Expense splits must add up exactly to the expense amount.')

	const expense = {
		id: nextId('e', mockState.expenses),
		groupId,
		description: input.description.trim(),
		amount: fromPaise(totalPaise),
		date: input.date ?? null,
		paidBy,
		splitType,
		splits: normalizedSplits.map(({ userId, paise }) => ({ userId, owedAmount: fromPaise(paise) })),
		createdAt: new Date().toISOString(),
	}
	mockState.expenses.unshift(expense)
	addActivity({
		type: 'expense.created',
		actorId: paidBy,
		groupId,
		expenseId: expense.id,
		message: `${mockState.users.find(({ id }) => id === paidBy).name} added ${expense.description}`,
	})

	return clone(expense)
}

export async function deleteExpense(id) {
	await delay()
	const expenseIndex = mockState.expenses.findIndex((expense) => expense.id === id)
	if (expenseIndex === -1) return null

	const [expense] = mockState.expenses.splice(expenseIndex, 1)
	addActivity({
		type: 'expense.deleted',
		actorId: CURRENT_USER_ID,
		groupId: expense.groupId,
		expenseId: expense.id,
		message: `Garv deleted ${expense.description}`,
	})
	return clone(expense)
}
