'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { Plus, Search } from 'lucide-react';
import type { Occurrence } from '@/lib/types';

export default function OcorrenciasPage() {
  const supabase = createClient();
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [filtered, setFiltered] = useState<Occurrence[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const { data } = await supabase
        .from('occurrences')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (data) {
        setOccurrences(data);
        setFiltered(data);
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let result = occurrences;
    if (search) {
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(search.toLowerCase()) ||
          o.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, occurrences]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ocorrências</h1>
        <Link
          href="/ocorrencias/nova"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova Ocorrência
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ocorrências..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Todos os status</option>
          <option value="aberta">Aberta</option>
          <option value="em_analise">Em Análise</option>
          <option value="acao_proposta">Ação Proposta</option>
          <option value="resolvida">Resolvida</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {occurrences.length === 0 ? (
              <>
                Nenhuma ocorrência registrada.{' '}
                <Link href="/ocorrencias/nova" className="text-blue-600 hover:underline">
                  Criar primeira ocorrência
                </Link>
              </>
            ) : (
              'Nenhuma ocorrência encontrada com os filtros selecionados.'
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Área</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((occ) => (
                <tr key={occ.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/ocorrencias/${occ.id}`} className="text-blue-600 hover:underline font-medium">
                      {occ.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{occ.type}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{occ.area || '-'}</td>
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
