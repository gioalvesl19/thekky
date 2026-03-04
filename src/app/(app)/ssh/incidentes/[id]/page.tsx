'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useParams } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import SeverityBadge from '@/components/SeverityBadge';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { SafetyIncident, IncidentStatus } from '@/lib/types';

const statusFlow: { label: string; value: IncidentStatus }[] = [
  { label: 'Aberto', value: 'aberto' },
  { label: 'Investigando', value: 'investigando' },
  { label: 'Ação Tomada', value: 'acao_tomada' },
  { label: 'Encerrado', value: 'encerrado' },
];

export default function IncidenteDetailPage() {
  const { supabase } = useCompany();
  const params = useParams();
  const id = params.id as string;
  const [incident, setIncident] = useState<SafetyIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [corrective, setCorrective] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const { data } = await supabase.from('safety_incidents').select('*').eq('id', id).single();
    if (data) { setIncident(data); setCorrective(data.corrective_action || ''); }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    await supabase.from('safety_incidents').update({ status: newStatus }).eq('id', id);
    loadData();
  };

  const handleSaveCorrective = async () => {
    setSaving(true);
    await supabase.from('safety_incidents').update({ corrective_action: corrective || null }).eq('id', id);
    loadData();
    setSaving(false);
  };

  if (loading) return <Loading />;
  if (!incident) return <p className="text-gray-500">Incidente não encontrado.</p>;

  return (
    <div className="max-w-4xl animate-in">
      <Link href="/ssh/incidentes" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{incident.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{incident.type} &middot; {incident.incident_date ? new Date(incident.incident_date).toLocaleDateString('pt-BR') : 'Sem data'}</p>
        </div>
        <div className="flex gap-2">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} type="incident" />
        </div>
      </div>

      {/* Status Flow */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Status</h3>
        <div className="flex items-center gap-2">
          {statusFlow.map((step, i) => (
            <div key={step.value} className="flex items-center gap-2">
              <button onClick={() => handleStatusChange(step.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  incident.status === step.value ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>{step.label}</button>
              {i < statusFlow.length - 1 && <div className="w-6 h-0.5 bg-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold mb-3">Detalhes</h2>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><span className="text-gray-500">Local:</span> <span className="ml-2 font-medium">{incident.location || '-'}</span></div>
          <div><span className="text-gray-500">Pessoa Afetada:</span> <span className="ml-2 font-medium">{incident.affected_person || '-'}</span></div>
        </div>
        <div>
          <span className="text-sm text-gray-500">Descrição:</span>
          <p className="mt-1 text-sm bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{incident.description || 'Sem descrição.'}</p>
        </div>
      </div>

      {/* Corrective Action */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold mb-3">Ação Corretiva</h2>
        <textarea rows={4} value={corrective} onChange={(e) => setCorrective(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y text-sm mb-3"
          placeholder="Descreva a ação corretiva tomada..." />
        <button onClick={handleSaveCorrective} disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all">
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}
