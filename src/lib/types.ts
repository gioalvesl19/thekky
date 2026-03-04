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
