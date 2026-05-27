export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  fee: string;
  location: string;
  rating: number;
  online: boolean;
  nftBadge: boolean;
  txCount: number;
  avatarUrl: string;
}

export interface MedicalRecord {
  id: string;
  patientAddress: string;
  title: string;
  date: string;
  encryptedContent: string;
  iv: string;
  ipfsHash: string;
  authorizedDoctors: string[];
}

export interface Appointment {
  id: string;
  patientAddress: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: "pending" | "completed" | "cancelled";
}

export interface PatientAlert {
  id: string;
  patientAddress: string;
  title: string;
  severity: "low" | "medium" | "high";
  message: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  urgency?: "low" | "medium" | "high";
}

export interface SymptomAnalysis {
  severity: "low" | "medium" | "high";
  recommendedSpecialty: string;
  possibleCauses: string[];
  advice: string;
  isEmergency: boolean;
  online?: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  notes: string;
  schedule?: {
    suggestedTimes: string[];
    scheduleNotes: string;
    reminders: string[];
    warning: string;
  };
}
