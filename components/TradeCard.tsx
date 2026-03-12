'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Trade, Outcome } from '@/types'

export default function TradeCard({ trade, onUpdate }: { trade: Trade; onUpdate?: () => void }) {
  const [updating, setUpdating] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [outcome, setOutcome] = useState<Outcome>('tp_hit')
  const [closePrice, setClosePrice] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleUpdate() {
    setUpdating(true)
    setErrorMsg('')
    const { error } = await supabase
      .from('forward_trades')
      .update({
        outcome,
        status: 'closed',
        close_price: closePrice ? parseFloat(closePrice) : null,
      })
      .eq('id', trade.id)
    setUpdating(false)
    if (error) { setErrorMsg(error.message); return }
    setShowUpdateForm(false)
    onUpdate?.()
  }

  const outcomeBadge = () => {
    if (!trade.outcome && trade.status === 'pending') return <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-900 text-yellow-300 border border-yellow-700">⏳ PENDING</span>
    if (trade.outcome === 'tp_hit') return <span className="px-2 py-1 rounded text-xs font-bold bg-green-900 text-green-300 border border-green-700">✓ TP HIT</span>
    if (trade.outcome === 'sl_hit') return <span className="px-2 py-1 rounded text-xs font-bold bg-red-900 text-red-300 border border-red-700">✗ SL HIT</span>
    if (trade.outcome === 'manual_close') return <span className="px-2 py-1 rounded text-xs font-bold bg-orange-900 text-orange-300 border border-orange-700">◎ MANUAL</span>
  }

  const biasPill = () => {
    if (trade.htf_bias === 'bullish') return <span className="px-2 py-1 rounded text-xs font-bold bg-green-900 text-green-300 border border-green-800">▲ BULLISH</span>
    if (trade.htf_bias === 'bearish') return <span className="px-2 py-1 rounded text-xs font-bold bg-red-900 text-red-300 border border-red-800">▼ BEARISH</span>
    return <span className="px-2 py-1 rounded text-xs font-bold bg-gray-800 text-gray-400 border border-gray-700">◆ RANGING</span>
  }

  const directionPill = () => {
    if (trade.direction === 'long') return <span className="px-2 py-1 rounded text-xs font-bold bg-green-900 text-green-300 border border-green-800">▲ LONG</span>
    return <span className="px-2 py-1 rounded text-xs font-bold bg-red-900 text-red-300 border border-red-800">▼ SHORT</span>
  }

  const netRRColor = trade.outcome === 'tp_hit' ? 'text-green-400' : trade.outcome === 'sl_hit' ? 'text-red-400' : 'text-yellow-400'
  const inputClass = "w-full bg-black border border-pink-900 text-green-300 font-mono text-sm px-3 py-2 rounded focus:outline-none focus:border-pink-500"
  const selectClass = "w-full bg-black border border-pink-900 text-green-300 font-mono text-sm px-3 py-2 rounded focus:outline-none focus:border-pink-500"

  return (
    <div className="border border-pink-900 rounded-lg bg-black p-4 font-mono hover:border-pink-700 transition-all">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-green-400 font-bold text-sm">{trade.pair}</span>
          <span className="px-2 py-1 rounded text-xs font-bold bg-pink-900 text-pink-300 border border-pink-700">SETUP {trade.setup}</span>
          <span className="px-2 py-1 rounded text-xs font-bold bg-black text-pink-400 border border-pink-800">{trade.timeframe}</span>
        </div>
        {outcomeBadge()}
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {biasPill()}
        {directionPill()}
        <span className="px-2 py-1 rounded text-xs font-bold bg-black text-pink-500 border border-pink-900">{trade.session}</span>
        <span className="px-2 py-1 rounded text-xs font-bold bg-black text-pink-500 border border-pink-900">{trade.trade_day}</span>
      </div>

      <div className="text-xs text-pink-600 mb-3">{trade.trade_date} {trade.trade_time} UTC</div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[['ENTRY', trade.entry_price], ['SL', trade.stop_loss], ['TP', trade.take_profit]].map(([label, val]) => (
          <div key={label as string} className="border border-pink-900 rounded px-2 py-1 text-center">
            <div className="text-xs text-pink-600 uppercase">{label}</div>
            <div className="text-green-400 text-xs font-bold">{val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        <div>
          <div className="text-xs text-pink-600 uppercase">Risk $</div>
          <div className="text-green-400 text-xs font-bold">${trade.risk_usd}</div>
        </div>
        <div>
          <div className="text-xs text-pink-600 uppercase">Gross RR</div>
          <div className="text-green-400 text-xs font-bold">{trade.gross_rr}R</div>
        </div>
        <div>
          <div className="text-xs text-pink-600 uppercase">Fee $</div>
          <div className="text-pink-400 text-xs font-bold">${trade.fee_usd}</div>
        </div>
        <div>
          <div className="text-xs text-pink-600 uppercase">Net RR</div>
          <div className={`text-xs font-bold ${netRRColor}`}>{trade.net_rr}R</div>
        </div>
      </div>

      {trade.rules_followed === false && (
        <div className="border border-red-900 rounded px-3 py-2 mb-3 bg-red-950">
          <div className="text-red-400 text-xs font-bold mb-1">⚠ RULES BROKEN — {trade.rule_broken}</div>
          {trade.rule_broken_notes && <div className="text-red-300 text-xs">{trade.rule_broken_notes}</div>}
        </div>
      )}

      {trade.notes && (
        <div className="border border-pink-900 rounded px-3 py-2 mb-3">
          <div className="text-pink-500 text-xs uppercase tracking-widest mb-1">Notes</div>
          <div className="text-green-300 text-xs">{trade.notes}</div>
        </div>
      )}

      {trade.status === 'pending' && !showUpdateForm && (
        <button
          onClick={() => setShowUpdateForm(true)}
          className="w-full py-2 mt-1 border border-pink-700 text-pink-400 hover:bg-pink-900 hover:text-white rounded text-xs font-bold tracking-widest uppercase transition-all"
        >
          UPDATE OUTCOME
        </button>
      )}

      {showUpdateForm && (
        <div className="mt-3 border border-pink-800 rounded p-3 bg-black">
          <div className="text-xs text-pink-500 uppercase tracking-widest mb-3">Close Trade</div>
          <div className="mb-3">
            <label className="block text-xs text-pink-400 uppercase tracking-widest mb-1">Outcome</label>
            <select className={selectClass} value={outcome} onChange={e => setOutcome(e.target.value as Outcome)}>
              <option value="tp_hit">TP Hit</option>
              <option value="sl_hit">SL Hit</option>
              <option value="manual_close">Manual Close</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-pink-400 uppercase tracking-widest mb-1">Close Price (optional)</label>
            <input className={inputClass} type="number" placeholder="0.00" value={closePrice} onChange={e => setClosePrice(e.target.value)} />
          </div>
          {errorMsg && <div className="text-red-400 text-xs mb-2">{errorMsg}</div>}
          <div className="flex gap-2">
            <button onClick={handleUpdate} disabled={updating}
              className="flex-1 py-2 bg-pink-700 hover:bg-pink-600 disabled:bg-pink-900 text-white rounded text-xs font-bold tracking-widest uppercase transition-all">
              {updating ? 'SAVING...' : 'CONFIRM'}
            </button>
            <button onClick={() => setShowUpdateForm(false)}
              className="flex-1 py-2 border border-pink-900 text-pink-600 hover:border-pink-700 rounded text-xs font-bold tracking-widest uppercase transition-all">
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}