'use client';

import { useEffect } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import PageHeader from '@/components/PageHeader';
import { CalendarX } from 'lucide-react';

export default function FeriadoPage() {
  const { isAdmin, loading: authLoading } = useCompany();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.replace('/dashboard'); return; }
  }, [authLoading, isAdmin, router]);

  if (authLoading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader title="Feriado / Data Nula" subtitle="Cadastro de feriados e datas não úteis" />
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <CalendarX className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Nenhum feriado cadastrado.</p>
      </div>
    </div>
  );
}
