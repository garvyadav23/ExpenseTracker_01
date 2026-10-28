const toPaise = (amount) => Math.round((amount + Number.EPSILON) * 100)
const fromPaise = (amount) => amount / 100

function invalid(error) {
  return { valid: false, splits: [], error }
}

function validAmount(amount) {
  if (!Number.isFinite(amount) || amount < 0) return false

  const paise = amount * 100
  return Number.isSafeInteger(Math.round(paise)) && Math.abs(paise - Math.round(paise)) <= 1e-8
}

function validateTotal(totalAmount) {
  if (!validAmount(totalAmount)) {
    return invalid('Total must be a non-negative amount with at most two decimal places.')
  }

  return null
}

function validateEntries(entries, label) {
  if (entries.length === 0) {
    return invalid(`At least one ${label} is required.`)
  }

  if (entries.some(([, value]) => !Number.isFinite(value) || value < 0)) {
    return invalid(`${label} must contain non-negative numbers.`)
  }

  return null
}

function allocate(totalPaise, entries) {
  const units = entries.map(([userId, w]) => [userId, Math.round(w * 100)])
  const unitTotal = units.reduce((sum, [, u]) => sum + u, 0)

  const allocations = units.map(([userId, u], index) => {
    const product = totalPaise * u
    return {
      userId,
      paise: Math.floor(product / unitTotal),
      remainder: product % unitTotal, // exact integer remainder
      index,
    }
  })

  const leftover = totalPaise - allocations.reduce((s, a) => s + a.paise, 0)
  const order = [...allocations].sort((a, b) => b.remainder - a.remainder || a.index - b.index)
  for (let i = 0; i < leftover; i += 1) order[i].paise += 1

  return allocations.map(({ userId, paise }) => ({ userId, amount: fromPaise(paise) }))
}   

function success(splits) {
  return { valid: true, splits, error: null }
}

export function splitEqual(totalAmount, userIds) {
  const totalError = validateTotal(totalAmount)
  if (totalError) return totalError
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return invalid('At least one user is required.')
  }
  if (new Set(userIds).size !== userIds.length) {
    return invalid('User IDs must be unique.')
  }

  const totalPaise = toPaise(totalAmount)
  const basePaise = Math.floor(totalPaise / userIds.length)
  const leftover = totalPaise % userIds.length

  return success(userIds.map((userId, index) => ({
    userId,
    amount: fromPaise(basePaise + (index < leftover ? 1 : 0)),
  })))
}

export function splitExact(totalAmount, amountsByUser) {
  const totalError = validateTotal(totalAmount)
  if (totalError) return totalError
  if (!amountsByUser || typeof amountsByUser !== 'object' || Array.isArray(amountsByUser)) {
    return invalid('Amounts must be provided as an object keyed by user ID.')
  }

  const entries = Object.entries(amountsByUser)
  const entriesError = validateEntries(entries, 'Amounts')
  if (entriesError) return entriesError
  if (entries.some(([, amount]) => !validAmount(amount))) {
    return invalid('Each amount must be a valid amount with at most two decimal places.')
  }

  const splits = entries.map(([userId, amount]) => ({ userId, amount: fromPaise(toPaise(amount)) }))
  const splitTotal = splits.reduce((sum, split) => sum + toPaise(split.amount), 0)
  if (splitTotal !== toPaise(totalAmount)) {
    return invalid('Split amounts must add up to the total.')
  }

  return success(splits)
}

export function splitPercent(totalAmount, percentByUser) {
  const totalError = validateTotal(totalAmount)
  if (totalError) return totalError
  if (!percentByUser || typeof percentByUser !== 'object' || Array.isArray(percentByUser)) {
    return invalid('Percentages must be provided as an object keyed by user ID.')
  }

  const entries = Object.entries(percentByUser)
  const entriesError = validateEntries(entries, 'Percentages')
  if (entriesError) return entriesError
  const percentTotal = entries.reduce((sum, [, percent]) => sum + percent, 0)
  if (Math.abs(percentTotal - 100) > 1e-8) {
    return invalid('Percentages must add up to 100.')
  }

  return success(allocate(toPaise(totalAmount), entries, percentTotal))
}

export function splitShares(totalAmount, sharesByUser) {
  const totalError = validateTotal(totalAmount)
  if (totalError) return totalError
  if (!sharesByUser || typeof sharesByUser !== 'object' || Array.isArray(sharesByUser)) {
    return invalid('Shares must be provided as an object keyed by user ID.')
  }

  const entries = Object.entries(sharesByUser)
  const entriesError = validateEntries(entries, 'Shares')
  if (entriesError) return entriesError
  const shareTotal = entries.reduce((sum, [, shares]) => sum + shares, 0)
  if (shareTotal <= 0 || !Number.isFinite(shareTotal)) {
    return invalid('Shares must have a positive total.')
  }

  return success(allocate(toPaise(totalAmount), entries, shareTotal))
}