'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types';

export function useCompany() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setError(authError?.message || 'Não autenticado');
          setLoading(false);
          return;
        }
        setUserId(user.id);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id, role, name')
          .eq('id', user.id)
          .single();

        // Só faz logout se o erro for especificamente "sem linhas" (PGRST116)
        // Outros erros (rede, timeout) NÃO devem deslogar
        if (!profile && profileError?.code === 'PGRST116') {
          await supabase.auth.signOut();
          router.replace('/login');
          return;
        }

        if (profile) {
          setCompanyId(profile.company_id);
          setRole((profile.role as UserRole) || 'user');
          setUserName(profile.name || '');
        }
      } catch (e) {
        console.error('useCompany error:', e);
        setError('Erro ao carregar dados');
      }
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  const isAdmin = role === 'admin';
  const isManager = role === 'admin' || role === 'manager';

  return { companyId, userId, userName, role, isAdmin, isManager, loading, error, supabase };
}
