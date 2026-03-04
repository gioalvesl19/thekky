'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { Users, UserCheck, Building2, UserX, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/Loading';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';

export default function RHPainelPage() {
  const { companyId, supabase, loading: authLoading } = useCompany();
  const [stats, setStats] = useState({ total: 0, ativos: 0, inativos: 0, departments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!companyId) { setLoading(false); return; }

    async function load() {
      const [empRes, deptRes] = await Promise.all([
        supabase.from('employees').select('status').eq('company_id', companyId!),
        supabase.from('departments').select('id').eq('company_id', companyId!),
      ]);

      const emp = empRes.data || [];
      const dept = deptRes.data || [];

      setStats({
        total: emp.length,
        ativos: emp.filter((e) => e.status === 'ativo').length,
        inativos: emp.filter((e) => e.status !== 'ativo').length,
        departments: dept.length,
      });
      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId]);

  if (loading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader
        title="RH - Recursos Humanos"
        subtitle="Painel de acompanhamento"
        action={{ label: 'Novo Colaborador', href: '/rh/colaboradores/novo' }}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Colaboradores" value={stats.total} icon={Users} color="bg-green-500" />
        <StatCard label="Ativos" value={stats.ativos} icon={UserCheck} color="bg-blue-500" />
        <StatCard label="Inativos/Afastados" value={stats.inativos} icon={UserX} color="bg-gray-500" />
        <StatCard label="Departamentos" value={stats.departments} icon={Building2} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/rh/colaboradores" className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-lg"><Users className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="font-medium text-sm">Colaboradores</p>
              <p className="text-xs text-gray-500">Gerenciar equipe</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link href="/rh/departamentos" className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-2 rounded-lg"><Building2 className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="font-medium text-sm">Departamentos</p>
              <p className="text-xs text-gray-500">Estrutura organizacional</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
