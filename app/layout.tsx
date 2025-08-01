import type { Metadata } from 'next'
import './globals.css'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarInset
} from '@/components/ui/sidebar'
import SidebarMenuContent from '@/components/sidebar-menu'

export const metadata: Metadata = {
  title: '加密资费平台 - 实时资金费率监控',
  description: '专业的加密货币交易所资金费率监控平台，提供实时数据分析和排名',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <SidebarProvider>
          <Sidebar className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-lg w-56 flex-shrink-0 h-full min-h-screen">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-4 py-6">
                <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-2"></span>
                <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">加密资费平台</span>
              </div>
            </SidebarHeader>
            <SidebarMenuContent />
          </Sidebar>
          <SidebarInset>
            {children}
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}
