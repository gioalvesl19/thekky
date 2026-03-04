'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Occurrence } from '@/lib/types';

export default function DashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    total: 0,
    abertas: 0,
    emAnalise: 0,
    resolvidas: 0,
    acoesPendentes: 0,
  });
  const [recentOccurrences, setRecentOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Get profile for company_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      // Load occurrences
      const { data: occurrences } = await supabase
        .from('occurrences')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      // Load pending actions
      const { count: pendingActions } = await supabase
        .from('actions')
        .select('*, occurrences!inner(company_id)', { count: 'exact', head: true })
        .eq('occurrences.company_id', profile.company_id)
        .eq('status', 'pendente');

      if (occurrences) {
        setStats({
          total: occurrences.length,
          abertas: occurrences.filter((o) => o.status === 'aberta').length,
          emAnalise: occurrences.filter((o) => o.status === 'em_analise').length,
          resolvidas: occurrences.filter((o) => o.status === 'resolvida').length,
          acoesPendentes: pendingActions || 0,
        });
        setRecentOccurrences(occurrences.slice(0, 5));
      }

      setLoading(false);
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const cards = [
    { label: 'Total de Ocorrências', value: stats.total, icon: FileText, color: 'bg-blue-500' },
    { label: 'Ocorrências Abertas', value: stats.abertas, icon: AlertCircle, color: 'bg-red-500' },
    { label: 'Em Análise', value: stats.emAnalise, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Resolvidas', value: stats.resolvidas, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Ações Pendentes', value: stats.acoesPendentes, icon: Clock, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`${card.color} p-2.5 rounded-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Occurrences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ocorrências Recentes</h2>
          <Link href="/ocorrencias" className="text-sm text-blue-600 hover:underline">
            Ver todas
          </Link>
        </div>
        {recentOccurrences.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma ocorrência registrada ainda.
            <Link href="/ocorrencias/nova" className="text-blue-600 hover:underline ml-1">
              Criar primeira ocorrência
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOccurrences.map((occ) => (
                <tr key={occ.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link href={`/ocorrencias/${occ.id}`} className="text-blue-600 hover:underline font-medium">
                      {occ.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{occ.type}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={occ.status} />
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(occ.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
