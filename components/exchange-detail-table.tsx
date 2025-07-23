import { useEffect, useState } from 'react'
import { getTopVolumeFundingRateAgg } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatVolume } from '@/lib/utils'

const periodList = [
  { key: 'hour', label: '小时' },
  { key: 'day', label: '天' },
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
  { key: 'quarter', label: '季度' },
  { key: 'year', label: '年' },
]

interface ExchangeDetailTableProps {
  exchange: string
  topN?: number
  symbol?: string
}

export default function ExchangeDetailTable({ exchange, topN = 50, symbol }: ExchangeDetailTableProps) {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (exchange) fetchData()
    else setRows([])
    // eslint-disable-next-line
  }, [exchange, topN, symbol])

  async function fetchData() {
    setLoading(true)
    try {
      const data = await getTopVolumeFundingRateAgg({ exchange, top_n: topN })
      let filtered = data
      if (symbol) {
        filtered = data.filter((row: any) => row.symbol === symbol)
      }
      setRows(filtered)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  return (
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
  )
} 