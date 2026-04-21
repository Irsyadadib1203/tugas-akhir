"use client";

import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from "react";
import { ref, onChildAdded, update } from "firebase/database";
import { db } from "@/lib/firebase";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// const mockNotifications: Notification[] = [
//   { id: 1, title: 'pH Level Alert', message: 'pH level exceeds normal range', time: '5 menit lalu', read: false },
//   { id: 2, title: 'System Update', message: 'Sensor calibration completed', time: '1 jam lalu', read: false },
//   { id: 3, title: 'Daily Report', message: 'Laporan harian tersedia', time: '2 jam lalu', read: true },
// ];

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const markAllAsRead = async () => {
  try {
    const updates: { [key: string]: boolean } = {};

    notifications.forEach(n => {
      updates[`notifications/${n.id}/read`] = true;
    });

    await update(ref(db), updates);

    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  } catch (err) {
    console.error(err);
  }
};
  const markAsRead = async (id: string) => {
    try {
      await update(ref(db, `notifications/${id}`), {
        read: true,
      });

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error(error);
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
  const notifRef = ref(db, "notifications");
  const getTimeAgo = (date: number) => {
  const diff = Date.now() - date;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  return `${hours} jam lalu`;
};

  const unsubscribe = onChildAdded(notifRef, (snapshot) => {
    const data = snapshot.val();

    const newNotification: Notification = {
      id: snapshot.key as string,
      title: data.title,
      message: data.message,
      time: getTimeAgo(data.timestamp),
      read: data.read ?? false,
    };


    setNotifications((prev) => [newNotification, ...prev].slice(0, 7)); // Simpan hanya 10 notifikasi terbaru
  });

  return () => unsubscribe();
}, []);

  const handleLogout = () => {
    logout();
    navigate.push('/auth');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* Page Title */}
      <div>
        <h2 className="font-display font-semibold text-lg text-foreground">
          Monitoring kualitas air kolam lele
        </h2>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
          
      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-3 border-b border-border">
              <h3 className="font-semibold">Notifikasi</h3>
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary"
              >
                Tandai semua
              </button>
            </div>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Tidak ada notifikasi
              </div>
            ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                onClick={() => markAsRead(notification.id)} 
                className="p-3 cursor-pointer">
                <div className={`p-3 rounded-lg ${!notification.read ? 'bg-muted/50' : ''}`}></div>
                <div className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-muted' : 'bg-primary'}`} />
                  <div>
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            )))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
