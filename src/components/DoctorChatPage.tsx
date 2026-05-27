import React, { useState, useEffect, useRef } from "react";
import { Doctor, ChatMessage, Appointment } from "../types";
import { 
  Send, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Video, 
  X, 
  CheckCircle, 
  User, 
  AlertCircle,
  FileCheck,
  Building2,
  Info,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Pill,
  Stethoscope
} from "lucide-react";

interface DoctorChatPageProps {
  walletAddress: string;
  doctors: Doctor[];
  appointments: Appointment[];
  setAppointments: (appts: Appointment[]) => void;
  fetchAppointments: (addr: string) => void;
  initialDoctorIdForChat?: string;
  clearInitialDoctorIdForChat?: () => void;
}

interface DoctorChat {
  doctorId: string;
  doctorName: string;
  specialty: string;
  avatarUrl: string;
  online: boolean;
  unreadCount: number;
  messages: ChatMessage[];
}

export default function DoctorChatPage({
  walletAddress,
  doctors,
  appointments,
  setAppointments,
  fetchAppointments,
  initialDoctorIdForChat,
  clearInitialDoctorIdForChat
}: DoctorChatPageProps) {
  // 4 simulated doctors available for chat as per specifications
  const [activeChatId, setActiveChatId] = useState<string>("doc1");
  const [chats, setChats] = useState<DoctorChat[]>([
    {
      doctorId: "doc1",
      doctorName: "Dra. Valentina Ross",
      specialty: "Cardiología",
      avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80",
      online: true,
      unreadCount: 1,
      messages: [
        {
          id: "init_1",
          role: "assistant",
          text: "Hola, soy la Dra. Valentina Ross. He recibido la alerta de su firma criptográfica. Estoy a su disposición para analizar reportes clínicos cardiológicos o valorar molestias en el pecho de manera confidencial.",
          timestamp: "08:12 AM"
        }
      ]
    },
    {
      doctorId: "doc2",
      doctorName: "Dr. Mateo Benítez",
      specialty: "Neurología",
      avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80",
      online: true,
      unreadCount: 2,
      messages: [
        {
          id: "init_2",
          role: "assistant",
          text: "Saludos. Soy el Dr. Mateo Benítez. Estoy revisando el blockchain. ¿Tiene dolores de cabeza persistentes o migrañas?",
          timestamp: "Ayer"
        }
      ]
    },
    {
      doctorId: "doc4",
      doctorName: "Dr. Diego Ferreira",
      specialty: "Bioinformática Clínica",
      avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80",
      online: true,
      unreadCount: 0,
      messages: [
        {
          id: "init_4",
          role: "assistant",
          text: "Hola, soy el Dr. Diego Ferreira. Trabajo con el mapeo genómico en la red. ¿Desea analizar su archivo FASTA o variante clínica de forma encriptada?",
          timestamp: "Ayer"
        }
      ]
    },
    {
      doctorId: "doc5",
      doctorName: "Dra. Lucía Mendoza",
      specialty: "Inmunología",
      avatarUrl: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=150&q=80",
      online: true,
      unreadCount: 0,
      messages: [
        {
          id: "init_5",
          role: "assistant",
          text: "Hola, bienvenida. Dra. Mendoza al habla. Si presenta cuadros alérgicos, fatiga extrema o sospecha rinitis, estoy atenta.",
          timestamp: "Hace 2 días"
        }
      ]
    }
  ]);

  const [hasLoaded, setHasLoaded] = useState(false);

  // Sync chats to localStorage per user wallet Address
  useEffect(() => {
    const key = walletAddress ? `sephiem_chats_${walletAddress}` : "sephiem_chats_anonymous";
    const savedChats = localStorage.getItem(key);
    let loadedChats: DoctorChat[] = [];
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedChats = parsed;
        }
      } catch (e) {
        console.error("Error loading chat memory:", e);
      }
    }

    if (loadedChats.length === 0) {
      // Revert to initial templates if there are no stored chats for this identifier
      loadedChats = [
        {
          doctorId: "doc1",
          doctorName: "Dra. Valentina Ross",
          specialty: "Cardiología",
          avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80",
          online: true,
          unreadCount: 1,
          messages: [
            {
              id: "init_1",
              role: "assistant",
              text: "Hola, soy la Dra. Valentina Ross. He recibido la alerta de su firma criptográfica. Estoy a su disposición para analizar reportes clínicos cardiológicos o valorar molestias en el pecho de manera confidencial.",
              timestamp: "08:12 AM"
            }
          ]
        },
        {
          doctorId: "doc2",
          doctorName: "Dr. Mateo Benítez",
          specialty: "Neurología",
          avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80",
          online: true,
          unreadCount: 2,
          messages: [
            {
              id: "init_2",
              role: "assistant",
              text: "Saludos. Soy el Dr. Mateo Benítez. Estoy revisando el blockchain. ¿Tiene dolores de cabeza persistentes o migrañas?",
              timestamp: "Ayer"
            }
          ]
        },
        {
          doctorId: "doc4",
          doctorName: "Dr. Diego Ferreira",
          specialty: "Bioinformática Clínica",
          avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80",
          online: true,
          unreadCount: 0,
          messages: [
            {
              id: "init_4",
              role: "assistant",
              text: "Hola, soy el Dr. Diego Ferreira. Trabajo con el mapeo genómico en la red. ¿Desea analizar su archivo FASTA o variante clínica de forma encriptada?",
              timestamp: "Ayer"
            }
          ]
        },
        {
          doctorId: "doc5",
          doctorName: "Dra. Lucía Mendoza",
          specialty: "Inmunología",
          avatarUrl: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=150&q=80",
          online: true,
          unreadCount: 0,
          messages: [
            {
              id: "init_5",
              role: "assistant",
              text: "Hola, bienvenida. Dra. Mendoza al habla. Si presenta cuadros alérgicos, fatiga extrema o sospecha rinitis, estoy atenta.",
              timestamp: "Hace 2 días"
            }
          ]
        }
      ];
    }

    setChats(loadedChats);
    setHasLoaded(true);
  }, [walletAddress]);

  // Handle dynamic insertion of chat from marketplace selection without infinite cycles
  useEffect(() => {
    if (!hasLoaded) return;
    if (initialDoctorIdForChat) {
      setChats((prev) => {
        const exists = prev.some((c) => c.doctorId === initialDoctorIdForChat);
        if (exists) return prev;

        const docInfo = doctors.find((d) => d.id === initialDoctorIdForChat);
        if (!docInfo) return prev;

        const newChat: DoctorChat = {
          doctorId: docInfo.id,
          doctorName: docInfo.name,
          specialty: docInfo.specialty,
          avatarUrl: docInfo.avatarUrl,
          online: docInfo.online,
          unreadCount: 0,
          messages: [
            {
              id: "init_dyn_" + Date.now(),
              role: "assistant",
              text: `Hola, soy ${docInfo.name}, especialista en ${docInfo.specialty}. He recibido su solicitud de consulta a través del marketplace de SEPHIEM. Su expediente clínico está cifrado y protegido. Por favor firme el acceso si desea que revise sus antecedentes de salud. ¿Cómo puedo asistirle hoy de forma personalizada?`,
              timestamp: "Ahora mismo"
            }
          ]
        };
        return [newChat, ...prev];
      });

      setActiveChatId(initialDoctorIdForChat);
      if (clearInitialDoctorIdForChat) {
        clearInitialDoctorIdForChat();
      }
    }
  }, [hasLoaded, initialDoctorIdForChat, doctors, clearInitialDoctorIdForChat]);

  useEffect(() => {
    if (!hasLoaded) return;
    const key = walletAddress ? `sephiem_chats_${walletAddress}` : "sephiem_chats_anonymous";
    localStorage.setItem(key, JSON.stringify(chats));
  }, [chats, walletAddress, hasLoaded]);

  // Appointment Form Fields
  const [appDate, setAppDate] = useState("");
  const [appTime, setAppTime] = useState("");
  const [appReason, setAppReason] = useState("");
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // States for blockchain access approval to specific specialist of currently active chat
  const [authorizedDoctors, setAuthorizedDoctors] = useState<string[]>([]);
  const [isSigningApproval, setIsSigningApproval] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    const key = `sephiem_authorized_doctors_${walletAddress}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setAuthorizedDoctors(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing authorized doctors list:", e);
      }
    } else {
      // By default authorize doc1 as demo
      setAuthorizedDoctors(["doc1"]);
    }
  }, [walletAddress]);

  const hasAccess = authorizedDoctors.includes(activeChatId);

  const getClinicalProfileForAPI = () => {
    const hasAccess = authorizedDoctors.includes(activeChatId);
    if (!hasAccess) {
      return { _restricted: true, message: "Acceso no firmado o revocado. El paciente debe presionar 'Firmar Acceso Clínico' para desencriptar e IPFS-compartir el perfil contigo." };
    }
    if (walletAddress) {
      const profileKey = `sephiem_profile_${walletAddress}`;
      const storedProfile = localStorage.getItem(profileKey);
      if (storedProfile) {
        try {
          return JSON.parse(storedProfile);
        } catch (err) {
          console.error("Error loading clinical profile for doctor chat:", err);
        }
      }
    }
    // High fidelity default fallback
    return {
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
  };

  const handleToggleAccessApproval = async () => {
    if (isSigningApproval) return;
    setIsSigningApproval(true);

    // Simulate blockchain signature progress
    await new Promise(resolve => setTimeout(resolve, 1500));

    const nextHasAccess = !hasAccess;
    let nextAuths = [];
    if (nextHasAccess) {
      nextAuths = [...authorizedDoctors, activeChatId];
    } else {
      nextAuths = authorizedDoctors.filter(id => id !== activeChatId);
    }
    
    setAuthorizedDoctors(nextAuths);
    if (walletAddress) {
      localStorage.setItem(`sephiem_authorized_doctors_${walletAddress}`, JSON.stringify(nextAuths));
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let systemText = "";
    if (nextHasAccess) {
      systemText = `🔑 AUTORIZACIÓN FIRMADA: He otorgado privilegios de descifrado y acceso premium en blockchain a mi Expediente Clínico Completo. Las llaves compartidas han sido generadas y transmitidas bajo AES-256 usando su dirección de red.`;
    } else {
      systemText = `🔒 PERMISO REVOCADO: He desestimado el acceso criptográfico y de desencriptación de mi Expediente Clínico. Las llaves anteriores han sido completamente invalidadas en el smart contract.`;
    }

    const userMsg: ChatMessage = {
      id: "usr_auth_" + Date.now(),
      role: "user",
      text: systemText,
      timestamp
    };

    // Append user message
    setChats(prev => prev.map(c => c.doctorId === activeChatId 
      ? { ...c, messages: [...c.messages, userMsg] } 
      : c
    ));
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `El paciente ha ${nextHasAccess ? "APROBADO Y FIRMADO EL ACCESO" : "REVOCADO EL ACCESO"} a sus registros médicos contigo en Blockchain / IPFS. Por favor responde confirmando este estado, agradeciendo y explicando brevemente qué impacto tiene en tus consultas.`,
          doctorName: activeChat.doctorName,
          specialty: activeChat.specialty,
          clinicalProfile: nextHasAccess ? getClinicalProfileForAPI() : { _restricted: true, message: "Acceso bloqueado civilmente" },
          history: [...activeChat.messages, userMsg].map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantReply: ChatMessage = {
          id: "ai_dr_auth_" + Date.now(),
          role: "assistant",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChats(prev => prev.map(c => c.doctorId === activeChatId 
          ? { ...c, messages: [...c.messages, assistantReply] } 
          : c
        ));
      } else {
        throw new Error("Local fallback");
      }
    } catch (err) {
      const fallbackText = nextHasAccess 
        ? `¡Entendido! Acabo de verificar la firma criptográfica en el bloque. Las llaves de descifrado AES-256 son válidas. He recuperado exitosamente su ficha médica y ahora puedo examinar el expediente de forma segura. Muchas gracias.`
        : `Confirmado. He recibido la señal de revocación de acceso. Procedo de inmediato a borrar de la memoria local y cerrar las pestañas de diagnóstico de su historial clínico de acuerdo a los protocolos soberanos.`;
      
      const assistantReplyFallback: ChatMessage = {
        id: "ai_dr_auth_fallback_" + Date.now(),
        role: "assistant",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prev => prev.map(c => c.doctorId === activeChatId 
        ? { ...c, messages: [...c.messages, assistantReplyFallback] } 
        : c
      ));
    } finally {
      setIsTyping(false);
      setIsSigningApproval(false);
    }

    showToast(nextHasAccess 
      ? `¡Acceso de desencriptación aprobado y firmado con Syscoin!` 
      : `¡Acceso revocado con éxito!`
    );
  };

  const handleApplySuggestion = (text: string) => {
    setChatInputValue(text);
    setTimeout(() => {
      const inputEl = document.querySelector('input[placeholder^="Chatear en"]') as HTMLInputElement;
      if (inputEl) {
        inputEl.focus();
        const startIndex = text.indexOf("[");
        const endIndex = text.indexOf("]");
        if (startIndex !== -1 && endIndex !== -1) {
          inputEl.setSelectionRange(startIndex + 1, endIndex);
        }
      }
    }, 80);
  };

  // Chat typing status
  const [chatInputValue, setChatInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Toast UI feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeChat = chats.find(c => c.doctorId === activeChatId) || chats[0];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages, isTyping]);

  // Trigger loading appointments
  useEffect(() => {
    if (walletAddress) {
      fetchAppointments(walletAddress);
    }
  }, [walletAddress]);

  // Handle Mark Chat as read
  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setChats(prev => prev.map(c => c.doctorId === id ? { ...c, unreadCount: 0 } : c));
  };

  // Chat sending to server (with tailored Doctor Prompt)
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputValue.trim()) return;

    const userText = chatInputValue;
    setChatInputValue("");

    const newMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      role: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update frontend state immediately
    setChats(prev => prev.map(c => c.doctorId === activeChatId 
      ? { ...c, messages: [...c.messages, newMsg] } 
      : c
    ));
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          doctorName: activeChat.doctorName,
          specialty: activeChat.specialty,
          clinicalProfile: getClinicalProfileForAPI(),
          history: activeChat.messages.map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Local offline doctor fallback");
      }

      const data = await response.json();
      
      const assistantReply: ChatMessage = {
        id: "ai_dr_" + Date.now(),
        role: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prev => prev.map(c => c.doctorId === activeChatId 
        ? { ...c, messages: [...c.messages, assistantReply] } 
        : c
      ));
    } catch (err) {
      // Local context fallbacks based on specialties
      let fallbackText = `Estimado paciente, soy el Dr./Dra. ${activeChat.doctorName} resolviendo de forma telemática local. `;
      const scan = userText.toLowerCase();

      if (activeChat.specialty === "Cardiología") {
        if (scan.includes("pecho") || scan.includes("presion") || scan.includes("corazon")) {
          fallbackText += "Dado que menciona síntomas vinculados al pecho o presión, le aconsejo de forma urgente registrar su presión sistólica/diastólica y, de ser severo, dirigirse inmediatamente a urgencias médicas físicas. He habilitado una cita prioritaria.";
        } else {
          fallbackText += "He revisado su consulta cardíaca preventiva. Le sugiero realizar ejercicios cardiovasculares de mínimo impacto de forma rutinaria y agendar una consulta formal para emitirle una receta telemática.";
        }
      } else if (activeChat.specialty === "Neurología") {
        if (scan.includes("cabeza") || scan.includes("migra") || scan.includes("jaqueca")) {
          fallbackText += "Las jaquecas severas suelen dispararse por fotosensibilidad o estrés. Evite pantallas azules por las próximas 3 horas, beba abundante agua fría y agende cita de seguimiento mediante el formulario.";
        } else {
          fallbackText += "Comprendo su duda neurológica clínica. Recomiendo evitar estimulantes como cafeína antes de dormir.";
        }
      } else {
        fallbackText += `Hemos recibido su consulta clínico-preventiva acerca de "${userText}". Por favor, mantenga reposo general y le invito a coordinar una cita mediante el panel de agendamientos adjunto para un examen riguroso.`;
      }

      const assistantReplyOffline: ChatMessage = {
        id: "ai_dr_offline_" + Date.now(),
        role: "assistant",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prev => prev.map(c => c.doctorId === activeChatId 
        ? { ...c, messages: [...c.messages, assistantReplyOffline] } 
        : c
      ));
    } finally {
      setIsTyping(false);
    }
  };

  // Appointment scheduling
  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appDate || !appTime || !appReason) {
      showToast("Por favor complete todos los datos del agendamiento");
      return;
    }

    setIsSubmittingApp(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientAddress: walletAddress,
          doctorName: activeChat.doctorName,
          date: appDate,
          time: appTime,
          reason: appReason
        })
      });

      if (response.ok) {
        showToast("¡Turno médico agendado y registrado en Blockchain local!");
        setAppDate("");
        setAppTime("");
        setAppReason("");
        
        // Reload appointments from server
        fetchAppointments(walletAddress);
      } else {
        throw new Error("No se pudo agendar la consulta telemática");
      }
    } catch (err: any) {
      showToast(`Error al agendar: ${err.message}`);
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const response = await fetch("/api/appointments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "cancelled" })
      });
      if (response.ok) {
        showToast("Agendamiento clínico cancelado");
        fetchAppointments(walletAddress);
      }
    } catch (e) {
      showToast("Error al cancelar la sesión médica");
    }
  };

  const handleCompleteAppointment = async (id: string) => {
    try {
      const response = await fetch("/api/appointments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "completed" })
      });
      if (response.ok) {
        showToast("Consulta telemática marcada como Completada");
        fetchAppointments(walletAddress);
      }
    } catch (e) {
      showToast("Error al finalizar consulta");
    }
  };

  // Start a Google Meet Teleconsultation Session in real time (Patient - Specialist)
  const handleStartMeetSession = async () => {
    const cleanDocName = activeChat.doctorName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
    const roomCode = `sep-${cleanDocName}-${Math.floor(Date.now() / 1000) % 1000}`;
    const meetUrl = `https://meet.google.com/${roomCode}`;

    const userText = `🩺 He iniciado una sala de teleconsulta en directo. Únase aquí para iniciar la atención online de inmediato: ${meetUrl}`;

    const newMsg: ChatMessage = {
      id: "usr_meet_" + Date.now(),
      role: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => prev.map(c => c.doctorId === activeChatId 
      ? { ...c, messages: [...c.messages, newMsg] } 
      : c
    ));
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `El paciente ha abierto una teleconsulta en Google Meet contigo en este enlace: ${meetUrl}. Responde confirmando cordialmente de inmediato que estás ingresando a la llamada y dile que estás listo para evaluar sus consultas médicas en vivo.`,
          doctorName: activeChat.doctorName,
          specialty: activeChat.specialty,
          clinicalProfile: getClinicalProfileForAPI(),
          history: [...activeChat.messages, newMsg].map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantReply: ChatMessage = {
          id: "ai_dr_meet_" + Date.now(),
          role: "assistant",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChats(prev => prev.map(c => c.doctorId === activeChatId 
          ? { ...c, messages: [...c.messages, assistantReply] } 
          : c
        ));
      } else {
        throw new Error("Local fallback required");
      }
    } catch (err) {
      const assistantReplyOffline: ChatMessage = {
        id: "ai_dr_meet_offline_" + Date.now(),
        role: "assistant",
        text: `¡Hola! He recibido el aviso de teleconsulta telemática en directo. Me estoy uniendo de forma inmediata a la sala de Meet para dar seguimiento en vivo a su ficha clínica ${meetUrl}. ¡Prepárese para iniciar!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prev => prev.map(c => c.doctorId === activeChatId 
        ? { ...c, messages: [...c.messages, assistantReplyOffline] } 
        : c
      ));
    } finally {
      setIsTyping(false);
    }

    window.open(meetUrl, "_blank");
    showToast("¡Teleconsulta Meet iniciada con el especialista!");
  };

  return (
    <div className="flex h-full text-white font-sans overflow-hidden bg-[#0A0D14]">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-semibold z-50 shadow-lg animate-fade-in flex items-center gap-1.5">
          <Info className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left panel: Simulated doctor chats list */}
      <div className="w-[240px] shrink-0 border-r border-[#1F293D] flex flex-col h-full bg-[#0C101B]">
        <div className="p-3.5 border-b border-[#1F293D] bg-[#0E1424]/40">
          <h2 className="text-xs font-bold text-gray-200 uppercase font-mono tracking-wider">
            Consultas Activas
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {chats.map((chat) => {
            const isSelected = chat.doctorId === activeChatId;
            return (
              <div
                key={chat.doctorId}
                onClick={() => handleSelectChat(chat.doctorId)}
                className={`p-2.5 rounded-xl cursor-pointer border transition-all text-xs flex items-center gap-2.5 ${
                  isSelected 
                    ? "bg-[#141F36] border-emerald-500/30" 
                    : "bg-[#101524] hover:bg-[#151D30] border-[#1f293d]/50"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={chat.avatarUrl}
                    alt={chat.doctorName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover border border-[#1F293D]"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0A0D14]" />
                </div>

                <div className="flex-1 min-width-0 leading-tight">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-gray-100 block truncate">{chat.doctorName}</span>
                    {chat.unreadCount > 0 && (
                      <span className="bg-emerald-500 text-[#0a0d14] font-bold text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-mono scale-90">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 block truncate mt-0.5">{chat.specialty}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center panel: Messaging history frame */}
      <div className="flex-1 flex flex-col border-r border-[#1F293D] h-full bg-[#0C101B]">
        <div className="p-3 border-b border-[#1F293D] bg-[#0E1424]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <img
              src={activeChat.avatarUrl}
              alt={activeChat.doctorName}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-lg object-cover border border-[#1f293d]"
            />
            <div className="leading-tight">
              <span className="font-bold text-gray-150 block text-xs">{activeChat.doctorName}</span>
              <span className="text-[10px] text-emerald-400 font-mono block">{activeChat.specialty} • Profesional Syscoin</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 p-1 px-2.5 bg-emerald-500/10 border border-emerald-500/20 text-[10px] rounded-full text-emerald-300 font-mono font-semibold">
              <Video className="w-3.5 h-3.5" /> Teleconsulta Habilitada
            </div>

            <button
              type="button"
              id="toggle-right-appointments-panel-btn"
              onClick={() => setShowRightPanel((prev) => !prev)}
              className={`p-1 px-2.5 rounded-full text-[10px] font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer border ${
                showRightPanel 
                  ? "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-300" 
                  : "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)] animate-pulse"
              }`}
              title={showRightPanel ? "Ocultar panel de citas" : "Mostrar panel de citas"}
            >
              {showRightPanel ? (
                <>
                  <EyeOff className="w-3 h-3 text-sky-400" />
                  <span>Ocultar Citas</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 text-blue-400" />
                  <span>Mostrar Citas</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message logs */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
          {activeChat.messages.map((m) => {
            const isAI = m.role === "assistant";
            return (
              <div key={m.id} className={`flex gap-2.5 max-w-[85%] ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed ${
                  isAI ? "bg-[#111726] border border-[#1F293D] text-gray-200" : "bg-emerald-500/15 text-white font-medium border border-emerald-500/20"
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span className="text-[9px] text-gray-500 font-mono block mt-1.5 text-right font-light">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2.5 mr-auto items-center">
              <div className="px-3.5 py-2 bg-[#121824] border border-[#1F293D] rounded-xl text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-[10px] ml-1.5">{activeChat.doctorName} redacta prescripción telemática...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Messaging prompt bar */}
        <form onSubmit={handleSendChatMessage} className="p-2.5 border-t border-[#1F293D] bg-[#0E1320] flex gap-2 flex-wrap sm:flex-nowrap">
          <button
            id="btn-google-meet-teleconsulta"
            type="button"
            onClick={handleStartMeetSession}
            disabled={isTyping}
            className="p-1.5 px-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-300 disabled:opacity-50 font-semibold rounded-xl active:scale-95 transition-all text-xs flex items-center gap-1.5 shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.12)] cursor-pointer"
            title="Iniciar consulta online vía Google Meet"
          >
            <Video className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="hidden sm:inline">Google Meet</span>
          </button>

          <button
            id="btn-blockchain-expediente-access"
            type="button"
            onClick={handleToggleAccessApproval}
            disabled={isSigningApproval || isTyping}
            className={`p-1.5 px-3 border disabled:opacity-50 font-semibold rounded-xl active:scale-95 transition-all text-xs flex items-center gap-1.5 shrink-0 cursor-pointer ${
              hasAccess 
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.12)] font-mono" 
                : "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 hover:border-amber-500/40 text-amber-300"
            }`}
            title={hasAccess ? "Revocar consentimiento legal de desencriptación" : "Otorgar y firmar consentimiento de desencriptación de expediente en Blockchain"}
          >
            {isSigningApproval ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Firmando Firma...</span>
              </>
            ) : hasAccess ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Acceso Expediente OK</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Aprobar Acceso Blockchain</span>
              </>
            )}
          </button>

          <input
            type="text"
            placeholder={`Chatear en canal encriptado con ${activeChat.doctorName}...`}
            value={chatInputValue}
            onChange={(e) => setChatInputValue(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-[#121824] border border-[#1F293D] rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/35"
          />
          <button
            type="submit"
            disabled={isTyping || !chatInputValue.trim()}
            className="p-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-[#0A0D14] font-bold rounded-xl active:scale-95 transition-all text-xs flex items-center gap-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" /> Enviar
          </button>
        </form>
      </div>

      {/* Right panel: Appointment Scheduler and historic appointments cards */}
      {showRightPanel && (
        <div className="w-[280px] shrink-0 p-3.5 space-y-4 overflow-y-auto bg-[#0A0D14] border-l border-[#1F293D]">
          
          {/* Agendamiento Form Section */}
          <div className="bg-[#0E1320] p-3 rounded-xl border border-[#1F293D] space-y-2.5">
            <h3 className="text-xs font-bold font-sans text-gray-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Agendar Teleconsulta
            </h3>
            
            <form onSubmit={handleScheduleAppointment} className="space-y-2 text-xs">
              {/* Display target Doctor Name dynamically as selected in Left Panel chat */}
              <div className="bg-[#121824] p-2 rounded border border-[#1F293D]/60 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <div>
                  <span className="text-[9px] text-gray-500 uppercase block leading-3">médico asignado</span>
                  <span className="text-white font-semibold block leading-tight">{activeChat.doctorName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-500 font-mono uppercase block mb-0.5">Fecha</label>
                  <input
                    type="date"
                    value={appDate}
                    onChange={(e) => setAppDate(e.target.value)}
                    className="w-full bg-[#121824] border border-[#1F293D] rounded-lg px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-mono uppercase block mb-0.5">Hora</label>
                  <input
                    type="time"
                    value={appTime}
                    onChange={(e) => setAppTime(e.target.value)}
                    className="w-full bg-[#121824] border border-[#1F293D] rounded-lg px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-mono uppercase block mb-0.5">Motivo de consulta</label>
                <input
                  type="text"
                  placeholder="ej. Revisión de electrocardiograma"
                  value={appReason}
                  onChange={(e) => setAppReason(e.target.value)}
                  className="w-full bg-[#121824] border border-[#1F293D] rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingApp}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-[#0A0D14] font-bold text-xs py-1.5 rounded-lg transition-transform"
              >
                Cerrar Acuerdo (Smart Contract)
              </button>
            </form>
          </div>

          {/* Existing teleconsultas agendamientos listing */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase block">
              Sesiones Agendadas ({appointments.length})
            </span>

            {appointments.length === 0 ? (
              <div className="p-4 border border-dashed border-[#1F293D] rounded-xl text-center text-gray-500 text-[10px] font-mono">
                Sin citas programadas. Use el formulario superior.
              </div>
            ) : (
              <div className="space-y-2">
                {appointments.map((appt) => {
                  const isPending = appt.status === "pending";
                  const isCompleted = appt.status === "completed";
                  const isCancelled = appt.status === "cancelled";
                  return (
                    <div key={appt.id} className="p-3 bg-[#0E1320] border border-[#1F293D] rounded-xl text-[10px] leading-relaxed space-y-1.5 relative group">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-white text-[11px] block">{appt.doctorName}</span>
                          <span className="text-gray-400 font-mono block mt-0.5">{appt.date} a las {appt.time}</span>
                        </div>

                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          isPending 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                            : isCompleted 
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" 
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                        }`}>
                          {appt.status}
                        </span>
                      </div>

                      <p className="text-gray-400 italic font-sans leading-tight">"{appt.reason}"</p>

                      {/* Manage Agendamiento Controls */}
                      {isPending && (
                        <div className="flex gap-2 pt-1 border-t border-[#1f293d]/50 mt-1">
                          <button
                            onClick={() => handleCompleteAppointment(appt.id)}
                            className="flex-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-mono py-1 rounded text-[9px] flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> COMPLETADO
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appt.id)}
                            className="flex-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-mono py-1 rounded text-[9px] flex items-center justify-center gap-1"
                          >
                            <X className="w-3 h-3" /> CANCELAR
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
