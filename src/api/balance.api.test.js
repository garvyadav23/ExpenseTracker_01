import { afterEach, describe, expect, it } from 'vitest'
import { getBalances, getGroupBalances } from './balance.api.js'
import { mockState } from '../mocks/state.js'

const originalState = JSON.parse(JSON.stringify(mockState))

function restoreState(source) {
	for (const key of Object.keys(mockState)) {
		mockState[key] = JSON.parse(JSON.stringify(source[key]))
	}
}

function expense(id, description, amount, paidBy, splits) {
	return { id, groupId: 'g-test', description, amount, paidBy, splitType: 'equal', splits }
}

describe('balance APIs', () => {
	afterEach(() => restoreState(originalState))

	it('updates owed and owing balances as expenses are added', async () => {
		mockState.users = [
			{ id: 'u1', name: 'Garv' },
			{ id: 'u5', name: 'Ravi' },
			{ id: 'u6', name: 'Aman' },
		]
		mockState.friendIds = ['u5', 'u6']
		mockState.groups = [{ id: 'g-test', name: 'Balance test', memberIds: ['u1', 'u5', 'u6'] }]
		mockState.settlements = []
		mockState.expenses = [expense('e-test-1', 'Garv pays', 300, 'u1', [
			{ userId: 'u1', owedAmount: 100 },
			{ userId: 'u5', owedAmount: 100 },
			{ userId: 'u6', owedAmount: 100 },
		])]

		let balances = await getBalances()
		expect(balances.overall).toMatchObject({ totalOwed: 200, totalOwing: 0 })
		expect(balances.perFriend.map(({ userId, netBalance }) => [userId, netBalance])).toEqual([
			['u5', 100],
			['u6', 100],
		])
		expect((await getGroupBalances('g-test')).memberBalances).toEqual([
			{ userId: 'u1', netBalance: 200 },
			{ userId: 'u5', netBalance: -100 },
			{ userId: 'u6', netBalance: -100 },
		])

		mockState.expenses.push(expense('e-test-2', 'Aman pays', 60, 'u6', [
			{ userId: 'u1', owedAmount: 30 },
			{ userId: 'u6', owedAmount: 30 },
		]))
		balances = await getBalances()
		expect(balances.overall).toMatchObject({ totalOwed: 170, totalOwing: 0 })
		expect(balances.perFriend.find(({ userId }) => userId === 'u6').netBalance).toBe(70)

		mockState.expenses.push(expense('e-test-3', 'Ravi pays', 90, 'u5', [
			{ userId: 'u1', owedAmount: 30 },
			{ userId: 'u5', owedAmount: 30 },
			{ userId: 'u6', owedAmount: 30 },
		]))
		balances = await getBalances()
		expect(balances.overall).toMatchObject({ totalOwed: 140, totalOwing: 0 })
		expect(balances.perFriend.find(({ userId }) => userId === 'u5').netBalance).toBe(70)
		expect(balances.perFriend.find(({ userId }) => userId === 'u6').netBalance).toBe(70)
	})
})