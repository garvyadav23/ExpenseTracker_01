import { useEffect, useMemo, useState } from 'react'
import { formatCurrency } from '../../utils/formatCurrency.js'
import EmptyState from '../common/EmptyState.jsx'
import {
  previewSplitPercent,
  splitEqual,
  splitExact,
  splitPercent,
  splitShares,
} from '../../utils/splitMath.js'

const splitModes = ['Equal', 'Exact', 'Percent', 'Shares']
const modeTypes = { Equal: 'equal', Exact: 'exact', Percent: 'percent', Shares: 'shares' }

function amountInputToPaise(value) {
  const input = String(value ?? '').trim()
  if (!/^\d*(\.\d{0,2})?$/.test(input)) return null
  const [whole = '0', fraction = ''] = input.split('.')
  return Number(whole || '0') * 100 + Number((fraction + '00').slice(0, 2))
}

function percentageUnits(value) {
  const input = String(value ?? '').trim()
  if (!/^\d*(\.\d{0,2})?$/.test(input)) return null
  const [whole = '0', fraction = ''] = input.split('.')
  return Number(whole || '0') * 100 + Number((fraction + '00').slice(0, 2))
}

function formatPercentUnits(units) {
  const whole = Math.floor(units / 100)
  const fraction = String(units % 100).padStart(2, '0').replace(/0+$/, '')
  return `${whole}${fraction ? `.${fraction}` : ''}%`
}

function initialPercentages(splits = [], totalAmount) {
  const totalPaise = Math.round(Number(totalAmount) * 100)
  let assignedUnits = 0
  return Object.fromEntries(splits.map((split, index) => {
    const units = index === splits.length - 1
      ? 10000 - assignedUnits
      : totalPaise > 0 ? Math.round((Math.round(split.owedAmount * 100) * 10000) / totalPaise) : 0
    assignedUnits += units
    return [split.userId, String(units / 100)]
  }))
}

export default function SplitSelector({ totalAmount, participants = [], onChange, initialSplitType = 'equal', initialSplits = [] }) {
  const [splitType, setSplitType] = useState(initialSplitType)
  const [exactAmounts, setExactAmounts] = useState(() => Object.fromEntries(initialSplits.map(({ userId, owedAmount }) => [userId, String(owedAmount)])))
  const [percentages, setPercentages] = useState(() => initialPercentages(initialSplits, totalAmount))
  const [shares, setShares] = useState(() => Object.fromEntries(initialSplits.map(({ userId, owedAmount }) => [userId, String(owedAmount)])))
  const userIds = useMemo(() => participants.map(({ id }) => id), [participants])
  const amount = Number(totalAmount) || 0

  const calculation = useMemo(() => {
    let result
    let previewSplits

    if (splitType === 'equal') {
      result = splitEqual(amount, userIds)
      previewSplits = result.splits
    } else if (splitType === 'exact') {
      const inputs = Object.fromEntries(userIds.map((id) => [
        id,
        amountInputToPaise(exactAmounts[id]) === null ? Number.NaN : Number(exactAmounts[id] || 0),
      ]))
      result = splitExact(amount, inputs)
      previewSplits = result.valid
        ? result.splits
        : userIds.map((userId) => ({ userId, amount: Number(exactAmounts[userId]) || 0 }))
    } else if (splitType === 'percent') {
      const inputs = Object.fromEntries(userIds.map((id) => [id, Number(percentages[id]) || 0]))
      result = splitPercent(amount, inputs)
      previewSplits = result.valid ? result.splits : previewSplitPercent(amount, inputs)
    } else {
      const inputs = Object.fromEntries(userIds.map((id) => [id, Number(shares[id] ?? 1) || 0]))
      result = splitShares(amount, inputs)
      previewSplits = result.splits
    }

    return {
      splitType,
      valid: result.valid,
      error: result.error,
      splits: result.splits.map(({ userId, amount: owedAmount }) => ({ userId, owedAmount })),
      previewSplits: previewSplits.map(({ userId, amount: owedAmount }) => ({ userId, owedAmount })),
    }
  }, [amount, exactAmounts, percentages, shares, splitType, userIds])

  useEffect(() => {
    onChange?.({
      splitType: calculation.splitType,
      splits: calculation.splits,
      valid: calculation.valid,
      error: calculation.error,
    })
  }, [calculation, onChange])

  function changeMode(mode) {
    const nextType = modeTypes[mode]
    setSplitType(nextType)
    if (nextType === 'exact') setExactAmounts(Object.fromEntries(userIds.map((id) => [id, ''])))
    if (nextType === 'percent') setPercentages(Object.fromEntries(userIds.map((id) => [id, '0'])))
    if (nextType === 'shares') setShares(Object.fromEntries(userIds.map((id) => [id, '1'])))
  }

  const exactPaise = userIds.reduce((sum, id) => sum + (amountInputToPaise(exactAmounts[id]) ?? 0), 0)
  const exactInputValid = userIds.every((id) => amountInputToPaise(exactAmounts[id]) !== null)
  const exactDifference = Math.round((amount + Number.EPSILON) * 100) - exactPaise
  const percentTotalUnits = userIds.reduce((sum, id) => sum + (percentageUnits(percentages[id]) ?? 0), 0)
  const percentInputValid = userIds.every((id) => percentageUnits(percentages[id]) !== null)
  const percentDifference = 10000 - percentTotalUnits
  const activeMode = Object.keys(modeTypes).find((mode) => modeTypes[mode] === splitType)

  return (
    <section className="space-y-4" aria-label="Expense split">
      <div role="tablist" aria-label="Split method" className="grid grid-cols-4 rounded-md bg-slate-100 p-1">
        {splitModes.map((mode) => (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={activeMode === mode}
            onClick={() => changeMode(mode)}
            className={`min-h-10 rounded px-2 text-xs font-semibold transition-colors sm:text-sm ${
              activeMode === mode ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {participants.length === 0 ? (
        <EmptyState title="No split participants" message="Select at least one participant to split this expense." />
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => {
            const preview = calculation.previewSplits.find((item) => item.userId === participant.id)
            return (
              <div key={participant.id} className="grid grid-cols-[minmax(0,1fr)_8rem] items-center gap-3">
                <label htmlFor={`split-${splitType}-${participant.id}`} className="truncate text-sm font-medium text-slate-700">
                  {participant.name}
                </label>
                {splitType === 'exact' ? (
                  <input
                    id={`split-${splitType}-${participant.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={exactAmounts[participant.id] ?? ''}
                    onChange={(event) => setExactAmounts((current) => ({ ...current, [participant.id]: event.target.value }))}
                    className="h-10 w-full rounded-md border border-slate-300 px-3 text-right text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                    aria-label={`${participant.name} exact amount`}
                  />
                ) : splitType === 'percent' ? (
                  <div className="relative">
                    <input
                      id={`split-${splitType}-${participant.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={percentages[participant.id] ?? '0'}
                      onChange={(event) => setPercentages((current) => ({ ...current, [participant.id]: event.target.value }))}
                      className="h-10 w-full rounded-md border border-slate-300 px-3 pr-7 text-right text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                      aria-label={`${participant.name} percentage`}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">%</span>
                  </div>
                ) : splitType === 'shares' ? (
                  <input
                    id={`split-${splitType}-${participant.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={shares[participant.id] ?? '1'}
                    onChange={(event) => setShares((current) => ({ ...current, [participant.id]: event.target.value }))}
                    className="h-10 w-full rounded-md border border-slate-300 px-3 text-right text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                    aria-label={`${participant.name} shares`}
                  />
                ) : (
                  <span className="text-right text-sm font-semibold text-slate-800">
                    {preview ? formatCurrency(preview.owedAmount) : formatCurrency(0)}
                  </span>
                )}
                {splitType !== 'equal' && (
                  <p className="col-span-2 -mt-2 text-right text-xs font-medium text-slate-600">
                    {preview ? formatCurrency(preview.owedAmount) : formatCurrency(0)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {splitType === 'exact' && exactInputValid && (
        <p className={`text-sm ${exactDifference < 0 ? 'text-rose-700' : 'text-slate-600'}`}>
          {exactDifference > 0
            ? `${formatCurrency(exactDifference / 100)} left to assign`
            : exactDifference < 0
              ? `${formatCurrency(Math.abs(exactDifference) / 100)} over`
              : 'Amounts add up exactly.'}
        </p>
      )}
      {splitType === 'percent' && percentInputValid && (
        <p className={`text-sm ${percentDifference < 0 ? 'text-rose-700' : 'text-slate-600'}`}>
          {percentDifference > 0
            ? `${formatPercentUnits(percentDifference)} left to assign`
            : percentDifference < 0
              ? `Over by ${formatPercentUnits(Math.abs(percentDifference))}`
              : 'Percentages add up to 100%.'}
        </p>
      )}
      {calculation.error && splitType !== 'exact' && splitType !== 'percent' && (
        <p role="alert" className="text-sm text-rose-700">{calculation.error}</p>
      )}
      {splitType === 'exact' && !exactInputValid && (
        <p role="alert" className="text-sm text-rose-700">Use amounts with no more than two decimal places.</p>
      )}
      {splitType === 'percent' && !percentInputValid && (
        <p role="alert" className="text-sm text-rose-700">Use percentages with no more than two decimal places.</p>
      )}
    </section>
  )
}