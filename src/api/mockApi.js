import { mockState } from '../mocks/state.js'

export const delay = () => new Promise((resolve) => setTimeout(resolve, 300))
export const clone = (value) => JSON.parse(JSON.stringify(value))

export function nextId(prefix, records) {
  const maxId = records.reduce((max, record) => {
    const match = new RegExp(`^${prefix}(\\d+)$`).exec(record.id)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)

  return `${prefix}${maxId + 1}`
}

export function toPaise(amount) {
  return Math.round((amount + Number.EPSILON) * 100)
}

export function fromPaise(amount) {
  return amount / 100
}

export function addActivity(activity) {
  mockState.activities.unshift({
    id: nextId('a', mockState.activities),
    createdAt: new Date().toISOString(),
    ...activity,
  })
}