type Props = {
  status: string;
  type?: 'occurrence' | 'action' | 'incident' | 'inspection' | 'employee';
};

const colorMap: Record<string, Record<string, string>> = {
  occurrence: {
    aberta: 'bg-red-100 text-red-800',
    em_analise: 'bg-yellow-100 text-yellow-800',
    acao_proposta: 'bg-blue-100 text-blue-800',
    resolvida: 'bg-green-100 text-green-800',
  },
  action: {
    pendente: 'bg-red-100 text-red-800',
    em_andamento: 'bg-yellow-100 text-yellow-800',
    concluida: 'bg-green-100 text-green-800',
  },
  incident: {
    aberto: 'bg-red-100 text-red-800',
    investigando: 'bg-yellow-100 text-yellow-800',
    acao_tomada: 'bg-blue-100 text-blue-800',
    encerrado: 'bg-green-100 text-green-800',
  },
  inspection: {
    pendente: 'bg-red-100 text-red-800',
    em_andamento: 'bg-yellow-100 text-yellow-800',
    concluida: 'bg-green-100 text-green-800',
  },
  employee: {
    ativo: 'bg-green-100 text-green-800',
    inativo: 'bg-gray-100 text-gray-800',
    ferias: 'bg-blue-100 text-blue-800',
    afastado: 'bg-yellow-100 text-yellow-800',
  },
};

const labelMap: Record<string, Record<string, string>> = {
  occurrence: {
    aberta: 'Aberta',
    em_analise: 'Em Análise',
    acao_proposta: 'Ação Proposta',
    resolvida: 'Resolvida',
  },
  action: {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
  },
  incident: {
    aberto: 'Aberto',
    investigando: 'Investigando',
    acao_tomada: 'Ação Tomada',
    encerrado: 'Encerrado',
  },
  inspection: {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
  },
  employee: {
    ativo: 'Ativo',
    inativo: 'Inativo',
    ferias: 'Férias',
    afastado: 'Afastado',
  },
};

export default function StatusBadge({ status, type = 'occurrence' }: Props) {
  const colors = colorMap[type] || {};
  const labels = labelMap[type] || {};

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
}
