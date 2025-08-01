"use client"
import { usePathname } from 'next/navigation'
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

const menu = [
  { label: '市场总览', path: '/' },
  { label: '热门榜单', path: '/top10' },
  { label: '资费查询', path: '/search' },
  { label: '套利机会', path: '/arbitrage' },
]

export default function SidebarMenuContent() {
  const pathname = usePathname()
  return (
    <SidebarContent>
      <SidebarMenu>
        {menu.map(item => (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton
              asChild
              className="font-semibold text-base px-6 py-3 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-slate-800 group"
              isActive={pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))}
            >
              <a
                href={item.path}
                className="block w-full h-full group-data-[active=true]:bg-blue-100 group-data-[active=true]:text-blue-700 dark:group-data-[active=true]:bg-slate-800 dark:group-data-[active=true]:text-blue-400"
              >
                {item.label}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
  )
} 