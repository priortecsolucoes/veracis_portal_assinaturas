import { create } from 'zustand';
import { Consulta, TipoConsulta, ChatMessage, Tab, Filter, Periodo, Role } from './types';
import { CONSULTAS_HOJE, TIPOS_CONSULTA } from './mock-data';

interface StoreState {
  // Auth
  isLoggedIn: boolean;
  role: Role;
  loginRole: Role;
  setLoginRole: (r: Role) => void;
  login: () => void;
  logout: () => void;

  // Navigation
  tab: Tab;
  setTab: (t: Tab) => void;

  // Agenda
  consultas: Consulta[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  patchConsulta: (id: number, patch: Partial<Consulta>) => void;

  // Detail
  selectedId: number | null;
  selectedRep: Consulta | null;
  selectConsulta: (id: number | null) => void;
  selectRep: (c: Consulta | null) => void;

  // Tablet signature mode
  tabletMode: 'off' | 'signing' | 'done';
  setTabletMode: (m: 'off' | 'signing' | 'done') => void;
  assinaturas: Record<number, string>;
  saveAssinatura: (id: number, dataUrl: string) => void;

  // Novo pacote
  novoPacoteQtd: number;
  setNovoPacoteQtd: (n: number) => void;

  // Tipos
  tipos: TipoConsulta[];
  addTipo: (t: Omit<TipoConsulta, 'id'>) => void;
  updateTipo: (id: number, patch: Partial<TipoConsulta>) => void;
  removeTipo: (id: number) => void;

  // Relatorio
  periodo: Periodo;
  setPeriodo: (p: Periodo) => void;

  // Chat
  chat: ChatMessage[];
  chatBusy: boolean;
  addChatMessage: (m: ChatMessage) => void;
  setChatBusy: (b: boolean) => void;

  // Toast
  toast: string | null;
  showToast: (msg: string) => void;
  _toastTimer: ReturnType<typeof setTimeout> | null;
}

export const useStore = create<StoreState>((set, get) => ({
  isLoggedIn: false,
  role: 'recepcao',
  loginRole: 'recepcao',
  setLoginRole: (r) => set({ loginRole: r }),
  login: () => set({ isLoggedIn: true, role: get().loginRole }),
  logout: () => set({ isLoggedIn: false, tab: 'dashboard', selectedId: null, selectedRep: null, tabletMode: 'off' }),

  tab: 'dashboard',
  setTab: (t) => set({ tab: t }),

  consultas: CONSULTAS_HOJE,
  filter: 'todas',
  setFilter: (f) => set({ filter: f }),
  patchConsulta: (id, patch) =>
    set((s) => ({ consultas: s.consultas.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  selectedId: null,
  selectedRep: null,
  selectConsulta: (id) => set({ selectedId: id, selectedRep: null, tab: id !== null ? 'detail' : 'dashboard' }),
  selectRep: (c) => set({ selectedRep: c, selectedId: null, tab: c !== null ? 'detail' : 'relatorio' }),

  tabletMode: 'off',
  setTabletMode: (m) => set({ tabletMode: m }),
  assinaturas: {},
  saveAssinatura: (id, dataUrl) =>
    set((s) => ({ assinaturas: { ...s.assinaturas, [id]: dataUrl } })),

  novoPacoteQtd: 10,
  setNovoPacoteQtd: (n) => set({ novoPacoteQtd: n }),

  tipos: TIPOS_CONSULTA,
  addTipo: (t) =>
    set((s) => ({ tipos: [...s.tipos, { ...t, id: Date.now() }] })),
  updateTipo: (id, patch) =>
    set((s) => ({ tipos: s.tipos.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  removeTipo: (id) =>
    set((s) => ({ tipos: s.tipos.filter((t) => t.id !== id) })),

  periodo: 'mes',
  setPeriodo: (p) => set({ periodo: p }),

  chat: [{ role: 'assistant', text: '✦ Olá! Sou a Vera! Pergunte qualquer informação sobre seu negócio que te respondo!' }],
  chatBusy: false,
  addChatMessage: (m) => set((s) => ({ chat: [...s.chat, m] })),
  setChatBusy: (b) => set({ chatBusy: b }),

  toast: null,
  _toastTimer: null,
  showToast: (msg) => {
    const timer = get()._toastTimer;
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => set({ toast: null, _toastTimer: null }), 3800);
    set({ toast: msg, _toastTimer: newTimer });
  },
}));
