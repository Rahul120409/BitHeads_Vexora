"use client";

import React, { useState } from "react";
import AdminNavbar from "./components/AdminNavbar";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EFF5F7] text-[#0c242c] flex flex-col font-sans selection:bg-[#23b5d3] selection:text-white">
      {/* Top Admin Navbar */}
      <AdminNavbar
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isSidebarOpen={isMobileSidebarOpen}
      />

      {/* Body Shell with Sidebar + Main Viewport */}
      <div className="flex-1 flex w-full relative">
        {/* Sidebar */}
        <AdminSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-[#EFF5F7] min-h-[calc(100vh-57px)] overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
