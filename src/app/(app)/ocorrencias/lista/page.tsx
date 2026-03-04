'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { Search } from 'lucide-react';
import type { Occurrence } from '@/lib/types';

export default function OcorrenciasListaPage() {
  const { companyId, supabase, loading: authLoading } = useCompany();
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [filtered, setFiltered] = useState<Occurrence[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!companyId) { setLoading(false); return; }

    async function load() {
      const { data } = await supabase
        .from('occurrences')
        .select('*')
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false });

      if (data) {
        setOccurrences(data);
        setFiltered(data);
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId]);

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

  if (loading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader
        title="Lista de Ocorrências"
        subtitle={`${occurrences.length} ocorrências registradas`}
        action={{ label: 'Nova Ocorrência', href: '/ocorrencias/nova' }}
      />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Todos</option>
          <option value="aberta">Aberta</option>
          <option value="em_analise">Em Análise</option>
          <option value="acao_proposta">Ação Proposta</option>
          <option value="resolvida">Resolvida</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Nenhuma ocorrência encontrada.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Área</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((occ) => (
                <tr key={occ.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/ocorrencias/${occ.id}`} className="text-blue-600 hover:underline font-medium text-sm">
                      {occ.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{occ.type}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{occ.area || '-'}</td>
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
