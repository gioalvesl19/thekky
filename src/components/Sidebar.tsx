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
  type LucideIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

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
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    modules.forEach((m) => {
      if (pathname.startsWith(m.basePath)) initial[m.basePath] = true;
    });
    return initial;
  });

  const toggleGroup = (basePath: string) => {
    setOpenGroups((prev) => ({ ...prev, [basePath]: !prev[basePath] }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <Link href="/dashboard" className="block">
          <h1 className="text-xl font-bold tracking-tight">THEKKY</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Sistema de Gestão</p>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            pathname === '/dashboard'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4.5 h-4.5" />
          Dashboard
        </Link>

        <div className="pt-2" />

        {/* Module Groups */}
        {modules.map((group) => {
          const isGroupActive = pathname.startsWith(group.basePath);
          const isOpen = openGroups[group.basePath] || isGroupActive;

          return (
            <div key={group.basePath}>
              <button
                onClick={() => toggleGroup(group.basePath)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isGroupActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <group.icon className={`w-4.5 h-4.5 ${isGroupActive ? group.color : ''}`} />
                  {group.label}
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Sub-items */}
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="ml-3 pl-3 border-l border-gray-800 space-y-0.5 py-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-500 hover:bg-gray-800/40 hover:text-gray-300'
                        }`}
                      >
                        <item.icon className="w-3.5 h-3.5" />
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

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-800/60 hover:text-gray-300 transition-all duration-200 w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
