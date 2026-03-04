'use client';

import { useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import type { OccurrenceType } from '@/lib/types';

const occurrenceTypes: OccurrenceType[] = [
  'Não Conformidade',
  'Reclamação de Cliente',
  'Auditoria Interna',
  'Auditoria Externa',
  'Melhoria',
  'Outro',
];

export default function NovaOcorrenciaPage() {
  const { companyId, userId, supabase } = useCompany();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'Não Conformidade' as OccurrenceType,
    origin: '',
    area: '',
    confidential: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase.from('occurrences').insert({
      company_id: companyId,
      title: form.title,
      description: form.description || null,
      type: form.type,
      origin: form.origin || null,
      area: form.area || null,
      confidential: form.confidential,
      created_by: userId,
      status: 'aberta',
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push('/ocorrencias');
    }
  };

  return (
    <div className="max-w-3xl animate-in">
      <h1 className="text-2xl font-bold mb-6">Cadastrar Ocorrência</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['Dados', 'Descrição'].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              {i + 1}
            </div>
            <span className="text-sm font-medium text-gray-700">{step}</span>
            {i < 1 && <div className="w-12 h-0.5 bg-gray-300" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assunto / Título *
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Título da ocorrência"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Ocorrência *
          </label>
          <select
            required
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as OccurrenceType })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {occurrenceTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origem da Ocorrência
            </label>
            <input
              type="text"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Produção, Cliente, Auditoria"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área da Ocorrência
            </label>
            <input
              type="text"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Qualidade, Logística, TI"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relato / Descrição *
          </label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
            placeholder="Descreva a ocorrência em detalhes..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="confidential"
            checked={form.confidential}
            onChange={(e) => setForm({ ...form, confidential: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="confidential" className="text-sm text-gray-700">
            Ocorrência Sigilosa?
          </label>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar e Enviar para Análise'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/ocorrencias')}
            className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
