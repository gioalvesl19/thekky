'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import SeverityBadge from '@/components/SeverityBadge';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { Search } from 'lucide-react';
import type { SafetyIncident } from '@/lib/types';

export default function IncidentesPage() {
  const { companyId, supabase, loading: authLoading } = useCompany();
  const [items, setItems] = useState<SafetyIncident[]>([]);
  const [filtered, setFiltered] = useState<SafetyIncident[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!companyId) { setLoading(false); return; }
    async function load() {
      const { data } = await supabase
        .from('safety_incidents')
        .select('*')
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false });
      if (data) { setItems(data); setFiltered(data); }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId]);

  useEffect(() => {
    let result = items;
    if (search) result = result.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) result = result.filter((i) => i.status === statusFilter);
    setFiltered(result);
  }, [search, statusFilter, items]);

  if (loading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader title="Incidentes de Segurança" subtitle={`${items.length} registros`} action={{ label: 'Novo Incidente', href: '/ssh/incidentes/novo' }} />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">Todos</option>
          <option value="aberto">Aberto</option>
          <option value="investigando">Investigando</option>
          <option value="acao_tomada">Ação Tomada</option>
          <option value="encerrado">Encerrado</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Nenhum incidente encontrado.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Severidade</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/ssh/incidentes/${inc.id}`} className="text-blue-600 hover:underline font-medium text-sm">{inc.title}</Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{inc.type}</td>
                  <td className="px-5 py-3"><SeverityBadge severity={inc.severity} /></td>
                  <td className="px-5 py-3"><StatusBadge status={inc.status} type="incident" /></td>
                  <td className="px-5 py-3 text-sm text-gray-500">{inc.incident_date ? new Date(inc.incident_date).toLocaleDateString('pt-BR') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
