'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import type { Department } from '@/lib/types';

export default function NovoColaboradorPage() {
  const { companyId, supabase, loading: authLoading } = useCompany();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', position: '', phone: '', hire_date: '', department_id: '',
  });

  useEffect(() => {
    if (authLoading || !companyId) return;
    supabase.from('departments').select('*').eq('company_id', companyId).order('name').then(({ data }) => {
      if (data) setDepartments(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setLoading(true); setError('');

    const { error: err } = await supabase.from('employees').insert({
      company_id: companyId, name: form.name, email: form.email || null,
      position: form.position || null, phone: form.phone || null,
      hire_date: form.hire_date || null, department_id: form.department_id || null,
      status: 'ativo',
    });

    if (err) { setError(err.message); setLoading(false); }
    else router.push('/rh/colaboradores');
  };

  return (
    <div className="max-w-3xl animate-in">
      <PageHeader title="Novo Colaborador" subtitle="Cadastrar colaborador" />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão</label>
            <input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
          <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Nenhum</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? 'Salvando...' : 'Cadastrar'}
          </button>
          <button type="button" onClick={() => router.push('/rh/colaboradores')}
            className="px-6 py-2.5 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
