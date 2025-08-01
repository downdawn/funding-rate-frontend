"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, TrendingUp, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { getArbitrageOpportunities, type ArbitrageOpportunity } from "@/lib/api"
import { formatVolume } from "@/lib/utils"
import PageLayout from "@/components/page-layout"

interface SearchParams {
  symbol: string | 'all'
  sort_by: 'hedge' | 'difference'
  time_range: 'latest' | 'average'
  limit: number
}

export default function ArbitrageOpportunities() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [searchParams, setSearchParams] = useState<SearchParams>({
    symbol: "all",
    sort_by: 'hedge',
    time_range: 'latest',
    limit: 10,
  })
  const [customSymbol, setCustomSymbol] = useState("")
  const [sortField, setSortField] = useState<string>("annualized_arbitrage")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // 初始化数据
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        // 初始查询
        await handleSearch()
      } catch (error) {
        console.error("Error loading initial data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    setError("")
    try {
      const params: any = {}
      // 优先使用自定义输入的币种
      if (customSymbol.trim()) {
        params.symbol = customSymbol.trim()
      } else if (searchParams.symbol && searchParams.symbol !== "all") {
        params.symbol = searchParams.symbol
      }
      if (searchParams.sort_by) params.sort_by = searchParams.sort_by
      if (searchParams.time_range) params.time_range = searchParams.time_range
      if (searchParams.limit) params.limit = searchParams.limit

      const response = await getArbitrageOpportunities(params)
      setOpportunities(response.data)
    } catch (error) {
      console.error("Error fetching arbitrage opportunities:", error)
      setError("获取套利机会数据失败，请检查网络连接或稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const getSortedOpportunities = () => {
    if (!sortField) return opportunities
    return [...opportunities].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case "symbol":
          aValue = a.symbol
          bValue = b.symbol
          return sortOrder === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue))
        case "exchange_a":
          aValue = a.exchange_a
          bValue = b.exchange_a
          return sortOrder === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue))
        case "rate_a":
          aValue = a.rate_a
          bValue = b.rate_a
          break
        case "volume_a":
          aValue = a.volume_a
          bValue = b.volume_a
          break
        case "exchange_b":
          aValue = a.exchange_b
          bValue = b.exchange_b
          return sortOrder === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue))
        case "rate_b":
          aValue = a.rate_b
          bValue = b.rate_b
          break
        case "volume_b":
          aValue = a.volume_b
          bValue = b.volume_b
          break
        case "difference_8h":
          aValue = a.difference_8h
          bValue = b.difference_8h
          break
        case "annualized_arbitrage":
          aValue = a.annualized_arbitrage
          bValue = b.annualized_arbitrage
          break
        default:
          return 0
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })
  }

  const sortedOpportunities = useMemo(() => getSortedOpportunities(), [opportunities, sortField, sortOrder])

  const formatRate = (rate: number) => {
    const percentage = (rate * 100).toFixed(4)
    return `${rate >= 0 ? "+" : ""}${percentage}%`
  }

  const getRateColor = (rate: number) => {
    if (rate > 0) return "text-red-500"
    if (rate < 0) return "text-green-500"
    return "text-gray-500"
  }

  const getArbitrageColor = (annualized: number) => {
    if (annualized > 100) return "text-green-600 font-bold"
    if (annualized > 50) return "text-green-500"
    if (annualized > 20) return "text-yellow-500"
    return "text-gray-500"
  }

  return (
    <PageLayout
      header={
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  套利机会
                </h1>
                <p className="text-sm text-muted-foreground">发现跨交易所套利机会</p>
              </div>
            </div>
          </div>
        </header>
      }
    >
      {/* 筛选面板 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            筛选条件
          </CardTitle>
          <CardDescription>设置筛选条件来查找套利机会</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">币种</Label>
              <Input
                type="text"
                placeholder="输入币种名称，如: BTC/USDT:USDT"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_by">排序方式</Label>
              <Select
                value={searchParams.sort_by}
                onValueChange={(value: 'hedge' | 'difference') =>
                  setSearchParams((prev) => ({ ...prev, sort_by: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hedge">正负对冲最强</SelectItem>
                  <SelectItem value="difference">差值最大</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_range">时间范围</Label>
              <Select
                value={searchParams.time_range}
                onValueChange={(value: 'latest' | 'average') =>
                  setSearchParams((prev) => ({ ...prev, time_range: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">最近1期</SelectItem>
                  <SelectItem value="average">最近3期平均</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">显示数量</Label>
              <Select
                value={searchParams.limit.toString()}
                onValueChange={(value) => setSearchParams((prev) => ({ ...prev, limit: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10条</SelectItem>
                  <SelectItem value="20">20条</SelectItem>
                  <SelectItem value="50">50条</SelectItem>
                  <SelectItem value="100">100条</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? "查询中..." : "查询套利机会"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 套利机会表格 */}
      <Card>
        <CardHeader>
          <CardTitle>套利机会列表</CardTitle>
          <CardDescription>显示发现的跨交易所套利机会，点击交易所可查看该交易所下该币种的详情</CardDescription>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无套利机会</p>
              <p className="text-sm mt-2">请尝试调整筛选条件</p>
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
                      币种
                      {sortField === "symbol" && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("exchange_a")}
                    >
                      交易所 A
                      {sortField === "exchange_a" && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("rate_a")}
                    >
                      费率 A
                      {sortField === "rate_a" && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                    <TableHead>周期A</TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("volume_a")}
                    >
                      24h交易量
                      {sortField === "volume_a" && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("exchange_b")}
                    >
                      交易所 B
                      {sortField === "exchange_b" && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("rate_b")}
                    >
                      费率 B
                      {sortField === "rate_b" && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                    <TableHead>周期B</TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("volume_b")}
                    >
                      24h交易量
                      {sortField === "volume_b" && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("difference_8h")}
                    >
                      8H差值
                      {sortField === "difference_8h" && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("annualized_arbitrage")}
                    >
                      套利年化
                      {sortField === "annualized_arbitrage" && (sortOrder === "asc" ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />)}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOpportunities.map((opp, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-gray-900">
                        {opp.symbol}
                      </TableCell>
                      <TableCell className="font-medium text-blue-700 cursor-pointer hover:underline hover:bg-blue-50 transition-colors"
                        onClick={() => window.location.href = `/pair/${encodeURIComponent(opp.exchange_a)}/${encodeURIComponent(opp.symbol)}`}
                      >
                        {opp.exchange_a.toUpperCase()}
                      </TableCell>
                      <TableCell className={`font-mono ${getRateColor(opp.rate_a)}`}>
                        {formatRate(opp.rate_a)}
                      </TableCell>
                      <TableCell>{opp.funding_interval_a}H</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatVolume(opp.volume_a)}
                      </TableCell>
                      <TableCell className="font-medium text-blue-700 cursor-pointer hover:underline hover:bg-blue-50 transition-colors"
                        onClick={() => window.location.href = `/pair/${encodeURIComponent(opp.exchange_b)}/${encodeURIComponent(opp.symbol)}`}
                      >
                        {opp.exchange_b.toUpperCase()}
                      </TableCell>
                      <TableCell className={`font-mono ${getRateColor(opp.rate_b)}`}>
                        {formatRate(opp.rate_b)}
                      </TableCell>
                      <TableCell>{opp.funding_interval_b}H</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatVolume(opp.volume_b)}
                      </TableCell>
                      <TableCell className={`font-mono ${getRateColor(opp.difference_8h)}`}>
                        {formatRate(opp.difference_8h)}
                      </TableCell>
                      <TableCell className={`font-mono ${getArbitrageColor(opp.annualized_arbitrage)}`}>
                        {opp.annualized_arbitrage.toFixed(2)}%
                      </TableCell>
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
