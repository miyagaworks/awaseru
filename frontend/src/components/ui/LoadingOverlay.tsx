// src/components/ui/LoadingOverlay.tsx
import { FC } from 'react';

interface LoadingOverlayProps {
  message: string;
  isVisible: boolean;
}

export const LoadingOverlay: FC<LoadingOverlayProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg">{message}</p>
        </div>
      </div>
    </div>
  );
};