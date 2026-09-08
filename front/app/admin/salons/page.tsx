"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  Plus, 
  Search, 
  X, 
  Phone,
  Store,
  RefreshCw,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  getAdminSalons, 
  getSalonById, 
  createAdminSalon, 
  updateAdminSalon, 
  getStates, 
  getCities, 
  SalonDTO, 
  StateDTO, 
  CityDTO 
} from "@/lib/api";

export default function AdminSalonsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<SalonDTO | null>(null);
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form States for Salon Outlet
  const [editingId, setEditingId] = useState<number | null>(null);
  const [salonName, setSalonName] = useState("");
  const [salonPhone, setSalonPhone] = useState("");
  const [salonType, setSalonType] = useState("UNISEX");
  const [salonState, setSalonState] = useState("");
  const [salonCity, setSalonCity] = useState("");
  const [salonAddress, setSalonAddress] = useState("");
  const [salonPincode, setSalonPincode] = useState("");
  const [salonStatus, setSalonStatus] = useState("ACTIVE");

  const [statesList, setStatesList] = useState<StateDTO[]>([]);
  const [citiesList, setCitiesList] = useState<CityDTO[]>([]);

  const [salons, setSalons] = useState<SalonDTO[]>([
    { id: 1, name: "SalonPulse Flagship Indiranagar", address: "101 100ft Road, Indiranagar", city: "Bangalore", state: "Karnataka", phone: "+91 98765 43210", status: "ACTIVE", salonType: "UNISEX", staffCount: 8 },
    { id: 2, name: "SalonPulse Mumbai Central", address: "Plot 45, Bandra West", city: "Mumbai", state: "Maharashtra", phone: "+91 91234 56789", status: "ACTIVE", salonType: "UNISEX", staffCount: 5 },
    { id: 3, name: "SalonPulse Men's Grooming Lounge", address: "Koregaon Park Main Rd", city: "Pune", state: "Maharashtra", phone: "+91 98123 45678", status: "ACTIVE", salonType: "MALE", staffCount: 6 },
  ]);

  const loadSalonsData = async () => {
    setIsRefreshing(true);
    const [fetchedSalons, fetchedStates, fetchedCities] = await Promise.all([
      getAdminSalons(),
      getStates(),
      getCities()
    ]);

    if (fetchedSalons && fetchedSalons.length > 0) setSalons(fetchedSalons);
    if (fetchedStates && fetchedStates.length > 0) setStatesList(fetchedStates);
    if (fetchedCities && fetchedCities.length > 0) setCitiesList(fetchedCities);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadSalonsData();
  }, []);

  const filteredSalons = salons.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.salonType && s.salonType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resetForm = () => {
    setEditingId(null);
    setSalonName("");
    setSalonPhone("");
    setSalonType("UNISEX");
    setSalonState("");
    setSalonCity("");
    setSalonAddress("");
    setSalonPincode("");
    setSalonStatus("ACTIVE");
  };

  // 1️⃣ Save / Create New Salon (POST /api/salons)
  const handleAddSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonName || !salonAddress || !salonCity) return;

    const newSalonPayload: SalonDTO = {
      name: salonName.trim(),
      address: salonAddress.trim(),
      city: salonCity.trim(),
      state: salonState.trim(),
      phone: salonPhone.trim(),
      status: salonStatus,
      salonType: salonType
    };

    const savedSalon = await createAdminSalon(newSalonPayload);
    const resultSalon = savedSalon || { ...newSalonPayload, id: Date.now() };

    setSalons([resultSalon, ...salons]);
    setFeedbackMsg({ text: `Salon "${resultSalon.name}" created successfully!`, type: "success" });
    setTimeout(() => setFeedbackMsg(null), 4000);

    resetForm();
    setShowAddModal(false);
  };

  // 3️⃣ Fetch Single Salon by ID (GET /api/salons/{id})
  const handleViewSalon = async (id: number) => {
    setIsLoadingSingle(true);
    setShowViewModal(true);
    const data = await getSalonById(id);
    if (data) {
      setSelectedSalon(data);
    } else {
      // Fallback from local state
      const local = salons.find(s => s.id === id);
      setSelectedSalon(local || null);
    }
    setIsLoadingSingle(false);
  };

  // Open Edit Modal with populated data
  const handleOpenEdit = (salon: SalonDTO) => {
    if (!salon.id) return;
    setEditingId(salon.id);
    setSalonName(salon.name || "");
    setSalonPhone(salon.phone || "");
    setSalonType(salon.salonType || "UNISEX");
    setSalonState(salon.state || "");
    setSalonCity(salon.city || "");
    setSalonAddress(salon.address || "");
    setSalonPincode(salon.pincode || "");
    setSalonStatus(salon.status || "ACTIVE");
    setShowEditModal(true);
  };

  // 4️⃣ Update Salon Details (PUT /api/salons/{id})
  const handleUpdateSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !salonName || !salonAddress || !salonCity) return;

    const updatedPayload: SalonDTO = {
      id: editingId,
      name: salonName.trim(),
      address: salonAddress.trim(),
      city: salonCity.trim(),
      state: salonState.trim(),
      phone: salonPhone.trim(),
      status: salonStatus,
      salonType: salonType
    };

    const response = await updateAdminSalon(editingId, updatedPayload);
    const finalSalon = response || updatedPayload;

    setSalons(salons.map(s => (s.id === editingId ? finalSalon : s)));
    setFeedbackMsg({ text: `Salon #${editingId} updated successfully!`, type: "success" });
    setTimeout(() => setFeedbackMsg(null), 4000);

    resetForm();
    setShowEditModal(false);
  };

  const getSalonTypeBadge = (type?: string) => {
    switch (type) {
      case "MALE":
        return { label: "Male Only 👨", style: "bg-blue-500/15 text-blue-700 border-blue-500/30" };
      case "FEMALE":
        return { label: "Female Only 👩", style: "bg-pink-500/15 text-pink-700 border-pink-500/30" };
      case "UNISEX":
      default:
        return { label: "Unisex (Male & Female) 👥", style: "bg-[#6B3820]/15 text-[#6B3820] border-[#6B3820]/30" };
    }
  };

  // Computed available cities based on selected state
  const selectedStateObj = statesList.find(s => s.stateName.toLowerCase() === salonState.toLowerCase());
  const availableCities = salonState 
    ? citiesList.filter(c => 
        (c.stateName && c.stateName.toLowerCase() === salonState.toLowerCase()) || 
        (selectedStateObj?.id && c.stateId === selectedStateObj.id)
      )
    : citiesList;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EADFD7]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#381E11] flex items-center gap-2.5">
            <Store className="w-7 h-7 text-[#6B3820]" />
            Salon Branch Management
          </h1>
          <p className="text-sm text-[#381E11]/70 mt-1 font-medium">
            Manage operational salon outlets, salon types (Unisex / Male Only / Female Only), locations, and active status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSalonsData}
            disabled={isRefreshing}
            className="p-2 text-xs font-extrabold bg-white hover:bg-[#FAF6F0] text-[#381E11] rounded-xl border border-[#EADFD7] transition-all duration-150 shadow-xs"
            title="Refresh Salons List"
          >
            <RefreshCw className={`w-4 h-4 text-[#6B3820] ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold bg-[#6B3820] hover:bg-[#542C19] text-white rounded-xl shadow-md shadow-[#6B3820]/30 transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            Add New Salon Outlet
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border ${
          feedbackMsg.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
            : "bg-rose-50 text-rose-800 border-rose-300"
        }`}>
          {feedbackMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          {feedbackMsg.text}
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#EADFD7] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B3820]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by salon name, type, city, or address..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820] font-semibold"
          />
        </div>
        <div className="text-xs text-[#381E11]/60 font-bold">
          Showing <span className="text-[#6B3820] font-extrabold">{filteredSalons.length}</span> Salons
        </div>
      </div>

      {/* 2️⃣ Salons Grid (GET /api/salons) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSalons.map((salon) => {
          const typeBadge = getSalonTypeBadge(salon.salonType);
          return (
            <div key={salon.id} className="p-5 rounded-2xl bg-white border border-[#EADFD7] space-y-3 shadow-xs hover:border-[#6B3820] transition-colors relative group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#6B3820]/15 text-[#6B3820] flex items-center justify-center font-extrabold shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#381E11]">{salon.name}</h3>
                    <p className="text-xs text-[#6B3820] font-bold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#6B3820]" /> {salon.city}{salon.state ? `, ${salon.state}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                    salon.status === "ACTIVE"
                      ? "bg-[#6B3820]/15 text-[#6B3820] border-[#6B3820]/30"
                      : "bg-[#FAF6F0] text-[#381E11] border-[#EADFD7]"
                  }`}>
                    {salon.status}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${typeBadge.style}`}>
                    {typeBadge.label}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-[#381E11]/80 font-medium">
                <p>{salon.address} {salon.pincode ? ` - ${salon.pincode}` : ""}</p>
                {salon.phone && (
                  <p className="text-[11px] font-mono text-[#381E11]/70 flex items-center gap-1 pt-1">
                    <Phone className="w-3 h-3 text-[#6B3820]" /> {salon.phone}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#FAF6F0] flex items-center justify-between text-xs font-bold text-[#381E11]/70">
                <div className="flex items-center gap-2">
                  {/* View Single Salon */}
                  <button
                    onClick={() => salon.id && handleViewSalon(salon.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold bg-[#FAF6F0] hover:bg-[#EADFD7]/50 text-[#381E11] rounded-lg transition-colors border border-[#EADFD7]"
                  >
                    <Eye className="w-3 h-3 text-[#6B3820]" /> View API Details
                  </button>

                  {/* Edit Salon */}
                  <button
                    onClick={() => handleOpenEdit(salon)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold bg-[#6B3820]/10 hover:bg-[#6B3820]/20 text-[#6B3820] rounded-lg transition-colors border border-[#6B3820]/30"
                  >
                    <Edit className="w-3 h-3" /> Edit Details
                  </button>
                </div>

                <span className="text-[#6B3820] font-mono text-[11px]">ID: #{salon.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1️⃣ Add New Salon Modal (POST /api/salons) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#381E11]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EADFD7] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-3">
              <h3 className="text-lg font-extrabold text-[#381E11] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#6B3820]" />
                Add / Save New Salon Branch
              </h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-[#381E11]/60 hover:text-[#381E11] p-1 rounded-lg hover:bg-[#FAF6F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSalon} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[#381E11]/80 mb-1">Salon Name</label>
                <input
                  type="text"
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  placeholder="e.g. SalonPulse Mumbai Central"
                  required
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#381E11]/80 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={salonPhone}
                    onChange={(e) => setSalonPhone(e.target.value)}
                    placeholder="e.g. +91 91234 56789"
                    required
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  />
                </div>

                <div>
                  <label className="block text-[#381E11]/80 mb-1">Salon Type</label>
                  <select
                    value={salonType}
                    onChange={(e) => setSalonType(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-bold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  >
                    <option value="UNISEX">Unisex (Male & Female)</option>
                    <option value="MALE">Male Only 👨</option>
                    <option value="FEMALE">Female Only 👩</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#381E11]/80 mb-1">State Dropdown</label>
                  <select
                    value={salonState}
                    onChange={(e) => {
                      setSalonState(e.target.value);
                      setSalonCity(""); // reset city selection when state changes
                    }}
                    required
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-bold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  >
                    <option value="">-- Select State --</option>
                    {statesList.length > 0 ? (
                      statesList.map(st => (
                        <option key={st.id || st.stateCode} value={st.stateName}>
                          {st.stateName} ({st.stateCode})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Karnataka">Karnataka (KA)</option>
                        <option value="Maharashtra">Maharashtra (MH)</option>
                        <option value="Delhi">Delhi (DL)</option>
                        <option value="Gujarat">Gujarat (GJ)</option>
                        <option value="Tamil Nadu">Tamil Nadu (TN)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[#381E11]/80 mb-1">City Dropdown</label>
                  <select
                    value={salonCity}
                    onChange={(e) => setSalonCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-bold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  >
                    <option value="">-- Select City --</option>
                    {availableCities.length > 0 ? (
                      availableCities.map(c => (
                        <option key={c.id || c.cityCode} value={c.cityName}>
                          {c.cityName} ({c.cityCode})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Bangalore">Bangalore (BLR)</option>
                        <option value="Mumbai">Mumbai (BOM)</option>
                        <option value="Pune">Pune (PNQ)</option>
                        <option value="New Delhi">New Delhi (DEL)</option>
                        <option value="Chennai">Chennai (MAA)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#381E11]/80 mb-1">Status</label>
                  <select
                    value={salonStatus}
                    onChange={(e) => setSalonStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-bold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#381E11]/80 mb-1">Address</label>
                <textarea
                  value={salonAddress}
                  onChange={(e) => setSalonAddress(e.target.value)}
                  placeholder="e.g. Plot 45, Bandra West"
                  rows={2}
                  required
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#FAF6F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-[#FAF6F0] hover:bg-[#EADFD7] text-[#381E11] rounded-xl font-extrabold border border-[#EADFD7] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#6B3820] hover:bg-[#542C19] text-white rounded-xl font-extrabold shadow-md shadow-[#6B3820]/30 transition-all"
                >
                  Save Salon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4️⃣ Update Salon Details Modal (PUT /api/salons/{id}) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-[#381E11]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EADFD7] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-3">
              <h3 className="text-lg font-extrabold text-[#381E11] flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#6B3820]" />
                Update Salon Details (ID: #{editingId})
              </h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-[#381E11]/60 hover:text-[#381E11] p-1 rounded-lg hover:bg-[#FAF6F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSalon} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[#381E11]/80 mb-1">Salon Name</label>
                <input
                  type="text"
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#381E11]/80 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={salonPhone}
                    onChange={(e) => setSalonPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  />
                </div>

                <div>
                  <label className="block text-[#381E11]/80 mb-1">Salon Type</label>
                  <select
                    value={salonType}
                    onChange={(e) => setSalonType(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-bold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  >
                    <option value="UNISEX">Unisex (Male & Female)</option>
                    <option value="MALE">Male Only 👨</option>
                    <option value="FEMALE">Female Only 👩</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#381E11]/80 mb-1">State Dropdown</label>
                  <select
                    value={salonState}
                    onChange={(e) => {
                      setSalonState(e.target.value);
                      setSalonCity(""); // reset city selection when state changes
                    }}
                    required
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-bold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  >
                    <option value="">-- Select State --</option>
                    {statesList.length > 0 ? (
                      statesList.map(st => (
                        <option key={st.id || st.stateCode} value={st.stateName}>
                          {st.stateName} ({st.stateCode})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Karnataka">Karnataka (KA)</option>
                        <option value="Maharashtra">Maharashtra (MH)</option>
                        <option value="Delhi">Delhi (DL)</option>
                        <option value="Gujarat">Gujarat (GJ)</option>
                        <option value="Tamil Nadu">Tamil Nadu (TN)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[#381E11]/80 mb-1">City Dropdown</label>
                  <select
                    value={salonCity}
                    onChange={(e) => setSalonCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-bold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  >
                    <option value="">-- Select City --</option>
                    {availableCities.length > 0 ? (
                      availableCities.map(c => (
                        <option key={c.id || c.cityCode} value={c.cityName}>
                          {c.cityName} ({c.cityCode})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Bangalore">Bangalore (BLR)</option>
                        <option value="Mumbai">Mumbai (BOM)</option>
                        <option value="Pune">Pune (PNQ)</option>
                        <option value="New Delhi">New Delhi (DEL)</option>
                        <option value="Chennai">Chennai (MAA)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#381E11]/80 mb-1">Status</label>
                  <select
                    value={salonStatus}
                    onChange={(e) => setSalonStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-bold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#381E11]/80 mb-1">Address</label>
                <textarea
                  value={salonAddress}
                  onChange={(e) => setSalonAddress(e.target.value)}
                  rows={2}
                  required
                  className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#FAF6F0]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 bg-[#FAF6F0] hover:bg-[#EADFD7] text-[#381E11] rounded-xl font-extrabold border border-[#EADFD7] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#6B3820] hover:bg-[#542C19] text-white rounded-xl font-extrabold shadow-md shadow-[#6B3820]/30 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3️⃣ Fetch Single Salon Modal (GET /api/salons/{id}) */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 bg-[#381E11]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EADFD7] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-3">
              <h3 className="text-lg font-extrabold text-[#381E11] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#6B3820]" />
                Single Salon Response (GET /api/salons/{selectedSalon?.id})
              </h3>
              <button 
                onClick={() => setShowViewModal(false)} 
                className="text-[#381E11]/60 hover:text-[#381E11] p-1 rounded-lg hover:bg-[#FAF6F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingSingle ? (
              <div className="py-8 flex flex-col items-center justify-center text-xs text-[#381E11]/60 font-bold">
                <RefreshCw className="w-6 h-6 text-[#6B3820] animate-spin mb-2" />
                Fetching details from GET /api/salons/{selectedSalon?.id}...
              </div>
            ) : selectedSalon ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#EADFD7] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#381E11]">Salon ID:</span>
                    <span className="font-mono text-[#6B3820] font-extrabold">#{selectedSalon.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#381E11]">Name:</span>
                    <span className="font-semibold text-[#381E11]">{selectedSalon.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#381E11]">Phone:</span>
                    <span className="font-mono text-[#381E11]">{selectedSalon.phone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#381E11]">City:</span>
                    <span className="font-semibold text-[#381E11]">{selectedSalon.city}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#381E11]">State:</span>
                    <span className="font-semibold text-[#381E11]">{selectedSalon.state}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#381E11]">Status:</span>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#6B3820]/15 text-[#6B3820] rounded-full border border-[#6B3820]/30">{selectedSalon.status}</span>
                  </div>
                  <div className="pt-2 border-t border-[#EADFD7]/60">
                    <span className="font-bold text-[#381E11] block mb-1">Address:</span>
                    <p className="text-[#381E11]/80">{selectedSalon.address}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-[#381E11]/60 font-bold block mb-1">JSON Payload Format:</span>
                  <pre className="p-3 bg-[#381E11] text-[#EADFD7] rounded-xl text-[11px] font-mono overflow-x-auto">
{JSON.stringify({
  id: selectedSalon.id,
  name: selectedSalon.name,
  address: selectedSalon.address,
  city: selectedSalon.city,
  state: selectedSalon.state,
  phone: selectedSalon.phone,
  status: selectedSalon.status
}, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-600 font-bold">Failed to load salon details.</p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-[#6B3820] text-white text-xs font-extrabold rounded-xl hover:bg-[#542C19]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
