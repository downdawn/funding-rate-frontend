import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(utcTimeString: string) {
  try {
    const date = new Date(utcTimeString)
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })
  } catch {
    return utcTimeString
  }
}

export function formatVolume(volume: number) {
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B'
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M'
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K'
  return volume?.toLocaleString?.() ?? '-'
}

// 将毫秒级时间戳转为东八区（GMT+8）时间并格式化输出
export function formatToGmt8(timestamp: number) {
  if (!timestamp && timestamp !== 0) return '';
  const date = new Date(timestamp);
  // 只显示日期和时间，不显示GMT+8
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Shanghai"
  });
}
