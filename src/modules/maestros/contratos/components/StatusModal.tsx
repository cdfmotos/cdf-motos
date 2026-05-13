import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface StatusModalProps {
  isOpen: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
}

export function StatusModal({ isOpen, type, title, message, onClose }: StatusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`p-4 flex items-start gap-4 ${type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
          <div className="shrink-0 mt-0.5">
            {type === 'error' ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-medium ${type === 'error' ? 'text-red-900' : 'text-green-900'}`}>
              {title}
            </h3>
            <p className={`mt-1 text-sm ${type === 'error' ? 'text-red-700' : 'text-green-700'}`}>
              {message}
            </p>
          </div>
          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type === 'error' ? 'red' : 'green'}-50 ${
                type === 'error'
                  ? 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                  : 'text-green-500 hover:bg-green-100 focus:ring-green-600'
              }`}
            >
              <span className="sr-only">Cerrar</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
