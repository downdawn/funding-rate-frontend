import { useEffect, useState } from 'react'
import { getTopVolumeFundingRateAgg } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatVolume } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getRankMap } from "@/lib/rankColor"
import RankedTableCell from "@/components/RankedTableCell"

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
  const [sortField, setSortField] = useState<string>('volume')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  function handleSort(field: string) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  function getSortedRows() {
    const sorted = [...rows]
    if (!sortField) return sorted
    return sorted.sort((a, b) => {
      let aValue: any, bValue: any
      if (sortField === 'symbol') {
        aValue = a.symbol
        bValue = b.symbol
        return sortOrder === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue))
      } else if (sortField === 'volume') {
        aValue = a.volume ?? 0
        bValue = b.volume ?? 0
      } else {
        aValue = a.aggs?.[sortField]?.total_rate ?? -Infinity
        bValue = b.aggs?.[sortField]?.total_rate ?? -Infinity
      }
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })
  }

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

  const sortedRows = getSortedRows()
  const periodRankMap = getRankMap(
    sortedRows,
    periodList,
    (row, key) => row.aggs?.[key]?.total_rate
  )

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
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('symbol')}
                  >
                    币对
                    {sortField === 'symbol' && (sortOrder === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('volume')}
                  >
                    成交量
                    {sortField === 'volume' && (sortOrder === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                  </TableHead>
                  {periodList.map((p) => (
                    <TableHead
                      key={p.key}
                      className="cursor-pointer select-none"
                      onClick={() => handleSort(p.key)}
                    >
                      {p.label}
                      {sortField === p.key && (sortOrder === 'asc' ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRows.map((row) => (
                  <TableRow key={row.symbol}>
                    <TableCell className="font-medium text-purple-700 cursor-pointer hover:underline"
                      onClick={() => window.location.href = `/pair/${encodeURIComponent(exchange)}/${encodeURIComponent(row.symbol)}`}
                    >
                      {row.symbol}
                    </TableCell>
                    <TableCell>{formatVolume(row.volume)}</TableCell>
                    {periodList.map((p) => (
                      <RankedTableCell
                        key={p.key}
                        value={row.aggs?.[p.key]?.total_rate}
                        rankInfo={periodRankMap[row.symbol]?.[p.key]}
                        tooltip={<div>周期: {row.aggs?.[p.key]?.period_value}</div>}
                        apr={row.aggs?.[p.key]?.apr}
                      />
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
