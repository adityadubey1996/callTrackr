import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  Folder,
  UploadCloud,
  BarChart,
  FileText,
} from "lucide-react";
import { Button } from "@/components/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/components/ui/tooltip";

function SidebarComponent() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { open, setOpen } = useSidebar(); // Get sidebar state and toggler

  const menuItems = [
    {
      label: "Chat",
      href: "/library",
      icon: Folder,
      tooltip: "Browse and manage your uploaded calls",
    },
    {
      label: "File Upload",
      href: "/file-upload",
      icon: UploadCloud,
      tooltip: "Upload new call recordings",
    },
    {
      label: "Metrics",
      href: "/metrics",
      icon: BarChart,
      tooltip: "Define and track your custom metrics",
    },
    {
      label: "Reports",
      href: "/reports",
      icon: FileText,
      tooltip: "View detailed analytics and reports",
    },
  ];

  return (
    <>
      <TooltipProvider>
        <div className="w-1/5 max-w-xs">
          <Sidebar>
            <SidebarHeader className="border-b p-4 flex flex-row justify-between items-center">
              <h2 className="text-lg font-semibold">CallTrackr</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)} // Close sidebar
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem
                    key={item.label}
                    className={
                      pathname === item.href
                        ? "rounded-md bg-white text-black"
                        : ""
                    }
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <a
                            href={item.href}
                            className="flex items-center gap-2"
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </a>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white px-3 py-2 rounded shadow-lg">
                        {item.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                        <a
                          href="#"
                          onClick={() => {
                            localStorage.clear();
                            navigate("/login");
                          }}
                          className="flex items-center gap-2"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Logout</span>
                        </a>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white px-3 py-2 rounded shadow-lg">
                      Logout from your account
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        </div>
      </TooltipProvider>
    </>
  );
}

export default function AppSideBar() {
  return (
    <div className="absolute md:relative w-fit max-w-xs">
      <SidebarProvider>
        {/* Sidebar Trigger for Mobile */}
        <SidebarTrigger onClick={() => console.log("Trigger clicked!")}>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SidebarTrigger>

        <SidebarComponent />
      </SidebarProvider>
    </div>
  );
}
