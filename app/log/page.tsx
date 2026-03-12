'use client'

export const dynamic = 'force-dynamic'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { calculateStats } from '@/lib/calculations'
import { exportToCSV } from '@/utils/export'
import { Trade, TradeStats } from '@/types'

const StatsPanel = dynamic(() => import('@/components/StatsPanel'), { ssr: false })
const TradeCard = dynamic(() => import('@/components/TradeCard'), { ssr: false })

export default function HomePage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState<TradeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'closed'>('all')

  async function fetchTrades() {
    setLoading(true)
    const { data } = await supabase
      .from('forward_trades')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      setTrades(data as Trade[])
      setStats(calculateStats(data))
    }
    setLoading(false)
  }

  useEffect(() => { fetchTrades() }, [])

  const filtered = trades.filter(t => {
    if (filter === 'pending') return t.status === 'pending'
    if (filter === 'closed') return t.status === 'closed'
    return true
  })

  const pending = trades.filter(t => t.status === 'pending')

  return (
    <div className="font-mono">
      <div className="mb-8">
        <div className="text-xs text-pink-600 uppercase tracking-widest mb-1">FatCat Forward Test</div>
        <h1 className="text-2xl font-bold text-pink-400 tracking-widest">OVERVIEW</h1>
        {pending.length > 0 && (
          <div className="mt-3 px-3 py-2 border border-yellow-800 rounded bg-yellow-950 text-yellow-400 text-xs font-bold tracking-widest">
            ⏳ {pending.length} PENDING TRADE{pending.length > 1 ? 'S' : ''} — UPDATE OUTCOMES BELOW
          </div>
        )}
      </div>

      {loading && (
        <div className="text-pink-500 text-sm tracking-widest animate-pulse mb-8">LOADING...</div>
      )}

      {!loading && stats && (
        <div className="mb-10">
          <div className="text-xs text-pink-600 uppercase tracking-widest mb-4">Performance Stats</div>
          <StatsPanel stats={stats} />
        </div>
      )}

      {!loading && trades.length > 0 && (
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-pink-600 uppercase tracking-widest">Trade Log</div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'closed'] as const).map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded border text-xs font-bold tracking-widest uppercase transition-all ${filter === f ? 'bg-pink-700 border-pink-500 text-white' : 'bg-black border-pink-900 text-pink-600 hover:border-pink-700'}`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => exportToCSV(trades)}
              className="px-3 py-1 rounded border border-green-800 text-green-500 hover:bg-green-900 hover:text-green-300 text-xs font-bold tracking-widest uppercase transition-all"
            >
              ↓ CSV
            </button>
          </div>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 border border-pink-900 rounded-lg">
          <div className="text-pink-700 text-4xl mb-4">⬡</div>
          <div className="text-pink-600 text-sm tracking-widest uppercase">No trades yet</div>
          <div className="text-pink-800 text-xs mt-2">Go to Log Trade to add your first trade</div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filtered.map(trade => (
          <TradeCard key={trade.id} trade={trade} onUpdate={fetchTrades} />
        ))}
      </div>
    </div>
  )
}