import { useState } from "react";
import { Calendar, CheckSquare, Users, BarChart3, Settings, UserCheck, ClipboardList } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useHR } from "@/contexts/HRContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const employeeItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Request Leave", url: "/request-leave", icon: Calendar },
];

const managerItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Pending Approvals", url: "/approvals", icon: CheckSquare },
  { title: "Request Leave", url: "/request-leave", icon: Calendar },
];

export function HRSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { currentUser, leaveRequests } = useHR();
  const currentPath = location.pathname;

  const items = currentUser?.role === 'manager' ? managerItems : employeeItems;
  const pendingCount = leaveRequests.filter(req => req.status === 'pending').length;
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50";

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent className="bg-card">
        <div className="p-4 border-b">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">HR Portal</h2>
              <p className="text-sm text-muted-foreground capitalize">{currentUser?.role} Dashboard</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"} 
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span>{item.title}</span>
                          {item.title === "Pending Approvals" && pendingCount > 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {pendingCount}
                            </Badge>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {currentUser?.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentUser?.department}
                </p>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}