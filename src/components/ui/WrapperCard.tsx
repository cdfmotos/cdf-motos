import React from 'react';

interface WrapperCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function WrapperCard({ children, title, className = '' }: WrapperCardProps) {
  return (
    <div className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-border bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
