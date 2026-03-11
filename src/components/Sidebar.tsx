'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ShieldAlert,
  Users,
  LogOut,
  ChevronDown,
  AlertTriangle,
  ClipboardCheck,
  UserPlus,
  Building2,
  Plus,
  Settings,
  MapPin,
  Lock,
  Key,
  User,
  Calendar,
  HardDrive,
  Mail,
  Building,
  CreditCard,
  Ban,
  CalendarCheck,
  Phone,
  CalendarX,
  MessageSquare,
  BookOpen,
  ListChecks,
  Activity,
  FileCheck,
  Grid2X2,
  Clock,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, useMemo } from 'react';
import type { UserRole } from '@/lib/types';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  icon: LucideIcon;
  basePath: string;
  color: string;
  items: NavItem[];
  adminOnly?: boolean;
};

const modules: NavGroup[] = [
  {
    label: 'Ocorrências',
    icon: FileText,
    basePath: '/ocorrencias',
    color: 'text-blue-400',
    items: [
      { href: '/ocorrencias', label: 'Painel', icon: LayoutDashboard },
      { href: '/ocorrencias/lista', label: 'Lista', icon: FileText },
      { href: '/ocorrencias/nova', label: 'Nova Ocorrência', icon: Plus },
    ],
  },
  {
    label: 'SSH',
    icon: ShieldAlert,
    basePath: '/ssh',
    color: 'text-orange-400',
    items: [
      { href: '/ssh', label: 'Painel', icon: LayoutDashboard },
      { href: '/ssh/incidentes', label: 'Incidentes', icon: AlertTriangle },
      { href: '/ssh/inspecoes', label: 'Inspeções', icon: ClipboardCheck },
    ],
  },
  {
    label: 'RH',
    icon: Users,
    basePath: '/rh',
    color: 'text-green-400',
    items: [
      { href: '/rh', label: 'Painel', icon: LayoutDashboard },
      { href: '/rh/colaboradores', label: 'Colaboradores', icon: UserPlus },
      { href: '/rh/departamentos', label: 'Departamentos', icon: Building2 },
    ],
  },
  {
    label: 'Sistema',
    icon: Settings,
    basePath: '/sistema',
    color: 'text-purple-400',
    adminOnly: true,
    items: [
      { href: '/sistema/agenda', label: 'Agenda', icon: Calendar },
      { href: '/sistema/alterar-senha', label: 'Alterar Senha', icon: Key },
      { href: '/sistema/areas', label: 'Áreas', icon: MapPin },
      { href: '/sistema/backups', label: 'Backups Gerados', icon: HardDrive },
      { href: '/sistema/central-emails-tarefas', label: 'Central de E-mails e Tarefas', icon: Mail },
      { href: '/sistema/cidade', label: 'Cidade', icon: Building },
      { href: '/sistema/cobranca', label: 'Cobrança', icon: CreditCard },
      { href: '/sistema/configurar-bloqueios', label: 'Configurar Bloqueios', icon: Ban },
      { href: '/sistema/configurar-dias-uteis', label: 'Configurar Dias Úteis', icon: CalendarCheck },
      { href: '/sistema/configurar', label: 'Configurar Sistema', icon: Settings },
      { href: '/sistema/contatos', label: 'Contatos', icon: Phone },
      { href: '/sistema/feriado', label: 'Feriado / Data Nula', icon: CalendarX },
      { href: '/sistema/forum', label: 'Fórum', icon: MessageSquare },
      { href: '/sistema/guia-implantacao', label: 'Guia de Implantação', icon: BookOpen },
      { href: '/sistema/lista-permissoes', label: 'Lista de Permissões', icon: ListChecks },
      { href: '/sistema/permissoes', label: 'Permissões', icon: Lock },
      { href: '/sistema/pessoas', label: 'Pessoas', icon: User },
      { href: '/sistema/raio-x', label: 'Raio X de Uso do Sistema', icon: Activity },
      { href: '/sistema/requisitos-regulamentares', label: 'Requisitos Regulamentares', icon: FileCheck },
      { href: '/sistema/tabela-iaf-nace', label: 'Tabela Código IAF/NACE', icon: Grid2X2 },
      { href: '/sistema/turno', label: 'Turno', icon: Clock },
      { href: '/sistema/unidade', label: 'Unidade', icon: Building2 },
      { href: '/sistema/versoes', label: 'Versões / Comunicados de Atualizações do Sistema', icon: Megaphone },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [role, setRole] = useState<UserRole>('user');
  const [userName, setUserName] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    modules.forEach((m) => {
      if (pathname.startsWith(m.basePath)) initial[m.basePath] = true;
    });
    return initial;
  });

  useEffect(() => {
    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', user.id)
        .single();
      if (data) {
        setRole((data.role as UserRole) || 'user');
        setUserName(data.name || '');
      }
    }
    loadRole();
  }, [supabase]);

  const toggleGroup = (basePath: string) => {
    setOpenGroups((prev) => ({ ...prev, [basePath]: !prev[basePath] }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const visibleModules = modules.filter((m) => !m.adminOnly || role === 'admin');

  return (
    <aside className="w-60 bg-gray-900 text-white min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-800">
        <Link href="/dashboard" className="block">
          <h1 className="text-lg font-bold tracking-tight">THEKKY</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Sistema de Gestão</p>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            pathname === '/dashboard'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Dashboard
        </Link>

        <div className="h-2" />

        {/* Module Groups */}
        {visibleModules.map((group) => {
          const isGroupActive = pathname.startsWith(group.basePath);
          const isOpen = openGroups[group.basePath] ?? isGroupActive;

          return (
            <div key={group.basePath}>
              <button
                onClick={() => toggleGroup(group.basePath)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isGroupActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <group.icon className={`w-4 h-4 shrink-0 ${isGroupActive ? group.color : ''}`} />
                  {group.label}
                  {group.adminOnly && (
                    <span className="text-[9px] bg-purple-800 text-purple-300 px-1.5 py-0.5 rounded font-semibold">ADM</span>
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="ml-3 pl-3 border-l border-gray-800 space-y-0.5 py-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-500 hover:bg-gray-800/60 hover:text-gray-300'
                        }`}
                      >
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="px-2 py-2 border-t border-gray-800">
        {userName && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-gray-400 truncate">{userName}</p>
            <p className="text-[10px] text-gray-600 capitalize">{role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
