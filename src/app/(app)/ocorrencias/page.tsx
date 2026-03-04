'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { FileText, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/Loading';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import type { Occurrence } from '@/lib/types';

export default function OcorrenciasPainelPage() {
  const { companyId, supabase, loading: authLoading } = useCompany();
  const [stats, setStats] = useState({ total: 0, abertas: 0, emAnalise: 0, resolvidas: 0, acoesPendentes: 0 });
  const [recent, setRecent] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !companyId) return;

    async function load() {
      const [occRes, actRes] = await Promise.all([
        supabase.from('occurrences').select('*').eq('company_id', companyId!).order('created_at', { ascending: false }),
        supabase.from('actions').select('status, occurrences!inner(company_id)').eq('occurrences.company_id', companyId!),
      ]);

      const occ = occRes.data || [];
      const act = actRes.data || [];

      setStats({
        total: occ.length,
        abertas: occ.filter((o) => o.status === 'aberta').length,
        emAnalise: occ.filter((o) => o.status === 'em_analise').length,
        resolvidas: occ.filter((o) => o.status === 'resolvida').length,
        acoesPendentes: act.filter((a) => a.status === 'pendente').length,
      });
      setRecent(occ.slice(0, 5));
      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId]);

  if (loading || authLoading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader
        title="Ocorrências"
        subtitle="Painel de acompanhamento"
        action={{ label: 'Nova Ocorrência', href: '/ocorrencias/nova' }}
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total" value={stats.total} icon={FileText} color="bg-blue-500" />
        <StatCard label="Abertas" value={stats.abertas} icon={AlertCircle} color="bg-red-500" />
        <StatCard label="Em Análise" value={stats.emAnalise} icon={Clock} color="bg-yellow-500" />
        <StatCard label="Resolvidas" value={stats.resolvidas} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="Ações Pendentes" value={stats.acoesPendentes} icon={Clock} color="bg-orange-500" />
      </div>

      {/* Recent table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold">Últimas Ocorrências</h2>
          <Link href="/ocorrencias/lista" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            Nenhuma ocorrência registrada.
            <Link href="/ocorrencias/nova" className="text-blue-600 hover:underline ml-1">Criar agora</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map((occ) => (
                <tr key={occ.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/ocorrencias/${occ.id}`} className="text-blue-600 hover:underline font-medium text-sm">
                      {occ.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{occ.type}</td>
                  <td className="px-5 py-3"><StatusBadge status={occ.status} /></td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(occ.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
