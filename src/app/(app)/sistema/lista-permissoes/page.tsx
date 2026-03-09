'use client';

import { useEffect } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import PageHeader from '@/components/PageHeader';
import { ListChecks } from 'lucide-react';

export default function ListaPermissoesPage() {
  const { isAdmin, loading: authLoading } = useCompany();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.replace('/dashboard'); return; }
  }, [authLoading, isAdmin, router]);

  if (authLoading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader title="Lista de Permissões" subtitle="Visualização de todas as permissões do sistema" />
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <ListChecks className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Nenhuma permissão configurada.</p>
      </div>
    </div>
  );
}
