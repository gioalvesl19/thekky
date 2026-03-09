'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import PageHeader from '@/components/PageHeader';
import { Check } from 'lucide-react';

export default function ConfigurarPage() {
  const { companyId, isAdmin, supabase, loading: authLoading } = useCompany();
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.replace('/dashboard'); return; }
    if (!companyId) { setLoading(false); return; }

    supabase.from('companies').select('name').eq('id', companyId).single().then(({ data }) => {
      if (data) setCompanyName(data.name || '');
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId, isAdmin]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('companies').update({ name: companyName }).eq('id', companyId!);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <Loading />;

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="animate-in max-w-2xl">
      <PageHeader title="Configurar Sistema" subtitle="Configurações gerais da empresa" action={undefined} />

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} placeholder="Nome da empresa" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          {saved && (
            <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <Check className="w-4 h-4" /> Salvo com sucesso!
            </div>
          )}
        </div>
      </form>

      <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Informações do Sistema</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>ID da Empresa</span>
            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{companyId?.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span>Versão</span>
            <span className="text-gray-400">THEKKY v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
