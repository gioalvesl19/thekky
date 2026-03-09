export type Company = {
  id: string;
  name: string;
  created_at: string;
};

export type UserRole = 'admin' | 'manager' | 'user';

export type Profile = {
  id: string;
  company_id: string;
  name: string;
  role: UserRole;
  created_at: string;
};

export type Area = {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
};

export type Unit = {
  id: string;
  company_id: string;
  name: string;
  city: string | null;
  state: string | null;
  active: boolean;
  created_at: string;
};

// === OCORRÊNCIAS ===

export type OccurrenceStatus = 'aberta' | 'em_analise' | 'acao_proposta' | 'em_acompanhamento' | 'encerrada' | 'eficacia_avaliada';

export type OccurrenceStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type OccurrenceType =
  | 'Conformidade'
  | 'Demanda THEKKY'
  | 'Gestão de Funcionários'
  | 'Investigação de Acidentes e Incidentes'
  | 'Mudança Inesperada'
  | 'Mudança Planejada'
  | 'Não Conformidade'
  | 'Oportunidade de Melhoria'
  | 'Reclamação de Cliente'
  | 'Auditoria Interna'
  | 'Auditoria Externa'
  | 'Outro';

export type OccurrenceOrigin =
  | 'Análise Crítica do Sistema de Gestão'
  | 'Análise de Risco'
  | 'Aspecto/Impacto Ambiental'
  | 'Atendimento ao Cliente'
  | 'Auditoria Externa'
  | 'Auditoria Interna'
  | 'Gerenciador de Tarefa'
  | 'Mudança Inesperada'
  | 'Mudança Planejada'
  | 'Oportunidades Identificadas'
  | 'Perigo/Risco em Segurança e Saúde'
  | 'Planejamento Estratégico'
  | 'Outro';

export type Occurrence = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  type: OccurrenceType;
  origin: string | null;
  origin_type: string | null;
  area: string | null;
  status: OccurrenceStatus;
  step: number;
  confidential: boolean;
  // Descrição da Ocorrência
  occurrence_date: string | null;
  report: string | null;
  reporter: string | null;
  analysis_indicated_person: string | null;
  apply_5_whys: boolean;
  // Relacionamentos
  related_people: string | null;
  related_suppliers: string | null;
  related_clients: string | null;
  applicable_requirements: string | null;
  // Análise
  analysis_type: string | null;
  analysis_description: string | null;
  related_risks: string | null;
  requires_action: boolean;
  days_open: number;
  emission_time: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ActionType =
  | 'Ação Corretiva'
  | 'Ação de Melhoria'
  | 'Ação Imediata (Disposição)'
  | 'Ação Preventiva';

export type ActionStatus = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';

export type Action = {
  id: string;
  occurrence_id: string;
  description: string;
  responsible: string;
  type: ActionType;
  status: ActionStatus;
  due_date: string | null;
  subject: string | null;
  deadline: string | null;
  extended_deadline: string | null;
  extension_justification: string | null;
  related_indicators: string | null;
  issuer: string | null;
  action_follower: string | null;
  requires_efficacy_evaluation: boolean;
  authorization_date: string | null;
  authorized_by: string | null;
  follow_up_date: string | null;
  follow_up_report: string | null;
  follow_up_responsible: string | null;
  action_situation: string | null;
  action_finalized: boolean;
  efficacy_evaluation: string | null;
  efficacy_evaluated_by: string | null;
  efficacy_evaluation_date: string | null;
  created_at: string;
  updated_at: string;
};

// === SSH (Segurança e Saúde no Trabalho) ===

export type IncidentType = 'Acidente' | 'Quase Acidente' | 'Incidente' | 'Condição Insegura' | 'Ato Inseguro';
export type IncidentSeverity = 'baixa' | 'media' | 'alta' | 'critica';
export type IncidentStatus = 'aberto' | 'investigando' | 'acao_tomada' | 'encerrado';

export type SafetyIncident = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  type: IncidentType;
  severity: IncidentSeverity;
  location: string | null;
  affected_person: string | null;
  status: IncidentStatus;
  corrective_action: string | null;
  reported_by: string | null;
  incident_date: string | null;
  created_at: string;
  updated_at: string;
};

export type InspectionStatus = 'pendente' | 'em_andamento' | 'concluida';

export type SafetyInspection = {
  id: string;
  company_id: string;
  title: string;
  area: string | null;
  inspector: string;
  findings: string | null;
  status: InspectionStatus;
  inspection_date: string | null;
  next_inspection: string | null;
  created_at: string;
  updated_at: string;
};

// === RH ===

export type EmployeeStatus = 'ativo' | 'inativo' | 'ferias' | 'afastado';

export type Employee = {
  id: string;
  company_id: string;
  department_id: string | null;
  name: string;
  email: string | null;
  position: string | null;
  phone: string | null;
  hire_date: string | null;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
};

export type Department = {
  id: string;
  company_id: string;
  name: string;
  manager: string | null;
  created_at: string;
};
