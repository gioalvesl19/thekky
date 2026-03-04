type Props = {
  status: string;
  type?: 'occurrence' | 'action';
};

const occurrenceColors: Record<string, string> = {
  aberta: 'bg-red-100 text-red-800',
  em_analise: 'bg-yellow-100 text-yellow-800',
  acao_proposta: 'bg-blue-100 text-blue-800',
  resolvida: 'bg-green-100 text-green-800',
};

const actionColors: Record<string, string> = {
  pendente: 'bg-red-100 text-red-800',
  em_andamento: 'bg-yellow-100 text-yellow-800',
  concluida: 'bg-green-100 text-green-800',
};

const occurrenceLabels: Record<string, string> = {
  aberta: 'Aberta',
  em_analise: 'Em Análise',
  acao_proposta: 'Ação Proposta',
  resolvida: 'Resolvida',
};

const actionLabels: Record<string, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
};

export default function StatusBadge({ status, type = 'occurrence' }: Props) {
  const colors = type === 'action' ? actionColors : occurrenceColors;
  const labels = type === 'action' ? actionLabels : occurrenceLabels;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
}
