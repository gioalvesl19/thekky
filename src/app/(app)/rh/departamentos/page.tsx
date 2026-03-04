'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { Trash2 } from 'lucide-react';
import type { Department } from '@/lib/types';

export default function DepartamentosPage() {
  const { companyId, supabase, loading: authLoading } = useCompany();
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', manager: '' });

  const load = async () => {
    if (!companyId) return;
    const { data } = await supabase.from('departments').select('*').eq('company_id', companyId).order('name');
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading || !companyId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    await supabase.from('departments').insert({
      company_id: companyId, name: form.name, manager: form.manager || null,
    });
    setForm({ name: '', manager: '' });
    setShowForm(false); setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('departments').delete().eq('id', id);
    load();
  };

  if (loading || authLoading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader title="Departamentos" subtitle={`${items.length} departamentos`} />

      <button onClick={() => setShowForm(!showForm)}
        className="mb-4 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-all">
        {showForm ? 'Cancelar' : 'Novo Departamento'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 p-5 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome do departamento" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <input type="text" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome do gestor" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Criar Departamento'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Nenhum departamento cadastrado.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Responsável</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Criado em</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium">{dept.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{dept.manager || '-'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(dept.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(dept.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
