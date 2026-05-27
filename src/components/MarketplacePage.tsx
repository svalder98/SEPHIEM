import React, { useState } from "react";
import { Doctor } from "../types";
import { Star, ShieldAlert, BadgeCheck, MapPin, DollarSign, ArrowRight, Video, FileText, MessageSquare } from "lucide-react";

interface MarketplacePageProps {
  doctors: Doctor[];
  searchQuery: string;
  onInitiateConsultation?: (docId: string) => void;
}

export default function MarketplacePage({ doctors, searchQuery, onInitiateConsultation }: MarketplacePageProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("doc1");

  // Coordinate mappings on the SVG map to correspond to doctor positions
  const pinCoordinates: Record<string, { x: number; y: number; travelTime: string }> = {
    doc1: { x: 120, y: 150, travelTime: "10 min de distancia" },
    doc2: { x: 280, y: 190, travelTime: "22 min de distancia" },
    doc3: { x: 340, y: 80, travelTime: "Clínica remota - Teleconsulta instantánea" },
    doc4: { x: 190, y: 220, travelTime: "15 min de distancia" },
    doc5: { x: 80, y: 90, travelTime: "8 min de distancia" },
    doc6: { x: 410, y: 270, travelTime: "Consultorio Remoto virtual" },
    doc7: { x: 230, y: 120, travelTime: "18 min de distancia" },
    doc8: { x: 310, y: 240, travelTime: "25 min de distancia" },
    doc9: { x: 150, y: 60, travelTime: "12 min de distancia" },
    doc10: { x: 380, y: 160, travelTime: "Teleconsulta recomendada" }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const lowQuery = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(lowQuery) ||
      doc.specialty.toLowerCase().includes(lowQuery) ||
      doc.location.toLowerCase().includes(lowQuery)
    );
  });

  const activeDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0] || null;
  const activePin = activeDoctor ? (pinCoordinates[activeDoctor.id] || { x: 200, y: 200, travelTime: "15 min" }) : { x: 200, y: 200, travelTime: "Cargando..." };

  return (
    <div className="flex h-full text-white font-sans overflow-hidden bg-[#0A0D14]">
      {/* 280px scrolling panel of Doctor Cards */}
      <div className="w-[300px] shrink-0 border-r border-[#1F293D] flex flex-col h-full bg-[#0C101B]">
        <div className="p-3.5 border-b border-[#1F293D] bg-[#0E1424]/40">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Directorios Médicos Web3
          </h2>
          <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase block">
            {filteredDoctors.length} Especialistas Registrados
          </span>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              Sin médicos que coincidan con la búsqueda.
            </div>
          ) : (
            filteredDoctors.map((doc) => {
              const matchesSelected = doc.id === selectedDoctorId;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all text-xs flex flex-col gap-2 ${
                    matchesSelected 
                      ? "bg-gradient-to-r from-[#121E36] to-[#16274D] border-emerald-500/40 shadow-md"
                      : "bg-[#101524] hover:bg-[#151D30] border-[#1F293D] hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="relative">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover border border-[#1F293D]"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0A0D14] ${
                        doc.online ? "bg-emerald-400" : "bg-gray-500"
                      }`} />
                    </div>

                    <div className="flex-1 min-width-0 leading-snug">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-100 block truncate">
                          {doc.name}
                        </span>
                        {doc.nftBadge && (
                          <div className="w-3.5 h-3.5 bg-emerald-500/10 border border-emerald-400/40 rounded flex items-center justify-center shrink-0" title="Especialista Verificado Blockchain (NFT Badge)">
                            <BadgeCheck className="w-2.5 h-2.5 text-emerald-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 block truncate">
                        {doc.specialty}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#1F293D]/70 pt-2 text-[10px] font-mono text-gray-400">
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 shrink-0" /> {doc.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-300">
                      {doc.fee}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: Map + Details container */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* Statistics & Overview ribbon */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#0F1424] p-3 rounded-xl border border-[#1F293D] text-center">
            <span className="text-[10px] text-gray-500 uppercase block font-mono">Contratos Activos</span>
            <span className="text-lg font-bold text-white font-mono">SEPHIEM Control</span>
          </div>
          <div className="bg-[#0F1424] p-3 rounded-xl border border-[#1F293D] text-center">
            <span className="text-[10px] text-gray-500 uppercase block font-mono">Gas Fee Estimado</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">~0.0001 ETH</span>
          </div>
          <div className="bg-[#0F1424] p-3 rounded-xl border border-[#1F293D] text-center">
            <span className="text-[10px] text-gray-500 uppercase block font-mono">Consultas IoT</span>
            <span className="text-lg font-bold text-cyan-400 font-mono">99.9% Online</span>
          </div>
        </div>

        {/* Real Dynamic Interactive Map */}
        <div className="relative border border-[#1F293D] rounded-xl bg-[#090C12] h-[280px] p-2 flex flex-col overflow-hidden mb-4 shadow-inner">
          <div className="absolute top-3 left-3 bg-[#0B101E]/90 px-2.5 py-1.5 rounded-lg border border-[#1F293D] backdrop-blur text-[10px] font-sans flex items-center gap-1.5 z-10">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-300">Mapa de Pin Médico (Syscoin Nodes)</span>
          </div>

          {/* SVG Map design */}
          <div className="flex-1 w-full h-full relative">
            <svg className="w-full h-full opacity-40 z-0 bg-radial-to-br from-[#121B2F] via-transparent to-[#0A0D15]">
              {/* grid lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1F293D" strokeWidth="0.5" />
                </pattern>
                <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Simulated city contours */}
              <circle cx="200" cy="180" r="120" fill="url(#mapGlow)" />
              <circle cx="350" cy="120" r="100" fill="url(#mapGlow)" />
              
              <path d="M50 150 C 150 100, 300 300, 450 150" fill="none" stroke="#22304d" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M100 80 C 200 240, 310 120, 480 220" fill="none" stroke="#22304d" strokeWidth="4" />
            </svg>

            {/* Render Map pins */}
            {filteredDoctors.map((doc) => {
              const pin = pinCoordinates[doc.id] || { x: 150, y: 150 };
              const isSelected = doc.id === selectedDoctorId;
              return (
                <div
                  key={doc.id}
                  style={{ left: `${pin.x}px`, top: `${pin.y}px` }}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                >
                  <div className="relative flex items-center justify-center">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${
                      isSelected ? "bg-emerald-400" : "bg-cyan-500/30"
                    }`} style={{ width: isSelected ? "24px" : "14px", height: isSelected ? "24px" : "14px" }} />
                    <div className={`p-1 rounded-full border shadow transition-transform ${
                      isSelected 
                        ? "bg-emerald-500 text-[#0A0D14] border-white scale-125 z-20" 
                        : "bg-[#111A2E] text-cyan-400 border-cyan-500/50 group-hover:bg-[#1C2C4E]"
                    }`}>
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    {/* Tooltip on Hover */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#0C1220] border border-[#1F293D] text-[9px] text-white px-2 py-1 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {doc.name} ({doc.specialty})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Travel Time Bar */}
          <div className="absolute bottom-3 left-3 right-3 bg-[#0B101E]/95 border border-[#1F293D]/90 rounded-xl px-3 py-2 flex items-center justify-between text-xs backdrop-blur font-sans">
            <span className="text-gray-400">Trayecto estimado al consultorio sugerido:</span>
            <span className="font-semibold text-emerald-400 font-mono text-xs">{activePin.travelTime}</span>
          </div>
        </div>

        {/* Detailed Info Card for Active Selected Doctor */}
        {activeDoctor ? (
          <div className="bg-gradient-to-b from-[#111624] to-[#0D101C] border border-[#1F293D] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-4">
              <img
                src={activeDoctor.avatarUrl}
                alt={activeDoctor.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover border border-[#1F293D]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-bold text-base text-white">{activeDoctor.name}</h3>
                  {activeDoctor.nftBadge && (
                    <span className="bg-emerald-500/10 border border-emerald-400/40 text-[10px] text-emerald-400 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 font-semibold">
                      NFT Badge Verificado
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{activeDoctor.specialty}</p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 font-mono">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" /> {activeDoctor.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1 shrink-0 border-t md:border-t-0 md:border-l border-[#1F293D] pt-3 md:pt-0 md:pl-4">
              <span className="text-[10px] text-gray-500 font-mono uppercase">Costo Consulta</span>
              <span className="text-lg font-bold text-[#10B981] font-mono">{activeDoctor.fee}</span>
              <span className="text-[10px] text-cyan-400/80 mt-1 font-mono">
                ★ {activeDoctor.rating} • {activeDoctor.txCount} transacciones
              </span>
              {onInitiateConsultation && (
                <button
                  id="btn-initiate-consultation"
                  type="button"
                  onClick={() => onInitiateConsultation(activeDoctor.id)}
                  className="mt-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.25)] flex items-center justify-center gap-2 self-stretch"
                  title="Conectar con especialista y agregar a Chat Médico"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Iniciar Consulta</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-b from-[#111624] to-[#0D101C] border border-[#1F293D] rounded-xl p-6 flex items-center justify-center text-gray-500 text-xs font-mono">
            Cargando expedientes y perfiles médicos de SEPHIEM...
          </div>
        )}
      </div>
    </div>
  );
}
