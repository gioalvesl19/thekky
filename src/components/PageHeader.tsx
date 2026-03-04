import Link from 'next/link';
import { Plus, type LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
    icon?: LucideIcon;
  };
};

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 text-sm font-medium shadow-sm"
        >
          {action.icon ? <action.icon className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {action.label}
        </Link>
      )}
    </div>
  );
}
