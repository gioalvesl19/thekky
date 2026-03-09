'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import PageHeader from '@/components/PageHeader';
import { UserPlus, Pencil, Check, X, Trash2, Eye, EyeOff } from 'lucide-react';
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

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500';

type ProfileWithUsername = Profile & { username?: string };

export default function PessoasPage() {
  const { companyId, userId, isAdmin, supabase, loading: authLoading } = useCompany();
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileWithUsername[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // Formulário de criação
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'user' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [creating, setCreating] = useState(false);

  const loadProfiles = async () => {
    if (!companyId) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at');
    if (data) setProfiles(data as ProfileWithUsername[]);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.replace('/dashboard'); return; }
    if (!companyId) { setLoading(false); return; }
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId, isAdmin]);

  const handleEdit = (p: ProfileWithUsername) => {
    setEditingId(p.id);
    setEditRole(p.role);
    setEditName(p.name || '');
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    await supabase.from('profiles').update({ role: editRole, name: editName }).eq('id', id);
    setSaving(false);
    setEditingId(null);
    loadProfiles();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setCreateError('Sessão expirada. Faça login novamente.'); setCreating(false); return; }

      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          username: createForm.username,
          password: createForm.password,
          name: createForm.name,
          role: createForm.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || 'Erro ao criar usuário.');
      } else {
        setCreateSuccess(`✓ ${data.message}`);
        setCreateForm({ name: '', username: '', password: '', role: 'user' });
        setShowCreate(false);
        loadProfiles();
      }
    } catch {
      setCreateError('Erro de conexão. Tente novamente.');
    }

    setCreating(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader
        title="Pessoas"
        subtitle={`${profiles.length} usuário(s) cadastrado(s)`}
      />

      {createSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-3 mb-4">
          {createSuccess}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setShowCreate(!showCreate); setCreateError(''); setCreateSuccess(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Criar Usuário
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateUser} className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-4">
          <h3 className="font-semibold text-sm text-gray-800">Novo Usuário</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome completo *</label>
              <input
                type="text" required value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className={inputClass} placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Usuário (usado para login) *
              </label>
              <input
                type="text" required value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                className={inputClass} placeholder="ex: joaosilva"
                title="Apenas letras, números, pontos, underscores ou hífens"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Senha *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required minLength={6}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className={inputClass + ' pr-10'} placeholder="Mínimo 6 caracteres"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Perfil de Acesso *</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                className={inputClass}
              >
                <option value="user">Usuário</option>
                <option value="manager">Gerente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          {createError && (
            <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{createError}</p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {creating ? 'Criando...' : 'Criar Usuário'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {profiles.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Nenhum usuário cadastrado.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Usuário</th>
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
                    <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {p.username || '-'}
                    </span>
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
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar nome/perfil">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {p.id !== userId && (
                          <button
                            onClick={async () => {
                              if (!confirm(`Remover ${p.name || 'este usuário'}?`)) return;
                              await supabase.from('profiles').delete().eq('id', p.id);
                              loadProfiles();
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
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
