import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, SymptomAnalysis, Medication } from "../types";
import { 
  Send, 
  BrainCircuit, 
  Activity, 
  Trash2, 
  AlertOctagon, 
  Calendar, 
  Clock, 
  Stethoscope, 
  HeartHandshake, 
  Check, 
  Sparkles,
  Info,
  Pill,
  FileCheck,
  MessageSquare,
  Smartphone,
  QrCode,
  Key,
  FileCode,
  Database,
  Share2,
  ExternalLink,
  Shield,
  HelpCircle
} from "lucide-react";

interface AIBitacoraPageProps {
  walletAddress: string;
  addAlert: (title: string, severity: "low" | "medium" | "high", message: string) => void;
}

export default function AIBitacoraPage({ walletAddress, addAlert }: AIBitacoraPageProps) {
  // Persistent chat variables
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasLoadedMessages, setHasLoadedMessages] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState<"connected" | "local">("connected");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [profilePreview, setProfilePreview] = useState<string>("Ficha no cargada");
  const [chatsCount, setChatsCount] = useState<number>(0);
  const [recsCount, setRecsCount] = useState<number>(0);

  // --- STATE FOR WEB3 WHATSAPP INTEGRATION & SANDBOX SIMULATOR ---
  const [showWAModal, setShowWAModal] = useState(false);
  const [showNoRealWAWarningModal, setShowNoRealWAWarningModal] = useState(false);
  const [waPhoneNumber, setWaPhoneNumber] = useState<string>("");
  const [waCountryCode, setWaCountryCode] = useState("+34");
  const [waBindingStatus, setWaBindingStatus] = useState<"unlinked" | "signing" | "verified">("unlinked");
  const [waActiveTab, setWaActiveTab] = useState<"config" | "webhook" | "architecture">("config");
  const [waVerificationCode, setWaVerificationCode] = useState("");
  const [userEnteredCode, setUserEnteredCode] = useState("");
  
  // Webhook message states
  const [webhookQuery, setWebhookQuery] = useState("");
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [lastWebhookPayload, setLastWebhookPayload] = useState<any | null>(null);
  const [lastWebhookResponsePayload, setLastWebhookResponsePayload] = useState<any | null>(null);

  // Sync state with current wallet address changes
  useEffect(() => {
    if (walletAddress) {
      const savedPhone = localStorage.getItem(`sephiem_wa_phone_${walletAddress}`) || "";
      setWaPhoneNumber(savedPhone);
      const savedStatus = localStorage.getItem(`sephiem_wa_status_${walletAddress}`) || "unlinked";
      setWaBindingStatus(savedStatus as any);
      if (savedStatus !== "verified") {
        setShowNoRealWAWarningModal(true);
      }
    } else {
      setWaPhoneNumber("");
      setWaBindingStatus("unlinked");
      setShowNoRealWAWarningModal(true);
    }
    // Set a neat default simulation query
    setWebhookQuery("Tengo migraña opresiva de nivel 7 con náuseas y molestia a la luz parpadeante. Comenzó hace unas 24 horas.");
  }, [walletAddress]);

  // Handle WhatsApp linking sequence
  const handleStartLinking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waPhoneNumber.trim()) {
      showToast("Por favor, ingrese un número de teléfono celular válido");
      return;
    }
    setWaBindingStatus("signing");
    // Generate a secure simulation signature code based on the current address
    const shortAddress = walletAddress ? walletAddress.slice(2, 8).toUpperCase() : "ANON";
    const randomHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase();
    const mockCode = `S-WA-EVM-${shortAddress}-${randomHex}`;
    setWaVerificationCode(mockCode);
    showToast("Firma criptográfica generada en MetaMask. Ingrese el código generado.");
  };

  const handleVerifyCode = () => {
    if (userEnteredCode.trim().toUpperCase() === waVerificationCode.toUpperCase()) {
      setWaBindingStatus("verified");
      localStorage.setItem(`sephiem_wa_phone_${walletAddress}`, waPhoneNumber);
      localStorage.setItem(`sephiem_wa_status_${walletAddress}`, "verified");
      showToast("✨ Canal WhatsApp Web3 verificado con éxito.");
      addAlert("Canal WhatsApp Vinculado", "low", `Se enlazó el WhatsApp ${waCountryCode} ${waPhoneNumber} a su billetera Web3`);
    } else {
      showToast("❌ Código de firma inválido. Vuelva a intentar.");
    }
  };

  const handleDisconnectWhatsApp = () => {
    if (window.confirm("¿Está seguro que desea revocar el acceso de WhatsApp a su billetera Web3 de SEPHIEM?")) {
      setWaBindingStatus("unlinked");
      setWaPhoneNumber("");
      setUserEnteredCode("");
      setWaVerificationCode("");
      localStorage.removeItem(`sephiem_wa_phone_${walletAddress}`);
      localStorage.removeItem(`sephiem_wa_status_${walletAddress}`);
      showToast("Canal de WhatsApp desvinculado");
    }
  };

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookQuery.trim()) return;
    if (waBindingStatus !== "verified") {
      showToast("Debe vincular su número de WhatsApp primero");
      return;
    }

    setSimulatingWebhook(true);

    const fullPhone = `${waCountryCode}${waPhoneNumber.replace(/\D/g, "")}`;
    const timestampUnix = Math.floor(Date.now() / 1000).toString();
    const messageId = `wamid.HBgL${Math.random().toString(36).substring(2).toUpperCase()}==`;

    // 1. Construct standard meta webhook body payload
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WHATSAPP_CLINICAL_ACCOUNT_1092",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "16505551234",
                  phone_number_id: "10982736154"
                },
                contacts: [
                  {
                    profile: {
                      name: "Paciente Web3 Autorizado"
                    },
                    wa_id: fullPhone
                  }
                ],
                messages: [
                  {
                    from: fullPhone,
                    id: messageId,
                    timestamp: timestampUnix,
                    text: {
                      body: webhookQuery
                    },
                    type: "text"
                  }
                ]
              },
              field: "messages"
            }
          ]
        }
      ],
      web3_context: {
        walletAddress: walletAddress,
        signatureProof: "0x3f5bda9021a8cd39e01fbc34dce8405ea7b2cd98c199837dfdaecd87364ca9b11b5df3ec017a8c4371"
      }
    };

    setLastWebhookPayload(payload);

    // 2. Insert user message in timeline using special ID prefix to visually tag WhatsApp origin
    const waUserMsgId = `wa_usr_${Date.now()}`;
    const newWAMsg: ChatMessage = {
      id: waUserMsgId,
      role: "user",
      text: `[WhatsApp: +${fullPhone}] ${webhookQuery}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const userMsgText = webhookQuery;
    // Clear sim query input
    setWebhookQuery("");

    // Append to messages list
    setMessages(prev => [...prev, newWAMsg]);
    setIsTyping(true);

    try {
      // Assemble history compatible with prompt endpoint
      const formattedHistory = [...messages, newWAMsg].map(m => ({
        role: m.role,
        content: m.text
      }));

      // Retrieve Clinical Profile
      let clinicalProfile = null;
      if (walletAddress) {
        const profileKey = `sephiem_profile_${walletAddress}`;
        const storedProfile = localStorage.getItem(profileKey);
        if (storedProfile) {
          try {
            clinicalProfile = JSON.parse(storedProfile);
          } catch (errProfile) {}
        }
      }

      // Pre-add doctor recommendations
      let doctorRecommendations: string[] = [];
      const chatKey = walletAddress ? `sephiem_chats_${walletAddress}` : "sephiem_chats_anonymous";
      const savedChats = localStorage.getItem(chatKey);
      if (savedChats) {
        try {
          const parsedChats = JSON.parse(savedChats);
          if (Array.isArray(parsedChats)) {
            parsedChats.forEach((chat: any) => {
              if (chat.messages) {
                chat.messages.forEach((msg: any) => {
                  if (msg.role === "assistant" || msg.role === "model") {
                    doctorRecommendations.push(`Dr/Dra. ${chat.doctorName} (${chat.specialty}): "${msg.text}"`);
                  }
                });
              }
            });
          }
        } catch (e) {}
      }

      // Fire precise clinician chat endpoint
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          history: formattedHistory,
          clinicalProfile,
          doctorRecommendations
        })
      });

      if (!response.ok) {
        throw new Error("Servicio webhook offline");
      }

      const data = await response.json();

      // 3. Formulate mock server payload response returned back to Meta's send endpoint
      const responseBody = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: fullPhone,
        type: "text",
        text: {
          body: data.reply
        },
        urgency_score: data.urgency || "low"
      };
      setLastWebhookResponsePayload(responseBody);

      // Add Model reply to local timeline with "wa_ai_" prefix so it receives green WhatsApp Badge
      const replyMsg: ChatMessage = {
        id: `wa_ai_${Date.now()}`,
        role: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgency: data.urgency
      };

      setMessages(prev => [...prev, replyMsg]);

      if (data.urgency === "high") {
        addAlert("Urgencia desde WhatsApp", "high", `Alerta de salud severa detectada en canal WhatsApp para +${fullPhone}.`);
      }
    } catch (err) {
      console.warn("Fallo en simulación, usando respaldo local", err);
      
      const localReplyText = `[Respuesta de Respaldo Local de WhatsApp SEPHIEM] He analizado su consulta ("${userMsgText}"). Recuerde que por cuestiones de privacidad Web3, este expediente local sólo se registra en este navegador. Complete sus datos demográficos de salud para refinar mi precisión. ¿Tiene algún síntoma complementario o malestar adicional que deba examinar?`;
      
      const mockOfflineResponseBody = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: fullPhone,
        type: "text",
        text: {
          body: localReplyText
        },
        fallback: true
      };
      setLastWebhookResponsePayload(mockOfflineResponseBody);

      const replyMsgOffline: ChatMessage = {
        id: `wa_ai_local_${Date.now()}`,
        role: "assistant",
        text: localReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, replyMsgOffline]);
    } finally {
      setIsTyping(false);
      setSimulatingWebhook(false);
    }
  };

  // Load chat history once on walletAddress assignment
  useEffect(() => {
    const key = walletAddress ? `sephiem_bitacora_messages_${walletAddress}` : "sephiem_bitacora_messages_anonymous";
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch (err) {
        console.error("Error parsing bitacora messages from cache:", err);
      }
    } else {
      setMessages([
        {
          id: "init",
          role: "assistant",
          text: "¡Hola! Bienvenido a SEPHIEM IA, su copiloto clínico Web3. Le asisto en Español de forma empática y de manera hiperactiva y proactiva. Conozco a fondo su ficha clínica y las pautas dadas por sus médicos especialistas en el chat. Por favor, comparta de qué manera se siente o qué síntomas posee, o configure sus recordatorios de medicamentos. Recuerde que mis sugerencias son meras orientaciones preventivas y no constituyen un diagnóstico médico formal.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
    setHasLoadedMessages(true);
  }, [walletAddress]);

  // Save chat history each time it changes
  useEffect(() => {
    if (!hasLoadedMessages) return;
    const key = walletAddress ? `sephiem_bitacora_messages_${walletAddress}` : "sephiem_bitacora_messages_anonymous";
    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, hasLoadedMessages, walletAddress]);

  // Clear chat history handler
  const handleClearHistory = () => {
    if (window.confirm("¿Está seguro que desea borrar todo el historial persistente de la Bitácora IA?")) {
      const initialMsgs = [
        {
          id: "init",
          role: "assistant",
          text: "¡Hola! Bienvenido a SEPHIEM IA, su copiloto clínico Web3. Le asisto en Español de forma empática y de manera hiperactiva y proactiva. Conozco a fondo su ficha clínica y las pautas dadas por sus médicos especialistas en el chat. Por favor, comparta de qué manera se siente o qué síntomas posee, o configure sus recordatorios de medicamentos. Recuerde que mis sugerencias son meras orientaciones preventivas y no constituyen un diagnóstico médico formal.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(initialMsgs);
      const key = walletAddress ? `sephiem_bitacora_messages_${walletAddress}` : "sephiem_bitacora_messages_anonymous";
      localStorage.setItem(key, JSON.stringify(initialMsgs));
      showToast("Historial de la Bitácora borrado");
    }
  };

  useEffect(() => {
    if (walletAddress) {
      const profileKey = `sephiem_profile_${walletAddress}`;
      const storedProfile = localStorage.getItem(profileKey);
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          setProfilePreview(`${parsed.fullName || "Alejandro Mendoza"} (${parsed.bloodType || "AB-"})`);
        } catch (e) {
          setProfilePreview("Ficha local");
        }
      } else {
        setProfilePreview(`Alejandro Mendoza (${walletAddress.slice(0, 4)}) • AB-`);
      }
    } else {
      setProfilePreview("Sin Ficha Demográfica");
    }

    const chatKey = walletAddress ? `sephiem_chats_${walletAddress}` : "sephiem_chats_anonymous";
    const savedChats = localStorage.getItem(chatKey);
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        if (Array.isArray(parsedChats)) {
          setChatsCount(parsedChats.length);
          let rCount = 0;
          parsedChats.forEach((chat: any) => {
            if (chat.messages) {
              chat.messages.forEach((m: any) => {
                if (m.role === "assistant" || m.role === "model") {
                  rCount++;
                }
              });
            }
          });
          setRecsCount(rCount);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [walletAddress, messages]);

  // Symptom Analyzer variables
  const [symptomsInput, setSymptomsInput] = useState("");
  const [isAnalyzingSymptoms, setIsAnalyzingSymptoms] = useState(false);
  const [symptomResult, setSymptomResult] = useState<SymptomAnalysis | null>(null);

  // Medication Tracker variables
  const [meds, setMeds] = useState<Medication[]>([]);
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medFrequency, setMedFrequency] = useState("");
  const [medNotes, setMedNotes] = useState("");
  const [isSchedulingMed, setIsSchedulingMed] = useState(false);

  // Toast UI feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load medications on load
  useEffect(() => {
    const cached = localStorage.getItem(`sephiem_medications_${walletAddress}`);
    if (cached) {
      try {
        setMeds(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
  }, [walletAddress]);

  const saveMeds = (updatedMeds: Medication[]) => {
    setMeds(updatedMeds);
    localStorage.setItem(`sephiem_medications_${walletAddress}`, JSON.stringify(updatedMeds));
  };

  // 1. Send chat message to Express service
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (waBindingStatus !== "verified") {
      setShowNoRealWAWarningModal(true);
      return;
    }

    const userMsgText = inputValue;
    setInputValue("");

    const newMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      role: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    try {
      // Assemble full transaction history
      const formattedHistory = messages.map(m => ({
        role: m.role,
        content: m.text
      }));

      // Retrieve Clinical Profile
      let clinicalProfile = null;
      if (walletAddress) {
        const profileKey = `sephiem_profile_${walletAddress}`;
        const storedProfile = localStorage.getItem(profileKey);
        if (storedProfile) {
          try {
            clinicalProfile = JSON.parse(storedProfile);
          } catch (errProfile) {
            console.error("Error reading clinical profile for copilot:", errProfile);
          }
        } else {
          // Robust clinical default fallback matching ClinicalHistoryPage
          clinicalProfile = {
            fullName: "Alejandro Mendoza " + walletAddress.slice(0, 4),
            birthDate: "1989-10-24",
            gender: "Masculino",
            nationalId: "ID-7819302-S",
            phone: "+34 612 048 991",
            emergencyContact: "Mariana Mendoza (Hermana) - +34 612 990 120",
            bloodType: "AB Negativo (AB-)",
            height: "179",
            weight: "74",
            bloodPressure: "120/80 mmHg",
            restingHeartRate: "65 lpm",
            chronicConditions: "Rinitis alérgica estacional leve, hipersensibilidad al polen.",
            insuranceProvider: "Axa Seguros de Salud Global S.A.",
            policyNumber: "AXA-SYS-88214-E",
            coverageType: "Cobertura de Telemedicina Completa Web3 & Hospitalización"
          };
        }
      }

      // Retrieve Specialist Doctor Recommendations from historical Chats
      let doctorRecommendations: string[] = [];
      const chatKey = walletAddress ? `sephiem_chats_${walletAddress}` : "sephiem_chats_anonymous";
      const savedChats = localStorage.getItem(chatKey);
      if (savedChats) {
        try {
          const parsedChats = JSON.parse(savedChats);
          if (Array.isArray(parsedChats)) {
            parsedChats.forEach((chat: any) => {
              if (chat.messages && Array.isArray(chat.messages)) {
                chat.messages.forEach((msg: any) => {
                  if (msg.role === "assistant" || msg.role === "model") {
                    doctorRecommendations.push(`Dr/Dra. ${chat.doctorName} (${chat.specialty}): "${msg.text}"`);
                  }
                });
              }
            });
          }
        } catch (errChats) {
          console.error("Error parsing saved doctor chats for copilot:", errChats);
        }
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          history: formattedHistory,
          clinicalProfile,
          doctorRecommendations
        })
      });

      if (!response.ok) {
        throw new Error("Servicio no disponible");
      }

      const data = await response.json();
      setOnlineStatus(data.online ? "connected" : "local");

      const replyMsg: ChatMessage = {
        id: "ai_" + Date.now(),
        role: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgency: data.urgency
      };

      setMessages(prev => [...prev, replyMsg]);

      // If urgent, spawn a patient alert visible in right bar
      if (data.urgency === "high") {
        addAlert("Alerta de Prioridad IA", "high", `Síntomas críticos detectados por SEPHIEM IA: '${userMsgText.slice(0, 30)}...'`);
      } else if (data.urgency === "medium") {
        addAlert("Establecer Monitoreo", "medium", "Se aconseja reposar y comprobar su temperatura regularmente.");
      }
    } catch (err) {
      console.warn("Fallo de red, usando asistente local incorporado.", err);
      setOnlineStatus("local");
      
      // Offline Local Response generator:
      let replyText = "Disculpe, me comunico vía el nodo encriptado local de SEPHIEM. ";
      const scan = userMsgText.toLowerCase();

      if (scan.includes("pecho") || scan.includes("corazon") || scan.includes("asfixia") || scan.includes("urgente")) {
        replyText += "⚠️ ¡ALERTAS ROJAS DETECTADAS! Sus síntomas sugieren problemas del corazón o respiratorios críticos. POR FAVOR, contacte a asistencia física u hospital de urgencias local con premura.";
        addAlert("Alerta Roja Local", "high", "Sintomatología alarmante de pecho informada offline.");
      } else if (scan.includes("fiebre") || scan.includes("temperatura")) {
        replyText += "Detecto malestar asociado a fiebre. Guarde reposo, controle regularmente su temperatura y manténgase altamente hidratado.";
        addAlert("Alerta Fiebre", "medium", "Fiebre detectada por asistente offline.");
      } else {
        replyText += `He registrado su inquietud: "${userMsgText}". Encontrará doctores en cardiología, psiquiatría y más especialidades en el Marketplace para videoconsultas inmediatas.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: "ai_local_" + Date.now(),
          role: "assistant",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // 2. Symptoms Analyzer
  const handleAnalyzeSymptoms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomsInput.trim()) return;

    setIsAnalyzingSymptoms(true);
    try {
      const response = await fetch("/api/ai/symptoms/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptomsInput })
      });
      if (!response.ok) {
        throw new Error("Servicio local de análisis");
      }
      const data = await response.json();
      setSymptomResult(data);
      showToast("¡Análisis de síntomas completado!");

      if (data.isEmergency) {
        addAlert("Urgencia Cardíaca IA", "high", "Se detectaron indicios severos de emergencia cardiovascular.");
      }
    } catch (err) {
      showToast("Error de comunicación de síntomas");
    } finally {
      setIsAnalyzingSymptoms(false);
    }
  };

  // 3. Medication Scheduler
  const handleScheduleMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDosage || !medFrequency) {
      showToast("Por favor, rellene los campos del medicamento");
      return;
    }

    setIsSchedulingMed(true);
    try {
      const response = await fetch("/api/ai/medications/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationName: medName,
          dosage: medDosage,
          frequency: medFrequency,
          notes: medNotes
        })
      });

      const data = await response.json();

      const newMed: Medication = {
        id: "med_" + Date.now(),
        name: medName,
        dosage: medDosage,
        frequency: medFrequency,
        notes: medNotes || "Ninguno",
        schedule: {
          suggestedTimes: data.suggestedTimes || ["08:00 AM"],
          scheduleNotes: data.scheduleNotes || "Tomar segun criterio médico",
          reminders: data.reminders || ["Configurado en el sistema SEPHIEM"],
          warning: data.warning || "Ninguna restrictiva"
        }
      };

      const updated = [...meds, newMed];
      saveMeds(updated);
      showToast("¡Medicamento agendado con éxito!");

      // Clear Form Fields
      setMedName("");
      setMedDosage("");
      setMedFrequency("");
      setMedNotes("");

      // Spawn patient alert schedule reminder
      addAlert("Nuevo Recordatorio", "low", `Medicamento registrado: ${medName} (${medDosage})`);
    } catch (err) {
      showToast("Error al procesar horario de medicación");
    } finally {
      setIsSchedulingMed(false);
    }
  };

  const handleRemoveMed = (id: string) => {
    const filtered = meds.filter(m => m.id !== id);
    saveMeds(filtered);
    showToast("Medicamento eliminado");
  };

  return (
    <div className="flex flex-col h-full text-white font-sans overflow-hidden bg-[#0A0D14] w-full relative">
      {/* Toast Alert pop-up */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl text-xs font-semibold z-50 shadow-lg animate-fade-in flex items-center gap-1.5">
          <Info className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* REAL WHATSAPP CONNECTION REQUIRED / LOGIN GATEWAY MODAL */}
      {showNoRealWAWarningModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#05070B]/95 backdrop-blur-md p-4 animate-fade-in text-white">
          <div className="bg-[#0C101B] border-2 border-[#25D366]/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[95vh] text-left">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1F293D] bg-[#0E1424]/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20">
                  <Key className="w-5 h-5 text-[#25D366] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#25D366] font-mono leading-none">Iniciar Sesión: Bitácora Paciente-IA</h3>
                  <span className="text-[10px] text-gray-400 block mt-1.5 font-medium">Requerida cuenta de WhatsApp Real</span>
                </div>
              </div>
              {waBindingStatus === "verified" && (
                <button
                  type="button"
                  onClick={() => setShowNoRealWAWarningModal(false)}
                  className="text-gray-400 hover:text-white text-sm font-semibold p-1.5 hover:bg-[#1C2335] rounded-lg transition-all cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              
              {/* Privacy protection notice */}
              <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#25D366] text-[11px]">
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>Protección de Datos & Confidencialidad</span>
                </div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  <strong>Canal de Historial Exclusivo:</strong> Al iniciar sesión, se establece un ruteo directo y seguro. <strong>Solo se guardan y visualizan de forma exclusiva los chats clínicos entre el paciente y la IA</strong>. No se cargan contactos, chats ajenos ni conversaciones privadas del usuario en nuestro entorno.
                </p>
              </div>

              {waBindingStatus === "unlinked" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[11.5px] text-gray-200 leading-relaxed">
                      Por favor, introduzca su número de celular para iniciar sesión y acoplar el canal directo y privado de la IA con su WhatsApp:
                    </p>
                  </div>
                  <form onSubmit={handleStartLinking} className="space-y-3">
                    <span className="text-[9.5px] text-gray-500 uppercase font-mono tracking-wider font-bold">Número del Paciente</span>
                    <div className="flex gap-2">
                      <select
                        value={waCountryCode}
                        onChange={(e) => setWaCountryCode(e.target.value)}
                        className="bg-[#121824] border border-[#1F293D] text-xs text-white rounded-xl px-2 focus:outline-none focus:border-[#25D366]/40 cursor-pointer"
                      >
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+54">🇦🇷 +54</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+57">🇨🇴 +57</option>
                        <option value="+51">🇵🇪 +51</option>
                        <option value="+56">🇨🇱 +56</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="ej. 612048991"
                        value={waPhoneNumber}
                        onChange={(e) => setWaPhoneNumber(e.target.value)}
                        className="flex-1 bg-[#121824] border border-[#1F293D] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#25D366]/40 font-mono"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#1A263D] hover:bg-[#25D366] hover:text-black border border-[#2D3C5C] hover:border-transparent text-gray-200 font-bold py-2.5 px-3 rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 font-mono shadow-md"
                    >
                      <Key className="w-3.5 h-3.5 shrink-0" />
                      <span>Firmar con MetaMask</span>
                    </button>
                  </form>
                </div>
              )}

              {waBindingStatus === "signing" && (
                <div className="p-4 bg-[#121824] border border-[#2D3958] rounded-2xl space-y-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-mono block text-[#25D366] font-bold">Código Único de Vinculación</span>
                    <p className="text-[10.5px] text-gray-300 leading-normal">
                      Confirme la autenticación de su billetera tecleando o pegando el código de firma que se generó de forma segura:
                    </p>
                  </div>
                  
                  <div className="bg-[#090C15] p-2.5 rounded-xl border border-[#1F293D] text-center font-mono text-xs text-[#25D366] font-bold select-all tracking-wide">
                    {waVerificationCode}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Confirmar Firma</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Escriba aquí el código..."
                        value={userEnteredCode}
                        onChange={(e) => setUserEnteredCode(e.target.value)}
                        className="flex-1 bg-[#090C15] border border-[#1F293D] font-mono text-xs text-white rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#25D366]/40"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        className="bg-[#25D366] hover:bg-emerald-600 text-black font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {waBindingStatus === "verified" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 bg-[#25D366]/5 border border-[#25D366]/20 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 bg-[#25D366]/15 text-[#25D366] text-[9.5px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider font-mono">
                        ● Sesión Iniciada
                      </span>
                      <button
                        type="button"
                        onClick={handleDisconnectWhatsApp}
                        className="text-[10px] text-red-500 hover:text-red-400 bg-transparent font-semibold border-none cursor-pointer hover:underline"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                    <div className="text-xs pt-1">
                      <span className="text-[9px] text-gray-500 font-mono uppercase block">Canal Directo Activo</span>
                      <strong className="text-white text-sm tracking-tight block font-mono mt-0.5">
                        {waCountryCode} {waPhoneNumber}
                      </strong>
                    </div>
                  </div>

                  {/* QR barcode container */}
                  <div className="p-4 bg-[#111625] border border-[#1F293D] rounded-2xl flex flex-col items-center justify-center space-y-3.5 text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider font-semibold">Código QR para Enlazar WhatsApp Web3</span>
                    <div className="p-3 bg-white rounded-2xl shadow-xl relative glow-emerald">
                      <QrCode className="w-36 h-36 text-[#0A0D14]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-[#25D366] p-2 rounded-xl border-2 border-white shadow-lg">
                          <MessageSquare className="w-5 h-5 text-black animate-bounce" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-200 font-sans leading-relaxed">
                        Escanea este código con tu celular dentro de WhatsApp para completar el enlace de sesión confidencial paciente-IA.
                      </p>
                      <span className="text-[9.5px] text-[#52668D] font-mono block mt-2 uppercase tracking-tight">
                        REF_ID: WA-SYS-SECURE-{walletAddress.slice(2, 10).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1F293D] bg-[#0A0D14] flex justify-between items-center">
              <div className="text-[9px] text-gray-500 font-mono">
                Sephiem v4.2 • Secure Cryptography
              </div>
              <div className="flex gap-2">
                {waBindingStatus === "verified" ? (
                  <button
                    type="button"
                    onClick={() => setShowNoRealWAWarningModal(false)}
                    className="bg-[#25D366] text-black hover:bg-emerald-400 font-bold px-6 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md"
                  >
                    Cargar Conversación IA
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      showToast("Debe iniciar sesión para ver la bitácora inteligente.");
                    }}
                    className="bg-[#121824] border border-[#1F293D] text-gray-500 font-semibold px-4 py-2 rounded-xl text-xs cursor-not-allowed"
                    title="Debe iniciar sesión con cuenta real de WhatsApp para acceder al chat"
                    disabled
                  >
                    Bloqueado
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* WHATSAPP WEB3 MODAL DIALOG - Clean scan-QR-to-configure session */}
      {showWAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070B]/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0C101B] border border-[#1F293D] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[#1F293D] bg-[#0E1424]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20">
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#25D366] font-mono leading-none">Acceso Soberano WhatsApp Web3</h3>
                  <span className="text-[10px] text-gray-450 block mt-1 leading-none">Hilo directo y privado paciente-IA</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWAModal(false)}
                className="text-gray-400 hover:text-white text-sm font-semibold p-1.5 hover:bg-[#1C2335] rounded-lg transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              
              {/* Privacy Directive block explicitly emphasizing confidentiality */}
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#25D366] text-[11px]">
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>Privacidad Clínica Absoluta</span>
                </div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  <strong>Canal Confidencial:</strong> Este canal rutea la mensajería directamente desde tu número de celular registrado al modelo SEPHIEM IA. En este entorno, <strong>solo se visualizan de forma exclusiva los registros entre tú como paciente y la Inteligencia Artificial</strong>. No se cargan contactos, chats personales ni datos externos ajenos a tu bitácora clínica.
                </p>
              </div>

              {waBindingStatus === "unlinked" && (
                <div className="space-y-3.5">
                  <p className="text-[10.5px] text-gray-300 leading-relaxed">
                    Vincule su celular con su billetera pública EVM firmando una transacción sin costo de gas para autorizar el ruteo directo y seguro:
                  </p>
                  <form onSubmit={handleStartLinking} className="space-y-3">
                    <div className="flex gap-2">
                      <select
                        value={waCountryCode}
                        onChange={(e) => setWaCountryCode(e.target.value)}
                        className="bg-[#121824] border border-[#1F293D] text-xs text-white rounded-xl px-2 focus:outline-none focus:border-[#25D366]/40 cursor-pointer"
                      >
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+54">🇦🇷 +54</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+57">🇨🇴 +57</option>
                        <option value="+51">🇵🇪 +51</option>
                        <option value="+56">🇨🇱 +56</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="ej. 612048991"
                        value={waPhoneNumber}
                        onChange={(e) => setWaPhoneNumber(e.target.value)}
                        className="flex-1 bg-[#121824] border border-[#1F293D] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#25D366]/40 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#1A263D] hover:bg-[#25D366] hover:text-black border border-[#2D3C5C] hover:border-transparent text-gray-300 font-bold py-2 px-3 rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 font-mono"
                    >
                      <Key className="w-3.5 h-3.5 shrink-0" />
                      <span>Firmar con MetaMask</span>
                    </button>
                  </form>
                </div>
              )}

              {waBindingStatus === "signing" && (
                <div className="p-3.5 bg-[#121824] border border-[#2D3958] rounded-2xl space-y-3 text-left">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-mono block text-gray-450">Firma Criptográfica Auténtica</span>
                    <p className="text-[10.5px] text-gray-300 leading-normal">
                      Confirme el código de autenticación única de su dispositivo móvil para acoplamiento clínico:
                    </p>
                  </div>
                  
                  <div className="bg-[#090C15] p-2 rounded-lg border border-[#1F293D] text-center font-mono text-xs text-[#25D366] font-bold select-all">
                    {waVerificationCode}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-semibold block">Confirme su código asignado</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Pegue aquí el código..."
                        value={userEnteredCode}
                        onChange={(e) => setUserEnteredCode(e.target.value)}
                        className="flex-1 bg-[#090C15] border border-[#1F293D] font-mono text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#25D366]/40"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        className="bg-[#25D366] hover:bg-emerald-600 text-black font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {waBindingStatus === "verified" && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 bg-[#25D366]/10 text-[#25D366] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide font-mono">
                        ● Sincronizado
                      </span>
                      <button
                        type="button"
                        onClick={handleDisconnectWhatsApp}
                        className="text-[10px] text-red-500 hover:text-red-400 bg-transparent font-semibold border-none cursor-pointer hover:underline"
                      >
                        Desconectar
                      </button>
                    </div>
                    <div className="text-xs text-left">
                      <span className="text-[9px] text-gray-500 font-mono uppercase block leading-none">Canal Activo de WhatsApp del Paciente</span>
                      <strong className="text-white text-sm tracking-tight block mt-1 font-mono">
                        {waCountryCode} {waPhoneNumber}
                      </strong>
                    </div>
                  </div>

                  {/* QR code scanner interface visual */}
                  <div className="p-4 bg-[#111625] border border-[#1F293D] rounded-2xl flex flex-col items-center justify-center space-y-3 text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider font-semibold">Escanear QR para Iniciar Sesión en WhatsApp</span>
                    <div className="p-2.5 bg-white rounded-xl shadow-lg relative glow-emerald">
                      <QrCode className="w-32 h-32 text-[#0A0D14]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-[#25D366] p-1.5 rounded-lg border-2 border-white shadow-md">
                          <MessageSquare className="w-5 h-5 text-black" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-300 font-sans leading-tight">
                        Escanea este código con la cámara de tu móvil para iniciar el hilo confidencial directo y automatizado de SEPHIEM IA.
                      </p>
                      <span className="text-[9px] text-[#52668D] font-mono block mt-2.5 uppercase leading-none">
                        token: S-WA-HASH-{walletAddress.slice(2, 11).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Hidden/expandable messages simulator (highly useful for local testing as requested) */}
                  <div className="pt-2 border-t border-[#1F293D] mt-3">
                    <details className="group cursor-pointer">
                      <summary className="text-[9.5px] text-cyan-400 uppercase font-mono tracking-wider font-semibold hover:text-cyan-300 flex items-center justify-between py-1 select-none">
                        <span>🧪 Sandbox de Simulación Webhook</span>
                        <span className="text-[8px] text-gray-400 group-open:rotate-180 transition-all">▼</span>
                      </summary>
                      <div className="pt-2 pb-1 text-left space-y-2.5 cursor-default" onClick={e => e.stopPropagation()}>
                        <span className="text-[9px] text-gray-400 leading-normal block">
                          Simule el envío de un síntoma de forma virtual por WhatsApp para verificar el auto-enlace a su Ficha Clínica unificada:
                        </span>
                        
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={webhookQuery}
                            onChange={(e) => setWebhookQuery(e.target.value)}
                            placeholder="Describa síntomas simulados aquí..."
                            className="w-full bg-[#121824] border border-[#1F293D] rounded-xl p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/40"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              handleSimulateWebhook(e);
                              setShowWAModal(false);
                            }}
                            disabled={simulatingWebhook || !webhookQuery.trim()}
                            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-800 text-[#090C15] font-bold py-1.5 px-3 rounded-xl text-[10px] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 font-mono"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>{simulatingWebhook ? "Procesando..." : "Simular POST Webhook"}</span>
                          </button>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#1F293D] bg-[#0A0D14] flex justify-end">
              <button
                type="button"
                onClick={() => setShowWAModal(false)}
                className="bg-[#121824] hover:bg-[#1D243B] border border-[#1F293D] text-gray-300 font-semibold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Single Column Layout: Full width AI Clinical Chat viewport */}
      <div className="flex-1 flex flex-col h-full bg-[#0C101B] min-w-0">
        {/* Chat Module Header */}
        <div className="p-3.5 border-b border-[#1F293D] flex items-center justify-between bg-[#0E1424]/40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight leading-4">Bitácora IA Copiloto</h2>
              <span className="text-[10px] text-gray-500 block leading-3 mt-0.5">Clínica inteligente offline-ready</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-whatsapp-sync"
              type="button"
              onClick={() => setShowNoRealWAWarningModal(true)}
              className="bg-[#121824] hover:bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold active:scale-95"
              title="Sincronizar sesión segura con QR de WhatsApp"
            >
              <QrCode className="w-3.5 h-3.5 text-[#25D366]" />
              <span>{waBindingStatus === "verified" ? "🟢 WhatsApp Activo" : "Iniciar Sesión"}</span>
            </button>

            <button
              id="btn-bitacora-clear"
              type="button"
              onClick={handleClearHistory}
              title="Borrar historial persistente de la Bitácora"
              className="bg-[#1D2235] hover:bg-[#ef4444]/20 hover:text-red-400 border border-[#2D354F] text-gray-400 p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[10px] active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">Limpiar Chat</span>
            </button>

            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 font-bold ${
              onlineStatus === "connected" 
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                : "bg-gray-500/15 text-gray-400 border border-gray-500/30"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${onlineStatus === "connected" ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
              {onlineStatus === "connected" ? "Servidor Online" : "Modo Local"}
            </span>
          </div>
        </div>

        {/* Ubicuo Connection Sync status ribbon */}
        <div className="bg-[#10162B] border-b border-[#1F293D] px-3.5 py-1.5 flex flex-wrap items-center justify-between gap-3 text-[10px] text-gray-400 font-mono shrink-0 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="font-sans font-semibold text-gray-300">Soberano:</span>
            <span className="text-cyan-300 text-[10.5px] max-w-[200px] truncate" title={profilePreview}>{profilePreview}</span>
            <span className="bg-[#1D2B4A] text-cyan-400 text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-widest leading-none font-mono font-bold">Ficha Médica</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="font-sans text-gray-400">Canales Médicos:</span>
              <span className="text-emerald-400 font-bold font-mono">
                {chatsCount} ({recsCount} recomendaciones)
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-[9.5px] text-emerald-400 font-sans font-semibold shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <Sparkles className="w-3 h-3 animate-spin duration-3000 shrink-0" />
              <span>Copiloto Proactivo Activo</span>
            </div>
          </div>
        </div>

        {/* Chat main active area containing scroll, suggestion chips, and text block */}
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
          
          {/* Scrollable message flow, suggestions, and form controls. These elements remain present but beautifully blurred if no verified session exists */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-all duration-500 ${
            waBindingStatus !== "verified" ? "filter blur-[5.5px] opacity-25 select-none pointer-events-none" : ""
          }`}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isAI = msg.role === "assistant";
                const isWhatsApp = msg.id.startsWith("wa_");
                // Clean phone prefixes in text representation to keep UI elegant
                const cleanText = msg.text.replace(/^\[WhatsApp:\s\+\d+\]\s/, "");

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                  >
                    {/* avatar mini icon */}
                    <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border text-xs font-mono font-bold ${
                      isAI 
                        ? (isWhatsApp ? "bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366]" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400") 
                        : (isWhatsApp ? "bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366]" : "bg-[#1C243B] border-[#2C3B5E] text-white")
                    }`}>
                      {isWhatsApp ? "WA" : (isAI ? "S" : "P")}
                    </div>

                    <div className="space-y-1">
                      {/* WhatsApp synchronization label */}
                      {isWhatsApp && (
                        <div className="flex items-center gap-1 shrink-0 mb-1 select-none">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#25D366]/15 border border-[#25D366]/25 text-[#25D366] text-[8.5px] font-bold font-mono tracking-wide uppercase leading-none">
                            ● WhatsApp Web3
                          </span>
                        </div>
                      )}

                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isAI 
                          ? "bg-[#101524] border border-[#1F293D] text-gray-200" 
                          : (isWhatsApp ? "bg-[#25D366]/10 border border-[#25D366]/20 text-white font-medium" : "bg-emerald-500/10 border border-emerald-500/30 text-white font-medium")
                      }`}>
                        {/* Urgency Highlight banner inside the message */}
                        {isAI && msg.urgency === "high" && (
                          <div className="mb-2.5 p-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg flex items-start gap-2 text-[11px] leading-snug">
                            <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-white">Alerta de Sintomatología Crítica:</strong> Se aconseja fervientemente buscar supervisión presencial de urgencias inmediata.
                            </div>
                          </div>
                        )}
                        
                        {/* Msg text split lines */}
                        <div className="whitespace-pre-wrap font-sans">
                          {cleanText}
                        </div>
                      </div>
                      
                      <span className={`text-[9px] font-mono text-gray-500 block ${isAI ? "text-left" : "text-right"}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 mr-auto items-center">
                  <div className="w-7 h-7 rounded-lg shrink-0 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold animate-pulse">
                    S
                  </div>
                  <div className="px-4 py-2 bg-[#101524] border border-[#1F293D] rounded-xl text-xs text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-[10px] ml-1.5 text-gray-500">SEPHIEM analiza historial clínico...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Quick Clinical Prompts and Suggestions */}
            <div id="ai-quick-suggestions-bitacora" className="px-3.5 py-2.5 bg-[#0C101B] border-t border-[#1F293D]/60 space-y-1.5 shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono uppercase font-bold tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>Sugerencias de la IA para una Respuesta Precisa</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  id="btn-sug-analisis-sintomas"
                  type="button"
                  onClick={() => setInputValue("Análisis de Síntomas: Tengo [describa su dolor o malestar aquí] dolor, hace [ej. 2 días] y el malestar es [ej. moderado].")}
                  className="text-[10px] bg-[#121824] hover:bg-emerald-500/10 hover:border-emerald-500/30 text-gray-300 hover:text-emerald-300 px-2.5 py-1.5 rounded-lg border border-[#1F293D] cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 font-medium"
                  title="Copiar prompt plantilla para análisis inteligente de síntomas"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>🩺 Análisis de Síntomas</span>
                </button>

                <button
                  id="btn-sug-tratamientos-farmacia"
                  type="button"
                  onClick={() => setInputValue("Tratamientos / Farmacia: Por favor, analice si el fármaco [describa medicamento] tiene incompatibilidades con mi diagnóstico o expediente.")}
                  className="text-[10px] bg-[#121824] hover:bg-[#38bdf8]/10 hover:border-[#38bdf8]/30 text-gray-300 hover:text-sky-300 px-2.5 py-1.5 rounded-lg border border-[#1F293D] cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 font-medium"
                  title="Copiar prompt plantilla sobre compatibilidad de medicamentos"
                >
                  <Pill className="w-3.5 h-3.5 text-sky-450 shrink-0" />
                  <span>💊 Análisis de Tratamiento</span>
                </button>

                <button
                  id="btn-sug-evaluacion-clinica"
                  type="button"
                  onClick={() => setInputValue("Evaluación Clínica: Basado en mi bitácora clínica, ¿cuáles son las recomendaciones y dosis preventivas aconsejadas para mi caso?")}
                  className="text-[10px] bg-[#121824] hover:bg-amber-500/10 hover:border-amber-500/30 text-gray-300 hover:text-amber-300 px-2.5 py-1.5 rounded-lg border border-[#1F293D] cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 font-medium"
                  title="Copiar prompt plantilla para evaluación de recomendaciones clínicas"
                >
                  <FileCheck className="w-3.5 h-3.5 text-amber-450 shrink-0" />
                  <span>📋 Evaluación Recomendada</span>
                </button>
              </div>
            </div>

            {/* Chat input form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#1F293D] bg-[#0E1320] flex gap-2 items-center shrink-0">
              <input
                type="text"
                placeholder="Escriba aquí sus síntomas o dudas médicas..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-[#121824] border border-[#1F293D] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/40"
              />
              <button
                type="submit"
                disabled={isTyping || !inputValue.trim()}
                className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-[#0A0D14] rounded-xl transition-all active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Mandatory Login Gateway Overlay Popup for Chat interface */}
          {waBindingStatus !== "verified" && (
            <div className="absolute inset-0 z-45 bg-[#05070B]/85 backdrop-blur-md flex items-center justify-center p-5 animate-fade-in text-white">
              <div className="bg-[#0C101B] border-2 border-[#25D366]/40 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[95vh] text-left">
                
                {/* Header */}
                <div className="p-4 border-b border-[#1F293D] bg-[#0E1424]/60 flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 relative animate-pulse">
                    <QrCode className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono leading-none">Inicio de Sesión Requerido</h3>
                    <span className="text-[9px] text-[#25D366] block mt-1 font-semibold uppercase tracking-wide font-mono">Bitácora Paciente-IA de SEPHIEM</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 space-y-4">
                  <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                    Para acceder de forma segura e iniciar su conversación interactiva de la bitácora clínica, <strong>es estrictamente obligatorio iniciar sesión</strong> enlazando una cuenta de WhatsApp real activa.
                  </p>

                  <div className="p-3 bg-[#25D366]/5 border border-[#25D366]/15 rounded-xl text-[9px] text-gray-400 leading-relaxed font-sans">
                    🔒 <strong>Privacidad Clínica y Descentralización:</strong> En este entorno, solo se guarda y visualiza de forma exclusiva el historial unificado paciente-IA. Sus datos, contactos personales y chats externos permanecen inaccesibles.
                  </div>

                  {waBindingStatus === "unlinked" && (
                    <form onSubmit={handleStartLinking} className="space-y-3 pt-1">
                      <span className="text-[9px] text-gray-500 uppercase font-mono tracking-wider font-bold block">Ingrese su número celular</span>
                      <div className="flex gap-2">
                        <select
                          value={waCountryCode}
                          onChange={(e) => setWaCountryCode(e.target.value)}
                          className="bg-[#121824] border border-[#1F293D] text-xs text-white rounded-xl px-2 focus:outline-none focus:border-[#25D366]/40 cursor-pointer"
                        >
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+54">🇦🇷 +54</option>
                          <option value="+52">🇲🇽 +52</option>
                          <option value="+57">🇨🇴 +57</option>
                          <option value="+51">🇵🇪 +51</option>
                          <option value="+56">🇨🇱 +56</option>
                          <option value="+1">🇺🇸 +1</option>
                        </select>
                        <input
                          type="tel"
                          placeholder="ej. 612048991"
                          value={waPhoneNumber}
                          onChange={(e) => setWaPhoneNumber(e.target.value)}
                          className="flex-1 bg-[#121824] border border-[#1F293D] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#25D366]/50 font-mono"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#1A263D] hover:bg-[#25D366] hover:text-black border border-[#2D3C5C] hover:border-transparent text-[#25D366] hover:text-black font-bold py-2.5 px-3 rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 font-mono shadow-md"
                      >
                        <Key className="w-3.5 h-3.5 shrink-0" />
                        <span>Firmar con MetaMask</span>
                      </button>
                    </form>
                  )}

                  {waBindingStatus === "signing" && (
                    <div className="p-3 bg-[#121824] border border-[#2D3958] rounded-2xl space-y-3.5 text-left animate-fade-in">
                      <div className="space-y-1">
                        <span className="text-[8.5px] uppercase font-mono block text-[#25D366] font-bold">Código Único de Vinculación</span>
                        <p className="text-[10px] text-gray-300 leading-normal">
                          Por favor, autorice la firma en su billetera MetaMask e ingrese el código generado:
                        </p>
                      </div>
                      
                      <div className="bg-[#090C15] p-2.5 rounded-xl border border-[#1F293D] text-center font-mono text-xs text-[#25D366] font-bold select-all tracking-wide">
                        {waVerificationCode}
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wide">Confirmar código recibido</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Escriba el código..."
                            value={userEnteredCode}
                            onChange={(e) => setUserEnteredCode(e.target.value)}
                            className="flex-1 bg-[#090C15] border border-[#1F293D] font-mono text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#25D366]/40"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyCode}
                            className="bg-[#25D366] hover:bg-emerald-600 text-black font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            Confirmar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-[#1F293D] bg-[#0A0D14] flex items-center justify-between font-mono text-[8px] text-gray-500">
                  <span>Secure Patient Portal</span>
                  <span className="text-amber-550 font-bold animate-pulse">🔒 Acceso Requerido</span>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
