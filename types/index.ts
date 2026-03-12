export type TradeStatus = 'pending' | 'closed'
export type Outcome = 'tp_hit' | 'sl_hit' | 'manual_close'
export type Setup = 'A' | 'B' | 'C' | 'D'
export type HTFBias = 'bullish' | 'bearish' | 'ranging'
export type Direction = 'long' | 'short'
export type Timeframe = '15m' | '1H' | '4H'
export type Session = 'Asia' | 'London' | 'New York'
export type Pair = 'BTC/USDT' | 'ETH/USDT' | 'SOL/USDT' | 'BONK/USDT'

export interface Trade {
  id: string
  created_at: string
  status: TradeStatus
  pair: Pair
  setup: Setup
  htf_bias: HTFBias
  direction: Direction
  timeframe: Timeframe
  trade_date: string
  trade_time: string
  trade_day: string
  session: Session
  entry_price: number
  stop_loss: number
  take_profit: number
  risk_usd: number
  portfolio_size?: number
  sl_pct: number
  position_size: number
  position_value: number
  gross_rr: number
  fee_usd: number
  fee_in_r: number
  overnight_fee: boolean
  net_rr: number
  net_reward_usd: number
  outcome?: Outcome
  close_price?: number
  rules_followed?: boolean
  rule_broken?: string
  rule_broken_notes?: string
  notes?: string
}

export interface TradeStats {
  total: number
  closed: number
  wins: number
  losses: number
  winRate: number
  avgGrossRR: number
  avgNetRR: number
  avgFeeInR: number
  expectancy: number
  bestPair: string
  bestSession: string
  bestDay: string
  bestTimeframe: string
  rulesFollowedWR: number
  rulesBrokenWR: number
}

export interface CalculatedFields {
  trade_day: string
  session: Session
  sl_pct: number
  position_size: number
  position_value: number
  gross_rr: number
  fee_usd: number
  fee_in_r: number
  net_rr: number
  net_reward_usd: number
}