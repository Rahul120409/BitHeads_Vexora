"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MapPin,
  Building2,
  Users,
  TrendingUp,
  ChevronLeft, 
  ChevronRight,
  Clock,
  Server,
  HelpCircle
} from "lucide-react";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Exact 5 Admin Panels: Dashboard, Location, Salon, Users, Revenue & Analytics
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      badge: "Live",
      badgeColor: "bg-[#23b5d3]/15 text-[#147a90] border-[#23b5d3]/30"
    },
    {
      name: "Location",
      href: "/admin/locations",
      icon: MapPin,
      badge: "5 Cities",
      badgeColor: "bg-[#23b5d3]/15 text-[#147a90] border-[#23b5d3]/30"
    },
    {
      name: "Salon",
      href: "/admin/salons",
      icon: Building2,
      badge: "4 Branches",
      badgeColor: "bg-[#23b5d3]/15 text-[#147a90] border-[#23b5d3]/30"
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      badge: "6 Accounts",
      badgeColor: "bg-[#23b5d3]/15 text-[#147a90] border-[#23b5d3]/30"
    },
    {
      name: "Revenue & Analytics",
      href: "/admin/revenue",
      icon: TrendingUp,
      badge: "₹12.5k",
      badgeColor: "bg-[#23b5d3]/15 text-[#147a90] border-[#23b5d3]/30"
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-[#0c242c]/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-[57px] left-0 z-40 h-[calc(100vh-57px)] bg-[#EFF5F7] border-r border-[#cce0e6] text-[#0c242c] transition-all duration-300 flex flex-col justify-between ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"} w-64 shadow-xs`}
      >
        {/* Top Section: Navigation Links */}
        <div className="p-3 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Section Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            {!isCollapsed && (
              <span className="text-[11px] font-extrabold tracking-wider text-[#147a90] uppercase">
                Admin Panel Tabs
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-[#0c242c]/60 hover:text-[#23b5d3] hover:bg-white transition-colors ml-auto shadow-xs"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4 text-[#23b5d3]" /> : <ChevronLeft className="w-4 h-4 text-[#23b5d3]" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 group relative ${
                    isActive
                      ? "bg-[#23b5d3] text-white shadow-md shadow-[#23b5d3]/30 font-extrabold"
                      : "text-[#0c242c]/80 hover:text-[#0c242c] hover:bg-white border border-transparent shadow-xs"
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isActive ? "text-white scale-110" : "text-[#23b5d3] group-hover:scale-110"
                    }`} />
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      isActive 
                        ? "bg-white/20 text-white border-white/30"
                        : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip on Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-white text-[#0c242c] text-xs font-bold rounded-lg shadow-xl border border-[#c2dee6] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Quick Backend Status Card & Help */}
        <div className="p-3 border-t border-[#cce0e6] bg-white/60">
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-white border border-[#c2dee6] space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#0c242c]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#23b5d3]" /> Java Backend
                </span>
                <span className="text-[10px] text-[#147a90] font-extrabold bg-[#23b5d3]/15 px-2 py-0.5 rounded-full border border-[#23b5d3]/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-[11px] text-[#0c242c]/70 leading-relaxed font-medium">
                Communicating via Java REST API.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-[#0c242c]/60 flex items-center gap-1 font-semibold">
                  <Server className="w-3 h-3 text-[#23b5d3]" /> Spring Boot
                </span>
                <span className="text-[#23b5d3] font-mono font-bold">192.168.137.94:8085</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-1">
              <div className="w-3 h-3 rounded-full bg-[#23b5d3] ring-4 ring-[#23b5d3]/20" title="Java Backend: Connected" />
            </div>
          )}

          {!isCollapsed && (
            <div className="mt-3 text-center">
              <a
                href="#help"
                className="inline-flex items-center gap-1.5 text-xs text-[#0c242c]/60 hover:text-[#23b5d3] transition-colors font-semibold"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#23b5d3]" /> Next.js Frontend Only
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
