"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  IndianRupee, 
  ArrowUpRight, 
  CalendarDays, 
  CheckCircle2, 
  CreditCard,
  RefreshCw,
  PieChart
} from "lucide-react";

export default function AdminRevenuePage() {
  const mockPayments = [
    { id: 201, customer: "Rahul Sharma", amount: "₹450", method: "UPI", date: "Today, 10:45 AM", status: "SUCCESS" },
    { id: 202, customer: "Amit Patel", amount: "₹250", method: "Card", date: "Today, 11:15 AM", status: "SUCCESS" },
    { id: 203, customer: "Sneha Gupta", amount: "₹1,200", method: "Cash", date: "Today, 11:45 AM", status: "SUCCESS" },
    { id: 204, customer: "Rohan Verma", amount: "₹800", method: "UPI", date: "Today, 12:30 PM", status: "SUCCESS" },
    { id: 205, customer: "Kavita Das", amount: "₹1,500", method: "UPI", date: "Today, 01:15 PM", status: "REFUNDED" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EADFD7]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#381E11] flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-[#6B3820]" />
            Revenue & Analytics
          </h1>
          <p className="text-sm text-[#381E11]/70 mt-1 font-medium">
            Financial monitoring, payment transactions, and service earnings (`payments` table).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#EADFD7] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#381E11]/70">
            <span className="text-xs font-extrabold">Total Daily Revenue</span>
            <IndianRupee className="w-4 h-4 text-[#6B3820]" />
          </div>
          <p className="text-2xl font-extrabold text-[#381E11]">₹12,500</p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18% from yesterday
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EADFD7] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#381E11]/70">
            <span className="text-xs font-extrabold">Transactions Completed</span>
            <CreditCard className="w-4 h-4 text-[#6B3820]" />
          </div>
          <p className="text-2xl font-extrabold text-[#381E11]">21 Paid Services</p>
          <p className="text-[11px] text-[#6B3820] font-bold">1 Refund processed</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EADFD7] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#381E11]/70">
            <span className="text-xs font-extrabold">Avg Ticket Size</span>
            <PieChart className="w-4 h-4 text-[#6B3820]" />
          </div>
          <p className="text-2xl font-extrabold text-[#381E11]">₹595 / customer</p>
          <p className="text-[11px] text-[#6B3820] font-bold">Hair Spa is top earner</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EADFD7] space-y-4 shadow-xs">
        <h2 className="text-base font-extrabold text-[#381E11] flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#6B3820]" /> Recent Transactions
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[#6B3820] uppercase bg-[#FAF6F0] border-b border-[#EADFD7] text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="px-4 py-3">Txn ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFD7]/60">
              {mockPayments.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF6F0]/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-[#6B3820] font-extrabold">#{p.id}</td>
                  <td className="px-4 py-3.5 font-bold text-[#381E11]">{p.customer}</td>
                  <td className="px-4 py-3.5 text-[#381E11]/80 font-medium">{p.method}</td>
                  <td className="px-4 py-3.5 text-[#381E11]/70 font-mono">{p.date}</td>
                  <td className="px-4 py-3.5 font-extrabold text-[#6B3820]">{p.amount}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${
                      p.status === "SUCCESS"
                        ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-700 border-rose-500/30"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
