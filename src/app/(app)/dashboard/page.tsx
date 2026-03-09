'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { FileText, AlertCircle, ShieldAlert, Users, ArrowRight, AlertTriangle, UserCheck } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/Loading';
import StatCard from '@/components/StatCard';

type ModuleStats = {
  occurrences: { total: number; abertas: number; acoesPendentes: number };
  ssh: { total: number; abertos: number; criticos: number };
  rh: { totalEmployees: number; ativos: number; departments: number };
};

export default function DashboardPage() {
  const { companyId, supabase, loading: authLoading } = useCompany();
  const [stats, setStats] = useState<ModuleStats>({
    occurrences: { total: 0, abertas: 0, acoesPendentes: 0 },
    ssh: { total: 0, abertos: 0, criticos: 0 },
    rh: { totalEmployees: 0, ativos: 0, departments: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!companyId) { setLoading(false); return; }

    async function load() {
      const [occRes, actRes, sshRes, empRes, deptRes] = await Promise.all([
        supabase.from('occurrences').select('status').eq('company_id', companyId!),
        supabase.from('actions').select('status, occurrences!inner(company_id)').eq('occurrences.company_id', companyId!),
        supabase.from('safety_incidents').select('status, severity').eq('company_id', companyId!),
        supabase.from('employees').select('status').eq('company_id', companyId!),
        supabase.from('departments').select('id').eq('company_id', companyId!),
      ]);

      const occ = occRes.data || [];
      const act = actRes.data || [];
      const ssh = sshRes.data || [];
      const emp = empRes.data || [];
      const dept = deptRes.data || [];

      setStats({
        occurrences: {
          total: occ.length,
          abertas: occ.filter((o) => o.status === 'aberta').length,
          acoesPendentes: act.filter((a) => a.status === 'pendente').length,
        },
        ssh: {
          total: ssh.length,
          abertos: ssh.filter((s) => s.status === 'aberto').length,
          criticos: ssh.filter((s) => s.severity === 'critica' || s.severity === 'alta').length,
        },
        rh: {
          totalEmployees: emp.length,
          ativos: emp.filter((e) => e.status === 'ativo').length,
          departments: dept.length,
        },
      });

      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId]);

  if (loading) return <Loading />;

  const moduleCards = [
    {
      title: 'Ocorrências',
      href: '/ocorrencias',
      color: 'border-l-blue-500',
      bgColor: 'bg-blue-50',
      icon: FileText,
      iconColor: 'text-blue-600',
      stats: [
        { label: 'Total', value: stats.occurrences.total },
        { label: 'Abertas', value: stats.occurrences.abertas },
        { label: 'Ações pendentes', value: stats.occurrences.acoesPendentes },
      ],
    },
    {
      title: 'SSH - Segurança',
      href: '/ssh',
      color: 'border-l-orange-500',
      bgColor: 'bg-orange-50',
      icon: ShieldAlert,
      iconColor: 'text-orange-600',
      stats: [
        { label: 'Incidentes', value: stats.ssh.total },
        { label: 'Abertos', value: stats.ssh.abertos },
        { label: 'Críticos/Altos', value: stats.ssh.criticos },
      ],
    },
    {
      title: 'RH - Recursos Humanos',
      href: '/rh',
      color: 'border-l-green-500',
      bgColor: 'bg-green-50',
      icon: Users,
      iconColor: 'text-green-600',
      stats: [
        { label: 'Colaboradores', value: stats.rh.totalEmployees },
        { label: 'Ativos', value: stats.rh.ativos },
        { label: 'Departamentos', value: stats.rh.departments },
      ],
    },
  ];

  return (
    <div className="animate-in">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">Visão geral de todos os módulos</p>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Ocorrências Abertas" value={stats.occurrences.abertas} icon={AlertCircle} color="bg-red-500" />
        <StatCard label="Ações Pendentes" value={stats.occurrences.acoesPendentes} icon={FileText} color="bg-blue-500" />
        <StatCard label="Incidentes SSH" value={stats.ssh.abertos} icon={AlertTriangle} color="bg-orange-500" subtitle="Abertos" />
        <StatCard label="Colaboradores" value={stats.rh.ativos} icon={UserCheck} color="bg-green-500" subtitle="Ativos" />
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {moduleCards.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className={`bg-white rounded-xl border border-gray-100 border-l-4 ${mod.color} p-5 hover:shadow-lg transition-all duration-200 group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`${mod.bgColor} p-2 rounded-lg`}>
                  <mod.icon className={`w-5 h-5 ${mod.iconColor}`} />
                </div>
                <h3 className="font-semibold">{mod.title}</h3>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {mod.stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-[10px] text-gray-500 uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
