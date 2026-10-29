export const queryKeys = {
  groups: ['groups'],
  group: (id) => ['groups', id],
  groupExpenses: (id) => ['expenses', 'group', id],
  expenses: ['expenses'],
  balances: ['balances'],
  groupBalances: (id) => ['balances', 'group', id],
  friends: ['friends'],
  activities: ['activities'],
}