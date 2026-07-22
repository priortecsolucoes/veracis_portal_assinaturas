import { Appointment, AppointmentType, SharedFile, User, ActionLog, Group, Tab } from './types';

// ---------------------------------------------------------------------------
// Specialty → procedure codes (CBO for Consulta; TUS for SADT)
// ---------------------------------------------------------------------------
export const SPECIALTY_CODES: Record<string, { cbo: string; tus: string }> = {
  'Cardiologia':        { cbo: '225135', tus: '10101012' },
  'Ortopedia':          { cbo: '225155', tus: '10101012' },
  'Fisioterapia':       { cbo: '223605', tus: '50000470' },
  'Ultrassonografia':   { cbo: '225120', tus: '40901220' },
  'Dermatologia':       { cbo: '225240', tus: '10101012' },
  'Urologia':           { cbo: '225250', tus: '10101012' },
  'Pediatria':          { cbo: '225175', tus: '10101012' },
  'Endocrinologia':     { cbo: '225170', tus: '10101012' },
  'Psicologia':         { cbo: '251510', tus: '50000462' },
  'Nutrição':           { cbo: '223710', tus: '50000454' },
};

// ---------------------------------------------------------------------------
// Today's appointments — completed:true migrated to status:'atendido'
// ---------------------------------------------------------------------------
export const TODAY_APPOINTMENTS: Appointment[] = [
  { id:1,  time:'07:30', patient:'Ana Lúcia Ferreira',        insuranceCard:'0034 8891 2201', doctor:'Dra. Laila Santa Bárbara', specialty:'Cardiologia',      serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'784120', status:'atendido',   referral:null },
  { id:2,  time:'08:00', patient:'José Carlos Menezes',       insuranceCard:'0034 5120 8834', doctor:'Dr. Rodrigo Lazzarini',    specialty:'Ortopedia',        serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'784131', status:'signed',     referral:null },
  { id:3,  time:'08:30', patient:'Maria Aparecida Souza',     insuranceCard:'0034 7745 0192', doctor:'Tharley Jean',             specialty:'Fisioterapia',     serviceType:'Terapia',  requiresFacial:true,  authorizationNumber:'784142', status:'authorized', referral:{ fileName:'encaminhamento-fisioterapia-maria.pdf', used:7, total:10 } },
  { id:4,  time:'09:15', patient:'Pedro Henrique Alves',      insuranceCard:'0034 3308 6617', doctor:'Jessé Bárbara',            specialty:'Ultrassonografia', serviceType:'Exame',    requiresFacial:false, authorizationNumber:'784156', status:'facial',     referral:{ fileName:'encaminhamento-ultrassom-pedro.pdf', used:1, total:1 } },
  { id:5,  time:'10:00', patient:'Francisca das Chagas Lima', insuranceCard:'0034 9012 4478', doctor:'Dra. Marina Lages',        specialty:'Dermatologia',     serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'784163', status:'facial',     referral:null },
  { id:6,  time:'10:30', patient:'Carlos Eduardo Ramos',      insuranceCard:'0034 6633 1902', doctor:'Dr. Fernando Peixoto',     specialty:'Urologia',         serviceType:'Consulta', requiresFacial:true,  authorizationNumber:null,     status:'facial',     referral:null },
  { id:7,  time:'11:00', patient:'Luana Beatriz Santos',      insuranceCard:'0034 2210 7743', doctor:'Dra. Gabriela Duarte',     specialty:'Pediatria',        serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'784177', status:'facial',     referral:null },
  { id:8,  time:'13:30', patient:'Antônio Geraldo Pires',     insuranceCard:'0034 4419 5560', doctor:'Rejanny Duque',            specialty:'Fisioterapia',     serviceType:'Terapia',  requiresFacial:true,  authorizationNumber:null,     status:'facial',     referral:{ fileName:'encaminhamento-fisioterapia-antonio.pdf', used:10, total:10 } },
  { id:9,  time:'14:00', patient:'Rita de Cássia Moreira',    insuranceCard:'0034 1187 3325', doctor:'Dra. Letícia Vieira',      specialty:'Endocrinologia',   serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'784185', status:'atendido',   referral:null },
];

export const APPOINTMENT_TYPES: AppointmentType[] = [
  { id:1, name:'Consulta médica',       cbo:'225125', tus:'10101012', rate:88  },
  { id:2, name:'Fisioterapia — sessão', cbo:'223605', tus:'50000470', rate:45  },
  { id:3, name:'Psicologia — sessão',   cbo:'251510', tus:'50000462', rate:60  },
  { id:4, name:'Nutrição — consulta',   cbo:'223710', tus:'50000454', rate:60  },
  { id:5, name:'Ultrassonografia',      cbo:'225120', tus:'40901220', rate:120 },
];

function isoAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function labelAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('pt-BR');
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });
}

export const SHARED_FILES_MOCK: SharedFile[] = [
  { id:1, provider:'Dr. Rodrigo Lazzarini',    appointmentLabel:`${daysAgo(1)} · Marcos Vinícius Carvalho · Ortopedia`,    postedAt:isoAgo(1), postedAtLabel:labelAgo(1), fileName:'guia-marcos-ortopedia.pdf',     fileType:'pdf', fileDataUrl:null },
  { id:2, provider:'Dra. Laila Santa Bárbara', appointmentLabel:`${daysAgo(1)} · Beatriz Oliveira · Cardiologia`,           postedAt:isoAgo(1), postedAtLabel:labelAgo(1), fileName:'resultado-ecg-beatriz.png',      fileType:'png', fileDataUrl:null },
  { id:3, provider:'Tharley Jean',             appointmentLabel:`${daysAgo(3)} · Raimundo Nonato Silva · Fisioterapia`,     postedAt:isoAgo(3), postedAtLabel:labelAgo(3), fileName:'evolucao-fisio-raimundo.pdf',    fileType:'pdf', fileDataUrl:null },
  { id:4, provider:'Jessé Bárbara',            appointmentLabel:`${daysAgo(5)} · Edilson Brito · Ultrassonografia`,         postedAt:isoAgo(5), postedAtLabel:labelAgo(5), fileName:'laudo-ultrassom-edilson.pdf',    fileType:'pdf', fileDataUrl:null },
  { id:5, provider:'Dra. Marina Lages',        appointmentLabel:`${daysAgo(7)} · Cristiane Nunes · Dermatologia`,           postedAt:isoAgo(7), postedAtLabel:labelAgo(7), fileName:'foto-lesao-cristiane.png',       fileType:'png', fileDataUrl:null },
];

// completed:true migrated to status:'atendido'
export const HISTORY: Appointment[] = [
  { id:101, time:'08:00', date:daysAgo(1),  patient:'Marcos Vinícius Carvalho', insuranceCard:'0034 1122 3344', doctor:'Dr. Rodrigo Lazzarini',    specialty:'Ortopedia',        serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783901', status:'atendido',  referral:null },
  { id:102, time:'09:30', date:daysAgo(1),  patient:'Beatriz Oliveira',          insuranceCard:'0034 5566 7788', doctor:'Dra. Laila Santa Bárbara', specialty:'Cardiologia',      serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783912', status:'atendido',  referral:null },
  { id:103, time:'10:00', date:daysAgo(1),  patient:'Raimundo Nonato Silva',     insuranceCard:'0034 9900 1122', doctor:'Tharley Jean',             specialty:'Fisioterapia',     serviceType:'Terapia',  requiresFacial:true,  authorizationNumber:'783920', status:'signed',    referral:{ fileName:'enc-fisio.pdf', used:5, total:10 } },
  { id:104, time:'14:00', date:daysAgo(2),  patient:'Cristiane Nunes',           insuranceCard:'0034 3344 5566', doctor:'Dra. Marina Lages',        specialty:'Dermatologia',     serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783800', status:'cancelled', referral:null },
  { id:105, time:'08:30', date:daysAgo(3),  patient:'Edilson Brito',             insuranceCard:'0034 7788 9900', doctor:'Jessé Bárbara',            specialty:'Ultrassonografia', serviceType:'Exame',    requiresFacial:false, authorizationNumber:'783750', status:'atendido',  referral:{ fileName:'enc-eco.pdf', used:1, total:1 } },
  { id:106, time:'11:00', date:daysAgo(3),  patient:'Sueli Aparecida Costa',     insuranceCard:'0034 2233 4455', doctor:'Dr. Fernando Peixoto',     specialty:'Urologia',         serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783762', status:'atendido',  referral:null },
  { id:107, time:'09:00', date:daysAgo(5),  patient:'Wanderson Alves',           insuranceCard:'0034 6677 8899', doctor:'Rejanny Duque',            specialty:'Fisioterapia',     serviceType:'Terapia',  requiresFacial:true,  authorizationNumber:'783600', status:'atendido',  referral:{ fileName:'enc-wander.pdf', used:8, total:10 } },
  { id:108, time:'15:00', date:daysAgo(7),  patient:'Neusa Ribeiro Fonseca',     insuranceCard:'0034 8899 0011', doctor:'Dra. Gabriela Duarte',     specialty:'Pediatria',        serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783450', status:'atendido',  referral:null },
  { id:109, time:'10:30', date:daysAgo(10), patient:'Elias Ferreira da Cruz',    insuranceCard:'0034 1100 2211', doctor:'Dra. Letícia Vieira',      specialty:'Endocrinologia',   serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783200', status:'cancelled', referral:null },
  { id:110, time:'08:00', date:daysAgo(12), patient:'Miriam Santos Pereira',     insuranceCard:'0034 3322 1100', doctor:'Tharley Jean',             specialty:'Fisioterapia',     serviceType:'Terapia',  requiresFacial:true,  authorizationNumber:'783100', status:'atendido',  referral:{ fileName:'enc-mir.pdf', used:3, total:10 } },
  { id:111, time:'09:45', date:daysAgo(15), patient:'Jonathas Lima Barreto',     insuranceCard:'0034 5544 3322', doctor:'Dr. Rodrigo Lazzarini',    specialty:'Ortopedia',        serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783000', status:'atendido',  referral:null },
  { id:112, time:'11:30', date:daysAgo(20), patient:'Adriana Conceição Matos',   insuranceCard:'0034 7766 5544', doctor:'Dra. Laila Santa Bárbara', specialty:'Cardiologia',      serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'782800', status:'signed',    referral:null },
  // RN-05 demo: Maria Aparecida Souza fez Fisioterapia há 15 dias → hoje (id:3) será destacada
  { id:113, time:'08:30', date:daysAgo(15), patient:'Maria Aparecida Souza',     insuranceCard:'0034 7745 0192', doctor:'Tharley Jean',             specialty:'Fisioterapia',     serviceType:'Terapia',  requiresFacial:true,  authorizationNumber:'782500', status:'atendido',  referral:{ fileName:'enc-fisio-maria-ant.pdf', used:10, total:10 } },
  // Pendentes do Passado: ficaram sem resolução nos dias anteriores
  { id:114, time:'09:00', date:daysAgo(1),  patient:'Paulo Roberto Santos',      insuranceCard:'0034 8811 0022', doctor:'Dra. Laila Santa Bárbara', specialty:'Cardiologia',      serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'785001', status:'facial',    referral:null },
  { id:115, time:'10:00', date:daysAgo(2),  patient:'Sônia Melo Braga',          insuranceCard:'0034 4422 9933', doctor:'Dra. Gabriela Duarte',     specialty:'Psicologia',       serviceType:'Terapia',  requiresFacial:true,  authorizationNumber:'784900', status:'authorized', referral:{ fileName:'enc-psico-sonia.pdf', used:3, total:10 } },
];

// ---------------------------------------------------------------------------
// Groups (A-03) — define which tabs each group can access
// ---------------------------------------------------------------------------
const RECEPTION_TABS: Tab[] = ['dashboard', 'reports', 'files'];
const BILLING_TABS: Tab[]   = ['dashboard', 'reports', 'files', 'types', 'users', 'groups', 'history', 'settings'];

export const MOCK_GROUPS: Group[] = [
  { id:1, name:'Recepção',    description:'Acesso à agenda do dia, relatórios e compartilhamento de arquivos.', allowedTabs: RECEPTION_TABS },
  { id:2, name:'Faturamento', description:'Acesso completo: agenda, relatórios, tipos de consulta, usuários e configurações.', allowedTabs: BILLING_TABS },
];

// ---------------------------------------------------------------------------
// Mock users (D-02) — using groupId
// ---------------------------------------------------------------------------
function tsAgo(daysBack: number, hour: string): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  const [h, m] = hour.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const MOCK_USERS: User[] = [
  { id:1, name:'Beth Faturamento',     login:'beth@clinicaveracis.com.br',       password:'••••••••', groupId:2, status:'active'   },
  { id:2, name:'Recepção',             login:'recepcao@clinicaveracis.com.br',   password:'••••••••', groupId:1, status:'active'   },
  { id:3, name:'Natália Recepção',     login:'natalia@clinicaveracis.com.br',    password:'••••••••', groupId:1, status:'active'   },
  { id:4, name:'Fernanda Faturamento', login:'fernanda@clinicaveracis.com.br',   password:'••••••••', groupId:2, status:'inactive' },
];

// ---------------------------------------------------------------------------
// Mock action logs (D-03)
// ---------------------------------------------------------------------------
export const MOCK_ACTION_LOGS: ActionLog[] = [
  { id:1,  login:'recepcao@clinicaveracis.com.br', action:'Login no sistema',                                          timestamp: tsAgo(0,  '07:01') },
  { id:2,  login:'recepcao@clinicaveracis.com.br', action:'Nº pedido 784120 vinculado a Ana Lúcia Ferreira',          timestamp: tsAgo(0,  '07:25') },
  { id:3,  login:'recepcao@clinicaveracis.com.br', action:'Guia 784120 baixada do TopSaúde (Ana Lúcia Ferreira)',     timestamp: tsAgo(0,  '07:28') },
  { id:4,  login:'recepcao@clinicaveracis.com.br', action:'Assinatura coletada — Ana Lúcia Ferreira',                 timestamp: tsAgo(0,  '07:32') },
  { id:5,  login:'recepcao@clinicaveracis.com.br', action:'Consulta marcada como Atendida — Ana Lúcia Ferreira',      timestamp: tsAgo(0,  '09:10') },
  { id:6,  login:'recepcao@clinicaveracis.com.br', action:'Nº pedido 784131 vinculado a José Carlos Menezes',        timestamp: tsAgo(0,  '07:55') },
  { id:7,  login:'recepcao@clinicaveracis.com.br', action:'Guia 784131 baixada do TopSaúde (José Carlos Menezes)',   timestamp: tsAgo(0,  '07:58') },
  { id:8,  login:'recepcao@clinicaveracis.com.br', action:'Assinatura coletada — José Carlos Menezes',               timestamp: tsAgo(0,  '08:03') },
  { id:9,  login:'beth@clinicaveracis.com.br',     action:'Login no sistema',                                         timestamp: tsAgo(0,  '08:00') },
  { id:10, login:'beth@clinicaveracis.com.br',     action:'Tipo de consulta adicionado: Fonoaudiologia — sessão',    timestamp: tsAgo(0,  '08:15') },
  { id:11, login:'recepcao@clinicaveracis.com.br', action:'Guia de Carlos Eduardo Ramos cancelada',                  timestamp: tsAgo(1,  '11:05') },
  { id:12, login:'recepcao@clinicaveracis.com.br', action:'Arquivo postado: evolucao-fisio-raimundo.pdf',            timestamp: tsAgo(3,  '10:30') },
  { id:13, login:'beth@clinicaveracis.com.br',     action:'Valor do tipo Fisioterapia — sessão atualizado: R$ 47,00',timestamp: tsAgo(5,  '14:22') },
  { id:14, login:'recepcao@clinicaveracis.com.br', action:'Assinatura em papel registrada — Wanderson Alves',        timestamp: tsAgo(5,  '09:08') },
  { id:15, login:'beth@clinicaveracis.com.br',     action:'Configurações salvas: tempo de sincronização FeeGow',     timestamp: tsAgo(7,  '08:05') },
];
