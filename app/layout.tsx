import type { Metadata } from 'next'
import './globals.css'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset
} from '@/components/ui/sidebar'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
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
          <Sidebar className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 rounded-tr-2xl rounded-br-2xl shadow-lg w-56 flex-shrink-0 h-full min-h-screen">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-4 py-6">
                <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-2"></span>
                <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">加密资费平台</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="font-semibold text-base px-6 py-3 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-slate-800 group" isActive={typeof window !== 'undefined' && window.location.pathname === '/'}>
                    <a href="/" className="block w-full h-full group-data-[active=true]:bg-blue-100 group-data-[active=true]:text-blue-700 dark:group-data-[active=true]:bg-slate-800 dark:group-data-[active=true]:text-blue-400">市场总览</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="font-semibold text-base px-6 py-3 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-slate-800 group" isActive={typeof window !== 'undefined' && window.location.pathname.startsWith('/top10')}>
                    <a href="/top10" className="block w-full h-full group-data-[active=true]:bg-blue-100 group-data-[active=true]:text-blue-700 dark:group-data-[active=true]:bg-slate-800 dark:group-data-[active=true]:text-blue-400">热门榜单</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="font-semibold text-base px-6 py-3 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-slate-800 group" isActive={typeof window !== 'undefined' && window.location.pathname.startsWith('/search')}>
                    <a href="/search" className="block w-full h-full group-data-[active=true]:bg-blue-100 group-data-[active=true]:text-blue-700 dark:group-data-[active=true]:bg-slate-800 dark:group-data-[active=true]:text-blue-400">资费查询</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            {children}
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}
