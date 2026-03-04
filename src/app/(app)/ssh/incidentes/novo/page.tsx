'use client';

import { useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import type { IncidentType, IncidentSeverity } from '@/lib/types';

const types: IncidentType[] = ['Acidente', 'Quase Acidente', 'Incidente', 'Condição Insegura', 'Ato Inseguro'];
const severities: { value: IncidentSeverity; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

export default function NovoIncidentePage() {
  const { companyId, userId, supabase } = useCompany();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', type: 'Acidente' as IncidentType,
    severity: 'baixa' as IncidentSeverity, location: '', affected_person: '', incident_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setLoading(true); setError('');

    const { error: err } = await supabase.from('safety_incidents').insert({
      company_id: companyId, title: form.title, description: form.description || null,
      type: form.type, severity: form.severity, location: form.location || null,
      affected_person: form.affected_person || null, reported_by: userId,
      incident_date: form.incident_date || null, status: 'aberto',
    });

    if (err) { setError(err.message); setLoading(false); }
    else router.push('/ssh/incidentes');
  };

  return (
    <div className="max-w-3xl animate-in">
      <PageHeader title="Novo Incidente de Segurança" subtitle="Registrar ocorrência de segurança" />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Descrição breve do incidente" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as IncidentType })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severidade *</label>
            <select required value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as IncidentSeverity })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              {severities.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Local do incidente" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data do Incidente</label>
            <input type="date" value={form.incident_date} onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pessoa Afetada</label>
          <input type="text" value={form.affected_person} onChange={(e) => setForm({ ...form, affected_person: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome da pessoa afetada" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
          <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y" placeholder="Descreva o incidente em detalhes..." />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? 'Salvando...' : 'Registrar Incidente'}
          </button>
          <button type="button" onClick={() => router.push('/ssh/incidentes')}
            className="px-6 py-2.5 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
