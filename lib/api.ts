const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export async function getExchanges() {
  const res = await fetch(`${API_BASE_URL}/api/v1/exchanges`)
  if (!res.ok) throw new Error('获取交易所失败')
  return (await res.json()).exchanges || []
}

export async function getSymbols(exchange: string) {
  if (!exchange) return []
  const res = await fetch(`${API_BASE_URL}/api/v1/symbols?exchange=${encodeURIComponent(exchange)}`)
  if (!res.ok) throw new Error('获取交易对失败')
  return (await res.json()).symbols || []
}

export async function getFundingRates(params: { exchange?: string; symbol?: string; limit?: number; period_type?: string }) {
  const query = new URLSearchParams()
  if (params.exchange) query.append('exchange', params.exchange)
  if (params.symbol) query.append('symbol', params.symbol)
  if (params.limit) query.append('limit', params.limit.toString())
  if (params.period_type) query.append('period_type', params.period_type)
  const res = await fetch(`${API_BASE_URL}/api/v1/funding-rates?${query.toString()}`)
  if (!res.ok) throw new Error('获取资费数据失败')
  return (await res.json()).data || []
}

export async function getFundingRateAgg(params: { exchange?: string; symbol?: string; limit?: number }) {
  const query = new URLSearchParams()
  if (params.exchange) query.append('exchange', params.exchange)
  if (params.symbol) query.append('symbol', params.symbol)
  if (params.limit) query.append('limit', params.limit.toString())
  const res = await fetch(`${API_BASE_URL}/api/v1/funding-rate-agg?${query.toString()}`)
  if (!res.ok) throw new Error('获取聚合数据失败')
  return (await res.json()).data || []
}

export async function getTopVolumeFundingRateAgg(params: { top_n?: number, exchange?: string, symbol?: string } = {}) {
  const query = new URLSearchParams()
  if (params.top_n) query.append('top_n', params.top_n.toString())
  if (params.exchange) query.append('exchange', params.exchange)
  if (params.symbol) query.append('symbol', params.symbol)
  const res = await fetch(`${API_BASE_URL}/api/v1/top-volume-funding-rate-agg?${query.toString()}`)
  if (!res.ok) throw new Error('获取成交量TOP10聚合数据失败')
  return (await res.json()).data || []
}

// 套利机会相关接口
export interface ArbitrageOpportunity {
  symbol: string
  exchange_a: string
  rate_a: number
  funding_interval_a: number
  volume_a: number
  exchange_b: string
  rate_b: number
  funding_interval_b: number
  volume_b: number
  difference_8h: number
  annualized_arbitrage: number
}

export interface ArbitrageOpportunitiesResponse {
  total: number
  data: ArbitrageOpportunity[]
}

export async function getArbitrageOpportunities(params: {
  symbol?: string
  sort_by?: 'hedge' | 'difference'
  time_range?: 'latest' | 'average'
  limit?: number
} = {}): Promise<ArbitrageOpportunitiesResponse> {
  const query = new URLSearchParams()
  if (params.symbol) query.append('symbol', params.symbol)
  if (params.sort_by) query.append('sort_by', params.sort_by)
  if (params.time_range) query.append('time_range', params.time_range)
  if (params.limit) query.append('limit', params.limit.toString())
  
  const res = await fetch(`${API_BASE_URL}/api/v1/arbitrage-opportunities?${query.toString()}`)
  if (!res.ok) throw new Error('获取套利机会数据失败')
  return await res.json()
}