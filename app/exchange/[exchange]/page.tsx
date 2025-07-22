"use client"
import { getTopVolumeFundingRateAgg } from "@/lib/api"
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatVolume } from '@/lib/utils'

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
            <div className="flex items-center space-x-2">
              <span className="bg-green-50 text-green-700 border-green-200 border rounded px-2 py-1 text-xs font-semibold">实时数据</span>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>币对资金费率</CardTitle>
            <CardDescription>展示该交易所下所有币对的多周期资金费率</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>币对</TableHead>
                      <TableHead>成交量</TableHead>
                      {periodList.map((p) => (
                        <TableHead key={p.key}>{p.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.symbol}>
                        <TableCell className="font-medium text-purple-700 cursor-pointer hover:underline"
                          onClick={() => window.location.href = `/pair/${encodeURIComponent(exchange)}/${encodeURIComponent(row.symbol)}`}
                        >
                          {row.symbol}
                        </TableCell>
                        <TableCell>{formatVolume(row.volume)}</TableCell>
                        {periodList.map((p) => (
                          <TableCell key={p.key}>
                            {row.aggs && row.aggs[p.key] ? (
                              <div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>{(row.aggs[p.key].total_rate * 100).toFixed(5)}%</div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div>周期: {row.aggs[p.key].period_value}</div>
                                  </TooltipContent>
                                </Tooltip>
                                <div className="text-xs text-gray-400">APR: {(row.aggs[p.key].apr * 100).toFixed(2)}%</div>
                              </div>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 