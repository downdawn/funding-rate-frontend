"use client"
import { getTopVolumeFundingRateAgg } from "@/lib/api"
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatVolume } from '@/lib/utils'
import ExchangeDetailTable from '@/components/exchange-detail-table'

const periodList = [
  { key: "hour", label: "小时" },
  { key: "day", label: "天" },
  { key: "week", label: "周" },
  { key: "month", label: "月" },
  { key: "quarter", label: "季度" },
  { key: "year", label: "年" },
]

export default function ExchangeDetailPage() {
  const params = useParams();
  const exchange = params?.exchange as string;
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (exchange) fetchData()
  }, [exchange])

  async function fetchData() {
    setLoading(true)
    try {
      // 新接口支持exchange参数
      const data = await getTopVolumeFundingRateAgg({ exchange, top_n: 50 })
      setRows(data)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">交易所</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {exchange}
                </h1>
                <p className="text-sm text-muted-foreground">该交易所下所有币对的多周期资金费率</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <ExchangeDetailTable exchange={exchange} />
      </div>
    </div>
  )
} 