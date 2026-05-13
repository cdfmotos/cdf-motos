import { WifiOff } from 'lucide-react';

interface OnlineGateProps {
  children: React.ReactNode;
}

export function OnlineGate({ children }: OnlineGateProps) {
  return <>{children}</>;
}

export function OfflineMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <WifiOff className="w-12 h-12 text-slate-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-700">Sin conexión</h3>
      <p className="text-sm text-slate-500 mt-1">
        Este módulo requiere conexión a internet.
      </p>
    </div>
  );
}