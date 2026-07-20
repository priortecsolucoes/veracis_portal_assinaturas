import { create } from 'zustand';
import { Appointment, AppointmentType, SharedFile, ChatMessage, Tab, Filter, Period, Role } from './types';
import { TODAY_APPOINTMENTS, APPOINTMENT_TYPES, SHARED_FILES_MOCK } from './mock-data';

interface StoreState {
  // Auth
  isLoggedIn: boolean;
  role: Role;
  userId: string;
  loginRole: Role;
  setLoginRole: (r: Role) => void;
  login: () => void;
  logout: () => void;

  // Navigation
  tab: Tab;
  setTab: (t: Tab) => void;

  // Agenda
  appointments: Appointment[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  patchAppointment: (id: number, patch: Partial<Appointment>) => void;

  // Detail
  selectedId: number | null;
  selectedRep: Appointment | null;
  selectAppointment: (id: number | null) => void;
  selectRep: (c: Appointment | null) => void;

  // Tablet signature mode
  // 'off'     — normal state
  // 'signing' — this device shows the canvas signing screen
  // 'done'    — signing completed locally, showing success screen
  // 'remote'  — desktop waiting for the tablet to sign (shows overlay)
  tabletMode: 'off' | 'signing' | 'done' | 'remote';
  setTabletMode: (m: 'off' | 'signing' | 'done' | 'remote') => void;
  signatures: Record<number, string>;
  saveSignature: (id: number, dataUrl: string) => void;

  // Remote signing coordination
  remoteSignAppointmentId: number | null;
  startRemoteSigning: (appointmentId: number) => void;
  clearRemoteSigning: () => void;

  // Peer presence (from Socket.IO 'presence' event)
  devicesOnline: number;
  setDevicesOnline: (n: number) => void;

  // Session package
  newPackageCount: number;
  setNewPackageCount: (n: number) => void;

  // Appointment types
  appointmentTypes: AppointmentType[];
  addAppointmentType: (t: Omit<AppointmentType, 'id'>) => void;
  updateAppointmentType: (id: number, patch: Partial<AppointmentType>) => void;
  removeAppointmentType: (id: number) => void;

  // File sharing
  sharedFiles: SharedFile[];
  addSharedFile: (p: Omit<SharedFile, 'id'>) => void;
  removeSharedFile: (id: number) => void;

  // Reports
  period: Period;
  setPeriod: (p: Period) => void;

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
  role: 'reception',
  userId: '',
  loginRole: 'reception',
  setLoginRole: (r) => set({ loginRole: r }),
  login: () => set({ isLoggedIn: true, role: get().loginRole, userId: get().loginRole }),
  logout: () => set({
    isLoggedIn: false,
    userId: '',
    tab: 'dashboard',
    selectedId: null,
    selectedRep: null,
    tabletMode: 'off',
    remoteSignAppointmentId: null,
    devicesOnline: 0,
  }),

  tab: 'dashboard',
  setTab: (t) => set({ tab: t }),

  appointments: TODAY_APPOINTMENTS,
  filter: 'all',
  setFilter: (f) => set({ filter: f }),
  patchAppointment: (id, patch) =>
    set((s) => ({ appointments: s.appointments.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  selectedId: null,
  selectedRep: null,
  selectAppointment: (id) => set({ selectedId: id, selectedRep: null, tab: id !== null ? 'detail' : 'dashboard' }),
  selectRep: (c) => set({ selectedRep: c, selectedId: null, tab: c !== null ? 'detail' : 'reports' }),

  tabletMode: 'off',
  setTabletMode: (m) => set({ tabletMode: m }),
  signatures: {},
  saveSignature: (id, dataUrl) =>
    set((s) => ({ signatures: { ...s.signatures, [id]: dataUrl } })),

  remoteSignAppointmentId: null,
  startRemoteSigning: (appointmentId) => set({ tabletMode: 'remote', remoteSignAppointmentId: appointmentId }),
  clearRemoteSigning: () => set({ tabletMode: 'off', remoteSignAppointmentId: null }),

  devicesOnline: 0,
  setDevicesOnline: (n) => set({ devicesOnline: n }),

  newPackageCount: 10,
  setNewPackageCount: (n) => set({ newPackageCount: n }),

  appointmentTypes: APPOINTMENT_TYPES,
  addAppointmentType: (t) =>
    set((s) => ({ appointmentTypes: [...s.appointmentTypes, { ...t, id: Date.now() }] })),
  updateAppointmentType: (id, patch) =>
    set((s) => ({ appointmentTypes: s.appointmentTypes.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  removeAppointmentType: (id) =>
    set((s) => ({ appointmentTypes: s.appointmentTypes.filter((t) => t.id !== id) })),

  sharedFiles: SHARED_FILES_MOCK,
  addSharedFile: (p) =>
    set((s) => ({ sharedFiles: [{ ...p, id: Date.now() }, ...s.sharedFiles] })),
  removeSharedFile: (id) =>
    set((s) => ({ sharedFiles: s.sharedFiles.filter((p) => p.id !== id) })),

  period: 'month',
  setPeriod: (p) => set({ period: p }),

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
