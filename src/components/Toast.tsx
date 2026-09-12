import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-200';
        let bgClass = 'bg-white';
        let Icon = Info;
        let iconColor = 'text-blue-600';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-200';
          bgClass = 'bg-white';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'warning') {
          borderClass = 'border-orange-200';
          bgClass = 'bg-white';
          Icon = AlertTriangle;
          iconColor = 'text-orange-500';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg ${borderClass} ${bgClass} transition-all duration-200 animate-in fade-in slide-in-from-bottom-3`}
          >
            <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
