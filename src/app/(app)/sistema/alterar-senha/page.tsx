'use client';

import { useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import PageHeader from '@/components/PageHeader';
import { Check, Eye, EyeOff } from 'lucide-react';

export default function AlterarSenhaPage() {
  const { supabase } = useCompany();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: form.password });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setMsg('Senha alterada com sucesso!');
      setForm({ password: '', confirm: '' });
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 pr-10';

  return (
    <div className="animate-in max-w-md">
      <PageHeader title="Alterar Senha" subtitle="Atualize sua senha de acesso" action={undefined} />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              required
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className={inputClass}
              placeholder="Repita a nova senha"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        {msg && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
            <Check className="w-4 h-4 shrink-0" /> {msg}
          </div>
        )}

        <button type="submit" disabled={saving} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? 'Salvando...' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  );
}
