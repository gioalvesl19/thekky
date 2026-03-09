'use client';

import { useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import type { OccurrenceType, OccurrenceOrigin } from '@/lib/types';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const occurrenceTypes: OccurrenceType[] = [
  'Conformidade',
  'Demanda THEKKY',
  'Gestão de Funcionários',
  'Investigação de Acidentes e Incidentes',
  'Mudança Inesperada',
  'Mudança Planejada',
  'Não Conformidade',
  'Oportunidade de Melhoria',
  'Reclamação de Cliente',
  'Auditoria Interna',
  'Auditoria Externa',
  'Outro',
];

const occurrenceOrigins: OccurrenceOrigin[] = [
  'Análise Crítica do Sistema de Gestão',
  'Análise de Risco',
  'Aspecto/Impacto Ambiental',
  'Atendimento ao Cliente',
  'Auditoria Externa',
  'Auditoria Interna',
  'Gerenciador de Tarefa',
  'Mudança Inesperada',
  'Mudança Planejada',
  'Oportunidades Identificadas',
  'Perigo/Risco em Segurança e Saúde',
  'Planejamento Estratégico',
  'Outro',
];

const steps = ['Dados', 'Relato', 'Revisão'];

export default function NovaOcorrenciaPage() {
  const { companyId, userId, userName, supabase } = useCompany();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    // Step 1 - Dados
    title: '',
    type: 'Não Conformidade' as OccurrenceType,
    origin_type: '' as OccurrenceOrigin | '',
    area: '',
    related_people: '',
    related_suppliers: '',
    related_clients: '',
    applicable_requirements: '',
    confidential: false,
    days_open: 5,
    emission_time: '08:00',
    // Step 2 - Relato
    occurrence_date: today,
    report: '',
    reporter: '',
    analysis_indicated_person: '',
    apply_5_whys: false,
  });

  const set = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!companyId) return;
    setLoading(true);
    setError('');

    const { error: insertError, data } = await supabase.from('occurrences').insert({
      company_id: companyId,
      title: form.title,
      type: form.type,
      origin_type: form.origin_type || null,
      area: form.area || null,
      related_people: form.related_people || null,
      related_suppliers: form.related_suppliers || null,
      related_clients: form.related_clients || null,
      applicable_requirements: form.applicable_requirements || null,
      confidential: form.confidential,
      days_open: form.days_open,
      emission_time: form.emission_time,
      occurrence_date: form.occurrence_date || null,
      report: form.report || null,
      reporter: form.reporter || userName || null,
      analysis_indicated_person: form.analysis_indicated_person || null,
      apply_5_whys: form.apply_5_whys,
      created_by: userId,
      status: 'aberta',
      step: 2,
    }).select().single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push(`/ocorrencias/${data.id}`);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="max-w-3xl animate-in">
      {/* Step Progress */}
      <div className="flex items-center gap-0 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                i < step ? 'bg-blue-600 border-blue-600 text-white' :
                i === step ? 'border-blue-600 text-blue-600 bg-white' :
                'border-gray-300 text-gray-400 bg-white'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Step 1 - Dados da Ocorrência */}
        {step === 0 && (
          <div className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-800 pb-3 border-b border-gray-100">Dados da Ocorrência</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Data da Emissão *</label>
                <input type="date" value={today} readOnly className={inputClass + ' bg-gray-50'} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Hora</label>
                  <input type="time" value={form.emission_time} onChange={(e) => set('emission_time', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Dias Aberto</label>
                  <input type="number" min={0} value={form.days_open} onChange={(e) => set('days_open', parseInt(e.target.value) || 0)} className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Assunto *</label>
              <input type="text" required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Descreva o assunto da ocorrência" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo de Ocorrência *</label>
                <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputClass}>
                  {occurrenceTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Origem da Ocorrência *</label>
                <select value={form.origin_type} onChange={(e) => set('origin_type', e.target.value)} className={inputClass}>
                  <option value="">Selecione...</option>
                  {occurrenceOrigins.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Área da Ocorrência *</label>
              <input type="text" value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="Ex: Qualidade, Produção, TI..." className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Pessoas Relacionadas</label>
                <input type="text" value={form.related_people} onChange={(e) => set('related_people', e.target.value)} placeholder="Nomes separados por vírgula" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fornecedores Relacionados</label>
                <input type="text" value={form.related_suppliers} onChange={(e) => set('related_suppliers', e.target.value)} placeholder="Nomes separados por vírgula" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Clientes Relacionados</label>
                <input type="text" value={form.related_clients} onChange={(e) => set('related_clients', e.target.value)} placeholder="Nomes separados por vírgula" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Requisitos Aplicáveis</label>
                <input type="text" value={form.applicable_requirements} onChange={(e) => set('applicable_requirements', e.target.value)} placeholder="Ex: ISO 9001, ISO 14001..." className={inputClass} />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="confidential" checked={form.confidential} onChange={(e) => set('confidential', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="confidential" className="text-sm text-gray-700">Ocorrência Sigilosa?</label>
            </div>
          </div>
        )}

        {/* Step 2 - Descrição / Relato */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-800 pb-3 border-b border-gray-100">Descrição da Ocorrência</h2>

            <div>
              <label className={labelClass}>Data da Ocorrência *</label>
              <input type="date" value={form.occurrence_date} onChange={(e) => set('occurrence_date', e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Relato *</label>
              <textarea rows={5} value={form.report} onChange={(e) => set('report', e.target.value)} placeholder="Descreva detalhadamente o que ocorreu..." className={inputClass + ' resize-y'} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Emissor</label>
                <input type="text" value={form.reporter || userName} onChange={(e) => set('reporter', e.target.value)} placeholder="Nome do responsável pelo relato" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Indicado para Análise</label>
                <input type="text" value={form.analysis_indicated_person} onChange={(e) => set('analysis_indicated_person', e.target.value)} placeholder="Nome do responsável pela análise" className={inputClass} />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="apply5" checked={form.apply_5_whys} onChange={(e) => set('apply_5_whys', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="apply5" className="text-sm text-gray-700">Aplicar os 5 Porquês?</label>
            </div>
          </div>
        )}

        {/* Step 3 - Revisão */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-800 pb-3 border-b border-gray-100">Revisão</h2>
            <div className="space-y-3 text-sm">
              <Row label="Assunto" value={form.title} />
              <Row label="Tipo" value={form.type} />
              <Row label="Origem" value={form.origin_type || '-'} />
              <Row label="Área" value={form.area || '-'} />
              <Row label="Data da Ocorrência" value={form.occurrence_date || '-'} />
              <Row label="Emissor" value={form.reporter || userName || '-'} />
              <Row label="Sigilosa" value={form.confidential ? 'Sim' : 'Não'} />
              <Row label="5 Porquês" value={form.apply_5_whys ? 'Sim' : 'Não'} />
              {form.report && (
                <div>
                  <span className="text-gray-500 font-medium">Relato:</span>
                  <p className="mt-1 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap text-gray-700">{form.report}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-xl">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2 ml-auto">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
            )}
            <button onClick={() => router.push('/ocorrencias')} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => {
                  if (step === 0 && !form.title) { setError('Preencha o assunto.'); return; }
                  if (step === 1 && !form.report) { setError('Preencha o relato.'); return; }
                  setError('');
                  setStep(step + 1);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Ocorrência'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 font-medium w-40 shrink-0">{label}:</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}
