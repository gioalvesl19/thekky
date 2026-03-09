'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import PageHeader from '@/components/PageHeader';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import type { Unit } from '@/lib/types';

export default function UnidadePage() {
  const { companyId, isAdmin, supabase, loading: authLoading } = useCompany();
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', city: '', state: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', city: '', state: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!companyId) return;
    const { data } = await supabase.from('units').select('*').eq('company_id', companyId).order('name');
    if (data) setUnits(data as Unit[]);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.replace('/dashboard'); return; }
    if (!companyId) { setLoading(false); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId, isAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !companyId) return;
    setSaving(true);
    await supabase.from('units').insert({ company_id: companyId, name: form.name, city: form.city || null, state: form.state || null });
    setForm({ name: '', city: '', state: '' });
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    await supabase.from('units').update({ name: editForm.name, city: editForm.city || null, state: editForm.state || null }).eq('id', id);
    setSaving(false);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta unidade?')) return;
    await supabase.from('units').delete().eq('id', id);
    load();
  };

  if (loading) return <Loading />;

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="animate-in">
      <PageHeader title="Unidades" subtitle={`${units.length} unidade(s) cadastrada(s)`} action={undefined} />

      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Nova Unidade
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-3">
          <h3 className="font-semibold text-sm">Nova Unidade</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Nome da unidade" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} placeholder="Cidade" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <input type="text" maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} className={inputClass} placeholder="UF" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {units.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">Nenhuma unidade cadastrada.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Cidade</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {units.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    {editingId === u.id ? (
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <span className="text-sm font-medium text-gray-800">{u.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === u.id ? (
                      <input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="px-2 py-1 border border-gray-300 rounded text-sm outline-none w-28 focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <span className="text-sm text-gray-500">{u.city || '-'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === u.id ? (
                      <input value={editForm.state} maxLength={2} onChange={(e) => setEditForm({ ...editForm, state: e.target.value.toUpperCase() })} className="px-2 py-1 border border-gray-300 rounded text-sm outline-none w-16 focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <span className="text-sm text-gray-500">{u.state || '-'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {editingId === u.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(u.id)} disabled={saving} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"><X className="w-3.5 h-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(u.id); setEditForm({ name: u.name, city: u.city || '', state: u.state || '' }); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
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
