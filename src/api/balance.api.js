import { CURRENT_USER_ID } from '../mocks/users.js'
import { mockState } from '../mocks/state.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import { addActivity, clone, delay, fromPaise, nextId, toPaise } from './mockApi.js'

function computeNetBalances(groupId) {
	const netByUser = new Map(mockState.users.map(({ id }) => [id, 0]))
	const inScope = (record) => groupId === undefined || record.groupId === groupId

	for (const expense of mockState.expenses.filter(inScope)) {
		const totalPaise = toPaise(expense.amount)
		netByUser.set(expense.paidBy, (netByUser.get(expense.paidBy) ?? 0) + totalPaise)
		for (const split of expense.splits) {
			netByUser.set(split.userId, (netByUser.get(split.userId) ?? 0) - toPaise(split.owedAmount))
		}
	}

	for (const settlement of mockState.settlements.filter(inScope)) {
		const amountPaise = toPaise(settlement.amount)
		netByUser.set(settlement.paidBy, (netByUser.get(settlement.paidBy) ?? 0) + amountPaise)
		netByUser.set(settlement.receivedBy, (netByUser.get(settlement.receivedBy) ?? 0) - amountPaise)
	}

	return netByUser
}

function pairwiseNetPaise(groupId) {
	const byFriend = new Map()
	const add = (friendId, paise) => {
		if (friendId === CURRENT_USER_ID) return
		byFriend.set(friendId, (byFriend.get(friendId) ?? 0) + paise)
	}
	const inScope = (record) => groupId === undefined || record.groupId === groupId

	for (const expense of mockState.expenses.filter(inScope)) {
		for (const split of expense.splits) {
			if (split.userId === expense.paidBy) continue
			if (expense.paidBy === CURRENT_USER_ID) add(split.userId, toPaise(split.owedAmount))
			if (split.userId === CURRENT_USER_ID) add(expense.paidBy, -toPaise(split.owedAmount))
		}
	}
	for (const s of mockState.settlements.filter(inScope)) {
		const paise = toPaise(s.amount)
		if (s.paidBy === CURRENT_USER_ID) add(s.receivedBy, paise)
		if (s.receivedBy === CURRENT_USER_ID) add(s.paidBy, -paise)
	}
	return byFriend
}

function calculatePerFriend(groupId) {
	const byFriend = pairwiseNetPaise(groupId)
	return [...new Set([...mockState.friendIds, ...byFriend.keys()])]
		.filter((userId) => userId !== CURRENT_USER_ID)
		.map((userId) => {
			const netPaise = byFriend.get(userId) ?? 0
			return {
				userId,
				user: clone(mockState.users.find(({ id }) => id === userId) ?? null),
				netBalance: fromPaise(netPaise),
				totalOwed: fromPaise(Math.max(netPaise, 0)),
				totalOwing: fromPaise(Math.max(-netPaise, 0)),
			}
		})
}

function balanceSummary(groupId) {
	let owed = 0
	let owing = 0
	for (const paise of pairwiseNetPaise(groupId).values()) {
		if (paise > 0) owed += paise
		else owing += -paise
	}
	return {
		netBalance: fromPaise(owed - owing),
		totalOwed: fromPaise(owed),
		totalOwing: fromPaise(owing),
	}
}

export async function getBalances() {
	await delay()
	return {
		overall: balanceSummary(undefined),
		perFriend: calculatePerFriend(undefined),
	}
}

export async function getGroupBalances(groupId) {
	await delay()
	const group = mockState.groups.find((item) => item.id === groupId)
	if (!group) {
		throw new Error('Group not found.')
	}
	return {
		groupId,
		...balanceSummary(groupId),
		perFriend: calculatePerFriend(groupId),
		memberBalances: [...computeNetBalances(groupId)]
			.filter(([userId]) => group.memberIds.includes(userId))
			.map(([userId, paise]) => ({ userId, netBalance: fromPaise(paise) })),
	}
}

export async function createSettlement(input) {
	await delay()
	if (!input || typeof input.paidBy !== 'string' || typeof input.receivedBy !== 'string') {
		throw new Error('Settlement payer and recipient must be string user IDs.')
	}
	if (input.paidBy === input.receivedBy) throw new Error('Settlement payer and recipient must differ.')
	if (![input.paidBy, input.receivedBy].every((id) => mockState.users.some((user) => user.id === id))) {
		throw new Error('Settlement users must exist.')
	}
	if (!Number.isFinite(input.amount) || input.amount <= 0) {
		throw new Error('Settlement amount must be positive.')
	}
	const amountPaise = toPaise(input.amount)
	if (Math.abs(input.amount * 100 - amountPaise) > 1e-8) {
		throw new Error('Settlement amount must have at most two decimal places.')
	}

	const groupId = input.groupId ?? null
	const group = groupId === null ? null : mockState.groups.find((item) => item.id === groupId)
	if (groupId !== null && !group) {
		throw new Error('Group not found.')
	}

	const settlement = {
		id: nextId('s', mockState.settlements),
		groupId,
		paidBy: input.paidBy,
		receivedBy: input.receivedBy,
		amount: fromPaise(amountPaise),
		note: input.note ?? '',
		createdAt: new Date().toISOString(),
	}
	mockState.settlements.unshift(settlement)
	const payer = mockState.users.find(({ id }) => id === settlement.paidBy)
	const recipient = mockState.users.find(({ id }) => id === settlement.receivedBy)
	addActivity({
		type: 'settlement.created',
		actorId: settlement.paidBy,
		groupId,
		settlementId: settlement.id,
		message: `${payer.name} paid ${recipient.name} ${formatCurrency(settlement.amount)}${group ? ` in ${group.name}` : ''}`,
	})
	return clone(settlement)
}
