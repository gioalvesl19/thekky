'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import PageHeader from '@/components/PageHeader';
import { UserPlus, Pencil, Check, X } from 'lucide-react';
import type { Profile, UserRole } from '@/lib/types';

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  user: 'Usuário',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-700',
};

export default function PessoasPage() {
  const { companyId, userId, isAdmin, supabase, loading: authLoading } = useCompany();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('user');
  const [inviteMsg, setInviteMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.replace('/dashboard'); return; }
    if (!companyId) { setLoading(false); return; }

    supabase.from('profiles').select('*').eq('company_id', companyId).order('created_at').then(({ data }) => {
      if (data) setProfiles(data as Profile[]);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId, isAdmin]);

  const handleEdit = (p: Profile) => {
    setEditingId(p.id);
    setEditRole(p.role);
    setEditName(p.name || '');
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    await supabase.from('profiles').update({ role: editRole, name: editName }).eq('id', id);
    setSaving(false);
    setEditingId(null);
    const { data } = await supabase.from('profiles').select('*').eq('company_id', companyId!);
    if (data) setProfiles(data as Profile[]);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMsg(`Convide ${inviteEmail} para criar conta em: ${window.location.origin}/login — após o cadastro, o perfil será vinculado à empresa e você poderá definir a função "${roleLabels[inviteRole]}" aqui nesta página.`);
    setInviteEmail('');
    setInviteName('');
    setShowInvite(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader
        title="Pessoas"
        subtitle={`${profiles.length} usuário(s) cadastrado(s)`}
        action={undefined}
      />

      {inviteMsg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg p-3 mb-4">
          {inviteMsg}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button onClick={() => setShowInvite(!showInvite)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <UserPlus className="w-4 h-4" /> Convidar Usuário
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-4">
          <h3 className="font-semibold text-sm">Convidar Novo Usuário</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
              <input type="text" required value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome completo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
              <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@empresa.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Perfil de Acesso</label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as UserRole)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="user">Usuário</option>
              <option value="manager">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Ver instruções</button>
            <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Perfil</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Desde</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {profiles.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3">
                  {editingId === p.id ? (
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.name || 'Sem nome'}</p>
                      {p.id === userId && <span className="text-xs text-blue-500">(você)</span>}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3">
                  {editingId === p.id ? (
                    <select value={editRole} onChange={(e) => setEditRole(e.target.value as UserRole)} className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="user">Usuário</option>
                      <option value="manager">Gerente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  ) : (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[p.role]}`}>
                      {roleLabels[p.role]}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {new Date(p.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-5 py-3">
                  {editingId === p.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleSave(p.id)} disabled={saving} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
