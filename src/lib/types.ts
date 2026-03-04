export type Company = {
  id: string;
  name: string;
  created_at: string;
};

export type Profile = {
  id: string;
  company_id: string;
  name: string;
  role: 'admin' | 'user' | 'analyst';
  created_at: string;
};

// === OCORRÊNCIAS ===

export type OccurrenceStatus = 'aberta' | 'em_analise' | 'acao_proposta' | 'resolvida';

export type OccurrenceType =
  | 'Não Conformidade'
  | 'Reclamação de Cliente'
  | 'Auditoria Interna'
  | 'Auditoria Externa'
  | 'Melhoria'
  | 'Outro';

export type Occurrence = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  type: OccurrenceType;
  origin: string | null;
  area: string | null;
  status: OccurrenceStatus;
  confidential: boolean;
  analysis_type: string | null;
  analysis_description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ActionType =
  | 'Ação Corretiva'
  | 'Ação de Melhoria'
  | 'Ação Imediata (Disposição)'
  | 'Ação Preventiva';

export type ActionStatus = 'pendente' | 'em_andamento' | 'concluida';

export type Action = {
  id: string;
  occurrence_id: string;
  description: string;
  responsible: string;
  type: ActionType;
  status: ActionStatus;
  due_date: string | null;
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
