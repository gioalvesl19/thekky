'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import PageHeader from '@/components/PageHeader';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import type { Area } from '@/lib/types';

export default function AreasPage() {
  const { companyId, isAdmin, supabase, loading: authLoading } = useCompany();
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!companyId) return;
    const { data } = await supabase.from('areas').select('*').eq('company_id', companyId).order('name');
    if (data) setAreas(data as Area[]);
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
    if (!newName || !companyId) return;
    setSaving(true);
    await supabase.from('areas').insert({ company_id: companyId, name: newName, description: newDesc || null });
    setNewName('');
    setNewDesc('');
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleSaveEdit = async (id: string) => {
    setSaving(true);
    await supabase.from('areas').update({ name: editName }).eq('id', id);
    setSaving(false);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta área?')) return;
    await supabase.from('areas').delete().eq('id', id);
    load();
  };

  if (loading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader title="Áreas" subtitle={`${areas.length} área(s) cadastrada(s)`} action={undefined} />

      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Nova Área
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-3">
          <h3 className="font-semibold text-sm">Nova Área</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
              <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Qualidade, Produção, TI..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
              <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Opcional" />
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
        {areas.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">Nenhuma área cadastrada. Crie a primeira área.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {areas.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    {editingId === a.id ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <span className="text-sm font-medium text-gray-800">{a.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{a.description || '-'}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {editingId === a.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(a.id)} disabled={saving} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(a.id); setEditName(a.name); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(a.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
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
