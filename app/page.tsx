"use client"

import { useState, useEffect } from "react"
import { Search, Activity, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { getExchanges, getSymbols, getFundingRates } from "@/lib/api"
import { formatDateTime, formatToGmt8 } from "@/lib/utils"
import PageLayout from "@/components/page-layout"

// 数据类型
interface FundingRate {
  id: number
  exchange: string
  symbol: string
  funding_rate: number
  funding_time: string
  timestamp: number
  created_time: string
}

interface SearchParams {
  exchange: string
  symbol: string
  limit: number
}

export default function CryptoFundingRates() {
  const [fundingRates, setFundingRates] = useState<FundingRate[]>([])
  const [exchanges, setExchanges] = useState<string[]>([])
  const [symbols, setSymbols] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    exchange: "all",
    symbol: "all",
    limit: 50,
  })
  const [exchangeSearch, setExchangeSearch] = useState("")
  const [symbolSearch, setSymbolSearch] = useState("")

  // 初始化数据
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const exchangesList = await getExchanges()
        console.log("Loaded exchanges:", exchangesList)
        setExchanges(exchangesList)

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

  // 当交易所变化时获取对应的交易对
  const handleExchangeChange = async (exchange: string) => {
    console.log("Selected exchange:", exchange)
    setSearchParams((prev) => ({ ...prev, exchange, symbol: "all" }))
    setSymbolSearch("") // 清空交易对搜索

    if (exchange !== "all") {
      setLoading(true)
      try {
        const symbolsList = await getSymbols(exchange)
        console.log("Fetched symbols:", symbolsList)
        setSymbols(symbolsList)
      } catch (error) {
        console.error("Error loading symbols:", error)
        setSymbols([])
      } finally {
        setLoading(false)
      }
    } else {
      setSymbols([])
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    const params: any = {}
    if (searchParams.exchange && searchParams.exchange !== "all") params.exchange = searchParams.exchange
    if (searchParams.symbol && searchParams.symbol !== "all") params.symbol = searchParams.symbol
    if (searchParams.limit) params.limit = searchParams.limit
    const data = await getFundingRates(params)
    setFundingRates(data)
    setLoading(false)
  }

  const formatFundingRate = (rate: number) => {
    const percentage = (rate * 100).toFixed(4)
    return `${rate >= 0 ? "+" : ""}${percentage}%`
  }

  const getFundingRateColor = (rate: number) => {
    if (rate > 0) return "text-red-500"
    if (rate < 0) return "text-green-500"
    return "text-gray-500"
  }

  const getFundingRateBadge = (rate: number) => {
    if (rate > 0) return <Badge variant="destructive">多头付费</Badge>
    if (rate < 0) return <Badge variant="secondary">空头付费</Badge>
    return <Badge variant="outline">平衡</Badge>
  }

  // 图表数据
  const chartData = fundingRates
    .slice(0, 20)
    .reverse()
    .map((rate) => ({
      time: new Date(rate.timestamp).toLocaleDateString(),
      rate: rate.funding_rate * 100,
    }))

  return (
    <PageLayout
      header={
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  市场总览
                </h1>
                <p className="text-sm text-muted-foreground">全市场资金费率与统计</p>
              </div>
            </div>
          </div>
        </header>
      }
    >
      {/* 简单的市场概览 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>市场概览</CardTitle>
          <CardDescription>当前查询结果概览</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">查询记录数</span>
              <span className="text-2xl font-bold">{fundingRates.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">最新资费率</span>
              <span
                className={`text-2xl font-bold ${fundingRates.length > 0 ? getFundingRateColor(fundingRates[0]?.funding_rate) : ""}`}
              >
                {fundingRates.length > 0 ? formatFundingRate(fundingRates[0]?.funding_rate) : "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">正资费率数量</span>
              <span className="text-2xl font-bold text-red-500">
                {fundingRates.filter((r) => r.funding_rate > 0).length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">负资费率数量</span>
              <span className="text-2xl font-bold text-green-500">
                {fundingRates.filter((r) => r.funding_rate < 0).length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">数据查询</TabsTrigger>
          <TabsTrigger value="chart">趋势图表</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* 搜索表单 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                资费数据查询
              </CardTitle>
              <CardDescription>选择交易所和交易对来查询资费数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exchange">交易所</Label>
                  <Select value={searchParams.exchange} onValueChange={handleExchangeChange}>
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
                          onChange={(e) => setExchangeSearch(e.target.value)}
                        />
                      </div>
                      <SelectItem value="all">全部交易所</SelectItem>
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
                  <Label htmlFor="symbol">交易对</Label>
                  <Select
                    value={searchParams.symbol}
                    onValueChange={(value) => setSearchParams((prev) => ({ ...prev, symbol: value }))}
                    disabled={searchParams.exchange === "all"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={searchParams.exchange === "all" ? "请先选择交易所" : "选择交易对"} />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="flex items-center px-3 pb-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                          className="flex h-8 w-full rounded-md bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
                          placeholder="搜索交易对..."
                          value={symbolSearch}
                          onChange={(e) => setSymbolSearch(e.target.value)}
                        />
                      </div>
                      <SelectItem value="all">全部交易对</SelectItem>
                      {symbols
                        .filter((symbol) => symbol.toLowerCase().includes(symbolSearch.toLowerCase()))
                        .map((symbol) => (
                          <SelectItem key={symbol} value={symbol}>
                            {symbol}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit">记录数量</Label>
                  <Select
                    value={searchParams.limit.toString()}
                    onValueChange={(value) => setSearchParams((prev) => ({ ...prev, limit: Number.parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20条</SelectItem>
                      <SelectItem value="50">50条</SelectItem>
                      <SelectItem value="100">100条</SelectItem>
                      <SelectItem value="200">200条</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleSearch} disabled={loading} className="w-full">
                    {loading ? "查询中..." : "查询数据"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 简化的数据表格 */}
          <Card>
            <CardHeader>
              <CardTitle>资费数据列表</CardTitle>
              <CardDescription>显示查询到的资费数据记录</CardDescription>
            </CardHeader>
            <CardContent>
              {fundingRates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>暂无数据</p>
                  <p className="text-sm mt-2">请尝试调整查询条件</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>交易所</TableHead>
                        <TableHead>交易对</TableHead>
                        <TableHead>资费率</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>资费时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fundingRates.map((rate) => (
                        <TableRow key={rate.id}>
                          <TableCell className="font-medium">{rate.exchange}</TableCell>
                          <TableCell className="font-medium">{rate.symbol}</TableCell>
                          <TableCell className={`font-mono text-lg ${getFundingRateColor(rate.funding_rate)}`}>
                            {formatFundingRate(rate.funding_rate)}
                          </TableCell>
                          <TableCell>{getFundingRateBadge(rate.funding_rate) as React.ReactNode}</TableCell>
                          <TableCell className="text-muted-foreground">{formatToGmt8(rate.timestamp)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>资费率趋势图</CardTitle>
              <CardDescription>显示资费率变化趋势</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>暂无图表数据</p>
                  <p className="text-sm mt-2">请先查询资费数据</p>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    rate: {
                      label: "资费率 (%)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <ChartTooltip>
                        <ChartTooltipContent />
                      </ChartTooltip>
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="var(--color-rate)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-rate)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
