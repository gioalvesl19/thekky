'use client';

import { useEffect } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import PageHeader from '@/components/PageHeader';
import { Grid2X2 } from 'lucide-react';

export default function TabelaIafNacePage() {
  const { isAdmin, loading: authLoading } = useCompany();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.replace('/dashboard'); return; }
  }, [authLoading, isAdmin, router]);

  if (authLoading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader title="Tabela Código IAF/NACE" subtitle="Códigos de atividade econômica IAF e NACE" />
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <Grid2X2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Nenhum código IAF/NACE cadastrado.</p>
      </div>
    </div>
  );
}
