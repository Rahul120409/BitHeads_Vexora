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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#cce0e6]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0c242c] flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-[#23b5d3]" />
            Location & Region Management
          </h1>
          <p className="text-sm text-[#0c242c]/70 mt-1 font-medium">
            Manage State Codes, State Names, City Codes, and Cities for salon operations.
          </p>
        </div>

        <button
          onClick={loadLocationsData}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-extrabold bg-white hover:bg-[#EFF5F7] text-[#0c242c] rounded-xl border border-[#c2dee6] transition-all duration-150 shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 text-[#23b5d3] ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Grid: 2 Add Cards (Add State Card & Add City Card) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: Add State Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#c2dee6] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#EFF5F7]">
            <h2 className="text-base font-extrabold text-[#0c242c] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#23b5d3]" />
              Add State Card
            </h2>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#23b5d3]/15 text-[#147a90] border border-[#23b5d3]/30">
              State Form
            </span>
          </div>

          <form onSubmit={handleSaveState} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[#0c242c]/80 mb-1">State Code</label>
              <input
                type="text"
                value={inputStateCode}
                onChange={(e) => setInputStateCode(e.target.value)}
                placeholder="e.g. KA, MH, DL, GJ"
                maxLength={4}
                required
                className="w-full px-3 py-2 bg-[#EFF5F7] border border-[#c2dee6] rounded-xl text-[#0c242c] font-mono font-bold uppercase placeholder-[#0c242c]/40 focus:outline-none focus:ring-2 focus:ring-[#23b5d3]"
              />
            </div>

            <div>
              <label className="block text-[#0c242c]/80 mb-1">State Name</label>
              <input
                type="text"
                value={inputStateName}
                onChange={(e) => setInputStateName(e.target.value)}
                placeholder="e.g. Karnataka, Maharashtra, Delhi"
                required
                className="w-full px-3 py-2 bg-[#EFF5F7] border border-[#c2dee6] rounded-xl text-[#0c242c] placeholder-[#0c242c]/40 focus:outline-none focus:ring-2 focus:ring-[#23b5d3]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelState}
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#EFF5F7] text-[#0c242c] rounded-xl hover:bg-slate-200 font-bold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#23b5d3] text-white rounded-xl hover:bg-[#1a9fba] font-extrabold shadow-md shadow-[#23b5d3]/30 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Save State
              </button>
            </div>
          </form>
        </div>

        {/* CARD 2: Add City Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#c2dee6] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#EFF5F7]">
            <h2 className="text-base font-extrabold text-[#0c242c] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#23b5d3]" />
              Add City Card
            </h2>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#23b5d3]/15 text-[#147a90] border border-[#23b5d3]/30">
              City Form
            </span>
          </div>

          <form onSubmit={handleSaveCity} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[#0c242c]/80 mb-1">Select State</label>
              <select
                value={selectedStateName}
                onChange={(e) => setSelectedStateName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#EFF5F7] border border-[#c2dee6] rounded-xl text-[#0c242c] font-bold focus:outline-none focus:ring-2 focus:ring-[#23b5d3]"
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
              <label className="block text-[#0c242c]/80 mb-1">City Code</label>
              <input
                type="text"
                value={inputCityCode}
                onChange={(e) => setInputCityCode(e.target.value)}
                placeholder="e.g. BLR, BOM, PNE, DEL"
                maxLength={5}
                required
                className="w-full px-3 py-2 bg-[#EFF5F7] border border-[#c2dee6] rounded-xl text-[#0c242c] font-mono font-bold uppercase placeholder-[#0c242c]/40 focus:outline-none focus:ring-2 focus:ring-[#23b5d3]"
              />
            </div>

            <div>
              <label className="block text-[#0c242c]/80 mb-1">City Name</label>
              <input
                type="text"
                value={inputCityName}
                onChange={(e) => setInputCityName(e.target.value)}
                placeholder="e.g. Bangalore, Mumbai, Pune"
                required
                className="w-full px-3 py-2 bg-[#EFF5F7] border border-[#c2dee6] rounded-xl text-[#0c242c] placeholder-[#0c242c]/40 focus:outline-none focus:ring-2 focus:ring-[#23b5d3]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelCity}
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#EFF5F7] text-[#0c242c] rounded-xl hover:bg-slate-200 font-bold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#23b5d3] text-white rounded-xl hover:bg-[#1a9fba] font-extrabold shadow-md shadow-[#23b5d3]/30 transition-colors"
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
        <div className="p-5 rounded-2xl bg-white border border-[#c2dee6] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#0c242c] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#23b5d3]" />
              Registered States
            </h2>
            <span className="text-xs font-bold text-[#147a90] bg-[#23b5d3]/15 px-2 py-0.5 rounded-full border border-[#23b5d3]/30">
              {states.length} Total
            </span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {states.map((st) => (
              <div 
                key={st.id || st.stateCode}
                className="p-3 rounded-xl bg-[#EFF5F7] border border-[#c2dee6] flex items-center justify-between gap-3 hover:border-[#23b5d3] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-[#23b5d3] text-white flex items-center justify-center font-mono font-extrabold text-xs">
                    {st.stateCode}
                  </span>
                  <span className="text-xs font-extrabold text-[#0c242c]">{st.stateName}</span>
                </div>
                <span className="text-[10px] font-bold text-[#23b5d3] bg-white px-2 py-1 rounded-md border border-[#c2dee6]">
                  Code: {st.stateCode}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cities Overview Table (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-[#c2dee6] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#23b5d3]" />
              <h2 className="text-base font-extrabold text-[#0c242c]">Registered Cities</h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#23b5d3]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search city, code or state..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#EFF5F7] border border-[#c2dee6] rounded-xl text-[#0c242c] font-semibold focus:outline-none focus:ring-2 focus:ring-[#23b5d3]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#147a90] uppercase bg-[#EFF5F7] border-b border-[#cce0e6] text-[10px] font-extrabold tracking-wider">
                <tr>
                  <th className="px-4 py-3">City Code</th>
                  <th className="px-4 py-3">City Name</th>
                  <th className="px-4 py-3">State Name</th>
                  <th className="px-4 py-3 text-right">State Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cce0e6]/60">
                {filteredCities.map((c, idx) => (
                  <tr key={c.id || idx} className="hover:bg-[#EFF5F7]/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#23b5d3]">
                      <span className="px-2 py-0.5 rounded bg-[#23b5d3]/15 border border-[#23b5d3]/30">
                        {c.cityCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-[#0c242c] flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#23b5d3]" />
                      {c.cityName}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#147a90]">{c.stateName || "Karnataka"}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-[#23b5d3]">
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
