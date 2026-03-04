'use client';

import { useEffect, useState } from 'react';
import { useCompany } from '@/lib/useCompany';
import { AlertTriangle, ClipboardCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/components/Loading';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import SeverityBadge from '@/components/SeverityBadge';
import PageHeader from '@/components/PageHeader';
import type { SafetyIncident } from '@/lib/types';

export default function SSHPainelPage() {
  const { companyId, supabase, loading: authLoading } = useCompany();
  const [stats, setStats] = useState({ total: 0, abertos: 0, criticos: 0, inspecoes: 0 });
  const [recent, setRecent] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!companyId) { setLoading(false); return; }

    async function load() {
      const [incRes, inspRes] = await Promise.all([
        supabase.from('safety_incidents').select('*').eq('company_id', companyId!).order('created_at', { ascending: false }),
        supabase.from('safety_inspections').select('status').eq('company_id', companyId!),
      ]);

      const inc = incRes.data || [];
      const insp = inspRes.data || [];

      setStats({
        total: inc.length,
        abertos: inc.filter((i) => i.status === 'aberto').length,
        criticos: inc.filter((i) => i.severity === 'critica' || i.severity === 'alta').length,
        inspecoes: insp.filter((i) => i.status === 'pendente').length,
      });
      setRecent(inc.slice(0, 5));
      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, companyId]);

  if (loading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader
        title="SSH - Segurança e Saúde"
        subtitle="Painel de acompanhamento"
        action={{ label: 'Novo Incidente', href: '/ssh/incidentes/novo' }}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Incidentes" value={stats.total} icon={AlertTriangle} color="bg-orange-500" />
        <StatCard label="Abertos" value={stats.abertos} icon={ShieldAlert} color="bg-red-500" />
        <StatCard label="Críticos/Altos" value={stats.criticos} icon={AlertTriangle} color="bg-red-600" />
        <StatCard label="Inspeções Pendentes" value={stats.inspecoes} icon={ClipboardCheck} color="bg-yellow-500" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link href="/ssh/incidentes" className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="font-medium text-sm">Incidentes</p>
              <p className="text-xs text-gray-500">Gerenciar ocorrências de segurança</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link href="/ssh/inspecoes" className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg"><ClipboardCheck className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="font-medium text-sm">Inspeções</p>
              <p className="text-xs text-gray-500">Controle de inspeções de segurança</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent incidents */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold">Últimos Incidentes</h2>
          <Link href="/ssh/incidentes" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Nenhum incidente registrado.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Severidade</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/ssh/incidentes/${inc.id}`} className="text-blue-600 hover:underline font-medium text-sm">{inc.title}</Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{inc.type}</td>
                  <td className="px-5 py-3"><SeverityBadge severity={inc.severity} /></td>
                  <td className="px-5 py-3"><StatusBadge status={inc.status} type="incident" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
