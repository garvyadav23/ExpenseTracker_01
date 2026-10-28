import { describe, expect, it } from 'vitest'
import { splitEqual, splitExact, splitPercent, splitShares } from './splitMath.js'

describe('splitEqual', () => {
  it('distributes leftover paise while preserving the total', () => {
    const result = splitEqual(100, ['a', 'b', 'c'])

    expect(result).toEqual({
      valid: true,
      splits: [
        { userId: 'a', amount: 33.34 },
        { userId: 'b', amount: 33.33 },
        { userId: 'c', amount: 33.33 },
      ],
      error: null,
    })
  })
})

describe('splitExact', () => {
  it('accepts amounts that add up exactly', () => {
    expect(splitExact(10, { a: 4.25, b: 5.75 })).toMatchObject({
      valid: true,
      splits: [{ userId: 'a', amount: 4.25 }, { userId: 'b', amount: 5.75 }],
      error: null,
    })
  })

  it('rejects amounts that do not add up', () => {
    expect(splitExact(10, { a: 4, b: 5 })).toMatchObject({
      valid: false,
      splits: [],
      error: expect.any(String),
    })
  })

  it('rejects amounts smaller than one paise', () => {
    expect(splitExact(1, { a: 1.001 })).toMatchObject({
      valid: false,
      splits: [],
      error: expect.any(String),
    })
  })
})

describe('splitPercent', () => {
  it('rounds paise and preserves the total', () => {
    const result = splitPercent(10, { a: 33.33, b: 33.33, c: 33.34 })

    expect(result.valid).toBe(true)
    expect(result.splits.map(({ amount }) => amount)).toEqual([3.33, 3.33, 3.34])
    expect(result.splits.reduce((sum, split) => sum + Math.round(split.amount * 100), 0)).toBe(1000)
  })

  it('rejects percentages that do not add up to 100', () => {
    expect(splitPercent(10, { a: 60, b: 30 }).valid).toBe(false)
  })
})

describe('splitShares', () => {
  it('splits proportionally and preserves the total', () => {
    const result = splitShares(10, { a: 1, b: 2 })

    expect(result.splits.map(({ amount }) => amount)).toEqual([3.33, 6.67])
    expect(result.splits.reduce((sum, split) => sum + Math.round(split.amount * 100), 0)).toBe(1000)
  })
})



const amounts = (result) => result.splits.map((s) => s.amount)
const sumPaise = (result) =>
  result.splits.reduce((sum, s) => sum + Math.round(s.amount * 100), 0)

describe('required edge cases', () => {
  it('equal: 100 among 3', () => {
    const r = splitEqual(100, ['a', 'b', 'c'])
    expect(r.valid).toBe(true)
    expect(amounts(r)).toEqual([33.34, 33.33, 33.33])
    expect(sumPaise(r)).toBe(10000)
  })

  it('equal: 0.01 among 2', () => {
    const r = splitEqual(0.01, ['a', 'b'])
    expect(amounts(r)).toEqual([0.01, 0])
    expect(sumPaise(r)).toBe(1)
  })

  it('percent: 33.33 / 33.33 / 33.34', () => {
    const r = splitPercent(100, { a: 33.33, b: 33.33, c: 33.34 })
    expect(amounts(r)).toEqual([33.33, 33.33, 33.34])
    expect(sumPaise(r)).toBe(10000)
  })

  it('percent: invalid when not 100', () => {
    const r = splitPercent(100, { a: 50, b: 30 })
    expect(r.valid).toBe(false)
    expect(r.error).toBeTruthy()
  })

  it('shares: 1:1:1 of 100', () => {
    const r = splitShares(100, { a: 1, b: 1, c: 1 })
    expect(amounts(r)).toEqual([33.34, 33.33, 33.33])
    expect(sumPaise(r)).toBe(10000)
  })

  it('shares: 1:2:3 of 10', () => {
    const r = splitShares(10, { a: 1, b: 2, c: 3 })
    expect(amounts(r)).toEqual([1.67, 3.33, 5])
    expect(sumPaise(r)).toBe(1000)
  })

  it('exact: invalid when sum is off', () => {
    const r = splitExact(100, { a: 60, b: 30 })
    expect(r.valid).toBe(false)
  })
})