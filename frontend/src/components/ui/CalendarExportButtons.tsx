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
  size?: "sm" | "md";
}

export const CalendarExportButtons: React.FC<CalendarExportButtonsProps> = ({
  date,
  title,
  description,
  size = "sm",
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

  const iconSize = size === "sm" ? 14 : 16;
  const btnClass =
    size === "sm"
      ? "p-1 rounded-md text-xs"
      : "p-1.5 rounded-lg text-sm";

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleGoogleCalendar}
        className={`${btnClass} text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors`}
        title="Googleカレンダーに追加"
        aria-label="Googleカレンダーに追加"
      >
        <CalendarPlus size={iconSize} />
      </button>
      <button
        onClick={handleIcsDownload}
        className={`${btnClass} text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors`}
        title="カレンダーファイル(.ics)をダウンロード"
        aria-label="カレンダーファイルをダウンロード"
      >
        <Download size={iconSize} />
      </button>
    </div>
  );
};
