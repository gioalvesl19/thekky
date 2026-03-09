'use client';

import { useEffect } from 'react';
import { useCompany } from '@/lib/useCompany';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import PageHeader from '@/components/PageHeader';
import { Shield, Users, UserCheck } from 'lucide-react';

const permissions = [
  {
    role: 'Administrador',
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    icon: Shield,
    access: [
      'Acesso total ao sistema',
      'Gerenciar usuários e permissões',
      'Criar e editar áreas e unidades',
      'Configurar o sistema',
      'Visualizar todos os módulos',
      'Criar, editar e excluir ocorrências',
      'Criar, editar e excluir ações',
      'Gerenciar SSH e RH',
    ],
  },
  {
    role: 'Gerente',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    icon: UserCheck,
    access: [
      'Visualizar todos os módulos',
      'Criar e editar ocorrências',
      'Criar e editar ações',
      'Gerenciar SSH e RH',
      'Visualizar relatórios',
      'Sem acesso ao módulo Sistema',
    ],
  },
  {
    role: 'Usuário',
    color: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-100 text-gray-700',
    icon: Users,
    access: [
      'Visualizar dashboard',
      'Criar ocorrências',
      'Visualizar ocorrências da empresa',
      'Registrar ações corretivas',
      'Visualizar SSH e RH',
      'Sem acesso ao módulo Sistema',
    ],
  },
];

export default function PermissoesPage() {
  const { isAdmin, loading: authLoading } = useCompany();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/dashboard');
  }, [isAdmin, authLoading, router]);

  if (authLoading) return <Loading />;

  return (
    <div className="animate-in">
      <PageHeader title="Permissões" subtitle="Níveis de acesso do sistema" action={undefined} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {permissions.map((p) => (
          <div key={p.role} className={`rounded-xl border p-5 ${p.color}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.badge}`}>
                <p.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{p.role}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.badge}`}>Nível {permissions.indexOf(p) + 1}</span>
              </div>
            </div>
            <ul className="space-y-1.5">
              {p.access.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 shrink-0 opacity-60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Para alterar permissões de usuários:</strong> Acesse <strong>Sistema → Pessoas</strong>, encontre o usuário e clique em editar para mudar o perfil de acesso.
      </div>
    </div>
  );
}
