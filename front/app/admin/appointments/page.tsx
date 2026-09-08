"use client";

import React, { useState } from "react";
import { 
  CalendarDays, 
  Search, 
  Filter
} from "lucide-react";

export default function AdminAppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const mockAppointments = [
    { id: 105, customer: "Rahul Sharma", service: "Haircut & Styling", staff: "Raj Kumar", time: "10:30 AM", date: "Today", status: "CONFIRMED", price: "₹450" },
    { id: 106, customer: "Amit Patel", service: "Beard Trim", staff: "Priya Singh", time: "11:00 AM", date: "Today", status: "WAITING", price: "₹250" },
    { id: 107, customer: "Sneha Gupta", service: "Hair Spa & Treatment", staff: "Raj Kumar", time: "11:30 AM", date: "Today", status: "CONFIRMED", price: "₹1,200" },
    { id: 108, customer: "Rohan Verma", service: "Facial & Cleanup", staff: "Neha Roy", time: "12:15 PM", date: "Today", status: "COMPLETED", price: "₹800" },
    { id: 109, customer: "Kavita Das", service: "Hair Color", staff: "Ankit Verma", time: "01:00 PM", date: "Today", status: "CANCELLED", price: "₹1,500" },
  ];

  const filteredAppointments = mockAppointments.filter((app) => {
    const matchesSearch = app.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.staff.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EADFD7]">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#381E11] flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-[#6B3820]" />
            Appointment Monitoring
          </h1>
          <p className="text-sm text-[#381E11]/70 mt-1 font-medium">
            Track, filter, and inspect all customer bookings across staff schedules.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#EADFD7] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B3820]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer, service or staff..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820] font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#6B3820] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-bold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="WAITING">Waiting</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointment Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EADFD7] overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="text-[#6B3820] uppercase bg-[#FAF6F0] border-b border-[#EADFD7] text-[10px] font-extrabold tracking-wider">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EADFD7]/60">
            {filteredAppointments.map((app) => (
              <tr key={app.id} className="hover:bg-[#FAF6F0]/80 transition-colors">
                <td className="px-4 py-3.5 font-mono text-[#6B3820] font-extrabold">#{app.id}</td>
                <td className="px-4 py-3.5 font-bold text-[#381E11]">{app.customer}</td>
                <td className="px-4 py-3.5 text-[#381E11]/80 font-medium">{app.service}</td>
                <td className="px-4 py-3.5 text-[#381E11]/70 font-medium">{app.staff}</td>
                <td className="px-4 py-3.5 font-mono text-[#381E11] font-bold">{app.time}</td>
                <td className="px-4 py-3.5 font-extrabold text-[#6B3820]">{app.price}</td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${
                    app.status === "CONFIRMED" 
                      ? "bg-[#6B3820]/15 text-[#6B3820] border-[#6B3820]/30" 
                      : app.status === "WAITING"
                      ? "bg-amber-500/15 text-amber-800 border-amber-500/30"
                      : app.status === "COMPLETED"
                      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-700 border-rose-500/30"
                  }`}>
                    {app.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
