import React from "react";
import { 
  Building2, 
  User, 
  BrainCircuit, 
  MessageSquare, 
  Activity, 
  ShieldCheck, 
  Search
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery 
}: HeaderProps) {
  
  const menuItems = [
    { id: "perfil-clinico", label: "Perfil Clínico", icon: User, desc: "Historial médico soberano" },
    { id: "bitacora-ia", label: "Bitácora IA", icon: BrainCircuit, desc: "Análisis y Copiloto inteligente" },
    { id: "marketplace", label: "Marketplace", icon: Building2, desc: "Directorio de especialistas" },
    { id: "gestion-chat", label: "Chat Médico", icon: MessageSquare, desc: "Canal de teleconsulta encriptado" },
  ];

  return (
    <header id="sephie-top-header" className="w-full bg-[#0E131F] border-b border-[#1F293D] text-gray-300 shrink-0 select-none">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Left Side: Brand Logo and encryption badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Activity className="w-4.5 h-4.5 text-[#0A0D14]" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold tracking-tight text-white text-base leading-none">
                SEPHIEM
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-mono font-semibold uppercase tracking-wide">
                Web3 MD
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-[#52668D] font-mono block mt-0.5">
              Protocolo Clínico Seguro
            </span>
          </div>
        </div>

        {/* Center: The 4 Primary Navigation Buttons */}
        <div className="flex items-center bg-[#090C15] border border-[#1F293D] p-1 rounded-2xl gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`btn-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                title={item.desc}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all text-xs font-medium cursor-pointer relative ${
                  isActive 
                    ? "bg-emerald-500/10 text-white font-semibold ring-1 ring-emerald-500/20" 
                    : "hover:bg-[#141A29] text-gray-400 hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${
                  isActive ? "text-emerald-400" : "text-gray-500"
                }`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: Security Badge & Compact Search Bar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* AES military-grade badge */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#141A29]/60 border border-emerald-500/10 text-[10px] text-emerald-400/95 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Cifrado Sólido AES-256</span>
          </div>

          {/* Quick Search */}
          <div className="relative w-44 lg:w-48">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar doctor..."
              className="w-full bg-[#121824] border border-[#1F293D] rounded-xl pl-8 pr-2.5 py-1.5 text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10 transition-all font-sans"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
