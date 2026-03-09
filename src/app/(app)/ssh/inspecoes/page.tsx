'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { Pencil, Check, X, Trash2 } from 'lucide-react';
import type { SafetyInspection } from '@/lib/types';

export default function InspecoesPage() {
  const { companyId, supabase, loading: authLoading } = useCompany();
  const [items, setItems] = useState<SafetyInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', area: '', inspector: '', inspection_date: '', next_inspection: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', area: '', inspector: '', inspection_date: '', next_inspection: '' });

  const load = async () => {
    if (!companyId) return;
    const { data } = await supabase.from('safety_inspections').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
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
    await supabase.from('safety_inspections').insert({
      company_id: companyId, title: form.title, area: form.area || null,
      inspector: form.inspector, inspection_date: form.inspection_date || null,
      next_inspection: form.next_inspection || null, status: 'pendente',
    });
    setForm({ title: '', area: '', inspector: '', inspection_date: '', next_inspection: '' });
    setShowForm(false); setSaving(false);
    load();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from('safety_inspections').update({ status }).eq('id', id);
    load();
  };

  const handleEdit = (insp: SafetyInspection) => {
    setEditingId(insp.id);
    setEditForm({
      title: insp.title, area: insp.area || '', inspector: insp.inspector,
      inspection_date: insp.inspection_date || '', next_inspection: insp.next_inspection || '',
    });
  };

  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    await supabase.from('safety_inspections').update({
      title: editForm.title, area: editForm.area || null, inspector: editForm.inspector,
      inspection_date: editForm.inspection_date || null, next_inspection: editForm.next_inspection || null,
    }).eq('id', id);
    setSaving(false);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta inspeção?')) return;
    await supabase.from('safety_inspections').delete().eq('id', id);
    load();
  };

  if (loading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader title="Inspeções de Segurança" subtitle={`${items.length} inspeções`} />

      <button onClick={() => setShowForm(!showForm)}
        className="mb-4 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-all">
        {showForm ? 'Cancelar' : 'Nova Inspeção'}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 p-5 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspetor *</label>
              <input type="text" required value={form.inspector} onChange={(e) => setForm({ ...form, inspector: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input type="date" value={form.inspection_date} onChange={(e) => setForm({ ...form, inspection_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Inspeção</label>
              <input type="date" value={form.next_inspection} onChange={(e) => setForm({ ...form, next_inspection: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Criar Inspeção'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Nenhuma inspeção registrada.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Área</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Inspetor</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((insp) => (
                <tr key={insp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    {editingId === insp.id ? (
                      <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <span className="text-sm font-medium">{insp.title}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === insp.id ? (
                      <input value={editForm.area} onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <span className="text-sm text-gray-600">{insp.area || '-'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === insp.id ? (
                      <input value={editForm.inspector} onChange={(e) => setEditForm({ ...editForm, inspector: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <span className="text-sm text-gray-600">{insp.inspector}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === insp.id ? (
                      <input type="date" value={editForm.inspection_date} onChange={(e) => setEditForm({ ...editForm, inspection_date: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <span className="text-sm text-gray-500">{insp.inspection_date ? new Date(insp.inspection_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <select value={insp.status} onChange={(e) => handleStatusChange(insp.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-2 py-1">
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="concluida">Concluída</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {editingId === insp.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(insp.id)} disabled={saving} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(insp)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(insp.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
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
