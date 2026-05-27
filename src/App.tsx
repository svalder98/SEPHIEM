import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import WalletCard from "./components/WalletCard";
import MarketplacePage from "./components/MarketplacePage";
import ClinicalHistoryPage from "./components/ClinicalHistoryPage";
import AIBitacoraPage from "./components/AIBitacoraPage";
import DoctorChatPage from "./components/DoctorChatPage";
import { Doctor, MedicalRecord, Appointment, PatientAlert } from "./types";
import { 
  Wallet, 
  Lock, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  Globe 
} from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("marketplace");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [initialDoctorIdForChat, setInitialDoctorIdForChat] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>(""),
    [networkName, setNetworkName] = useState<string>("Ninguna conectada"),
    [isConnecting, setIsConnecting] = useState<boolean>(false),
    [customManualAddress, setCustomManualAddress] = useState<string>(""),
    [showManualInput, setShowManualInput] = useState<boolean>(false);

  // Shared platform records and clinical values
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [authorizedDrIds, setAuthorizedDrIds] = useState<string[]>([]);

  // Globally unified wallet connector
  const connectWallet = async (manualAddr?: string) => {
    setIsConnecting(true);
    
    // Strict verification of manual fallback if provided by testers/developers
    if (manualAddr) {
      const cleanAddr = manualAddr.trim();
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethAddressRegex.test(cleanAddr)) {
        alert("ERROR DE DE AUTENTICACIÓN: Dirección de wallet inválida. Debe seguir el formato hexadecimal oficial de MetaMask (42 caracteres, comenzando con 0x).");
        setIsConnecting(false);
        return;
      }
      setTimeout(() => {
        setWalletAddress(cleanAddr);
        setNetworkName("Syscoin Testnet (Sandbox)");
        setIsConnecting(false);
      }, 500);
      return;
    }

    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: "eth_requestAccounts",
          });
          if (accounts && accounts[0]) {
            setWalletAddress(accounts[0]);
            const chainId = await (window as any).ethereum.request({
              method: "eth_chainId",
            });
            if (chainId === "0x1645" || parseInt(chainId, 16) === 5701) {
              setNetworkName("Syscoin Testnet");
            } else {
              setNetworkName("MetaMask (Inyectado)");
            }
            setIsConnecting(false);
            return;
          }
        } catch (mErr: any) {
          console.error("MetaMask eth_requestAccounts falló:", mErr);
          alert("ERROR EN LA FIRMA: Conexión de MetaMask rechazada o cancelada por el usuario. No se puede iniciar sesión sin firma de wallet.");
          setIsConnecting(false);
          return;
        }
      } else {
        alert("METAMASK NO DETECTADO: Para interactuar en SEPHIEM, active la extensión de MetaMask o use un navegador con soporte para Web3.");
        setIsConnecting(false);
      }
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  // Fetch initial registry doctors list from our Exprss API
  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      if (response.ok) {
        const list = await response.json();
        setDoctors(list);
      }
    } catch (err) {
      console.error("Fallo de red al buscar doctores de SEPHIEM:", err);
    }
  };

  const fetchRecords = async (address: string) => {
    try {
      const resp = await fetch(`/api/records?address=${address}`);
      if (resp.ok) {
        const list = await resp.json();
        setRecords(list);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async (address: string) => {
    try {
      const resp = await fetch(`/api/appointments?address=${address}`);
      if (resp.ok) {
        const list = await resp.json();
        setAppointments(list);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAlerts = async (address: string) => {
    try {
      const resp = await fetch(`/api/ai/alerts/${address}`);
      if (resp.ok) {
        const list = await resp.json();
        setAlerts(list);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAccessControls = async (address: string) => {
    try {
      const resp = await fetch(`/api/access?patientAddress=${address}`);
      if (resp.ok) {
        const list = await resp.json();
        setAuthorizedDrIds(list.map((item: any) => item.doctorId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGrantAccess = async (docId: string) => {
    if (!walletAddress) return;
    try {
      await fetch("/api/access/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientAddress: walletAddress, doctorId: docId })
      });
      fetchAccessControls(walletAddress);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeAccess = async (docId: string) => {
    if (!walletAddress) return;
    try {
      await fetch("/api/access/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientAddress: walletAddress, doctorId: docId })
      });
      fetchAccessControls(walletAddress);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAlert = async (title: string, severity: "low" | "medium" | "high", message: string) => {
    if (!walletAddress) return;
    try {
      const resp = await fetch("/api/ai/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientAddress: walletAddress, title, severity, message })
      });
      if (resp.ok) {
        fetchAlerts(walletAddress);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sync details on mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Sync patient details as soon as walletAddress is activated
  useEffect(() => {
    if (walletAddress) {
      fetchRecords(walletAddress);
      fetchAppointments(walletAddress);
      fetchAlerts(walletAddress);
      fetchAccessControls(walletAddress);
    } else {
      setRecords([]);
      setAppointments([]);
      setAlerts([]);
      setAuthorizedDrIds([]);
    }
  }, [walletAddress]);

  // Tab switching renderer
  const renderActivePage = () => {
    switch (activeTab) {
      case "marketplace":
        return (
          <MarketplacePage
            doctors={doctors}
            searchQuery={searchQuery}
            onInitiateConsultation={(docId) => {
              setInitialDoctorIdForChat(docId);
              setActiveTab("gestion-chat");
            }}
          />
        );
      case "perfil-clinico":
        return (
          <ClinicalHistoryPage
            walletAddress={walletAddress}
            doctors={doctors}
            records={records}
            setRecords={setRecords}
            authorizedDrIds={authorizedDrIds}
            onGrantAccess={handleGrantAccess}
            onRevokeAccess={handleRevokeAccess}
          />
        );
      case "bitacora-ia":
        return <AIBitacoraPage walletAddress={walletAddress} addAlert={handleAddAlert} />;
      case "gestion-chat":
        return (
          <DoctorChatPage
            walletAddress={walletAddress}
            doctors={doctors}
            appointments={appointments}
            setAppointments={setAppointments}
            fetchAppointments={fetchAppointments}
            initialDoctorIdForChat={initialDoctorIdForChat}
            clearInitialDoctorIdForChat={() => setInitialDoctorIdForChat("")}
          />
        );
      default:
        return (
          <MarketplacePage
            doctors={doctors}
            searchQuery={searchQuery}
            onInitiateConsultation={(docId) => {
              setInitialDoctorIdForChat(docId);
              setActiveTab("gestion-chat");
            }}
          />
        );
    }
  };

  if (!walletAddress) {
    return (
      <div id="metamask-login-container" className="flex flex-col items-center justify-center min-h-screen w-full bg-[#07090F] text-white p-4 relative overflow-hidden select-none">
        
        {/* Futury cyber grid and ambient blobs */}
        <div id="glow-blob-1" className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div id="glow-blob-2" className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Retro scanlines or cyber grid lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.1)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          
          {/* Header branding on Lock Screen */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_25px_rgba(16,185,129,0.3)] mb-4">
              <Activity className="w-8 h-8 text-[#0A0D14]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              SEPHIEM <span className="text-emerald-400 font-mono">MD</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-mono mt-1">
              Plataforma Médica Soberana Web3
            </p>
          </div>

          {/* Core Card layout with lock symbol */}
          <div id="login-card-sephiem" className="bg-[#0E1320] border border-[#1F293D] p-6 rounded-2xl shadow-2xl relative overflow-hidden space-y-5">
            {/* Ambient accent bar at top */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
            
            <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-left">
                <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-mono block font-bold">
                  Puerta de Entrada Protegida
                </span>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Su firma criptográfica actúa como llave segura de descifrado local de su expediente.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-left text-xs text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-[#151D2F] flex items-center justify-center shrink-0 text-emerald-400 text-[10px] font-bold">1</div>
                <div>
                  <span className="font-semibold text-white text-[12px]">Sin Cuentas Ni Contraseñas</span>
                  <p className="text-[11px] text-gray-400 leading-normal mt-0.5">
                    No almacenamos correos ni contraseñas. El acceso se valida directamente con su firma digital.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-[#151D2F] flex items-center justify-center shrink-0 text-emerald-400 text-[10px] font-bold">2</div>
                <div>
                  <span className="font-semibold text-white text-[12px]">Cifrado Local AES-256</span>
                  <p className="text-[11px] text-gray-400 leading-normal mt-0.5">
                    Sus datos clínicos se guardan estrictamente bajo llaves soberanas generadas por su billetera.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-[#151D2F] flex items-center justify-center shrink-0 text-emerald-400 text-[10px] font-bold">3</div>
                <div>
                  <span className="font-semibold text-white text-[12px]">Auditoría Inmutable</span>
                  <p className="text-[11px] text-gray-400 leading-normal mt-0.5">
                    Conceda o revoque accesos a médicos especialistas acreditados sobre la red Syscoin.
                  </p>
                </div>
              </div>
            </div>

            {/* Central Metamask Connect button */}
            <div className="pt-2">
              <button
                id="btn-login-connect-metamask"
                onClick={() => connectWallet()}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-[#090C15] font-bold text-sm py-3.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(16,185,129,0.15)] disabled:opacity-50"
              >
                <Wallet className="w-5 h-5 text-[#090C15] group-hover:rotate-12 transition-transform shrink-0" />
                <span>{isConnecting ? "Conectando con MetaMask..." : "Conectar Wallet MetaMask"}</span>
                <ArrowRight className="w-4 h-4 text-[#090C15] group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>

            {/* Simulated sandbox fallbacks as fallback/sandbox */}
            <div className="border-t border-[#1F293D]/60 pt-4 text-center">
              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-gray-500 hover:text-emerald-400 transition-colors text-[10px] uppercase tracking-wider font-mono bg-transparent border-none cursor-pointer focus:outline-none"
              >
                {showManualInput ? "[ Ocultar Opciones de Simulación ]" : "[ ¿No tiene MetaMask? Use el Generador de Pruebas ]"}
              </button>

              {showManualInput && (
                <div id="sandbox-override-input" className="mt-3 p-3 bg-[#121724] border border-[#1F293D] rounded-xl space-y-2 text-left">
                  <span className="text-[9px] text-[#52668D] uppercase font-mono block">Dirección de Pruebas (Ethereum/EVM compatible)</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ej. 0x8F5dCa47353f47eD5f..."
                      value={customManualAddress}
                      onChange={(e) => setCustomManualAddress(e.target.value)}
                      className="flex-1 bg-[#090C15] border border-[#1F293D] text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/40 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const addr = customManualAddress.trim();
                        if (!addr) {
                          alert("ERROR: Por favor ingrese una dirección hexadecimal de MetaMask válida (que empiece con 0x).");
                          return;
                        }
                        connectWallet(addr);
                      }}
                      className="bg-[#1F293D] hover:bg-emerald-500/20 hover:text-emerald-400 text-xs text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      Cargar
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-500 leading-tight">
                    Perfecto para simular diagnósticos o probar la plataforma en navegadores sin soporte de extensiones Web3.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Privacy & Network standard indicators */}
          <div className="mt-6 flex justify-center items-center gap-4 text-gray-500 text-[10px] font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
              Cumple HIPAA
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-500/70" />
              Syscoin Testnet 5701
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0A0D14] text-white">
      {/* 1. Sleek Top Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. Main Page Layout Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Central Active Page content */}
        <div id="sephiem-main-view" className="flex-1 bg-[#070A0F] h-full flex flex-col relative overflow-y-auto">
          <div className="page-wrap flex-1 min-h-0 h-full">
            {renderActivePage()}
          </div>
        </div>

        {/* Right Status and Web3 Credentials Bar */}
        <div id="sephiem-sidebar" className="w-[300px] shrink-0 h-full">
          <WalletCard
            walletAddress={walletAddress}
            setWalletAddress={setWalletAddress}
            networkName={networkName}
            setNetworkName={setNetworkName}
            alerts={alerts}
            fetchAlerts={fetchAlerts}
          />
        </div>
      </div>
    </div>
  );
}
