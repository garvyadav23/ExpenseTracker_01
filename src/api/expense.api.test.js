import { afterEach, describe, expect, it } from 'vitest'
import { getBalances } from './balance.api.js'
import { mockState } from '../mocks/state.js'
import { updateExpense } from './expense.api.js'

const originalState = JSON.parse(JSON.stringify(mockState))

function restoreState(source) {
	for (const key of Object.keys(mockState)) {
		mockState[key] = JSON.parse(JSON.stringify(source[key]))
	}
}

describe('updateExpense', () => {
	afterEach(() => restoreState(originalState))

	it('replaces expense data, preserves its ID, and records an update activity', async () => {
		const previousFriendBalance = (await getBalances()).perFriend.find(({ userId }) => userId === 'u2').netBalance
		const updated = await updateExpense('e1', {
			groupId: 'g1',
			description: 'Dinner',
			amount: 100.01,
			date: '2026-10-28',
			paidBy: 'u2',
			splitType: 'exact',
			splits: [
				{ userId: 'u1', owedAmount: 50 },
				{ userId: 'u2', owedAmount: 50.01 },
			],
		})

		expect(updated).toMatchObject({
			id: 'e1',
			description: 'Dinner',
			amount: 100.01,
			date: '2026-10-28',
			paidBy: 'u2',
			splitType: 'exact',
			splits: [
				{ userId: 'u1', owedAmount: 50 },
				{ userId: 'u2', owedAmount: 50.01 },
			],
		})
		expect(updated.createdAt).toBe(originalState.expenses.find(({ id }) => id === 'e1').createdAt)
		expect(mockState.activities[0]).toMatchObject({
			type: 'expense.updated',
			expenseId: 'e1',
			message: "Garv updated 'Dinner'",
		})
		expect(updated).not.toHaveProperty('balance')
		const nextFriendBalance = (await getBalances()).perFriend.find(({ userId }) => userId === 'u2').netBalance
		expect(nextFriendBalance).not.toBe(previousFriendBalance)
	})

	it('rejects splits that do not sum to the updated amount', async () => {
		await expect(updateExpense('e1', {
			description: 'Dinner',
			amount: 100,
			paidBy: 'u1',
			splitType: 'exact',
			splits: [{ userId: 'u1', owedAmount: 99.99 }],
		})).rejects.toThrow('Expense splits must add up exactly to the expense amount.')
	})
})