// frontend/src/lib/calendarExport.ts

export interface CalendarExportParams {
  date: string; // "YYYY-MM-DD"
  title: string;
  description?: string | null;
}

/**
 * YYYY-MM-DD文字列をYYYYMMDD形式に変換（Dateオブジェクトを使わずタイムゾーン問題を回避）
 */
function toCompactDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/**
 * YYYY-MM-DD文字列の翌日をYYYYMMDD形式で返す（終日イベントの排他的終了日用）
 */
function toNextDayCompact(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const nextDay = new Date(year, month - 1, day + 1);
  const y = nextDay.getFullYear();
  const m = String(nextDay.getMonth() + 1).padStart(2, "0");
  const d = String(nextDay.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * ICS形式の文字列を生成
 */
export function generateIcsContent(params: CalendarExportParams): string {
  const { date, title, description } = params;
  const dtStart = toCompactDate(date);
  const dtEnd = toNextDayCompact(date);
  const uid = `${date}-${Date.now()}@awaseru.net`;
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const descLine = description
    ? `DESCRIPTION:${description.replace(/\n/g, "\\n")}\r\n`
    : "";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//awaseru.net//NONSGML v1.0//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${title}`,
    ...(descLine ? [descLine.trim()] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * ICSファイルをダウンロード
 */
export function downloadIcsFile(params: CalendarExportParams): void {
  const content = generateIcsContent(params);
  const filename = `${params.title}-${params.date}.ics`;

  // iOS Safari対応: data URIを使用
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    const dataUri =
      "data:text/calendar;charset=utf-8," + encodeURIComponent(content);
    window.open(dataUri);
  } else {
    const blob = new Blob([content], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/**
 * GoogleカレンダーのURLを生成
 */
export function generateGoogleCalendarUrl(
  params: CalendarExportParams
): string {
  const { date, title, description } = params;
  const dtStart = toCompactDate(date);
  const dtEnd = toNextDayCompact(date);

  const queryParams = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${dtStart}/${dtEnd}`,
  });

  if (description) {
    queryParams.set("details", description);
  }

  return `https://www.google.com/calendar/render?${queryParams.toString()}`;
}
