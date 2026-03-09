'use client';

import { useEffect } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import PageHeader from '@/components/PageHeader';
import { CalendarCheck } from 'lucide-react';

export default function ConfigurarDiasUteisPage() {
  const { isAdmin, loading: authLoading } = useCompany();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.replace('/dashboard'); return; }
  }, [authLoading, isAdmin, router]);

  if (authLoading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader title="Configurar Dias Úteis" subtitle="Definição de dias úteis para o sistema" />
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Configure os dias úteis da empresa.</p>
      </div>
    </div>
  );
}
