'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { Search, Pencil, Check, X, Trash2 } from 'lucide-react';
import type { Employee } from '@/lib/types';

export default function ColaboradoresPage() {
  const { companyId, supabase, loading: authLoading } = useCompany();
  const [items, setItems] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', position: '', email: '', hire_date: '' });
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    if (!companyId) return;
    const { data } = await supabase.from('employees').select('*').eq('company_id', companyId).order('name');
    if (data) { setItems(data); setFiltered(data); }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!companyId) { setLoading(false); return; }
    loadItems();
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
    loadItems();
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditForm({ name: emp.name, position: emp.position || '', email: emp.email || '', hire_date: emp.hire_date || '' });
  };

  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    await supabase.from('employees').update({
      name: editForm.name,
      position: editForm.position || null,
      email: editForm.email || null,
      hire_date: editForm.hire_date || null,
    }).eq('id', id);
    setSaving(false);
    setEditingId(null);
    loadItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este colaborador?')) return;
    await supabase.from('employees').delete().eq('id', id);
    loadItems();
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
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    {editingId === emp.id ? (
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <span className="text-sm font-medium">{emp.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === emp.id ? (
                      <input value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cargo" />
                    ) : (
                      <span className="text-sm text-gray-600">{emp.position || '-'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === emp.id ? (
                      <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@..." />
                    ) : (
                      <span className="text-sm text-gray-600">{emp.email || '-'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === emp.id ? (
                      <input type="date" value={editForm.hire_date} onChange={(e) => setEditForm({ ...editForm, hire_date: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <span className="text-sm text-gray-500">{emp.hire_date ? new Date(emp.hire_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <select value={emp.status} onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-2 py-1">
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="ferias">Férias</option>
                      <option value="afastado">Afastado</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {editingId === emp.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(emp.id)} disabled={saving} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(emp)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
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
