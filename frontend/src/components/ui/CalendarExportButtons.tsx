// frontend/src/components/ui/CalendarExportButtons.tsx
"use client";

import React from "react";
import { CalendarPlus, Download } from "lucide-react";
import {
  downloadIcsFile,
  generateGoogleCalendarUrl,
  type CalendarExportParams,
} from "../../lib/calendarExport";

interface CalendarExportButtonsProps {
  date: string;
  title: string;
  description?: string | null;
}

export const CalendarExportButtons: React.FC<CalendarExportButtonsProps> = ({
  date,
  title,
  description,
}) => {
  const params: CalendarExportParams = {
    date,
    title,
    description: description || undefined,
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(params);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleIcsDownload = () => {
    downloadIcsFile(params);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <button
        onClick={handleGoogleCalendar}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 hover:border-blue-400 transition-colors shadow-sm"
        aria-label="Googleカレンダーに追加"
      >
        <CalendarPlus size={14} />
        Googleカレンダーに追加
      </button>
      <button
        onClick={handleIcsDownload}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
        aria-label="iCal形式でダウンロード"
      >
        <Download size={14} />
        iCalダウンロード
      </button>
    </div>
  );
};
