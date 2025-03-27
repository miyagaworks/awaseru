// components/events/ShareButton.tsx
import React, { useState } from 'react';
import Image from 'next/image';

interface ShareButtonProps {
  url: string;
}

export const ShareButton = ({ url }: ShareButtonProps) => {
  const [showMessage, setShowMessage] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    } catch (err) {
      console.error('URLのコピーに失敗しました', err);
    }
  };

  return (
    <div className="fixed left-4 bottom-4 z-10">
      <button
        onClick={handleShare}
        className="flex items-center bg-blue-500 text-white py-3 px-4 rounded-r-lg shadow-md hover:bg-blue-600 transition-colors"
      >
        <Image
          src="/icons/share.svg"
          alt="共有"
          width={20}
          height={20}
          className="mr-2"
        />
        参加者へ共有する
      </button>
      {showMessage && (
        <div className="absolute bottom-full left-0 mb-2 px-4 py-2 bg-gray-800 text-white rounded-md text-sm whitespace-nowrap">
          共有用URLをコピーしました
        </div>
      )}
    </div>
  );
};