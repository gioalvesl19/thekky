'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import Link from 'next/link';
import type { Occurrence, Action, ActionType } from '@/lib/types';

const actionTypes: ActionType[] = [
  'Ação Corretiva',
  'Ação de Melhoria',
  'Ação Imediata (Disposição)',
  'Ação Preventiva',
];

const WORKFLOW_STEPS = [
  { label: 'Cadastrar', short: '1' },
  { label: 'Relatar', short: '2' },
  { label: 'Analisar', short: '3' },
  { label: 'Propor Ação', short: '4' },
  { label: 'Acompanhar', short: '5' },
  { label: 'Encerrar', short: '6' },
  { label: 'Eficácia', short: '7' },
];

const TABS = ['Dados da Ocorrência', 'Descrição', 'Análise', 'Ações', 'Acompanhamento'];

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none';
const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

export default function OcorrenciaDetailPage() {
  const supabase = createClient();
  const params = useParams();
  const id = params.id as string;

  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showActionForm, setShowActionForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [actionForm, setActionForm] = useState({
    type: 'Ação Corretiva' as ActionType,
    subject: '',
    description: '',
    responsible: '',
    deadline: '',
    issuer: '',
    action_follower: '',
    requires_efficacy_evaluation: false,
  });

  const [analysisForm, setAnalysisForm] = useState({
    analysis_type: '',
    analysis_description: '',
    related_risks: '',
    requires_action: true,
  });

  const [followUpForm, setFollowUpForm] = useState({
    follow_up_date: new Date().toISOString().split('T')[0],
    follow_up_report: '',
    follow_up_responsible: '',
    action_situation: '',
    action_finalized: false,
  });

  const [efficacyForm, setEfficacyForm] = useState({
    efficacy_evaluation: '',
    efficacy_evaluated_by: '',
    efficacy_evaluation_date: new Date().toISOString().split('T')[0],
  });

  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [{ data: occ }, { data: acts }] = await Promise.all([
      supabase.from('occurrences').select('*').eq('id', id).single(),
      supabase.from('actions').select('*').eq('occurrence_id', id).order('created_at', { ascending: false }),
    ]);

    if (occ) {
      setOccurrence(occ);
      setAnalysisForm({
        analysis_type: occ.analysis_type || '',
        analysis_description: occ.analysis_description || '',
        related_risks: occ.related_risks || '',
        requires_action: occ.requires_action !== false,
      });
    }
    if (acts) {
      setActions(acts);
      if (acts.length > 0 && !selectedActionId) setSelectedActionId(acts[0].id);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const advanceStep = async (newStep: number) => {
    const stepStatusMap: Record<number, string> = {
      2: 'aberta', 3: 'em_analise', 4: 'em_analise',
      5: 'acao_proposta', 6: 'em_acompanhamento',
      7: 'encerrada',
    };
    await supabase.from('occurrences').update({
      step: newStep,
      status: stepStatusMap[newStep] || occurrence?.status,
    }).eq('id', id);
    loadData();
  };

  const handleSaveAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('occurrences').update({
      analysis_type: analysisForm.analysis_type || null,
      analysis_description: analysisForm.analysis_description || null,
      related_risks: analysisForm.related_risks || null,
      requires_action: analysisForm.requires_action,
      status: 'em_analise',
      step: Math.max((occurrence?.step || 3), 3),
    }).eq('id', id);
    setSaving(false);
    loadData();
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data } = await supabase.from('actions').insert({
      occurrence_id: id,
      type: actionForm.type,
      subject: actionForm.subject || null,
      description: actionForm.description,
      responsible: actionForm.responsible,
      deadline: actionForm.deadline || null,
      issuer: actionForm.issuer || null,
      action_follower: actionForm.action_follower || null,
      requires_efficacy_evaluation: actionForm.requires_efficacy_evaluation,
      status: 'pendente',
      action_finalized: false,
    }).select().single();

    if (data) {
      await supabase.from('occurrences').update({ status: 'acao_proposta', step: Math.max((occurrence?.step || 4), 4) }).eq('id', id);
      setSelectedActionId(data.id);
      setShowActionForm(false);
      setActionForm({ type: 'Ação Corretiva', subject: '', description: '', responsible: '', deadline: '', issuer: '', action_follower: '', requires_efficacy_evaluation: false });
    }
    setSaving(false);
    loadData();
  };

  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActionId) return;
    setSaving(true);
    await supabase.from('actions').update({
      follow_up_date: followUpForm.follow_up_date || null,
      follow_up_report: followUpForm.follow_up_report || null,
      follow_up_responsible: followUpForm.follow_up_responsible || null,
      action_situation: followUpForm.action_situation || null,
      action_finalized: followUpForm.action_finalized,
      status: followUpForm.action_finalized ? 'concluida' : 'em_andamento',
    }).eq('id', selectedActionId);

    if (followUpForm.action_finalized) {
      await supabase.from('occurrences').update({ step: Math.max((occurrence?.step || 6), 6), status: 'em_acompanhamento' }).eq('id', id);
    }
    setSaving(false);
    loadData();
  };

  const handleSaveEfficacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActionId) return;
    setSaving(true);
    await supabase.from('actions').update({
      efficacy_evaluation: efficacyForm.efficacy_evaluation,
      efficacy_evaluated_by: efficacyForm.efficacy_evaluated_by || null,
      efficacy_evaluation_date: efficacyForm.efficacy_evaluation_date || null,
    }).eq('id', selectedActionId);
    await supabase.from('occurrences').update({ step: 7, status: 'eficacia_avaliada' }).eq('id', id);
    setSaving(false);
    loadData();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  if (!occurrence) return <p className="text-gray-500">Ocorrência não encontrada.</p>;

  const currentStep = occurrence.step || 1;
  const selectedAction = actions.find((a) => a.id === selectedActionId) || actions[0] || null;

  return (
    <div className="max-w-5xl animate-in">
      <Link href="/ocorrencias" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Registro de Ocorrência</p>
          <h1 className="text-xl font-bold text-gray-900">{occurrence.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{occurrence.type} · {new Date(occurrence.created_at).toLocaleDateString('pt-BR')}</p>
        </div>
        <StatusBadge status={occurrence.status} />
      </div>

      {/* 7-Step workflow */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center">
          {WORKFLOW_STEPS.map((s, i) => {
            const stepNum = i + 1;
            const isDone = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;
            return (
              <div key={s.label} className="flex items-center flex-1">
                <button
                  onClick={() => stepNum <= currentStep + 1 && advanceStep(stepNum)}
                  disabled={stepNum > currentStep + 1}
                  className={`flex flex-col items-center gap-1 group transition-all disabled:cursor-not-allowed ${stepNum <= currentStep + 1 ? 'cursor-pointer' : 'opacity-40'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    isDone ? 'bg-blue-600 border-blue-600 text-white' :
                    isCurrent ? 'border-blue-600 text-blue-600 bg-blue-50' :
                    'border-gray-300 text-gray-400 bg-white'
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  <span className={`text-[10px] font-medium leading-tight text-center max-w-[60px] ${isCurrent ? 'text-blue-600' : isDone ? 'text-blue-500' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </button>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-3 ${i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === i
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab === 'Ações' && actions.length > 0
                ? `${selectedAction?.type || 'Ação'} / ${actions.length} / ${selectedAction ? <StatusBadge status={selectedAction.status} type="action" /> : ''}`
                : tab}
              {tab === 'Ações' && actions.length > 0 && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded font-semibold ${selectedAction?.action_finalized ? 'bg-green-100 text-green-700' : selectedAction?.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'}`}>
                  {selectedAction?.action_finalized ? 'Finalizada' : selectedAction?.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* TAB 0 - Dados da Ocorrência */}
          {activeTab === 0 && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <InfoRow label="Data da Emissão" value={new Date(occurrence.created_at).toLocaleDateString('pt-BR')} />
                <InfoRow label="Hora" value={occurrence.emission_time || '08:00'} />
                <InfoRow label="Dias em Aberto" value={String(occurrence.days_open || 0)} />
              </div>
              <InfoRow label="Assunto" value={occurrence.title} />
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Tipo de Ocorrência" value={occurrence.type} />
                <InfoRow label="Origem da Ocorrência" value={occurrence.origin_type || occurrence.origin || '-'} />
              </div>
              <InfoRow label="Área da Ocorrência" value={occurrence.area || '-'} />
              <div className="grid grid-cols-3 gap-4">
                <InfoRow label="Pessoas Relacionadas" value={occurrence.related_people || '-'} />
                <InfoRow label="Fornecedores" value={occurrence.related_suppliers || '-'} />
                <InfoRow label="Clientes" value={occurrence.related_clients || '-'} />
              </div>
              <InfoRow label="Requisitos Aplicáveis" value={occurrence.applicable_requirements || '-'} />
              <InfoRow label="Ocorrência Sigilosa?" value={occurrence.confidential ? 'Sim' : 'Não'} />
            </div>
          )}

          {/* TAB 1 - Descrição da Ocorrência */}
          {activeTab === 1 && (
            <div className="space-y-3 text-sm">
              <InfoRow label="Data da Ocorrência" value={occurrence.occurrence_date ? new Date(occurrence.occurrence_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'} />
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Relato</p>
                <p className="bg-gray-50 p-3 rounded-lg whitespace-pre-wrap text-gray-700 min-h-[80px]">{occurrence.report || occurrence.description || 'Sem relato.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Emissor" value={occurrence.reporter || '-'} />
                <InfoRow label="Indicado para Análise" value={occurrence.analysis_indicated_person || '-'} />
              </div>
              <InfoRow label="Aplicar 5 Porquês?" value={occurrence.apply_5_whys ? 'Sim' : 'Não'} />
            </div>
          )}

          {/* TAB 2 - Análise */}
          {activeTab === 2 && (
            <form onSubmit={handleSaveAnalysis} className="space-y-4">
              <div>
                <label className={labelClass}>Tipo de Causa</label>
                <input type="text" value={analysisForm.analysis_type} onChange={(e) => setAnalysisForm({ ...analysisForm, analysis_type: e.target.value })} className={inputClass} placeholder="Ex: Falha de processo, Erro humano, Falha de equipamento..." />
              </div>
              <div>
                <label className={labelClass}>Descrição da Análise</label>
                <textarea rows={4} value={analysisForm.analysis_description} onChange={(e) => setAnalysisForm({ ...analysisForm, analysis_description: e.target.value })} className={inputClass + ' resize-y'} placeholder="Descreva detalhadamente a análise da causa..." />
              </div>
              <div>
                <label className={labelClass}>Riscos Relacionados</label>
                <input type="text" value={analysisForm.related_risks} onChange={(e) => setAnalysisForm({ ...analysisForm, related_risks: e.target.value })} className={inputClass} placeholder="Descreva os riscos relacionados..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="requires_action" checked={analysisForm.requires_action} onChange={(e) => setAnalysisForm({ ...analysisForm, requires_action: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                <label htmlFor="requires_action" className="text-sm text-gray-700">Exige Ação?</label>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Salvando...' : 'Salvar Análise'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3 - Ações */}
          {activeTab === 3 && (
            <div>
              {/* Action selector */}
              {actions.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {actions.map((a) => (
                    <button key={a.id} onClick={() => setSelectedActionId(a.id)} className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${selectedActionId === a.id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
                      {a.type} {a.action_finalized ? '✓' : ''}
                    </button>
                  ))}
                </div>
              )}

              {selectedAction && !showActionForm && (
                <div className="space-y-3 text-sm mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Tipo de Ação" value={selectedAction.type} />
                    <InfoRow label="Assunto" value={selectedAction.subject || selectedAction.description?.slice(0, 50) || '-'} />
                  </div>
                  <InfoRow label="Descrição" value={selectedAction.description} />
                  <div className="grid grid-cols-3 gap-4">
                    <InfoRow label="Prazo de Conclusão" value={selectedAction.deadline ? new Date(selectedAction.deadline + 'T00:00:00').toLocaleDateString('pt-BR') : (selectedAction.due_date ? new Date(selectedAction.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-')} />
                    <InfoRow label="Responsável" value={selectedAction.responsible} />
                    <InfoRow label="Emissor" value={selectedAction.issuer || '-'} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Acompanhante" value={selectedAction.action_follower || '-'} />
                    <InfoRow label="Avaliação de Eficácia" value={selectedAction.requires_efficacy_evaluation ? 'Sim' : 'Não'} />
                  </div>
                </div>
              )}

              {showActionForm ? (
                <form onSubmit={handleCreateAction} className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-sm text-gray-700">Nova Ação</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Tipo de Ação *</label>
                      <select required value={actionForm.type} onChange={(e) => setActionForm({ ...actionForm, type: e.target.value as ActionType })} className={inputClass}>
                        {actionTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Assunto *</label>
                      <input type="text" required value={actionForm.subject} onChange={(e) => setActionForm({ ...actionForm, subject: e.target.value })} className={inputClass} placeholder="Assunto da ação" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Descrição *</label>
                    <textarea required rows={3} value={actionForm.description} onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })} className={inputClass + ' resize-y'} placeholder="Descreva a ação..." />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Prazo de Conclusão *</label>
                      <input type="date" required value={actionForm.deadline} onChange={(e) => setActionForm({ ...actionForm, deadline: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Responsável *</label>
                      <input type="text" required value={actionForm.responsible} onChange={(e) => setActionForm({ ...actionForm, responsible: e.target.value })} className={inputClass} placeholder="Nome" />
                    </div>
                    <div>
                      <label className={labelClass}>Emissor</label>
                      <input type="text" value={actionForm.issuer} onChange={(e) => setActionForm({ ...actionForm, issuer: e.target.value })} className={inputClass} placeholder="Nome" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Quem Acompanhará?</label>
                      <input type="text" value={actionForm.action_follower} onChange={(e) => setActionForm({ ...actionForm, action_follower: e.target.value })} className={inputClass} placeholder="Nome" />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={actionForm.requires_efficacy_evaluation} onChange={(e) => setActionForm({ ...actionForm, requires_efficacy_evaluation: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                        Exige Avaliação de Eficácia?
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                      {saving ? 'Salvando...' : 'Salvar Ação'}
                    </button>
                    <button type="button" onClick={() => setShowActionForm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowActionForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" /> Nova Ação
                </button>
              )}
            </div>
          )}

          {/* TAB 4 - Acompanhamento */}
          {activeTab === 4 && (
            <div className="space-y-6">
              {actions.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhuma ação criada. Vá para a aba Ações.</p>
              ) : (
                <>
                  {/* Action selector */}
                  <div className="flex gap-2 flex-wrap">
                    {actions.map((a) => (
                      <button key={a.id} onClick={() => setSelectedActionId(a.id)} className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${selectedActionId === a.id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
                        {a.type}
                      </button>
                    ))}
                  </div>

                  {selectedAction && (
                    <form onSubmit={handleSaveFollowUp} className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Acompanhar Ação</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Data do Acompanhamento *</label>
                          <input type="date" required value={followUpForm.follow_up_date} onChange={(e) => setFollowUpForm({ ...followUpForm, follow_up_date: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Responsável</label>
                          <input type="text" value={followUpForm.follow_up_responsible} onChange={(e) => setFollowUpForm({ ...followUpForm, follow_up_responsible: e.target.value })} className={inputClass} placeholder="Nome" />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Relato de Acompanhamento *</label>
                        <textarea required rows={4} value={followUpForm.follow_up_report} onChange={(e) => setFollowUpForm({ ...followUpForm, follow_up_report: e.target.value })} className={inputClass + ' resize-y'} placeholder="Descreva o acompanhamento..." />
                      </div>
                      <div>
                        <label className={labelClass}>Situação da Ação</label>
                        <select value={followUpForm.action_situation} onChange={(e) => setFollowUpForm({ ...followUpForm, action_situation: e.target.value })} className={inputClass}>
                          <option value="">Selecione...</option>
                          <option value="Em prazo">Em prazo</option>
                          <option value="Atrasada">Atrasada</option>
                          <option value="Concluída">Concluída</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={followUpForm.action_finalized} onChange={(e) => setFollowUpForm({ ...followUpForm, action_finalized: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                        Ação Finalizada?
                      </label>
                      <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                        {saving ? 'Salvando...' : 'Salvar Acompanhamento'}
                      </button>
                    </form>
                  )}

                  {/* Efficacy section if applicable */}
                  {selectedAction?.requires_efficacy_evaluation && (
                    <form onSubmit={handleSaveEfficacy} className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-semibold text-gray-700">Avaliação de Eficácia</h3>
                      <div>
                        <label className={labelClass}>Avaliação</label>
                        <textarea rows={3} value={efficacyForm.efficacy_evaluation} onChange={(e) => setEfficacyForm({ ...efficacyForm, efficacy_evaluation: e.target.value })} className={inputClass + ' resize-y'} placeholder="A ação foi eficaz? Justifique..." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Avaliado por</label>
                          <input type="text" value={efficacyForm.efficacy_evaluated_by} onChange={(e) => setEfficacyForm({ ...efficacyForm, efficacy_evaluated_by: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Data da Avaliação</label>
                          <input type="date" value={efficacyForm.efficacy_evaluation_date} onChange={(e) => setEfficacyForm({ ...efficacyForm, efficacy_evaluation_date: e.target.value })} className={inputClass} />
                        </div>
                      </div>
                      <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                        {saving ? 'Salvando...' : 'Registrar Avaliação de Eficácia'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
          <Link href="/ocorrencias/lista" className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Voltar à Listagem
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}
