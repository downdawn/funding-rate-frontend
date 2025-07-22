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

export async function getTopVolumeFundingRateAgg(params: { top_n?: number, exchange?: string } = {}) {
  const query = new URLSearchParams()
  if (params.top_n) query.append('top_n', params.top_n.toString())
  if (params.exchange) query.append('exchange', params.exchange)
  const res = await fetch(`${API_BASE_URL}/api/v1/top-volume-funding-rate-agg?${query.toString()}`)
  if (!res.ok) throw new Error('获取成交量TOP10聚合数据失败')
  return (await res.json()).data || []
} 