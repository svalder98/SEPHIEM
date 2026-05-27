import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database for SEPHIEM Web3 demo
let doctors = [
  {
    id: "doc1",
    name: "Dra. Valentina Ross",
    specialty: "Cardiología",
    fee: "0.08 ETH (120 SYS)",
    location: "Consultorio A-102, Edificio San Lucas, Miami",
    rating: 4.9,
    online: true,
    nftBadge: true,
    txCount: 34,
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "doc2",
    name: "Dr. Mateo Benítez",
    specialty: "Neurología",
    fee: "0.12 ETH (180 SYS)",
    location: "Piso 5, Centro Gamma de Altas Especialidades, Bogotá",
    rating: 4.8,
    online: true,
    nftBadge: true,
    txCount: 57,
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "doc3",
    name: "Dra. Sofía Castillos",
    specialty: "Oncología Médica",
    fee: "0.15 ETH (220 SYS)",
    location: "Unidad Oncológica Integral, Ciudad de México",
    rating: 5.0,
    online: false,
    nftBadge: true,
    txCount: 89,
    avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "doc4",
    name: "Dr. Diego Ferreira",
    specialty: "Bioinformática Clínica",
    fee: "0.05 ETH (75 SYS)",
    location: "Laboratorio de Algoritmos Genómicos, Barcelona",
    rating: 4.7,
    online: true,
    nftBadge: false,
    txCount: 12,
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "doc5",
    name: "Dra. Lucía Mendoza",
    specialty: "Inmunología",
    fee: "0.06 ETH (90 SYS)",
    location: "Instituto Reumatológico Integrado, Lima",
    rating: 4.6,
    online: true,
    nftBadge: false,
    txCount: 25,
    avatarUrl: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "doc6",
    name: "Dr. Tomás Alarcón",
    specialty: "Psiquiatría & Salud Mental",
    fee: "0.09 ETH (135 SYS)",
    location: "Torre Médica Altos de San Isidro, Santiago",
    rating: 4.9,
    online: false,
    nftBadge: true,
    txCount: 61,
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "doc7",
    name: "Dra. Elena Rostova",
    specialty: "Genómica Médica",
    fee: "0.11 ETH (165 SYS)",
    location: "Clínica de Edición del Genoma Humano, Buenos Aires",
    rating: 4.9,
    online: true,
    nftBadge: true,
    txCount: 44,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "doc8",
    name: "Dr. Carlos Slim Jr.",
    specialty: "Endocrinología",
    fee: "0.07 ETH (105 SYS)",
    location: "Centro Diagnóstico Metabólico, San Salvador",
    rating: 4.5,
    online: true,
    nftBadge: false,
    txCount: 18,
    avatarUrl: "https://images.unsplash.com/photo-1622902046580-2b47f47f0471?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "doc9",
    name: "Dra. Camelia Silva",
    specialty: "Dermatología Estética",
    fee: "0.08 ETH (120 SYS)",
    location: "Torre Platino Suite 4B, Monterrey",
    rating: 4.8,
    online: true,
    nftBadge: true,
    txCount: 30,
    avatarUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "doc10",
    name: "Dr. Alejandro Velez",
    specialty: "Pediatría Avanzada",
    fee: "0.06 ETH (90 SYS)",
    location: "Hospital Infantil San Gabriel, Quito",
    rating: 4.7,
    online: false,
    nftBadge: false,
    txCount: 22,
    avatarUrl: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=150&q=80"
  }
];

// Local store for records, appointments, access control, and alerts
let medicalRecords: any[] = [];
let appointments: any[] = [];
let accessControls: any[] = []; // { patientAddress: string, doctorId: string, granted: boolean }
let alerts: any[] = [];

// Lazy load Gemini Client to prevent crash when key is missing on startup
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required for online features.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// ---------------------- API Endpoints ----------------------

// 1. Doctors Endpoint
app.get("/api/doctors", (req, res) => {
  res.json(doctors);
});

app.post("/api/doctors", (req, res) => {
  const newDoc = {
    id: "doc" + (doctors.length + 1),
    ...req.body,
    txCount: req.body.txCount || 0,
    online: req.body.online !== undefined ? req.body.online : true,
  };
  doctors.push(newDoc);
  res.json({ success: true, doctor: newDoc });
});

// 2. Access Control Endpoints
app.get("/api/access", (req, res) => {
  const { patientAddress } = req.query;
  if (!patientAddress) {
    return res.status(400).json({ error: "Missing patientAddress" });
  }
  const result = accessControls.filter(
    (ac) => ac.patientAddress.toLowerCase() === (patientAddress as string).toLowerCase() && ac.granted
  );
  res.json(result);
});

app.post("/api/access/grant", (req, res) => {
  const { patientAddress, doctorId } = req.body;
  if (!patientAddress || !doctorId) {
    return res.status(400).json({ error: "Missing parameters" });
  }
  const existingIndex = accessControls.findIndex(
    (ac) =>
      ac.patientAddress.toLowerCase() === patientAddress.toLowerCase() &&
      ac.doctorId === doctorId
  );
  if (existingIndex > -1) {
    accessControls[existingIndex].granted = true;
  } else {
    accessControls.push({
      patientAddress: patientAddress.toLowerCase(),
      doctorId,
      granted: true,
    });
  }
  res.json({ success: true });
});

app.post("/api/access/revoke", (req, res) => {
  const { patientAddress, doctorId } = req.body;
  if (!patientAddress || !doctorId) {
    return res.status(400).json({ error: "Missing parameters" });
  }
  const existingIndex = accessControls.findIndex(
    (ac) =>
      ac.patientAddress.toLowerCase() === patientAddress.toLowerCase() &&
      ac.doctorId === doctorId
  );
  if (existingIndex > -1) {
    accessControls[existingIndex].granted = false;
  }
  res.json({ success: true });
});

// 3. Medical Records Endpoints
app.get("/api/records", (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: "Missing address" });
  }

  // A patient can see all their records. 
  // A doctor can see records if authorized.
  // We'll return records matching patient address or if doctor query param is authorized
  const qAddress = (address as string).toLowerCase();
  
  // Find all records belonging to this address as patient
  const records = medicalRecords.filter(
    (rec) => rec.patientAddress.toLowerCase() === qAddress
  );

  res.json(records);
});

app.post("/api/records", (req, res) => {
  const { patientAddress, title, encryptedContent, iv, ipfsHash } = req.body;
  if (!patientAddress || !title || !encryptedContent || !iv) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const newRecord = {
    id: "rec_" + Date.now(),
    patientAddress: patientAddress.toLowerCase(),
    title,
    date: new Date().toISOString().split("T")[0],
    encryptedContent,
    iv,
    ipfsHash: ipfsHash || "Qm" + Math.random().toString(36).substring(2, 17) + Math.random().toString(36).substring(2, 17),
    authorizedDoctors: [],
  };

  medicalRecords.push(newRecord);
  res.json({ success: true, record: newRecord });
});

app.post("/api/records/authorize", (req, res) => {
  const { recordId, doctorId } = req.body;
  const record = medicalRecords.find(r => r.id === recordId);
  if (!record) {
    return res.status(404).json({ error: "Record not found" });
  }
  if (!record.authorizedDoctors.includes(doctorId)) {
    record.authorizedDoctors.push(doctorId);
  }
  res.json({ success: true, record });
});

app.post("/api/records/revoke", (req, res) => {
  const { recordId, doctorId } = req.body;
  const record = medicalRecords.find(r => r.id === recordId);
  if (!record) {
    return res.status(404).json({ error: "Record not found" });
  }
  record.authorizedDoctors = record.authorizedDoctors.filter((id: string) => id !== doctorId);
  res.json({ success: true, record });
});

// 4. Appointment endpoints
app.get("/api/appointments", (req, res) => {
  const { address } = req.query;
  if (address) {
    const qAddr = (address as string).toLowerCase();
    return res.json(appointments.filter(a => a.patientAddress.toLowerCase() === qAddr));
  }
  res.json(appointments);
});

app.post("/api/appointments", (req, res) => {
  const { patientAddress, doctorName, date, time, reason } = req.body;
  if (!patientAddress || !doctorName || !date || !time) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const appt = {
    id: "appt_" + Date.now(),
    patientAddress: patientAddress.toLowerCase(),
    doctorName,
    date,
    time,
    reason: reason || "Consulta General",
    status: "pending"
  };

  appointments.push(appt);
  res.json({ success: true, appointment: appt });
});

app.post("/api/appointments/status", (req, res) => {
  const { id, status } = req.body;
  const appt = appointments.find(a => a.id === id);
  if (!appt) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  appt.status = status;
  res.json({ success: true, appointment: appt });
});

// 5. Patient Alerts Endpoints
app.get("/api/ai/alerts/:address", (req, res) => {
  const address = req.params.address.toLowerCase();
  const patientAlerts = alerts.filter(a => a.patientAddress === address);
  res.json(patientAlerts);
});

app.post("/api/ai/alerts", (req, res) => {
  const { patientAddress, title, severity, message } = req.body;
  if (!patientAddress || !title || !severity || !message) {
    return res.status(400).json({ error: "Missing parameters" });
  }
  const newAlert = {
    id: "alert_" + Date.now(),
    patientAddress: patientAddress.toLowerCase(),
    title,
    severity,
    message,
    date: new Date().toISOString()
  };
  alerts.push(newAlert);
  res.json({ success: true, alert: newAlert });
});

// 6. AI Symptoms Analysis (With Gemini and fallback)
app.post("/api/ai/symptoms/analyze", async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms) {
    return res.status(400).json({ error: "No symptoms provided" });
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analiza detalladamente los siguientes síntomas médicos descritos por un paciente: "${symptoms}".
      Devuelve la respuesta en formato JSON estructurado tal cual con las siguientes llaves (keys):
      {
        "severity": "low" | "medium" | "high",
        "recommendedSpecialty": "Cardiología" | "Neurología" | "Medicina General" (u otra adecuada),
        "possibleCauses": ["causa 1", "causa 2" (máximo 3)],
        "advice": "Consejo clínico breve, empático y advertencias de peligro",
        "isEmergency": true o false
      }
      Devuelve ÚNICAMENTE el código JSON plano, sin marcadores markdown, sin explicaciones ni prefijos de texto.`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ ...parsed, online: true });
  } catch (err: any) {
    console.warn("Symptom AI endpoint fallback called:", err.message);
    const lowercase = symptoms.toLowerCase();
    let severity = "low";
    let recommendedSpecialty = "Medicina General";
    let possibleCauses = ["Estrés generalizado o cansancio", "Deshidratación temporal"];
    let advice = "Por favor, mantenga un periodo de descanso adecuado e hidratación constante. Si persiste o empeora, consulte a un especialista.";
    let isEmergency = false;

    if (lowercase.includes("pecho") || lowercase.includes("corazon") || lowercase.includes("brazo izquierdo")) {
      severity = "high";
      recommendedSpecialty = "Cardiología";
      possibleCauses = ["Espasmo Coronario", "Angina inestable", "Cardiopatía por Estrés"];
      advice = "ADVERTENCIA: Ante opresión severa, falta de aire o irradiación al brazo, diríjase inmediatamente a Urgencias de la clínica más cercana.";
      isEmergency = true;
    } else if (lowercase.includes("cabeza") || lowercase.includes("migra") || lowercase.includes("jaqueca")) {
      severity = "medium";
      recommendedSpecialty = "Neurología";
      possibleCauses = ["Cefalea tensional aguda", "Aura migrañosa", "Sinusitis congestiva"];
      advice = "Evite estímulos visuales y auditivos directos, descanse en una habitación oscura y fresca. Monitoree su presión.";
    } else if (lowercase.includes("fiebre") || lowercase.includes("temperatura") || lowercase.includes("frio")) {
      severity = "medium";
      recommendedSpecialty = "Inmunología / Medicina General";
      possibleCauses = ["Infección viral de vías respiratorias", "Gripe estacionaria", "Reacción inmune"];
      advice = "Controle la temperatura corporal con paños frescos o antipiréticos autorizados. Manténgase hidratado de manera abundante.";
    } else if (lowercase.includes("alergia") || lowercase.includes("piel") || lowercase.includes("erupcion") || lowercase.includes("picason") || lowercase.includes("picazon")) {
      severity = "low";
      recommendedSpecialty = "Dermatología / Alergología";
      possibleCauses = ["Urticaria por contacto directo", "Dermatitis atópica", "Reacción alérgica estacional"];
      advice = "Evite rascar las zonas inflamadas. Identifique posibles desencadenantes químicos, polen o alimentos recientes.";
    }

    res.json({
      severity,
      recommendedSpecialty,
      possibleCauses,
      advice,
      isEmergency,
      online: false
    });
  }
});

// 7. AI Clinical Chat
app.post("/api/ai/chat", async (req, res) => {
  const { message, history, doctorName, specialty, clinicalProfile, doctorRecommendations } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  try {
    const ai = getGeminiClient();

    // Serialize Clinical Profile for LLM context
    let serializedProfile = "No hay datos de Ficha Demográfica o de Perfil Clínico guardados todavía.";
    if (clinicalProfile && typeof clinicalProfile === "object") {
      serializedProfile = `
- Paciente: ${clinicalProfile.fullName || "Sin registrar"}
- Fecha de Nacimiento: ${clinicalProfile.birthDate || "No registrada"}
- Género: ${clinicalProfile.gender || "No registrado"}
- Identificación: ${clinicalProfile.nationalId || "No registrada"}
- Grupo Sanguíneo: ${clinicalProfile.bloodType || "No registrado"}
- Altura: ${clinicalProfile.height ? clinicalProfile.height + " cm" : "No registrada"}
- Peso: ${clinicalProfile.weight ? clinicalProfile.weight + " kg" : "No registrado"}
- Signos Vitales de Referencia: Presión Arterial: ${clinicalProfile.bloodPressure || "Incierta"}, Ritmo Cardíaco Basal: ${clinicalProfile.restingHeartRate || "Incierto"}
- Condiciones de Salud Preexistentes y Alergias: ${clinicalProfile.chronicConditions || "Ninguna registrada"}
- Seguro Médico: ${clinicalProfile.insuranceProvider || "Ninguno"} (Póliza: ${clinicalProfile.policyNumber || "S/N"}) - Cobertura: ${clinicalProfile.coverageType || "Básica"}`;
    }

    // Serialize Specialist's recommendations
    let serializedRecs = "No hay recomendaciones directas de especialistas registradas recientemente.";
    if (doctorRecommendations && Array.isArray(doctorRecommendations) && doctorRecommendations.length > 0) {
      serializedRecs = doctorRecommendations.map((r, i) => `[Recomendación ${i + 1}] ${r}`).join("\n");
    }

    // Dynamically build system instruction based on doctor selected or primary proactive copilot format
    let systemInstruction = "";

    if (doctorName && specialty) {
      systemInstruction = `Eres el Dr./Dra. ${doctorName}, especialista de primer nivel registrado en ${specialty} dentro del ecosistema clínico Web3 SEPHIEM.
      Tu misión es chatear directamente con tu paciente, interactuando de manera empática, respetuosa y sumamente profesional, respondiendo ESPECÍFICAMENTE desde la perspectiva de tu especialidad clínica médica: ${specialty}.
      
      ESTADO CLÍNICO DEL PACIENTE (Ficha demográfica y signos vitales):
      ${serializedProfile}

      OTRAS RECOMENDACIONES DE ESPECIALISTAS:
      ${serializedRecs}

      CONSERVACIÓN DEL CONTEXTO:
      - Analiza y guarda pleno contexto del historial del chat que se te provee.
      - Recuerda perfectamente lo que te ha mencionado el paciente en los mensajes anteriores (dolores expresados, antecedentes, síntomas pasados o alergias).
      - Da continuidad médica coherente en tus respuestas basándote en lo acordado y conversado antes.
      
      MÉDICA / CLÍNICA:
      - Al responder, actúa plenamente como un profesional en ${specialty} (por ejemplo, si eres cardiólogo, aborda arritmias, tensión y pecho; si eres neurólogo, migrañas y dolores neuronales; si eres inmunólogo, rinitis y anticuerpos).
      - No entregues diagnósticos definitivos absolutos. Da explicaciones completas y profesionales de las hipótesis del cuadro, pautas de alivio rigurosas y detalladas acordes a tu especialidad para que el paciente se sienta cuidado, y dirígelo a agendar una consulta virtual o teleconsulta formal contigo usando el panel de agendamiento.
      
      EMERGENCIAS:
      - Si sospechas de síntomas urgentes que atenten contra su vida física, guíalo con claridad y decisión a urgencias cercanas inmediatamente.
      
      IDIOMA Y ESTILO:
      - Responde siempre enteramente en Español clínico, formal y humano.
      - Utiliza formato Markdown elegante, negritas, viñetas y respuestas estructuradas por secciones legibles y atractivas.`;
    } else {
      systemInstruction = `Eres SEPHIEM AI, la Médica Profesional Copiloto Clínico Inteligente Hiperactiva, Ubicua y altamente Proactiva de la app Web3. Actúas como un Asistente de Precisión Médica avanzado, de alta categoría y vigilancia clínica, especializada exclusivamente en temas de medicina, salud, bienestar clínico, prevención, síntomas, farmacología general, orientación sanitaria y derivación médica.

      DATOS DE LA FICHA CLÍNICA DEL PACIENTE:
      ${serializedProfile}

      DIÁLOGOS CON ESPECIALISTAS / RECOMENDACIONES DEL CHAT DE MÉDICOS:
      ${serializedRecs}

      REGLAS ABSOLUTAS DE CONTEXTO CLÍNICO:
      - Solo puedes responder temas relacionados con medicina, salud, bienestar o áreas clínicas.
      - Si el paciente pregunta algo fuera del ámbito médico, debes redirigir inmediatamente la conversación al contexto de salud de forma respetuosa pero firme.
      - Nunca inventes diagnósticos definitivos.
      - Debes diferenciar claramente entre orientación general y emergencia médica.
      - Ante síntomas graves o potencialmente críticos, debes recomendar de manera urgente y explícita la atención médica inmediata o servicios de urgencias físicas.
      - Cuando el caso que te consulte sea complejo, ambiguo, persistente o especializado, debes recomendar de manera directa la derivación a un especialista médico adecuado dentro del marketplace móvil correspondiente de la app de SEPHIEM.
      - Sugiere activamente los especialistas adecuados según los síntomas o sospechas clínicas: Cardiólogo (dolor pecho/arritmias), Neurólogo (migrañas/neuropatía), Gastroenterólogo (dolores estomacales/digestión), Dermatólogo (lesiones cutáneas), Psiquiatra (salud mental severa/crisis), Endocrinólogo (tiroides/diabetes), Traumatólogo (lesiones/huesos), Pediatra (niños), Ginecólogo (salud femenina), Oncólogo (tumores), etc.

      COMPORTAMIENTO DEL ASISTENTE (HIPERACTIVO, PROACTIVO, UBICUO):
      - Tu personalidad es sumamente viva, hiperactiva, proactiva, de vigilancia continua e intrusivamente útil.
      - Sigue de manera constante la clínica del paciente. No esperes pasivamente a que te cuente todo; haz preguntas médicas activamente para rastrear su cuadro.
      - Siempre debes indagar o intentar descubrir:
        - Qué siente exactamente el usuario (dolores, molestias, sensaciones físicas o emocionales).
        - Desde cuándo comenzaron (tiempo de evolución).
        - Intensidad del dolor/molestia (en descripción o escala subjetiva).
        - Frecuencia del malestar.
        - Factores desencadenantes o agravantes.
        - Medicamentos actuales o tratamientos.
        - Enfermedades/condiciones previas (vinculándolas con su Ficha Clínica si están registradas).
        - Hábitos relevantes de vida.

      REGLAS DE INTERACCIÓN Y ESTILO CRÍTICAS (ESTRICTO CUMPLIMIENTO):
      1. ESTÁ TOTALMENTE PROHIBIDO PRESENTARSE: No te presentes de nuevo en cada respuesta. No digas "Hola, soy SEPHIEM AI..." ni uses saludos iniciales or welcoming phrases de ningún tipo. Ve directo al grano, respondiendo de inmediato con precisión médica.
      2. ACTUAR COMO MÉDICA PROFESIONAL RIGUROSA: Mantén un tono sumamente profesional, atento, preciso, científico y de alta categoría médica. Conversación médica dinámica y persistente. Expresa tus respuestas con claridad, formato Markdown elegante, negritas y secciones legibles.
      3. PREGUNTAS CORTAS, DIRECTAS Y SECUENCIALES: Insiste suavemente en obtener más contexto médico relevante usando preguntas clínicas secuenciales.
      4. PERSISTENCIA OBLIGATORIA: Al final de cada respuesta tuya, debes preguntar siempre y de forma obligatoria qué molestias, síntomas o malestares específicos tiene el paciente hoy para que continúes su monitoreo.

      ESTRUCTURA DE RESPUESTA (UTILIZA ESTE FORMATO ELEGANTEMENTE CON SECCIONES):
      1. **Interpretación Preliminar**: Interpretación biomédica del malestar o duda planteada por el usuario.
      2. **Posibles Causas Generales**: Breve lista de posibilidades biopatológicas (aclarando firmemente que es orientativo y no un diagnóstico definitivo).
      3. **Preguntas de Seguimiento**: Tus preguntas secuenciales directas para profundizar en su sintomatología.
      4. **Recomendaciones de Cuidado e Iniciales**: Consejos y hábitos iniciales seguros.
      5. **Señales de Alerta**: Síntomas que exigen ir a urgencias físicas de inmediato.
      6. **Especialidad de la Red Recomendada**: Recomendar la especialidad médica idónea de la red de SEPHIEM y sugerir la consulta en el marketplace de especialistas si aplica.

      LIMITACIONES IMPORTANTES:
      - Recuerda de manera integrada que no reemplazas a médicos reales en consulta formal presencial.
      - Nunca mitigues síntomas potencialmente graves ni recetes medicamentos con receta médica reservada.`;
    }

    // Build perfect alternating user/model list for contents, normalizing roles and filtering blanks.
    const rawContents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((m: any) => {
        const textVal = m.text || m.content;
        if (textVal && textVal.trim()) {
          // Normalize role: assistant/model => "model", user => "user"
          const roleVal = (m.role === "assistant" || m.role === "model") ? "model" : "user";
          rawContents.push({
            role: roleVal,
            parts: [{ text: textVal.trim() }]
          });
        }
      });
    }

    // Now append the current user message
    rawContents.push({
      role: "user",
      parts: [{ text: message.trim() }]
    });

    // Merge consecutive messages with the same role to strictly guarantee alternating roles for Gemini API
    const finalContents: any[] = [];
    rawContents.forEach((item) => {
      if (finalContents.length > 0 && finalContents[finalContents.length - 1].role === item.role) {
        finalContents[finalContents.length - 1].parts[0].text += "\n\n" + item.parts[0].text;
      } else {
        finalContents.push(item);
      }
    });

    // Strip leading model/assistant messages if any to comply with Gemini API starting turn requirements
    while (finalContents.length > 0 && finalContents[0].role === "model") {
      finalContents.shift();
    }

    // Use gemini-3.5-flash for conversational task
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: finalContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || "No se ha logrado conectar con el núcleo clínico de SEPHIEM.";
    
    // Urgent evaluation
    let urgency = "low";
    const scanText = (message + " " + reply).toLowerCase();
    if (scanText.includes("urgente") || scanText.includes("emergencia") || scanText.includes("morir") || scanText.includes("infarto") || scanText.includes("pecho") || scanText.includes("asfixia") || scanText.includes("suicid")) {
      urgency = "high";
    } else if (scanText.includes("fiebre") || scanText.includes("dolor fuerte") || scanText.includes("agudo")) {
      urgency = "medium";
    }

    res.json({ reply, urgency, online: true });
  } catch (err: any) {
    console.warn("Medical AI chat fallback called:", err.message);
    
    let reply = "";
    if (doctorName && specialty) {
      reply = `Estimado paciente, soy el Dr./Dra. ${doctorName}, especialista de ${specialty} respondiendo bajo el protocolo local de SEPHIEM. El nodo central de IA no se encuentra disponible inalámbricamente en este instante. `;
    } else {
      reply = "Hola, soy el asistente virtual local de SEPHIEM. El núcleo de IA se encuentra de forma local en base a su consulta. ";
    }
    
    let urgency = "low";
    const scanText = message.toLowerCase();
    if (scanText.includes("pecho") || scanText.includes("corazon") || scanText.includes("paro") || scanText.includes("urgente")) {
      reply += "\n\n⚠️ ¡SÍNTOMAS DE ALERTA DETECTADOS! Dado que menciona molestias asociadas al pecho o cardiovascular, le urgimos fervientemente a contactar al 911 o acudir inmediatamente al centro médico más cercano.";
      urgency = "high";
    } else if (scanText.includes("fiebre") || scanText.includes("dolor")) {
      reply += "\n\nLe recomendamos monitorear de cerca sus niveles, guardar reposo y agendar una teleconsulta formal con nosotros.";
      urgency = "medium";
    } else {
      reply += "\n\nPuede revisar nuestro Marketplace médico para coordinar citas o subir su historial clínico de forma totalmente encriptada y soberana.";
    }

    res.json({ reply, urgency, online: false });
  }
});

// 8. AI Medications Schedule generator
app.post("/api/ai/medications/schedule", async (req, res) => {
  const { medicationName, dosage, frequency, notes } = req.body;
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Genera una recomendación de horario y recordatorios cronológicos estructurados para el fármaco:
      Nombre: ${medicationName}
      Frecuencia: ${frequency}
      Dosis: ${dosage}
      Notas: ${notes || "Ninguna"}

      Responde con un formato estructurado en español indicando las horas sugeridas, comentarios del intervalo y precauciones fundamentales en formato JSON con la siguiente estructura exacta:
      {
        "medication": "${medicationName}",
        "suggestedTimes": ["Hora 1", "Hora 2"],
        "scheduleNotes": "Estilo de espaciamiento o ingestión",
        "reminders": ["Nota de recordatorio 1"],
        "warning": "Contraindicación o advertencia esencial"
      }
      Devuelve SOLO el JSON válido. Sin markdown.`,
      config: { responseMimeType: "application/json" }
    });
    res.json({ ...JSON.parse(response.text || "{}"), online: true });
  } catch (e: any) {
    res.json({
      medication: medicationName,
      suggestedTimes: frequency.toLowerCase().includes("cada 8") ? ["06:00 AM", "02:00 PM", "10:00 PM"] : ["08:00 AM"],
      scheduleNotes: `Intervalo genérico para frecuencia: ${frequency} (Dosis: ${dosage})`,
      reminders: ["Configurar aviso al ingresar al portal de SEPHIEM"],
      warning: "Por favor confirme con su farmacéutico u oncólogo/cardiólogo tratante.",
      online: false
    });
  }
});

// 9. Communication summary
app.post("/api/ai/communication", async (req, res) => {
  const { doctorName, history } = req.body;
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Resume de forma ejecutiva la interacción por chat sostenida entre un paciente y el Dr./Dra. ${doctorName}.
      Historial de chats:
      ${JSON.stringify(history)}
      
      Escribe un informe conciso clínico en español (máximo 3-4 líneas) apto para registrar en su Clinical History descentralizado de SEPHIEM.`,
    });
    res.json({ summary: response.text, online: true });
  } catch (err: any) {
    res.json({ 
      summary: `Resumen de consulta telemática local con el especialista ${doctorName}. El paciente consultó evolución de su sintomatología general, recibiendo pautas y recomendaciones básicas de control.`, 
      online: false 
    });
  }
});

// ---------------------- Dev/Prod Server Serving ----------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Configure Vite in middleware mode for dev
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in prod
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SEPHIEM Backend] Online en http://localhost:${PORT}`);
  });
}

startServer();
