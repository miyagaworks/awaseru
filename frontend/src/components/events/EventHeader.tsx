// src/components/events/EventHeader.tsx
import React from 'react';
import { Button } from '../../components/ui/button';

interface EventHeaderProps {
  title: string;
  description?: string | null;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-6 border-b border-gray-200">
      <div className="text-center md:text-left w-full">
        <h1 className="text-2xl font-bold text-black">{title}の日程調整</h1>
        {description && (
          <p className="mt-2 text-black" style={{ color: 'black' }}>{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-[#c0e0ff] hover:bg-[#a8d4ff]"
          style={{ color: 'black' }}
          onClick={() => window.location.href = `/${window.location.pathname.split('/')[1]}/edit`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="black"
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ color: 'black' }}
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span style={{ color: 'black' }}>日程・参加者を編集</span>
        </Button>
      </div>
    </div>
  );
};