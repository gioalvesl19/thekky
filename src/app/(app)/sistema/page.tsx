'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompany } from '@/lib/useCompany';
import Loading from '@/components/Loading';

export default function SistemaPage() {
  const { isAdmin, loading } = useCompany();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAdmin) router.replace('/dashboard');
      else router.replace('/sistema/pessoas');
    }
  }, [isAdmin, loading, router]);

  return <Loading />;
}
