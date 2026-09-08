"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  Search, 
  Filter, 
  Plus, 
  X,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { getAdminUsers, createAdminUser, UserDTO } from "@/lib/api";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form States matching exact Java REST API payload contract
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [role, setRole] = useState("CUSTOMER");

  const [users, setUsers] = useState<UserDTO[]>([
    { id: 1, name: "Rahul Sharma", email: "customer@demo.com", mobileNumber: "9876543210", role: "CUSTOMER", userType: "CUSTOMER", createdAt: "2026-09-08T10:57:07" },
    { id: 6, name: "Karan Malhotra", email: "karan@example.com", mobileNumber: "9876543210", role: "CUSTOMER", userType: "CUSTOMER", createdAt: "2026-09-08T12:03:42" },
    { id: 2, name: "Raj Kumar", email: "raj@salonpulse.com", mobileNumber: "9812345678", role: "SALON_OWNER", userType: "SALON_OWNER", createdAt: "2026-09-08T11:00:00" },
    { id: 4, name: "Admin Manager", email: "admin@salonpulse.com", mobileNumber: "9900112233", role: "ADMIN", userType: "ADMIN", createdAt: "2026-09-08T09:00:00" },
  ]);

  const loadUsersData = async () => {
    setIsRefreshing(true);
    const fetchedUsers = await getAdminUsers();
    if (fetchedUsers && fetchedUsers.length > 0) {
      // Map STAFF → SALON_OWNER for UI display
      const mapped = fetchedUsers.map((u) => ({
        ...u,
        role: u.role === "STAFF" ? "SALON_OWNER" : u.role,
        userType: u.userType === "STAFF" ? "SALON_OWNER" : u.userType,
      }));
      setUsers(mapped);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.mobileNumber && u.mobileNumber.includes(searchTerm));
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName || !email || !password || !confirmPassword || !mobileNumber) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    const newUserPayload: UserDTO = {
      name: fullName.trim(),
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      password: password,
      confirmPassword: confirmPassword,
      cnfPassword: confirmPassword,
      // Send STAFF to backend; display as SALON_OWNER in UI
      role: role === "SALON_OWNER" ? "STAFF" : role,
      userType: role === "SALON_OWNER" ? "STAFF" : role
    };

    try {
      const savedUser = await createAdminUser(newUserPayload);
      // Show SALON_OWNER in local state regardless of what API returns
      const displayUser = savedUser
        ? { ...savedUser, role: role, userType: role }
        : { ...newUserPayload, id: Date.now(), role: role, userType: role };
      setUsers([displayUser, ...users]);

      // Reset Form
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setMobileNumber("");
      setRole("CUSTOMER");
      setErrorMessage("");
      setShowAddModal(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to register user. Check Java backend server.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EADFD7]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#381E11] flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#6B3820]" />
            User Account Management
          </h1>
          <p className="text-sm text-[#381E11]/70 mt-1 font-medium">
            Manage user accounts across Customers, Staff, and Admins (`GET/POST /api/users`).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadUsersData}
            disabled={isRefreshing}
            className="p-2 text-xs font-extrabold bg-white hover:bg-[#FAF6F0] text-[#381E11] rounded-xl border border-[#EADFD7] transition-all duration-150 shadow-xs"
            title="Refresh Users List"
          >
            <RefreshCw className={`w-4 h-4 text-[#6B3820] ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setErrorMessage("");
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold bg-[#6B3820] hover:bg-[#542C19] text-white rounded-xl shadow-md shadow-[#6B3820]/30 transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            Add New User
          </button>
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
            placeholder="Search by name, email, or mobile..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820] font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#6B3820] shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-extrabold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="SALON_OWNER">Salon Owners</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#EADFD7] overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="text-[#6B3820] uppercase bg-[#FAF6F0] border-b border-[#EADFD7] text-[10px] font-extrabold tracking-wider">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Email Address</th>
              <th className="px-4 py-3">Mobile Number</th>
              <th className="px-4 py-3 text-right">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EADFD7]/60">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-[#FAF6F0]/80 transition-colors">
                <td className="px-4 py-3.5 font-mono text-[#6B3820] font-extrabold">#{u.id}</td>
                <td className="px-4 py-3.5 font-bold text-[#381E11] flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#6B3820]/15 text-[#6B3820] font-extrabold flex items-center justify-center text-xs">
                    {u.name ? u.name.charAt(0) : "U"}
                  </div>
                  {u.name}
                </td>
                <td className="px-4 py-3.5 text-[#381E11]/80 font-medium">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#6B3820]" /> {u.email}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-[#381E11]/80 font-mono font-semibold">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#6B3820]" /> {u.mobileNumber || "-"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${
                    u.role === "ADMIN"
                      ? "bg-[#6B3820] text-white border-[#6B3820]"
                      : u.role === "SALON_OWNER"
                      ? "bg-amber-500/15 text-amber-800 border-amber-500/30"
                      : "bg-[#FAF6F0] text-[#381E11] border-[#EADFD7]"
                  }`}>
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#381E11]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EADFD7] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-3">
              <h3 className="text-lg font-extrabold text-[#381E11] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#6B3820]" />
                Register New User Account
              </h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-[#381E11]/60 hover:text-[#381E11] p-1 rounded-lg hover:bg-[#FAF6F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[#381E11]/80 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Karan Malhotra"
                  required
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#381E11]/80 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. karan@example.com"
                    required
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  />
                </div>

                <div>
                  <label className="block text-[#381E11]/80 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    required
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#381E11]/80 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  />
                </div>

                <div>
                  <label className="block text-[#381E11]/80 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#381E11]/80 mb-1">Role & User Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-bold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="SALON_OWNER">SALON_OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#FAF6F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#FAF6F0] text-[#381E11] rounded-xl hover:bg-[#EADFD7] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6B3820] text-white rounded-xl hover:bg-[#542C19] font-extrabold shadow-md shadow-[#6B3820]/30"
                >
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
