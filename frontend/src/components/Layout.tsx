import { HRSidebar } from "@/components/HRSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useHR } from "@/contexts/HRContext";
import { Button } from "@/components/ui/button";
import { UserCheck, UserCog } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { currentUser, switchRole } = useHR();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <HRSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                   Sopra HR Leave Management System
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {currentUser?.name}
                </p>
              </div>
            </div>
            
            {/* Role Switch (Demo purposes) */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Switch Role:</span>
              <p className="text-sm text-muted-foreground">Role: {currentUser?.role}</p>

            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}