"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getExchanges, getSymbols, getTopVolumeFundingRateAgg } from "@/lib/api"
import PageLayout from "@/components/page-layout"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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

export default function ExchangeSearchPage() {
  const [exchanges, setExchanges] = useState<string[]>([])
  const [symbols, setSymbols] = useState<string[]>([])
  const [exchangeSearch, setExchangeSearch] = useState("")
  const [symbolSearch, setSymbolSearch] = useState("")
  const [selectedExchange, setSelectedExchange] = useState<string>("")
  const [selectedSymbol, setSelectedSymbol] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [symbolLoading, setSymbolLoading] = useState(false)
  const [resultRows, setResultRows] = useState<any[]>([])
  const [queried, setQueried] = useState(false)
  const [sortField, setSortField] = useState<string>("volume")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetchExchanges()
  }, [])

  useEffect(() => {
    if (selectedExchange) fetchSymbols(selectedExchange)
    else setSymbols([])
    setSelectedSymbol("all")
  }, [selectedExchange])

  async function fetchExchanges() {
    setLoading(true)
    try {
      const data = await getExchanges()
      setExchanges(data)
      // 优先选中binance，否则选第一个
      if (data.length > 0) {
        const defaultExchange = data.includes("binance") ? "binance" : data[0]
        setSelectedExchange(defaultExchange)
      }
    } catch {
      setExchanges([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchSymbols(exchange: string) {
    setSymbolLoading(true)
    try {
      const data = await getSymbols(exchange)
      setSymbols(data)
    } catch {
      setSymbols([])
    } finally {
      setSymbolLoading(false)
    }
  }

  async function handleQuery() {
    setLoading(true)
    setQueried(true)
    try {
      const params: any = { exchange: selectedExchange, top_n: 50 }
      if (selectedSymbol && selectedSymbol !== "all") {
        params.symbol = selectedSymbol
      }
      const data = await getTopVolumeFundingRateAgg(params)
      setResultRows(data)
    } catch {
      setResultRows([])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleQuery()
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
    const rows = [...resultRows]
    if (!sortField) return rows
    return rows.sort((a, b) => {
      let aValue: any, bValue: any
      if (sortField === "symbol") {
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

  // 用useMemo优化排序和排名map
  const sortedRows = useMemo(() => getSortedRows(), [resultRows, sortField, sortOrder])
  const periodRankMap = useMemo(() => getRankMap(
    sortedRows,
    periodList,
    (row, key) => row.aggs?.[key]?.total_rate
  ), [sortedRows])

  return (
    <PageLayout
      header={
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">查</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  资费查询
                </h1>
                <p className="text-sm text-muted-foreground">按条件自定义查询多周期资金费率</p>
              </div>
            </div>
          </div>
        </header>
      }
    >
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            资费查询
          </CardTitle>
          <CardDescription>选择交易所和币对进行查询</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exchange">交易所</Label>
              <Select value={selectedExchange} onValueChange={v => setSelectedExchange(v)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="选择交易所" />
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-3 pb-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      className="flex h-8 w-full rounded-md bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
                      placeholder="搜索交易所..."
                      value={exchangeSearch}
                      onChange={e => setExchangeSearch(e.target.value)}
                    />
                  </div>
                  {exchanges
                    .filter((exchange) => exchange.toLowerCase().includes(exchangeSearch.toLowerCase()))
                    .map((exchange) => (
                      <SelectItem key={exchange} value={exchange}>
                        {exchange}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">币对</Label>
              <Select
                value={selectedSymbol}
                onValueChange={v => setSelectedSymbol(v)}
                disabled={!selectedExchange || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedExchange ? "选择币对" : "请先选择交易所"} />
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-3 pb-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                      className="flex h-8 w-full rounded-md bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
                      placeholder="搜索币对..."
                      value={symbolSearch}
                      onChange={e => setSymbolSearch(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <SelectItem value="all">全部币对</SelectItem>
                  {symbolLoading ? (
                    <SelectItem value="__loading" disabled>加载中...</SelectItem>
                  ) : (
                    symbols
                      .filter((symbol) => symbol.toLowerCase().includes(symbolSearch.toLowerCase()))
                      .map((symbol) => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleQuery} disabled={loading} className="w-full">
                {loading ? "查询中..." : "查询数据"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>币对资金费率</CardTitle>
          <CardDescription>展示该交易所下所有币对的多周期资金费率</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : resultRows.length === 0 && queried ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无数据</p>
              <p className="text-sm mt-2">请尝试调整查询条件</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{p.label}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div>周期：{p.label}</div>
                          </TooltipContent>
                        </Tooltip>
                        {sortField === p.key && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRows.map((row) => (
                    <TableRow key={row.symbol}>
                      <TableCell className="font-medium text-purple-700 cursor-pointer hover:underline"
                        onClick={() => window.location.href = `/pair/${encodeURIComponent(selectedExchange)}/${encodeURIComponent(row.symbol)}`}
                      >
                        {row.symbol}
                      </TableCell>
                      <TableCell>{row.volume >= 1e9 ? (row.volume / 1e9).toFixed(2) + 'B' : row.volume >= 1e6 ? (row.volume / 1e6).toFixed(2) + 'M' : row.volume >= 1e3 ? (row.volume / 1e3).toFixed(2) + 'K' : row.volume?.toLocaleString?.() ?? '-'}</TableCell>
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
    </PageLayout>
  )
}
