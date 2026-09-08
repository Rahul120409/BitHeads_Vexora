"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Building2, 
  Globe, 
  Search, 
  Check, 
  X, 
  RefreshCw
} from "lucide-react";
import { getStates, createState, getCities, createCity, StateDTO, CityDTO } from "@/lib/api";

export default function AdminLocationsPage() {
  // State List & City List
  const [states, setStates] = useState<StateDTO[]>([
    { id: 1, stateCode: "KA", stateName: "Karnataka" },
    { id: 2, stateCode: "MH", stateName: "Maharashtra" },
    { id: 3, stateCode: "DL", stateName: "Delhi" },
    { id: 4, stateCode: "GJ", stateName: "Gujarat" },
  ]);

  const [cities, setCities] = useState<CityDTO[]>([
    { id: 1, cityCode: "BLR", cityName: "Bangalore", stateId: 1, stateCode: "KA", stateName: "Karnataka" },
    { id: 2, cityCode: "BOM", cityName: "Mumbai", stateId: 2, stateCode: "MH", stateName: "Maharashtra" },
    { id: 3, cityCode: "PNE", cityName: "Pune", stateId: 2, stateCode: "MH", stateName: "Maharashtra" },
    { id: 4, cityCode: "DEL", cityName: "New Delhi", stateId: 3, stateCode: "DL", stateName: "Delhi" },
  ]);

  // Form States for Add State Card
  const [inputStateCode, setInputStateCode] = useState("");
  const [inputStateName, setInputStateName] = useState("");

  // Form States for Add City Card
  const [selectedStateName, setSelectedStateName] = useState("");
  const [inputCityCode, setInputCityCode] = useState("");
  const [inputCityName, setInputCityName] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch from Java Spring Boot REST API (/api/locations/states & /api/locations/cities)
  const loadLocationsData = async () => {
    setIsRefreshing(true);
    const [fetchedStates, fetchedCities] = await Promise.all([
      getStates(),
      getCities()
    ]);

    if (fetchedStates && fetchedStates.length > 0) setStates(fetchedStates);
    if (fetchedCities && fetchedCities.length > 0) setCities(fetchedCities);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadLocationsData();
  }, []);

  // Save State Handler (POST /api/locations/states)
  const handleSaveState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputStateCode || !inputStateName) return;

    const newStatePayload: StateDTO = {
      stateCode: inputStateCode.toUpperCase().trim(),
      stateName: inputStateName.trim()
    };

    const savedState = await createState(newStatePayload);
    setStates([...states, savedState || { ...newStatePayload, id: Date.now() }]);

    // Reset Form
    setInputStateCode("");
    setInputStateName("");
  };

  const handleCancelState = () => {
    setInputStateCode("");
    setInputStateName("");
  };

  // Save City Handler (POST /api/locations/cities)
  const handleSaveCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStateName || !inputCityCode || !inputCityName) return;

    const matchedState = states.find(s => s.stateName === selectedStateName);

    const newCityPayload: CityDTO = {
      cityCode: inputCityCode.toUpperCase().trim(),
      cityName: inputCityName.trim(),
      stateId: matchedState?.id,
      stateCode: matchedState?.stateCode || "",
      stateName: selectedStateName
    };

    const savedCity = await createCity(newCityPayload);
    setCities([...cities, savedCity || { ...newCityPayload, id: Date.now() }]);

    // Reset Form
    setSelectedStateName("");
    setInputCityCode("");
    setInputCityName("");
  };

  const handleCancelCity = () => {
    setSelectedStateName("");
    setInputCityCode("");
    setInputCityName("");
  };

  const filteredCities = cities.filter(c => 
    c.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cityCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.stateName && c.stateName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.stateCode && c.stateCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EADFD7]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#381E11] flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-[#6B3820]" />
            Location & Region Management
          </h1>
          <p className="text-sm text-[#381E11]/70 mt-1 font-medium">
            Manage State Codes, State Names, City Codes, and Cities for salon operations.
          </p>
        </div>

        <button
          onClick={loadLocationsData}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold bg-white hover:bg-[#FAF6F0] text-[#381E11] rounded-xl border border-[#EADFD7] transition-all duration-150 shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 text-[#6B3820] ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Grid: 2 Add Cards (Add State Card & Add City Card) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: Add State Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#EADFD7] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#FAF6F0]">
            <h2 className="text-base font-extrabold text-[#381E11] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#6B3820]" />
              Add State Card
            </h2>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#6B3820]/15 text-[#6B3820] border border-[#6B3820]/30">
              State Form
            </span>
          </div>

          <form onSubmit={handleSaveState} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[#381E11]/80 mb-1">State Code</label>
              <input
                type="text"
                value={inputStateCode}
                onChange={(e) => setInputStateCode(e.target.value)}
                placeholder="e.g. KA, MH, DL, GJ"
                maxLength={4}
                required
                className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-mono font-bold uppercase placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
              />
            </div>

            <div>
              <label className="block text-[#381E11]/80 mb-1">State Name</label>
              <input
                type="text"
                value={inputStateName}
                onChange={(e) => setInputStateName(e.target.value)}
                placeholder="e.g. Karnataka, Maharashtra, Delhi"
                required
                className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelState}
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#FAF6F0] text-[#381E11] rounded-xl hover:bg-[#EADFD7] font-bold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#6B3820] text-white rounded-xl hover:bg-[#542C19] font-extrabold shadow-md shadow-[#6B3820]/30 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Save State
              </button>
            </div>
          </form>
        </div>

        {/* CARD 2: Add City Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#EADFD7] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#FAF6F0]">
            <h2 className="text-base font-extrabold text-[#381E11] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#6B3820]" />
              Add City Card
            </h2>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#6B3820]/15 text-[#6B3820] border border-[#6B3820]/30">
              City Form
            </span>
          </div>

          <form onSubmit={handleSaveCity} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[#381E11]/80 mb-1">Select State</label>
              <select
                value={selectedStateName}
                onChange={(e) => setSelectedStateName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-bold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
              >
                <option value="">-- Select a State --</option>
                {states.map((st) => (
                  <option key={st.id || st.stateCode} value={st.stateName}>
                    {st.stateName} ({st.stateCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#381E11]/80 mb-1">City Code</label>
              <input
                type="text"
                value={inputCityCode}
                onChange={(e) => setInputCityCode(e.target.value)}
                placeholder="e.g. BLR, BOM, PNE, DEL"
                maxLength={5}
                required
                className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-mono font-bold uppercase placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
              />
            </div>

            <div>
              <label className="block text-[#381E11]/80 mb-1">City Name</label>
              <input
                type="text"
                value={inputCityName}
                onChange={(e) => setInputCityName(e.target.value)}
                placeholder="e.g. Bangalore, Mumbai, Pune"
                required
                className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelCity}
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#FAF6F0] text-[#381E11] rounded-xl hover:bg-[#EADFD7] font-bold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#6B3820] text-white rounded-xl hover:bg-[#542C19] font-extrabold shadow-md shadow-[#6B3820]/30 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Save City
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Grid: States Display & Cities Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* States Overview List (1 Col) */}
        <div className="p-5 rounded-2xl bg-white border border-[#EADFD7] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#381E11] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#6B3820]" />
              Registered States
            </h2>
            <span className="text-xs font-bold text-[#6B3820] bg-[#6B3820]/15 px-2 py-0.5 rounded-full border border-[#6B3820]/30">
              {states.length} Total
            </span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {states.map((st) => (
              <div 
                key={st.id || st.stateCode}
                className="p-3 rounded-xl bg-[#FAF6F0] border border-[#EADFD7] flex items-center justify-between gap-3 hover:border-[#6B3820] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-[#6B3820] text-white flex items-center justify-center font-mono font-extrabold text-xs">
                    {st.stateCode}
                  </span>
                  <span className="text-xs font-extrabold text-[#381E11]">{st.stateName}</span>
                </div>
                <span className="text-[10px] font-bold text-[#6B3820] bg-white px-2 py-1 rounded-md border border-[#EADFD7]">
                  Code: {st.stateCode}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cities Overview Table (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[#EADFD7] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#6B3820]" />
              <h2 className="text-base font-extrabold text-[#381E11]">Registered Cities</h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6B3820]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search city, code or state..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF6F0] border border-[#EADFD7] rounded-xl text-[#381E11] font-semibold focus:outline-none focus:ring-2 focus:ring-[#6B3820]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#6B3820] uppercase bg-[#FAF6F0] border-b border-[#EADFD7] text-[10px] font-extrabold tracking-wider">
                <tr>
                  <th className="px-4 py-3">City Code</th>
                  <th className="px-4 py-3">City Name</th>
                  <th className="px-4 py-3">State Name</th>
                  <th className="px-4 py-3 text-right">State Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFD7]/60">
                {filteredCities.map((c, idx) => (
                  <tr key={c.id || idx} className="hover:bg-[#FAF6F0]/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#6B3820]">
                      <span className="px-2 py-0.5 rounded bg-[#6B3820]/15 border border-[#6B3820]/30">
                        {c.cityCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-[#381E11] flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#6B3820]" />
                      {c.cityName}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#6B3820]">{c.stateName || "Karnataka"}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-[#6B3820]">
                      {c.stateCode || "KA"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
