import React from 'react';
import { IndicatorCard } from '../../../components/ui/IndicatorCard';
import type { LucideIcon } from 'lucide-react';

interface IndicatorCardAnimatedProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  delay?: number;
}

export function IndicatorCardAnimated({ title, value, icon, description, delay = 0 }: IndicatorCardAnimatedProps) {
  return (
    <div 
      className="opacity-0 translate-x-[-20px] animate-[slideInRight_0.5s_ease-out_forwards]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <IndicatorCard 
        title={title} 
        value={value} 
        icon={icon} 
        description={description} 
      />
    </div>
  );
}
