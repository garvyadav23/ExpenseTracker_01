import { activities } from './activities.js'
import { expenses } from './expenses.js'
import { groups } from './groups.js'
import { settlements } from './settlements.js'
import { CURRENT_USER_ID, users } from './users.js'

const clone = (value) => JSON.parse(JSON.stringify(value))

export const mockState = {
  users: clone(users),
  groups: clone(groups),
  expenses: clone(expenses),
  settlements: clone(settlements),
  activities: clone(activities),
  friendIds: users.filter(({ id }) => id !== CURRENT_USER_ID).map(({ id }) => id),
}