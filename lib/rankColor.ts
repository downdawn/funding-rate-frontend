// 表格唯一值排名
export function getRankMap(rows: any[], periodList: {key: string}[], valueGetter: (row: any, periodKey: string) => number | undefined) {
  const rankMap: Record<string, Record<string, { rank: number, total: number, value: number }>> = {}
  periodList.forEach(p => {
    // 取唯一值并降序排序
    const values = Array.from(new Set(
      rows.map(row => valueGetter(row, p.key))
        .filter(v => typeof v === 'number' && !isNaN(v))
    )).sort((a, b) => b - a)
    const total = values.length
    if (total === 0) return
    // 记录每个唯一值的排名
    const valueRank: Record<string, number> = {}
    values.forEach((v, i) => { valueRank[v] = i })
    // 记录每个row在该周期的唯一排名
    rows.forEach(row => {
      const v = valueGetter(row, p.key)
      if (typeof v === 'number' && !isNaN(v)) {
        if (!rankMap[row.symbol]) rankMap[row.symbol] = {}
        rankMap[row.symbol][p.key] = { rank: valueRank[v], total, value: v }
      }
    })
  })
  return rankMap
}

// 只做颜色深浅插值，由外部决定传绿还是红
export function getCellBgStyle(rank: number, total: number, isGreen: boolean) {
  // 0为最深，靠近30%为最浅
  const percent = total <= 1 ? 1 : 1 - rank / Math.max(1, Math.floor(total * 0.3) - 1)
  const base = isGreen ? [220, 252, 231] : [254, 226, 226] // green-100 / red-100
  const deep = isGreen ? [16, 185, 129] : [239, 68, 68]    // green-400 / red-400
  // 线性插值
  const rgb = base.map((b, i) => Math.round(b + (deep[i] - b) * percent))
  return { backgroundColor: `rgb(${rgb.join(',')})` }
} 