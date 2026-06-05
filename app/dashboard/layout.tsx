"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen w-full bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          // Mobile: tidak ada margin kiri, Desktop: margin sesuai sidebar
          "ml-0",
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 overflow-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}