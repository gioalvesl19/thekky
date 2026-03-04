'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import type { Occurrence, Action, ActionType, OccurrenceStatus } from '@/lib/types';

const actionTypes: ActionType[] = [
  'Ação Corretiva',
  'Ação de Melhoria',
  'Ação Imediata (Disposição)',
  'Ação Preventiva',
];

const statusFlow: { label: string; value: OccurrenceStatus }[] = [
  { label: 'Aberta', value: 'aberta' },
  { label: 'Em Análise', value: 'em_analise' },
  { label: 'Ação Proposta', value: 'acao_proposta' },
  { label: 'Resolvida', value: 'resolvida' },
];

export default function OcorrenciaDetailPage() {
  const supabase = createClient();
  const params = useParams();
  const id = params.id as string;

  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActionForm, setShowActionForm] = useState(false);
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [actionForm, setActionForm] = useState({
    description: '',
    responsible: '',
    type: 'Ação Corretiva' as ActionType,
    due_date: '',
  });
  const [analysisForm, setAnalysisForm] = useState({
    analysis_type: '',
    analysis_description: '',
  });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const { data: occ } = await supabase
      .from('occurrences')
      .select('*')
      .eq('id', id)
      .single();

    if (occ) {
      setOccurrence(occ);
      setAnalysisForm({
        analysis_type: occ.analysis_type || '',
        analysis_description: occ.analysis_description || '',
      });
    }

    const { data: acts } = await supabase
      .from('actions')
      .select('*')
      .eq('occurrence_id', id)
      .order('created_at', { ascending: false });

    if (acts) setActions(acts);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from('actions').insert({
      occurrence_id: id,
      description: actionForm.description,
      responsible: actionForm.responsible,
      type: actionForm.type,
      due_date: actionForm.due_date || null,
      status: 'pendente',
    });

    if (!error) {
      // Update occurrence status
      await supabase
        .from('occurrences')
        .update({ status: 'acao_proposta' })
        .eq('id', id);

      setActionForm({ description: '', responsible: '', type: 'Ação Corretiva', due_date: '' });
      setShowActionForm(false);
      loadData();
    }
    setSaving(false);
  };

  const handleSaveAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    await supabase
      .from('occurrences')
      .update({
        analysis_type: analysisForm.analysis_type || null,
        analysis_description: analysisForm.analysis_description || null,
        status: 'em_analise',
      })
      .eq('id', id);

    setShowAnalysisForm(false);
    loadData();
    setSaving(false);
  };

  const handleStatusChange = async (newStatus: OccurrenceStatus) => {
    await supabase
      .from('occurrences')
      .update({ status: newStatus })
      .eq('id', id);
    loadData();
  };

  const handleActionStatusChange = async (actionId: string, status: string) => {
    await supabase
      .from('actions')
      .update({ status })
      .eq('id', actionId);

    // If all actions are done, mark occurrence as resolved
    const { data: remaining } = await supabase
      .from('actions')
      .select('status')
      .eq('occurrence_id', id)
      .neq('status', 'concluida');

    if (remaining && remaining.length <= 1 && status === 'concluida') {
      await supabase
        .from('occurrences')
        .update({ status: 'resolvida' })
        .eq('id', id);
    }

    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!occurrence) {
    return <p className="text-gray-500">Ocorrência não encontrada.</p>;
  }

  return (
    <div className="max-w-4xl">
      <Link href="/ocorrencias" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar à listagem
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{occurrence.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Criada em {new Date(occurrence.created_at).toLocaleDateString('pt-BR')} &middot; {occurrence.type}
          </p>
        </div>
        <StatusBadge status={occurrence.status} />
      </div>

      {/* Status Flow */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Fluxo da Ocorrência</h3>
        <div className="flex items-center gap-2">
          {statusFlow.map((step, i) => (
            <div key={step.value} className="flex items-center gap-2">
              <button
                onClick={() => handleStatusChange(step.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  occurrence.status === step.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {step.label}
              </button>
              {i < statusFlow.length - 1 && (
                <div className="w-6 h-0.5 bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Occurrence Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="text-lg font-semibold mb-3">Dados da Ocorrência</h2>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-500">Origem:</span>
            <span className="ml-2 font-medium">{occurrence.origin || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">Área:</span>
            <span className="ml-2 font-medium">{occurrence.area || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">Sigilosa:</span>
            <span className="ml-2 font-medium">{occurrence.confidential ? 'Sim' : 'Não'}</span>
          </div>
        </div>
        <div>
          <span className="text-sm text-gray-500">Descrição / Relato:</span>
          <p className="mt-1 text-sm bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
            {occurrence.description || 'Sem descrição.'}
          </p>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Análise da Ocorrência</h2>
          {!showAnalysisForm && (
            <button
              onClick={() => setShowAnalysisForm(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              {occurrence.analysis_description ? 'Editar' : 'Fazer Análise'}
            </button>
          )}
        </div>

        {showAnalysisForm ? (
          <form onSubmit={handleSaveAnalysis} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Causa</label>
              <input
                type="text"
                value={analysisForm.analysis_type}
                onChange={(e) => setAnalysisForm({ ...analysisForm, analysis_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Falha de processo, Erro humano"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição da Análise *</label>
              <textarea
                required
                rows={4}
                value={analysisForm.analysis_description}
                onChange={(e) => setAnalysisForm({ ...analysisForm, analysis_description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                placeholder="Descreva a análise de causa..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Análise'}
              </button>
              <button
                type="button"
                onClick={() => setShowAnalysisForm(false)}
                className="px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : occurrence.analysis_description ? (
          <div>
            {occurrence.analysis_type && (
              <p className="text-sm mb-2">
                <span className="text-gray-500">Tipo de Causa:</span>{' '}
                <span className="font-medium">{occurrence.analysis_type}</span>
              </p>
            )}
            <p className="text-sm bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
              {occurrence.analysis_description}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Nenhuma análise realizada ainda.</p>
        )}
      </div>

      {/* Actions Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Ações</h2>
          <button
            onClick={() => setShowActionForm(!showActionForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Ação
          </button>
        </div>

        {/* New Action Form */}
        {showActionForm && (
          <form onSubmit={handleCreateAction} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-4 border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ação *</label>
              <select
                required
                value={actionForm.type}
                onChange={(e) => setActionForm({ ...actionForm, type: e.target.value as ActionType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {actionTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição da Ação *</label>
              <textarea
                required
                rows={3}
                value={actionForm.description}
                onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                placeholder="Descreva a ação a ser tomada..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
                <input
                  type="text"
                  required
                  value={actionForm.responsible}
                  onChange={(e) => setActionForm({ ...actionForm, responsible: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
                <input
                  type="date"
                  value={actionForm.due_date}
                  onChange={(e) => setActionForm({ ...actionForm, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Criar Ação'}
              </button>
              <button
                type="button"
                onClick={() => setShowActionForm(false)}
                className="px-4 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Actions List */}
        {actions.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma ação criada ainda.</p>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => (
              <div key={action.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {action.type}
                      </span>
                      <StatusBadge status={action.status} type="action" />
                    </div>
                    <p className="text-sm mt-2">{action.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Responsável: <strong>{action.responsible}</strong></span>
                      {action.due_date && (
                        <span>Prazo: <strong>{new Date(action.due_date).toLocaleDateString('pt-BR')}</strong></span>
                      )}
                    </div>
                  </div>
                  <select
                    value={action.status}
                    onChange={(e) => handleActionStatusChange(action.id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 ml-4"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
