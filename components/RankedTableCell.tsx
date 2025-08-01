import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getCellBgStyle } from "@/lib/rankColor"
import { TableCell } from "@/components/ui/table"
import React from "react"

interface RankedTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  value?: number
  rankInfo?: { rank: number, total: number }
  tooltip?: React.ReactNode
  apr?: number
  fundingInterval?: number
  periodType?: string
}

export default function RankedTableCell({ value, rankInfo, tooltip, apr, fundingInterval, periodType, children, ...props }: RankedTableCellProps) {
  let cellStyle = undefined
  if (rankInfo && typeof value === 'number' && value !== 0) {
    const { rank, total } = rankInfo
    const isGreen = value > 0
    const isRed = value < 0
    const greenLine = Math.floor(total * 0.3)
    const redLine = Math.floor(total * 0.7)
    if (isGreen && rank < greenLine) {
      cellStyle = getCellBgStyle(rank, total, true)
    } else if (isRed && rank >= redLine) {
      cellStyle = getCellBgStyle(total - 1 - rank, total, false)
    }
  }
  return (
    <TableCell style={cellStyle} {...props}>
      {typeof value === 'number' ? (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>{(value * 100).toFixed(5)}%</div>
            </TooltipTrigger>
            <TooltipContent>
              {periodType === "hour" && fundingInterval && (
                <div className="mb-1 text-xs text-gray-500">
                  【{fundingInterval}h】
                </div>
              )}
              {tooltip}
            </TooltipContent>
          </Tooltip>
          {typeof apr === 'number' && (
            <div className="text-xs text-black font-bold">APR: {(apr * 100).toFixed(2)}%</div>
          )}
        </>
      ) : (
        children ?? <span className="text-gray-300">-</span>
      )}
    </TableCell>
  )
} 