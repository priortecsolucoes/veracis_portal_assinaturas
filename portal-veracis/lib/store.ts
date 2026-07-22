import { create } from 'zustand';
import { Appointment, AppointmentType, SharedFile, ChatMessage, Tab, Filter, Period, Role, User, Group, ActionLog, SystemSettings } from './types';
import { TODAY_APPOINTMENTS, APPOINTMENT_TYPES, SHARED_FILES_MOCK, MOCK_USERS, MOCK_GROUPS, MOCK_ACTION_LOGS } from './mock-data';

interface StoreState {
  // Auth
  isLoggedIn: boolean;
  role: Role;
  userId: string;
  allowedTabs: Tab[];
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

  // Users (D-02)
  users: User[];
  addUser: (u: Omit<User, 'id'>) => void;
  updateUser: (id: number, patch: Partial<User>) => void;
  removeUser: (id: number) => void;

  // Groups (A-03)
  groups: Group[];
  addGroup: (g: Omit<Group, 'id'>) => void;
  updateGroup: (id: number, patch: Partial<Group>) => void;
  removeGroup: (id: number) => void;

  // Action logs (D-03)
  actionLogs: ActionLog[];
  logAction: (action: string) => void;

  // Settings (D-12)
  settings: SystemSettings;
  updateSettings: (patch: Partial<SystemSettings>) => void;

  // Toast
  toast: string | null;
  showToast: (msg: string) => void;
  _toastTimer: ReturnType<typeof setTimeout> | null;
}

export const useStore = create<StoreState>((set, get) => ({
  isLoggedIn: false,
  role: 'reception',
  userId: '',
  allowedTabs: [],
  loginRole: 'reception',
  setLoginRole: (r) => set({ loginRole: r }),
  login: () => {
    const { loginRole, groups, users } = get();
    const role = loginRole;
    const userId = role === 'billing' ? 'beth@clinicaveracis.com.br' : 'recepcao@clinicaveracis.com.br';
    const user = users.find((u) => u.login === userId);
    const group = user ? groups.find((g) => g.id === user.groupId) : undefined;
    const allowedTabs: Tab[] = group ? group.allowedTabs : (role === 'billing' ? ['dashboard','reports','files','types','users','groups','history','settings'] : ['dashboard','reports','files']);
    set({ isLoggedIn: true, role, userId, allowedTabs });
    get().logAction('Login no sistema');
  },
  logout: () => {
    get().logAction('Logout do sistema');
    set({
      isLoggedIn: false,
      userId: '',
      allowedTabs: [],
      tab: 'dashboard',
      selectedId: null,
      selectedRep: null,
      tabletMode: 'off',
      remoteSignAppointmentId: null,
      devicesOnline: 0,
    });
  },

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

  users: MOCK_USERS,
  addUser: (u) =>
    set((s) => ({ users: [...s.users, { ...u, id: Date.now() }] })),
  updateUser: (id, patch) =>
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
  removeUser: (id) =>
    set((s) => ({ users: s.users.filter((u) => u.id !== id) })),

  groups: MOCK_GROUPS,
  addGroup: (g) =>
    set((s) => ({ groups: [...s.groups, { ...g, id: Date.now() }] })),
  updateGroup: (id, patch) =>
    set((s) => ({ groups: s.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
  removeGroup: (id) =>
    set((s) => ({ groups: s.groups.filter((g) => g.id !== id) })),

  actionLogs: MOCK_ACTION_LOGS,
  logAction: (action) => {
    const { userId } = get();
    const entry: ActionLog = {
      id: Date.now(),
      login: userId || 'sistema',
      action,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({ actionLogs: [entry, ...s.actionLogs] }));
  },

  settings: {
    rtSignatureDataUrl: null,
    syncIntervalMinutes: 30,
    feegowApiKey: '',
    topsaudeUser: '',
    topsaudePassword: '',
  },
  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),

  toast: null,
  _toastTimer: null,
  showToast: (msg) => {
    const timer = get()._toastTimer;
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => set({ toast: null, _toastTimer: null }), 3800);
    set({ toast: msg, _toastTimer: newTimer });
  },
}));
