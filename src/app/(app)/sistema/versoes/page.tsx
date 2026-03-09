'use client';

import { useEffect } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import PageHeader from '@/components/PageHeader';
import { Megaphone } from 'lucide-react';

export default function VersoesPage() {
  const { isAdmin, loading: authLoading } = useCompany();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.replace('/dashboard'); return; }
  }, [authLoading, isAdmin, router]);

  if (authLoading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader title="Versões / Comunicados de Atualizações do Sistema" subtitle="Histórico de versões e comunicados de atualização" />
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Nenhuma versão ou comunicado disponível.</p>
      </div>
    </div>
  );
}
