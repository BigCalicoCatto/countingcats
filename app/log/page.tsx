'use client'

export const dynamic = 'force-dynamic'

import TradeForm from '@/components/TradeForm'
import { useRouter } from 'next/navigation'

export default function LogPage() {
  const router = useRouter()

  return (
    <div className="font-mono">
      <div className="mb-8">
        <div className="text-xs text-pink-600 uppercase tracking-widest mb-1">FatCat Forward Test</div>
        <h1 className="text-2xl font-bold text-pink-400 tracking-widest">LOG TRADE</h1>
        <div className="text-xs text-pink-700 mt-1">Setup A — Forward Test Only</div>
      </div>
      <TradeForm onSubmitSuccess={() => router.push('/')} />
    </div>
  )
}