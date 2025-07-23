"use client"
import { getFundingRateAgg, getFundingRates } from "@/lib/api"
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatToGmt8 } from "@/lib/utils"

const periodList = [
  { key: "hour", label: "小时" },
  { key: "day", label: "天" },
  { key: "week", label: "周" },
  { key: "month", label: "月" },
  { key: "quarter", label: "季度" },
  { key: "year", label: "年" },
]

export default function PairDetailPage() {
  const params = useParams();
  const exchangeRaw = params?.exchange as string;
  const symbolRaw = params?.symbol as string;
  const exchange = decodeURIComponent(exchangeRaw);
  const symbol = decodeURIComponent(symbolRaw);

  const [aggRow, setAggRow] = useState<any | null>(null)
  const [loadingAgg, setLoadingAgg] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  // 默认只请求小时数据

  useEffect(() => {
    fetchAgg()
  }, [exchange, symbol])

  useEffect(() => {
    fetchHistory()
  }, [exchange, symbol])

  async function fetchAgg() {
    setLoadingAgg(true)
    try {
      const data = await getFundingRateAgg({ exchange, symbol, limit: 1000 })
      // 聚合该平台+币对的多周期数据为一行
      const rates: Record<string, { total_rate: number; apr: number }> = {}
      for (const item of data) {
        if (periodList.some(p => p.key === item.period_type)) {
          rates[item.period_type] = {
            total_rate: item.total_rate,
            apr: item.apr,
          }
        }
      }
      setAggRow({ exchange, symbol, rates })
    } catch {
      setAggRow(null)
    } finally {
      setLoadingAgg(false)
    }
  }

  async function fetchHistory() {
    setLoadingHistory(true)
    try {
      const data = await getFundingRates({ exchange, symbol, limit: 100, period_type: "hour" })
      const arr = (data || []).slice().sort((a: any, b: any) => a.timestamp - b.timestamp)
      console.log('history', arr)
      setHistory(arr)
    } catch {
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">币对</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {symbol}（{exchange}）
              </h1>
              <p className="text-sm text-muted-foreground">展示该交易所下该币对的多周期聚合资金费率和历史走势</p>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>资金费率历史走势</CardTitle>
            <CardDescription>最近100条小时数据</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="text-muted-foreground py-8">加载中...</div>
            ) : history.length === 0 ? (
              <div className="text-muted-foreground py-8">暂无数据</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="funding_time" tickFormatter={v => v ? formatToGmt8((history.find(item => item.funding_time === v)?.timestamp ?? 0)) : ''} />
                  <YAxis domain={['auto', 'auto']} tickFormatter={v => (v * 100).toFixed(3) + '%'} />
                  <Tooltip formatter={v => (v as number * 100).toFixed(5) + '%'} labelFormatter={l => formatToGmt8((history.find(item => item.funding_time === l)?.timestamp ?? 0))} />
                  <Line type="monotone" dataKey="funding_rate" stroke="#8884d8" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>各周期聚合资金费率</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAgg ? (
              <div className="text-muted-foreground py-8">加载中...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {periodList.map((p) => (
                        <TableHead key={p.key}>{p.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {periodList.map((p) => (
                        <TableCell key={p.key}>
                          {aggRow && aggRow.rates[p.key] ? (
                            <>
                              <div>{(aggRow.rates[p.key].total_rate * 100).toFixed(5)}%</div>
                              <div className="text-xs text-gray-400">APR: {(aggRow.rates[p.key].apr * 100).toFixed(2)}%</div>
                            </>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
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