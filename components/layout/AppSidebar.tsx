"use client";

import { LayoutDashboard, History, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'History', url: '/history', icon: History },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const location = usePathname();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-40 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <Droplets className="w-6 h-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display font-bold text-lg text-sidebar-foreground">AquaMonitor</h1>
              <p className="text-xs text-sidebar-foreground/60">Sistem Monitoring Kualitas Air</p>
              <p className="text-xs text-sidebar-foreground/60">olam ikan lele</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {!collapsed && (
          <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-4 px-3">
            Menu
          </p>
        )}
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location === item.url;
            return (
              <li key={item.title}>
                <Link
                  href={item.url}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    collapsed && 'justify-center px-3',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/25'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button */}
      {/* Floating Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-12 rounded-full",
          "bg-sidebar border border-sidebar-border shadow-lg",
          "flex items-center justify-center",
          "text-sidebar-foreground/70 hover:text-sidebar-foreground",
          "hover:bg-sidebar-accent transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/50"
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Footer Status */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-sidebar-accent rounded-xl p-4">
            <p className="text-sm text-sidebar-foreground/80 mb-2">Monitoring Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-sidebar-foreground/60">Sistem Aktif</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
