import { CalculatedFields, Session } from '@/types'

function getSession(utcHour: number): Session {
  if (utcHour >= 0 && utcHour <= 7) return 'Asia'
  if (utcHour >= 8 && utcHour <= 12) return 'London'
  return 'New York'
}

function getDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
}

export function calculate(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  riskUsd: number,
  overnightFee: boolean,
  utcDate: Date
): CalculatedFields {
  const slDistance = Math.abs(entryPrice - stopLoss)
  const positionSize = riskUsd / slDistance
  const positionValue = positionSize * entryPrice

  const tpDistance = Math.abs(takeProfit - entryPrice)
  const grossReward = positionSize * tpDistance
  const grossRR = grossReward / riskUsd

  const feeUsd = positionValue * 0.0008
  const overnightFeeUsd = overnightFee ? positionValue * 0.000033 : 0
  const netReward = grossReward - feeUsd - overnightFeeUsd
  const netRR = netReward / riskUsd
  const feeInR = feeUsd / riskUsd

  const slPct = (slDistance / entryPrice) * 100

  const utcHour = utcDate.getUTCHours()
  const session = getSession(utcHour)
  const tradeDay = getDay(utcDate)

  return {
    trade_day: tradeDay,
    session,
    sl_pct: Math.round(slPct * 10000) / 10000,
    position_size: Math.round(positionSize * 10000) / 10000,
    position_value: Math.round(positionValue * 100) / 100,
    gross_rr: Math.round(grossRR * 100) / 100,
    fee_usd: Math.round(feeUsd * 100) / 100,
    fee_in_r: Math.round(feeInR * 10000) / 10000,
    net_rr: Math.round(netRR * 100) / 100,
    net_reward_usd: Math.round(netReward * 100) / 100,
  }
}

export function calculateStats(trades: any[]) {
  const closed = trades.filter(t => t.status === 'closed')
  const wins = closed.filter(t => t.outcome === 'tp_hit')
  const losses = closed.filter(t => t.outcome === 'sl_hit')

  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0
  const avgGrossRR = closed.length > 0 ? closed.reduce((a, t) => a + t.gross_rr, 0) / closed.length : 0
  const avgNetRR = closed.length > 0 ? closed.reduce((a, t) => a + t.net_rr, 0) / closed.length : 0
  const avgFeeInR = closed.length > 0 ? closed.reduce((a, t) => a + t.fee_in_r, 0) / closed.length : 0
  const expectancy = (winRate / 100) * avgNetRR + ((1 - winRate / 100) * -1)

  const rulesFollowed = closed.filter(t => t.rules_followed === true)
  const rulesBroken = closed.filter(t => t.rules_followed === false)
  const rulesFollowedWins = rulesFollowed.filter(t => t.outcome === 'tp_hit')
  const rulesBrokenWins = rulesBroken.filter(t => t.outcome === 'tp_hit')
  const rulesFollowedWR = rulesFollowed.length > 0 ? (rulesFollowedWins.length / rulesFollowed.length) * 100 : 0
  const rulesBrokenWR = rulesBroken.length > 0 ? (rulesBrokenWins.length / rulesBroken.length) * 100 : 0

  function best(field: string) {
    const groups: Record<string, { wins: number; total: number }> = {}
    closed.forEach(t => {
      const key = t[field]
      if (!groups[key]) groups[key] = { wins: 0, total: 0 }
      groups[key].total++
      if (t.outcome === 'tp_hit') groups[key].wins++
    })
    let bestKey = '-'
    let bestWR = -1
    Object.entries(groups).forEach(([key, val]) => {
      const wr = val.total > 0 ? val.wins / val.total : 0
      if (wr > bestWR) { bestWR = wr; bestKey = key }
    })
    return bestKey
  }

  return {
    total: trades.length,
    closed: closed.length,
    wins: wins.length,
    losses: losses.length,
    winRate: Math.round(winRate * 10) / 10,
    avgGrossRR: Math.round(avgGrossRR * 100) / 100,
    avgNetRR: Math.round(avgNetRR * 100) / 100,
    avgFeeInR: Math.round(avgFeeInR * 10000) / 10000,
    expectancy: Math.round(expectancy * 100) / 100,
    bestPair: best('pair'),
    bestSession: best('session'),
    bestDay: best('trade_day'),
    bestTimeframe: best('timeframe'),
    rulesFollowedWR: Math.round(rulesFollowedWR * 10) / 10,
    rulesBrokenWR: Math.round(rulesBrokenWR * 10) / 10,
  }
}