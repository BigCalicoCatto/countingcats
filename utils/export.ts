import { Trade } from '@/types'

export function exportToCSV(trades: Trade[], filename = 'forward_trades.csv') {
  const headers = [
    'Date', 'Time', 'Day', 'Session', 'Pair', 'Setup', 'HTF Bias', 'Direction',
    'Timeframe', 'Entry', 'Stop Loss', 'Take Profit', 'Risk $', 'Portfolio Size',
    'SL %', 'Position Size', 'Position Value', 'Gross RR', 'Fee $', 'Fee in R',
    'Overnight Fee', 'Net RR', 'Net Reward $', 'Outcome', 'Close Price',
    'Rules Followed', 'Rule Broken', 'Rule Broken Notes', 'Notes', 'Status'
  ]

  const rows = trades.map(t => [
    t.trade_date,
    t.trade_time,
    t.trade_day,
    t.session,
    t.pair,
    t.setup,
    t.htf_bias,
    t.direction,
    t.timeframe,
    t.entry_price,
    t.stop_loss,
    t.take_profit,
    t.risk_usd,
    t.portfolio_size ?? '',
    t.sl_pct,
    t.position_size,
    t.position_value,
    t.gross_rr,
    t.fee_usd,
    t.fee_in_r,
    t.overnight_fee ? 'Yes' : 'No',
    t.net_rr,
    t.net_reward_usd,
    t.outcome ?? 'pending',
    t.close_price ?? '',
    t.rules_followed === true ? 'Yes' : t.rules_followed === false ? 'No' : '',
    t.rule_broken ?? '',
    t.rule_broken_notes ?? '',
    t.notes ?? '',
    t.status
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}