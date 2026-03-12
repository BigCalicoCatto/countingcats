import { TradeStats } from '@/types'

export default function StatsPanel({ stats }: { stats: TradeStats }) {
  const statBlock = (label: string, value: string | number, color = 'text-green-400') => (
    <div className="border border-pink-900 rounded-lg p-3 bg-black">
      <div className="text-xs text-pink-500 uppercase tracking-widest mb-1">{label}</div>
      <div className={`font-mono font-bold text-lg ${color}`}>{value}</div>
    </div>
  )

  const winRateColor = stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'
  const expectancyColor = stats.expectancy >= 0 ? 'text-green-400' : 'text-red-400'
  const netRRColor = stats.avgNetRR >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="font-mono">
      <div className="grid grid-cols-2 gap-3 mb-3 sm:grid-cols-4">
        {statBlock('Total Trades', stats.total, 'text-pink-400')}
        {statBlock('Closed', stats.closed, 'text-pink-400')}
        {statBlock('Wins', stats.wins, 'text-green-400')}
        {statBlock('Losses', stats.losses, 'text-red-400')}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 sm:grid-cols-4">
        {statBlock('Win Rate', `${stats.winRate}%`, winRateColor)}
        {statBlock('Avg Gross RR', `${stats.avgGrossRR}R`, 'text-green-400')}
        {statBlock('Avg Net RR', `${stats.avgNetRR}R`, netRRColor)}
        {statBlock('Avg Fee in R', `${stats.avgFeeInR}R`, 'text-pink-400')}
      </div>

      <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2">
        {statBlock('Expectancy', `${stats.expectancy}R`, expectancyColor)}
        <div className="border border-pink-900 rounded-lg p-3 bg-black">
          <div className="text-xs text-pink-500 uppercase tracking-widest mb-2">Discipline Edge</div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-green-400">Rules Followed WR</span>
            <span className="font-bold text-green-400">{stats.rulesFollowedWR}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-red-400">Rules Broken WR</span>
            <span className="font-bold text-red-400">{stats.rulesBrokenWR}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border border-pink-900 rounded-lg p-3 bg-black">
          <div className="text-xs text-pink-500 uppercase tracking-widest mb-1">Best Pair</div>
          <div className="text-green-400 font-bold text-sm">{stats.bestPair}</div>
        </div>
        <div className="border border-pink-900 rounded-lg p-3 bg-black">
          <div className="text-xs text-pink-500 uppercase tracking-widest mb-1">Best Session</div>
          <div className="text-green-400 font-bold text-sm">{stats.bestSession}</div>
        </div>
        <div className="border border-pink-900 rounded-lg p-3 bg-black">
          <div className="text-xs text-pink-500 uppercase tracking-widest mb-1">Best Day</div>
          <div className="text-green-400 font-bold text-sm">{stats.bestDay}</div>
        </div>
        <div className="border border-pink-900 rounded-lg p-3 bg-black">
          <div className="text-xs text-pink-500 uppercase tracking-widest mb-1">Best Timeframe</div>
          <div className="text-green-400 font-bold text-sm">{stats.bestTimeframe}</div>
        </div>
      </div>
    </div>
  )
}