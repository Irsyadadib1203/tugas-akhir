"use client";

import { LayoutDashboard, History, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

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

  const [lastSeen, setLastSeen] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(false);

  // ✅ Ambil last_seen dari Firebase
  useEffect(() => {
    const lastSeenRef = ref(db, '/kolam/last_seen');
    const unsub = onValue(lastSeenRef, (snap) => {
      const val = snap.val();
      if (val) setLastSeen(val);
    });
    return () => unsub();
  }, []);

  // ✅ Cek isOnline setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSeen === 0) {
        setIsOnline(false);
        return;
      }
      const now = Math.floor(Date.now() / 1000);
      setIsOnline((now - lastSeen) < 10);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSeen]);


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
              <p className="text-xs text-sidebar-foreground/60">Kolam Ikan Lele</p>
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
      <div className="p-4 border-t border-sidebar-border">
        {!collapsed ? (
          // ✅ Mode expanded — tampil lengkap
          <div className="bg-sidebar-accent rounded-xl p-4">
            <p className="text-sm text-sidebar-foreground/80 mb-2">Monitoring Status</p>
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                isOnline ? "bg-success animate-pulse" : "bg-destructive"
              )} />
              <span className={cn(
                "text-xs",
                isOnline ? "text-sidebar-foreground/60" : "text-destructive/80"
              )}>
                {isOnline ? "Sistem Aktif" : "Sistem Tidak Aktif"}
              </span>
            </div>
          </div>
        ) : (
          // ✅ Mode collapsed — hanya dot indikator di tengah
          <div className="flex justify-center">
            <span
              className={cn(
                "w-3 h-3 rounded-full",
                isOnline ? "bg-success animate-pulse" : "bg-destructive"
              )}
              title={isOnline ? "Sistem Aktif" : "Sistem Tidak Aktif"}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
