// components/events/CreateButton.tsx
import React from 'react';
import Image from 'next/image';

interface CreateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingMessage?: string;
}

export const CreateButton = ({ 
    onClick, 
    disabled = false,
    loading = false,
    loadingMessage = '' 
  }: CreateButtonProps) => {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center justify-center bg-blue-600 text-white py-5 rounded-lg shadow-md hover:bg-blue-800 transition-colors disabled:bg-gray-400"
      >
        <Image
          src="/icons/calendar.svg"
          alt="カレンダー"
          width={24}
          height={24}
          className="brightness-0 invert mr-2" // SVGを白色に
        />
        <span className="text-base">
          {loading ? loadingMessage : '作成する'}
        </span>
      </button>
    );
  };