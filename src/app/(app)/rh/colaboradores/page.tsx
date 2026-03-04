'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { Search } from 'lucide-react';
import type { Employee } from '@/lib/types';

export default function ColaboradoresPage() {
  const { companyId, supabase, loading: authLoading } = useCompany();
  const [items, setItems] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!companyId) { setLoading(false); return; }
    async function load() {
      const { data } = await supabase.from('employees').select('*').eq('company_id', companyId!).order('name');
      if (data) { setItems(data); setFiltered(data); }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId]);

  useEffect(() => {
    if (search) {
      setFiltered(items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.position?.toLowerCase().includes(search.toLowerCase())));
    } else {
      setFiltered(items);
    }
  }, [search, items]);

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from('employees').update({ status }).eq('id', id);
    const { data } = await supabase.from('employees').select('*').eq('company_id', companyId!).order('name');
    if (data) { setItems(data); setFiltered(data); }
  };

  if (loading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader title="Colaboradores" subtitle={`${items.length} colaboradores`} action={{ label: 'Novo Colaborador', href: '/rh/colaboradores/novo' }} />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por nome ou cargo..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Nenhum colaborador encontrado.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Cargo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Admissão</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium">{emp.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{emp.position || '-'}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{emp.email || '-'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="px-5 py-3">
                    <select value={emp.status} onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-2 py-1">
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="ferias">Férias</option>
                      <option value="afastado">Afastado</option>
                    </select>
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
