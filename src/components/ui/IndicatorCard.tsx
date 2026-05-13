import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IndicatorCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function IndicatorCard({ title, value, icon: Icon, description }: IndicatorCardProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-lg">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
    </div>
  );
}
