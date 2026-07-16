export type Role = 'recepcao' | 'faturamento';
export type Status = 'facial' | 'autorizado' | 'assinado' | 'papel' | 'cancelado';
export type Tab = 'dashboard' | 'detail' | 'relatorio' | 'tipos';
export type Filter = 'todas' | 'baixar' | 'assinar' | 'concluidas';
export type Periodo = 'semana' | 'mes' | 'trimestre' | 'todos';

export interface Encaminhamento {
  arquivo: string;
  usadas: number;
  total: number;
}

export interface Consulta {
  id: number;
  hora: string;
  paciente: string;
  carteira: string;
  medico: string;
  especialidade: string;
  tipo: 'Consulta' | 'Terapia' | 'Exame';
  exigeFacial: boolean;
  pedido: string | null;
  status: Status;
  realizada: boolean;
  enc: Encaminhamento | null;
  data?: string; // for historical records
}

export interface TipoConsulta {
  id: number;
  nome: string;
  cbo: string;
  tus: string;
  valor: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const ST: Record<Status, { label: string; bg: string; color: string }> = {
  facial:     { label: 'Pend. reconhec. facial', bg: '#FBF0DC', color: '#8A5A12' },
  autorizado: { label: 'Autorizado',             bg: '#DDEEF9', color: '#1E6EA7' },
  assinado:   { label: 'Assinado',               bg: '#E3F2E8', color: '#1D6B3C' },
  papel:      { label: 'Assinado (papel)',        bg: '#EFE6F5', color: '#6B3E8F' },
  cancelado:  { label: 'Cancelada (não veio)',    bg: '#F7E4E1', color: '#A33B2E' },
};

export const VALOR: Record<string, number> = {
  Consulta: 88,
  Terapia: 45,
  Exame: 120,
};

export function brl(v: number): string {
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}
