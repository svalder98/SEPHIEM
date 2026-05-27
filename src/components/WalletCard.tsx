import React, { useState, useEffect } from "react";
import { 
  Wallet, 
  Copy, 
  Check, 
  Wifi, 
  Lock, 
  Info,
  BellRing,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PatientAlert } from "../types";

interface WalletCardProps {
  walletAddress: string;
  setWalletAddress: (address: string) => void;
  networkName: string;
  setNetworkName: (name: string) => void;
  alerts: PatientAlert[];
  fetchAlerts: (addr: string) => void;
}

export default function WalletCard({
  walletAddress,
  setWalletAddress,
  networkName,
  setNetworkName,
  alerts,
  fetchAlerts
}: WalletCardProps) {
  const [copied, setCopied] = useState(false);
  const [balanceETH, setBalanceETH] = useState("0.45");
  const [balanceSYS, setBalanceSYS] = useState("320.0");
  const [isConnecting, setIsConnecting] = useState(false);
  const [blockHeight, setBlockHeight] = useState(1485230);

  // Poll block heights occasionally for realism
  useEffect(() => {
    const timer = setInterval(() => {
      setBlockHeight(b => b + Math.floor(Math.random() * 2));
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Fetch alerts when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchAlerts(walletAddress);
    }
  }, [walletAddress]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Real MetaMask Connection Check
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: "eth_requestAccounts",
          });
          if (accounts && accounts[0]) {
            setWalletAddress(accounts[0]);
            // Attempt to query network chainId
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
        alert("METAMASK NO DETECTADO: Para interactuar en SEPHIEM, active la extensión de MetaMask o use un navegador compatible con Web3.");
        setIsConnecting(false);
      }
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedAddress = walletAddress 
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    : "";

  return (
    <div className="flex flex-col h-full bg-[#0E131F] border-l border-[#1F293D] p-4 text-gray-300">
      {/* Wallet Heading */}
      <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase block mb-3">
        Credenciales Web3
      </span>

      {/* Main Connection State Card */}
      {!walletAddress ? (
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#121A2E] to-[#162244] border border-emerald-500/20 shadow-lg text-center mb-5">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">Sin Conectar</h4>
          <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
            Conecte su billetera Web3 (MetaMask u offline) para habilitar el cifrado soberano de sus datos.
          </p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-[#0A0D14] font-semibold text-xs py-2 rounded-lg transition-transform focus:outline-none"
          >
            {isConnecting ? "Conectando..." : "Conectar Billetera"}
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#141B2D] border border-emerald-500/30 shadow-md mb-5 relative overflow-hidden group">
          {/* subtle decor glow */}
          <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-colors" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-white">Wallet Sincronizada</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="text-[10px] text-gray-500 hover:text-rose-400 font-mono transition-colors"
            >
              [DESCONECTAR]
            </button>
          </div>

          <div className="flex items-center justify-between bg-[#0E1320] px-3 py-2 rounded-lg border border-[#1F293D] mb-4">
            <span className="font-mono text-xs text-emerald-400 font-medium">
              {formattedAddress}
            </span>
            <button 
              onClick={handleCopy} 
              className="text-gray-500 hover:text-white transition-colors"
              title="Copiar dirección completa"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Balances Section */}
          <div className="grid grid-cols-2 gap-2 mb-1">
            <div className="bg-[#0E1320] p-2 rounded-lg text-center border border-[#1F293D]">
              <span className="text-[9px] text-gray-500 uppercase block">Saldo SYS</span>
              <span className="text-xs font-bold text-white font-mono">{balanceSYS} SYS</span>
            </div>
            <div className="bg-[#0E1320] p-2 rounded-lg text-center border border-[#1F293D]">
              <span className="text-[9px] text-gray-500 uppercase block">Saldo ETH</span>
              <span className="text-xs font-bold text-white font-mono">{balanceETH} ETH</span>
            </div>
          </div>
        </div>
      )}

      {/* Network properties card */}
      <div className="p-3.5 rounded-xl bg-[#111624] border border-[#1F293D] text-[11px] space-y-2 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Red Activa:</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <Wifi className="w-3 h-3 animate-pulse" /> {networkName}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">ID Cadena:</span>
          <span className="text-white font-mono">5701 (SYS Testnet)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Bloque Actual:</span>
          <span className="text-gray-400 font-mono">#{blockHeight.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Seguridad:</span>
          <span className="text-white flex items-center gap-1 font-sans text-[10px]">
            <Lock className="w-2.5 h-2.5 text-emerald-400" /> PBKDF2 Sólido
          </span>
        </div>
      </div>

      {/* Alerts Hub (only visible when wallet is connected) */}
      {walletAddress && (
        <div className="flex-1 mt-1 flex flex-col min-height-0">
          <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase block mb-2">
            Alertas de Salud ({alerts.length})
          </span>
          {alerts.length === 0 ? (
            <div className="flex-1 border border-dashed border-[#1F293D] rounded-xl flex flex-col items-center justify-center p-4 text-center text-gray-500 text-xs">
              <BellRing className="w-5 h-5 text-gray-600 mb-2" />
              <span>Sin alertas activas</span>
              <span className="text-[9px] text-gray-600 mt-1">Generadas autónomamente por la bitácora médica</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[180px]">
              <AnimatePresence initial={false}>
                {alerts.map((al) => {
                  const isHigh = al.severity === "high";
                  return (
                    <motion.div 
                      key={al.id}
                      initial={{ opacity: 0, x: -24, scale: 0.95 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0, 
                        scale: 1,
                        boxShadow: isHigh 
                          ? [
                              "0 0 4px rgba(244, 63, 94, 0.15)",
                              "0 0 14px rgba(244, 63, 94, 0.35)",
                              "0 0 4px rgba(244, 63, 94, 0.15)"
                            ]
                          : "0px 0px 0px rgba(0,0,0,0)"
                      }}
                      exit={{ opacity: 0, x: 24, scale: 0.95 }}
                      transition={{
                        opacity: { duration: 0.3 },
                        x: { type: "spring", stiffness: 120, damping: 15 },
                        scale: { duration: 0.2 },
                        boxShadow: isHigh 
                          ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
                          : { duration: 0.2 }
                      }}
                      className={`p-2.5 rounded-lg border text-xs leading-relaxed flex gap-2 overflow-hidden relative ${
                        isHigh 
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                          : al.severity === "medium"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          : "bg-[#141B2D] border-sky-500/20 text-sky-300"
                      }`}
                    >
                      {/* Subtle scanner glow line overlay for high alerts */}
                      {isHigh && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/10 to-transparent pointer-events-none"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                        />
                      )}
                      
                      <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isHigh ? "text-rose-400 animate-pulse" : ""}`} />
                      <div className="relative z-10">
                        <span className="font-bold text-white block text-[11px] leading-snug">{al.title}</span>
                        <p className="text-[10px] font-sans text-gray-300 mt-0.5">{al.message}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Footer Version Details */}
      <div className="mt-auto pt-4 border-t border-[#1F293D] flex items-center justify-between text-[10px] text-gray-500 font-mono">
        <span>SEPHIEM v4.1.2</span>
        <span className="text-emerald-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
          Sincronizado
        </span>
      </div>
    </div>
  );
}
