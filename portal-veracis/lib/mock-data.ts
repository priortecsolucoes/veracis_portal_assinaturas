import { Appointment, AppointmentType, SharedFile } from './types';

export const TODAY_APPOINTMENTS: Appointment[] = [
  { id:1,  time:'07:30', patient:'Ana Lúcia Ferreira',        insuranceCard:'0034 8891 2201', doctor:'Dra. Laila Santa Bárbara', specialty:'Cardiologia',      serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'784120', status:'signed',     completed:true,  referral:null },
  { id:2,  time:'08:00', patient:'José Carlos Menezes',       insuranceCard:'0034 5120 8834', doctor:'Dr. Rodrigo Lazzarini',    specialty:'Ortopedia',        serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'784131', status:'signed',     completed:false, referral:null },
  { id:3,  time:'08:30', patient:'Maria Aparecida Souza',     insuranceCard:'0034 7745 0192', doctor:'Tharley Jean',             specialty:'Fisioterapia',     serviceType:'Terapia',  requiresFacial:true,  authorizationNumber:'784142', status:'authorized', completed:false, referral:{ fileName:'encaminhamento-fisioterapia-maria.pdf', used:7, total:10 } },
  { id:4,  time:'09:15', patient:'Pedro Henrique Alves',      insuranceCard:'0034 3308 6617', doctor:'Jessé Bárbara',            specialty:'Ultrassonografia', serviceType:'Exame',    requiresFacial:false, authorizationNumber:'784156', status:'facial',     completed:false, referral:{ fileName:'encaminhamento-ultrassom-pedro.pdf', used:1, total:1 } },
  { id:5,  time:'10:00', patient:'Francisca das Chagas Lima', insuranceCard:'0034 9012 4478', doctor:'Dra. Marina Lages',        specialty:'Dermatologia',     serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'784163', status:'facial',     completed:false, referral:null },
  { id:6,  time:'10:30', patient:'Carlos Eduardo Ramos',      insuranceCard:'0034 6633 1902', doctor:'Dr. Fernando Peixoto',     specialty:'Urologia',         serviceType:'Consulta', requiresFacial:true,  authorizationNumber:null,     status:'facial',     completed:false, referral:null },
  { id:7,  time:'11:00', patient:'Luana Beatriz Santos',      insuranceCard:'0034 2210 7743', doctor:'Dra. Gabriela Duarte',     specialty:'Pediatria',        serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'784177', status:'facial',     completed:false, referral:null },
  { id:8,  time:'13:30', patient:'Antônio Geraldo Pires',     insuranceCard:'0034 4419 5560', doctor:'Rejanny Duque',            specialty:'Fisioterapia',     serviceType:'Terapia',  requiresFacial:true,  authorizationNumber:null,     status:'facial',     completed:false, referral:{ fileName:'encaminhamento-fisioterapia-antonio.pdf', used:10, total:10 } },
  { id:9,  time:'14:00', patient:'Rita de Cássia Moreira',    insuranceCard:'0034 1187 3325', doctor:'Dra. Letícia Vieira',      specialty:'Endocrinologia',   serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'784185', status:'authorized', completed:true,  referral:null },
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
  {
    id: 1,
    provider: 'Dr. Rodrigo Lazzarini',
    appointmentLabel: `${daysAgo(1)} · Marcos Vinícius Carvalho · Ortopedia`,
    postedAt: isoAgo(1),
    postedAtLabel: labelAgo(1),
    fileName: 'guia-marcos-ortopedia.pdf',
    fileType: 'pdf',
    fileDataUrl: null,
  },
  {
    id: 2,
    provider: 'Dra. Laila Santa Bárbara',
    appointmentLabel: `${daysAgo(1)} · Beatriz Oliveira · Cardiologia`,
    postedAt: isoAgo(1),
    postedAtLabel: labelAgo(1),
    fileName: 'resultado-ecg-beatriz.png',
    fileType: 'png',
    fileDataUrl: null,
  },
  {
    id: 3,
    provider: 'Tharley Jean',
    appointmentLabel: `${daysAgo(3)} · Raimundo Nonato Silva · Fisioterapia`,
    postedAt: isoAgo(3),
    postedAtLabel: labelAgo(3),
    fileName: 'evolucao-fisio-raimundo.pdf',
    fileType: 'pdf',
    fileDataUrl: null,
  },
  {
    id: 4,
    provider: 'Jessé Bárbara',
    appointmentLabel: `${daysAgo(5)} · Edilson Brito · Ultrassonografia`,
    postedAt: isoAgo(5),
    postedAtLabel: labelAgo(5),
    fileName: 'laudo-ultrassom-edilson.pdf',
    fileType: 'pdf',
    fileDataUrl: null,
  },
  {
    id: 5,
    provider: 'Dra. Marina Lages',
    appointmentLabel: `${daysAgo(7)} · Cristiane Nunes · Dermatologia`,
    postedAt: isoAgo(7),
    postedAtLabel: labelAgo(7),
    fileName: 'foto-lesao-cristiane.png',
    fileType: 'png',
    fileDataUrl: null,
  },
];

export const HISTORY: Appointment[] = [
  { id:101, time:'08:00', date:daysAgo(1),  patient:'Marcos Vinícius Carvalho', insuranceCard:'0034 1122 3344', doctor:'Dr. Rodrigo Lazzarini',    specialty:'Ortopedia',     serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783901', status:'signed',    completed:true,  referral:null },
  { id:102, time:'09:30', date:daysAgo(1),  patient:'Beatriz Oliveira',          insuranceCard:'0034 5566 7788', doctor:'Dra. Laila Santa Bárbara', specialty:'Cardiologia',   serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783912', status:'signed',    completed:true,  referral:null },
  { id:103, time:'10:00', date:daysAgo(1),  patient:'Raimundo Nonato Silva',     insuranceCard:'0034 9900 1122', doctor:'Tharley Jean',             specialty:'Fisioterapia',  serviceType:'Terapia',  requiresFacial:true,  authorizationNumber:'783920', status:'signed',    completed:false, referral:{ fileName:'enc-fisio.pdf', used:5, total:10 } },
  { id:104, time:'14:00', date:daysAgo(2),  patient:'Cristiane Nunes',           insuranceCard:'0034 3344 5566', doctor:'Dra. Marina Lages',        specialty:'Dermatologia',  serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783800', status:'cancelled', completed:false, referral:null },
  { id:105, time:'08:30', date:daysAgo(3),  patient:'Edilson Brito',             insuranceCard:'0034 7788 9900', doctor:'Jessé Bárbara',            specialty:'Ultrassonografia', serviceType:'Exame', requiresFacial:false, authorizationNumber:'783750', status:'signed',    completed:true,  referral:{ fileName:'enc-eco.pdf', used:1, total:1 } },
  { id:106, time:'11:00', date:daysAgo(3),  patient:'Sueli Aparecida Costa',     insuranceCard:'0034 2233 4455', doctor:'Dr. Fernando Peixoto',     specialty:'Urologia',      serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783762', status:'signed',    completed:true,  referral:null },
  { id:107, time:'09:00', date:daysAgo(5),  patient:'Wanderson Alves',           insuranceCard:'0034 6677 8899', doctor:'Rejanny Duque',            specialty:'Fisioterapia',  serviceType:'Terapia',  requiresFacial:true,  authorizationNumber:'783600', status:'signed',    completed:true,  referral:{ fileName:'enc-wander.pdf', used:8, total:10 } },
  { id:108, time:'15:00', date:daysAgo(7),  patient:'Neusa Ribeiro Fonseca',     insuranceCard:'0034 8899 0011', doctor:'Dra. Gabriela Duarte',     specialty:'Pediatria',     serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783450', status:'signed',    completed:true,  referral:null },
  { id:109, time:'10:30', date:daysAgo(10), patient:'Elias Ferreira da Cruz',    insuranceCard:'0034 1100 2211', doctor:'Dra. Letícia Vieira',      specialty:'Endocrinologia', serviceType:'Consulta', requiresFacial:true, authorizationNumber:'783200', status:'cancelled', completed:false, referral:null },
  { id:110, time:'08:00', date:daysAgo(12), patient:'Miriam Santos Pereira',     insuranceCard:'0034 3322 1100', doctor:'Tharley Jean',             specialty:'Fisioterapia',  serviceType:'Terapia',  requiresFacial:true,  authorizationNumber:'783100', status:'signed',    completed:true,  referral:{ fileName:'enc-mir.pdf', used:3, total:10 } },
  { id:111, time:'09:45', date:daysAgo(15), patient:'Jonathas Lima Barreto',     insuranceCard:'0034 5544 3322', doctor:'Dr. Rodrigo Lazzarini',    specialty:'Ortopedia',     serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'783000', status:'signed',    completed:true,  referral:null },
  { id:112, time:'11:30', date:daysAgo(20), patient:'Adriana Conceição Matos',   insuranceCard:'0034 7766 5544', doctor:'Dra. Laila Santa Bárbara', specialty:'Cardiologia',   serviceType:'Consulta', requiresFacial:true,  authorizationNumber:'782800', status:'signed',    completed:false, referral:null },
];
