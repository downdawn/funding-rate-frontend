"use client"

import { getTopVolumeFundingRateAgg } from "@/lib/api"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import PageLayout from "@/components/page-layout"
import { ChevronDown, ChevronUp } from "lucide-react"
import { getRankMap } from "@/lib/rankColor"
import RankedTableCell from "@/components/RankedTableCell"

const periodList = [
  { key: "hour", label: "小时" },
  { key: "day", label: "天" },
  { key: "week", label: "周" },
  { key: "month", label: "月" },
  { key: "quarter", label: "季度" },
  { key: "year", label: "年" },
]

export default function Top10Page() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sortField, setSortField] = useState<string>("volume")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetchTop10()
  }, [])

  async function fetchTop10() {
    setLoading(true)
    try {
      // 直接请求新接口
      const data = await getTopVolumeFundingRateAgg({ top_n: 10 })
      setRows(data)
    } catch (e) {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  function formatVolume(volume: number) {
    if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B'
    if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M'
    if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K'
    return volume?.toLocaleString?.() ?? '-'
  }

  function handleSort(field: string) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  function getSortedRows() {
    const sorted = [...rows]
    if (!sortField) return sorted
    return sorted.sort((a, b) => {
      let aValue: any, bValue: any
      if (sortField === "exchange") {
        aValue = a.exchange
        bValue = b.exchange
        return sortOrder === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue))
      } else if (sortField === "symbol") {
        aValue = a.symbol
        bValue = b.symbol
        return sortOrder === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue))
      } else if (sortField === "volume") {
        aValue = a.volume ?? 0
        bValue = b.volume ?? 0
      } else {
        // periodList key
        aValue = a.aggs?.[sortField]?.total_rate ?? -Infinity
        bValue = b.aggs?.[sortField]?.total_rate ?? -Infinity
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })
  }

  const sortedRows = getSortedRows()
  // 修复 periodRankMap 未定义
  const periodRankMap = getRankMap(
    sortedRows,
    periodList,
    (row, key) => row.aggs?.[key]?.total_rate
  )

  return (
    <PageLayout
      header={
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">热</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  热门榜单
                </h1>
                <p className="text-sm text-muted-foreground">展示各热门榜单</p>
              </div>
            </div>
          </div>
        </header>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>成交量TOP10</CardTitle>
          <CardDescription>展示成交量TOP10的币对资金费率</CardDescription>
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
                      onClick={() => handleSort("exchange")}
                    >
                      平台
                      {sortField === "exchange" && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("symbol")}
                    >
                      币对
                      {sortField === "symbol" && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("volume")}
                    >
                      成交量
                      {sortField === "volume" && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                    {periodList.map((p) => (
                      <TableHead
                        key={p.key}
                        className="cursor-pointer select-none"
                        onClick={() => handleSort(p.key)}
                      >
                        {p.label}
                        {sortField === p.key && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRows.map((row) => (
                    <TableRow key={row.exchange + row.symbol}>
                      <TableCell className="font-medium text-blue-700 cursor-pointer hover:underline"
                        onClick={() => window.location.href = `/exchange/${encodeURIComponent(row.exchange)}`}
                      >
                        {row.exchange}
                      </TableCell>
                      <TableCell className="font-medium text-purple-700 cursor-pointer hover:underline"
                        onClick={() => window.location.href = `/pair/${encodeURIComponent(row.exchange)}/${encodeURIComponent(row.symbol)}`}
                      >
                        {row.symbol}
                      </TableCell>
                      <TableCell>{formatVolume(row.volume)}</TableCell>
                      {periodList.map((p) => (
                        <RankedTableCell
                          key={p.key}
                          value={row.aggs?.[p.key]?.total_rate}
                          rankInfo={periodRankMap[row.exchange + row.symbol]?.[p.key]}
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
    </PageLayout>
  )
}
