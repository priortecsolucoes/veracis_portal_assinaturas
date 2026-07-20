export type Role = 'reception' | 'billing';
export type Status = 'facial' | 'authorized' | 'signed' | 'paper' | 'cancelled';
export type Tab = 'dashboard' | 'detail' | 'reports' | 'types' | 'files';
export type Filter = 'all' | 'download' | 'sign' | 'completed';
export type Period = 'week' | 'month' | 'quarter' | 'all';

export interface Referral {
  fileName: string;
  used: number;
  total: number;
}

export interface Appointment {
  id: number;
  time: string;
  patient: string;
  insuranceCard: string;
  doctor: string;
  specialty: string;
  serviceType: 'Consulta' | 'Terapia' | 'Exame';
  requiresFacial: boolean;
  authorizationNumber: string | null;
  status: Status;
  completed: boolean;
  referral: Referral | null;
  date?: string; // for historical records
}

export interface SharedFile {
  id: number;
  provider: string;
  appointmentLabel: string;   // "19/07 · Patient · Specialty"
  postedAt: string;           // 'YYYY-MM-DD' — used for sorting and filtering
  postedAtLabel: string;      // 'dd/mm/yyyy' — display
  fileName: string;
  fileType: 'pdf' | 'png';
  fileDataUrl: string | null; // base64 data URL; null for demo data
}

export interface AppointmentType {
  id: number;
  name: string;
  cbo: string;
  tus: string;
  rate: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const ST: Record<Status, { label: string; bg: string; color: string }> = {
  facial:     { label: 'Pend. reconhec. facial', bg: '#FBF0DC', color: '#8A5A12' },
  authorized: { label: 'Autorizado',             bg: '#DDEEF9', color: '#1E6EA7' },
  signed:     { label: 'Assinado',               bg: '#E3F2E8', color: '#1D6B3C' },
  paper:      { label: 'Assinado (papel)',        bg: '#EFE6F5', color: '#6B3E8F' },
  cancelled:  { label: 'Cancelada (não veio)',    bg: '#F7E4E1', color: '#A33B2E' },
};

export const SERVICE_RATES: Record<string, number> = {
  Consulta: 88,
  Terapia: 45,
  Exame: 120,
};

export function brl(v: number): string {
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}
