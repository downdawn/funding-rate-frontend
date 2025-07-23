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

// 将UTC时间字符串转为东八区（GMT+8）时间并格式化输出
export function formatToGmt8(utcString: string) {
  if (!utcString) return '';
  const date = new Date(utcString);
  // 转为东八区
  const gmt8 = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  // 格式化输出 2025/07/23 00:00:00 GMT+8
  return `${gmt8.getFullYear()}/${(gmt8.getMonth() + 1).toString().padStart(2, '0')}/${gmt8.getDate().toString().padStart(2, '0')} ${gmt8.getHours().toString().padStart(2, '0')}:${gmt8.getMinutes().toString().padStart(2, '0')}:${gmt8.getSeconds().toString().padStart(2, '0')} GMT+8`;
}
