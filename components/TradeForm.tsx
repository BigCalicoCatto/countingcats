'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { calculate } from '@/lib/calculations'
import { CalculatedFields, Pair, Setup, HTFBias, Direction, Timeframe } from '@/types'

const defaultCalc: CalculatedFields = {
  trade_day: '-', session: 'Asia', sl_pct: 0,
  position_size: 0, position_value: 0, gross_rr: 0,
  fee_usd: 0, fee_in_r: 0, net_rr: 0, net_reward_usd: 0,
}

export default function TradeForm({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) {
  const [pair, setPair] = useState<Pair>('BTC/USDT')
  const [setup] = useState<Setup>('A')
  const [htfBias, setHtfBias] = useState<HTFBias>('bullish')
  const [direction, setDirection] = useState<Direction>('long')
  const [timeframe, setTimeframe] = useState<Timeframe>('1H')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [riskUsd, setRiskUsd] = useState('')
  const [portfolioSize, setPortfolioSize] = useState('')
  const [overnightFee, setOvernightFee] = useState(false)
  const [rulesFollowed, setRulesFollowed] = useState<boolean | null>(null)
  const [ruleBroken, setRuleBroken] = useState('')
  const [ruleBrokenNotes, setRuleBrokenNotes] = useState('')
  const [notes, setNotes] = useState('')
  const [calc, setCalc] = useState<CalculatedFields>(defaultCalc)
  const [utcNow, setUtcNow] = useState(new Date())
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const interval = setInterval(() => setUtcNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const e = parseFloat(entryPrice)
    const s = parseFloat(stopLoss)
    const t = parseFloat(takeProfit)
    const r = parseFloat(riskUsd)
    if (e > 0 && s > 0 && t > 0 && r > 0 && e !== s) {
      setCalc(calculate(e, s, t, r, overnightFee, utcNow))
    }
  }, [entryPrice, stopLoss, takeProfit, riskUsd, overnightFee, utcNow])

  const utcDateStr = utcNow.toISOString().split('T')[0]
  const utcTimeStr = utcNow.toISOString().split('T')[1].substring(0, 8)

  async function handleSubmit() {
    setErrorMsg('')
    setSuccessMsg('')
    const e = parseFloat(entryPrice)
    const s = parseFloat(stopLoss)
    const tp = parseFloat(takeProfit)
    const r = parseFloat(riskUsd)
    if (!e || !s || !tp || !r) { setErrorMsg('Fill in Entry, SL, TP and Risk $ first.'); return }
    setSubmitting(true)
    const { error } = await supabase.from('forward_trades').insert([{
      status: 'pending',
      pair, setup, htf_bias: htfBias, direction, timeframe,
      trade_date: utcDateStr, trade_time: utcTimeStr,
      trade_day: calc.trade_day, session: calc.session,
      entry_price: e, stop_loss: s, take_profit: tp, risk_usd: r,
      portfolio_size: portfolioSize ? parseFloat(portfolioSize) : null,
      sl_pct: calc.sl_pct, position_size: calc.position_size,
      position_value: calc.position_value, gross_rr: calc.gross_rr,
      fee_usd: calc.fee_usd, fee_in_r: calc.fee_in_r,
      overnight_fee: overnightFee, net_rr: calc.net_rr,
      net_reward_usd: calc.net_reward_usd,
      rules_followed: rulesFollowed,
      rule_broken: ruleBroken || null,
      rule_broken_notes: ruleBrokenNotes || null,
      notes: notes || null,
    }])
    setSubmitting(false)
    if (error) { setErrorMsg(error.message); return }
    setSuccessMsg('Trade logged successfully.')
    setEntryPrice(''); setStopLoss(''); setTakeProfit('')
    setRiskUsd(''); setPortfolioSize(''); setOvernightFee(false)
    setRulesFollowed(null); setRuleBroken(''); setRuleBrokenNotes(''); setNotes('')
    setCalc(defaultCalc)
    onSubmitSuccess?.()
  }

  const labelClass = "block text-xs font-bold tracking-widest text-pink-400 mb-1 uppercase"
  const inputClass = "w-full bg-black border border-pink-900 text-green-300 font-mono text-sm px-3 py-2 rounded focus:outline-none focus:border-pink-500 placeholder-gray-700"
  const selectClass = "w-full bg-black border border-pink-900 text-green-300 font-mono text-sm px-3 py-2 rounded focus:outline-none focus:border-pink-500"
  const calcBox = "bg-black border border-pink-900 rounded px-3 py-2 text-green-400 font-mono text-sm"

  return (
    <div className="font-mono">
      <div className="mb-6 border border-pink-800 rounded-lg p-4 bg-black">
        <div className="text-xs tracking-widest text-pink-500 mb-1 uppercase">UTC Clock</div>
        <div className="text-green-400 text-lg">{utcDateStr} {utcTimeStr}</div>
        <div className="text-pink-400 text-xs mt-1">{calc.trade_day} — {calc.session} Session</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>Pair</label>
          <select className={selectClass} value={pair} onChange={e => setPair(e.target.value as Pair)}>
            {['BTC/USDT','ETH/USDT','SOL/USDT','BONK/USDT'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Setup</label>
          <div className={`${calcBox} text-pink-400 font-bold`}>A — Forward Test</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className={labelClass}>HTF Bias</label>
          <select className={selectClass} value={htfBias} onChange={e => setHtfBias(e.target.value as HTFBias)}>
            <option value="bullish">Bullish</option>
            <option value="bearish">Bearish</option>
            <option value="ranging">Ranging</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Direction</label>
          <select className={selectClass} value={direction} onChange={e => setDirection(e.target.value as Direction)}>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Timeframe</label>
          <select className={selectClass} value={timeframe} onChange={e => setTimeframe(e.target.value as Timeframe)}>
            <option value="15m">15m</option>
            <option value="1H">1H</option>
            <option value="4H">4H</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>Entry Price</label>
          <input className={inputClass} type="number" placeholder="0.00" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Stop Loss</label>
          <input className={inputClass} type="number" placeholder="0.00" value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Take Profit</label>
          <input className={inputClass} type="number" placeholder="0.00" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Risk $</label>
          <input className={inputClass} type="number" placeholder="0.00" value={riskUsd} onChange={e => setRiskUsd(e.target.value)} />
        </div>
      </div>

      <div className="mb-4">
        <label className={labelClass}>Portfolio Size (optional)</label>
        <input className={inputClass} type="number" placeholder="0.00" value={portfolioSize} onChange={e => setPortfolioSize(e.target.value)} />
      </div>

      <div className="mb-6">
        <label className={labelClass}>Overnight Fee</label>
        <button
          onClick={() => setOvernightFee(!overnightFee)}
          className={`px-4 py-2 rounded border font-mono text-sm font-bold tracking-widest transition-all ${overnightFee ? 'bg-pink-700 border-pink-500 text-white' : 'bg-black border-pink-900 text-pink-700'}`}
        >
          {overnightFee ? '● ON' : '○ OFF'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 border border-pink-900 rounded-lg p-4 bg-black">
        <div className="text-xs tracking-widest text-pink-500 uppercase col-span-2 mb-2">Auto-Calculated</div>
        {[
          ['SL %', `${calc.sl_pct}%`],
          ['Position Size', calc.position_size],
          ['Position Value', `$${calc.position_value}`],
          ['Gross RR', `${calc.gross_rr}R`],
          ['Fee $', `$${calc.fee_usd}`],
          ['Fee in R', `${calc.fee_in_r}R`],
          ['Net RR', `${calc.net_rr}R`],
          ['Net Reward $', `$${calc.net_reward_usd}`],
        ].map(([label, val]) => (
          <div key={label as string}>
            <div className="text-xs text-pink-600 uppercase tracking-widest">{label}</div>
            <div className={`font-mono text-sm font-bold ${String(val).includes('-') ? 'text-red-400' : 'text-green-400'}`}>{val}</div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className={labelClass}>Rules Followed?</label>
        <div className="flex gap-3">
          {[true, false].map(val => (
            <button key={String(val)}
              onClick={() => setRulesFollowed(val)}
              className={`px-4 py-2 rounded border font-mono text-sm font-bold tracking-widest transition-all ${rulesFollowed === val ? (val ? 'bg-green-800 border-green-500 text-green-300' : 'bg-red-900 border-red-500 text-red-300') : 'bg-black border-pink-900 text-pink-700'}`}
            >
              {val ? 'YES' : 'NO'}
            </button>
          ))}
        </div>
      </div>

      {rulesFollowed === false && (
        <div className="mb-4">
          <label className={labelClass}>Rule Broken</label>
          <select className={selectClass} value={ruleBroken} onChange={e => setRuleBroken(e.target.value)}>
            <option value="">Select...</option>
            <option value="HTF bias not confirmed">HTF bias not confirmed</option>
            <option value="Against market direction">Against market direction</option>
            <option value="Other">Other</option>
          </select>
          <div className="mt-2">
            <label className={labelClass}>Rule Broken Notes</label>
            <input className={inputClass} type="text" placeholder="Details..." value={ruleBrokenNotes} onChange={e => setRuleBrokenNotes(e.target.value)} />
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className={labelClass}>Notes</label>
        <textarea className={`${inputClass} h-20 resize-none`} placeholder="Optional notes..." value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {errorMsg && <div className="mb-4 text-red-400 text-sm font-mono border border-red-800 rounded px-3 py-2">{errorMsg}</div>}
      {successMsg && <div className="mb-4 text-green-400 text-sm font-mono border border-green-800 rounded px-3 py-2">{successMsg}</div>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3 bg-pink-700 hover:bg-pink-600 disabled:bg-pink-900 text-white font-bold tracking-widest uppercase rounded border border-pink-500 transition-all font-mono"
      >
        {submitting ? 'LOGGING...' : '⬡ LOG TRADE'}
      </button>
    </div>
  )
}