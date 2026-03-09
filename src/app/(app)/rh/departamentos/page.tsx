'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import type { Department } from '@/lib/types';

export default function DepartamentosPage() {
  const { companyId, supabase, loading: authLoading } = useCompany();
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', manager: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', manager: '' });

  const load = async () => {
    if (!companyId) return;
    const { data } = await supabase.from('departments').select('*').eq('company_id', companyId).order('name');
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!companyId) { setLoading(false); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    await supabase.from('departments').insert({ company_id: companyId, name: form.name, manager: form.manager || null });
    setForm({ name: '', manager: '' });
    setShowForm(false); setSaving(false);
    load();
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id);
    setEditForm({ name: dept.name, manager: dept.manager || '' });
  };

  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    await supabase.from('departments').update({ name: editForm.name, manager: editForm.manager || null }).eq('id', id);
    setSaving(false);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este departamento?')) return;
    await supabase.from('departments').delete().eq('id', id);
    load();
  };

  if (loading) return <Loading />;

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
                  <td className="px-5 py-3">
                    {editingId === dept.id ? (
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <span className="text-sm font-medium">{dept.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === dept.id ? (
                      <input value={editForm.manager} onChange={(e) => setEditForm({ ...editForm, manager: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Responsável" />
                    ) : (
                      <span className="text-sm text-gray-600">{dept.manager || '-'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(dept.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {editingId === dept.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(dept.id)} disabled={saving} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(dept)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(dept.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
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
