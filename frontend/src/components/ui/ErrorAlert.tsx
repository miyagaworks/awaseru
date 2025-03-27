// src/components/ui/ErrorAlert.tsx
import { XCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  'data-testid'?: string;
}

export const ErrorAlert = ({ 
  message, 
  onDismiss,
  'data-testid': testId = 'error-alert'
}: ErrorAlertProps) => {
  return (
    <div 
      role="alert" 
      data-testid={testId}
      className="rounded-lg border border-red-200 bg-red-50 p-4"
    >
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-500 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-500 hover:text-red-700"
            aria-label="エラーを閉じる"
          >
            <XCircle className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};