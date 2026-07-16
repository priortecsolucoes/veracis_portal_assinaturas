import { Consulta, TipoConsulta } from './types';

export const CONSULTAS_HOJE: Consulta[] = [
  { id:1,  hora:'07:30', paciente:'Ana Lúcia Ferreira',        carteira:'0034 8891 2201', medico:'Dra. Laila Santa Bárbara', especialidade:'Cardiologia',      tipo:'Consulta', exigeFacial:true,  pedido:'784120', status:'assinado',   realizada:true,  enc:null },
  { id:2,  hora:'08:00', paciente:'José Carlos Menezes',       carteira:'0034 5120 8834', medico:'Dr. Rodrigo Lazzarini',    especialidade:'Ortopedia',        tipo:'Consulta', exigeFacial:true,  pedido:'784131', status:'assinado',   realizada:false, enc:null },
  { id:3,  hora:'08:30', paciente:'Maria Aparecida Souza',     carteira:'0034 7745 0192', medico:'Tharley Jean',             especialidade:'Fisioterapia',     tipo:'Terapia',  exigeFacial:true,  pedido:'784142', status:'autorizado', realizada:false, enc:{ arquivo:'encaminhamento-fisioterapia-maria.pdf', usadas:7, total:10 } },
  { id:4,  hora:'09:15', paciente:'Pedro Henrique Alves',      carteira:'0034 3308 6617', medico:'Jessé Bárbara',            especialidade:'Ultrassonografia', tipo:'Exame',    exigeFacial:false, pedido:'784156', status:'facial',     realizada:false, enc:{ arquivo:'encaminhamento-ultrassom-pedro.pdf', usadas:1, total:1 } },
  { id:5,  hora:'10:00', paciente:'Francisca das Chagas Lima', carteira:'0034 9012 4478', medico:'Dra. Marina Lages',        especialidade:'Dermatologia',     tipo:'Consulta', exigeFacial:true,  pedido:'784163', status:'facial',     realizada:false, enc:null },
  { id:6,  hora:'10:30', paciente:'Carlos Eduardo Ramos',      carteira:'0034 6633 1902', medico:'Dr. Fernando Peixoto',     especialidade:'Urologia',         tipo:'Consulta', exigeFacial:true,  pedido:null,     status:'facial',     realizada:false, enc:null },
  { id:7,  hora:'11:00', paciente:'Luana Beatriz Santos',      carteira:'0034 2210 7743', medico:'Dra. Gabriela Duarte',     especialidade:'Pediatria',        tipo:'Consulta', exigeFacial:true,  pedido:'784177', status:'facial',     realizada:false, enc:null },
  { id:8,  hora:'13:30', paciente:'Antônio Geraldo Pires',     carteira:'0034 4419 5560', medico:'Rejanny Duque',            especialidade:'Fisioterapia',     tipo:'Terapia',  exigeFacial:true,  pedido:null,     status:'facial',     realizada:false, enc:{ arquivo:'encaminhamento-fisioterapia-antonio.pdf', usadas:10, total:10 } },
  { id:9,  hora:'14:00', paciente:'Rita de Cássia Moreira',    carteira:'0034 1187 3325', medico:'Dra. Letícia Vieira',      especialidade:'Endocrinologia',   tipo:'Consulta', exigeFacial:true,  pedido:'784185', status:'autorizado', realizada:true,  enc:null },
];

export const TIPOS_CONSULTA: TipoConsulta[] = [
  { id:1, nome:'Consulta médica',       cbo:'225125', tus:'10101012', valor:88  },
  { id:2, nome:'Fisioterapia — sessão', cbo:'223605', tus:'50000470', valor:45  },
  { id:3, nome:'Psicologia — sessão',   cbo:'251510', tus:'50000462', valor:60  },
  { id:4, nome:'Nutrição — consulta',   cbo:'223710', tus:'50000454', valor:60  },
  { id:5, nome:'Ultrassonografia',      cbo:'225120', tus:'40901220', valor:120 },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });
}

export const HISTORICO: Consulta[] = [
  { id:101, hora:'08:00', data:daysAgo(1),  paciente:'Marcos Vinícius Carvalho', carteira:'0034 1122 3344', medico:'Dr. Rodrigo Lazzarini',    especialidade:'Ortopedia',     tipo:'Consulta', exigeFacial:true,  pedido:'783901', status:'assinado', realizada:true,  enc:null },
  { id:102, hora:'09:30', data:daysAgo(1),  paciente:'Beatriz Oliveira',          carteira:'0034 5566 7788', medico:'Dra. Laila Santa Bárbara', especialidade:'Cardiologia',   tipo:'Consulta', exigeFacial:true,  pedido:'783912', status:'assinado', realizada:true,  enc:null },
  { id:103, hora:'10:00', data:daysAgo(1),  paciente:'Raimundo Nonato Silva',     carteira:'0034 9900 1122', medico:'Tharley Jean',             especialidade:'Fisioterapia',  tipo:'Terapia',  exigeFacial:true,  pedido:'783920', status:'assinado', realizada:false, enc:{ arquivo:'enc-fisio.pdf', usadas:5, total:10 } },
  { id:104, hora:'14:00', data:daysAgo(2),  paciente:'Cristiane Nunes',           carteira:'0034 3344 5566', medico:'Dra. Marina Lages',        especialidade:'Dermatologia',  tipo:'Consulta', exigeFacial:true,  pedido:'783800', status:'cancelado', realizada:false, enc:null },
  { id:105, hora:'08:30', data:daysAgo(3),  paciente:'Edilson Brito',             carteira:'0034 7788 9900', medico:'Jessé Bárbara',            especialidade:'Ultrassonografia', tipo:'Exame', exigeFacial:false, pedido:'783750', status:'assinado', realizada:true,  enc:{ arquivo:'enc-eco.pdf', usadas:1, total:1 } },
  { id:106, hora:'11:00', data:daysAgo(3),  paciente:'Sueli Aparecida Costa',     carteira:'0034 2233 4455', medico:'Dr. Fernando Peixoto',     especialidade:'Urologia',      tipo:'Consulta', exigeFacial:true,  pedido:'783762', status:'assinado', realizada:true,  enc:null },
  { id:107, hora:'09:00', data:daysAgo(5),  paciente:'Wanderson Alves',           carteira:'0034 6677 8899', medico:'Rejanny Duque',            especialidade:'Fisioterapia',  tipo:'Terapia',  exigeFacial:true,  pedido:'783600', status:'assinado', realizada:true,  enc:{ arquivo:'enc-wander.pdf', usadas:8, total:10 } },
  { id:108, hora:'15:00', data:daysAgo(7),  paciente:'Neusa Ribeiro Fonseca',     carteira:'0034 8899 0011', medico:'Dra. Gabriela Duarte',     especialidade:'Pediatria',     tipo:'Consulta', exigeFacial:true,  pedido:'783450', status:'assinado', realizada:true,  enc:null },
  { id:109, hora:'10:30', data:daysAgo(10), paciente:'Elias Ferreira da Cruz',    carteira:'0034 1100 2211', medico:'Dra. Letícia Vieira',      especialidade:'Endocrinologia', tipo:'Consulta', exigeFacial:true, pedido:'783200', status:'cancelado', realizada:false, enc:null },
  { id:110, hora:'08:00', data:daysAgo(12), paciente:'Miriam Santos Pereira',     carteira:'0034 3322 1100', medico:'Tharley Jean',             especialidade:'Fisioterapia',  tipo:'Terapia',  exigeFacial:true,  pedido:'783100', status:'assinado', realizada:true,  enc:{ arquivo:'enc-mir.pdf', usadas:3, total:10 } },
  { id:111, hora:'09:45', data:daysAgo(15), paciente:'Jonathas Lima Barreto',     carteira:'0034 5544 3322', medico:'Dr. Rodrigo Lazzarini',    especialidade:'Ortopedia',     tipo:'Consulta', exigeFacial:true,  pedido:'783000', status:'assinado', realizada:true,  enc:null },
  { id:112, hora:'11:30', data:daysAgo(20), paciente:'Adriana Conceição Matos',   carteira:'0034 7766 5544', medico:'Dra. Laila Santa Bárbara', especialidade:'Cardiologia',   tipo:'Consulta', exigeFacial:true,  pedido:'782800', status:'assinado', realizada:false, enc:null },
];
