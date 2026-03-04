import type { LucideIcon } from 'lucide-react';

type Props = {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  subtitle?: string;
};

export default function StatCard({ label, value, icon: Icon, color, subtitle }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`${color} p-2.5 rounded-xl`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
