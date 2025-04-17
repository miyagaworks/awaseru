// components/events/DateSummary.tsx
import React, { useMemo } from "react";
import Image from "next/image";
import { Check, X, AlertTriangle, Clock } from "lucide-react";

type ResponseStatus = "未回答" | "◯" | "×" | "△";
type Responses = Record<string, Record<string, ResponseStatus>>;

interface DateSummaryProps {
  date: string;
  responses: Responses;
  participants: string[];
}

export const DateSummary: React.FC<DateSummaryProps> = ({
  date,
  responses,
  participants,
}) => {
  // 参加者名の正規化ユーティリティ
  const normalizeParticipantName = (participant: string | string[]) => {
    const name = Array.isArray(participant) ? participant[0] : participant;
    return name.replace(/[\[\]\"]/g, ""); // 特殊文字を取り除く
  };

  // 集計処理を最適化
  const { summary, responseRate } = useMemo(() => {
    // 初期値を設定
    const initialSummary: Record<ResponseStatus, number> = {
      "◯": 0,
      "×": 0,
      "△": 0,
      未回答: 0,
    };

    // 回答状況を集計
    const summary = participants.reduce(
      (acc, participant) => {
        const normalizedName = normalizeParticipantName(participant);
        // responsesのキーも正規化して比較
        const entry = Object.entries(responses).find(
          ([key]) => normalizeParticipantName(key) === normalizedName
        );

        const participantResponses = entry ? entry[1] : undefined;
        const status = participantResponses?.[date] || "未回答";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { ...initialSummary }
    ); // 初期値のコピーを使用

    // 回答率の計算
    const totalResponses = participants.length;
    const respondedCount = totalResponses - (summary["未回答"] || 0);
    const responseRate =
      totalResponses > 0
        ? Math.round((respondedCount / totalResponses) * 1000) / 10
        : 0;

    return { summary, responseRate };
  }, [date, responses, participants]); // 必要最小限の依存関係

  // 日付フォーマット
  const { formatted, color, dayOfWeek } = useMemo(() => {
    const date_ = new Date(date);
    const month = date_.getMonth() + 1;
    const day = date_.getDate();
    const weekdayIndex = date_.getDay();
    const weekday = ["日", "月", "火", "水", "木", "金", "土"][weekdayIndex];

    let textColor;
    if (weekdayIndex === 0) textColor = "text-red-600";
    else if (weekdayIndex === 6) textColor = "text-blue-600";
    else textColor = "text-gray-800";

    return {
      formatted: `${month}/${day}(${weekday})`,
      color: textColor,
      dayOfWeek: weekday,
    };
  }, [date]);

  // 回答率に基づくバッジカラー
  const rateColor = useMemo(() => {
    if (responseRate >= 75) return "bg-green-100 text-green-800";
    if (responseRate >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  }, [responseRate]);

  // 参加数に基づく背景色
  const bgGradient = useMemo(() => {
    const okCount = summary["◯"];
    const total = participants.length;
    const okRatio = total > 0 ? okCount / total : 0;

    if (okRatio >= 0.75)
      return "bg-gradient-to-br from-green-50 to-green-100 border-green-200";
    if (okRatio >= 0.5)
      return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200";
    if (okRatio >= 0.25)
      return "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200";
    return "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200";
  }, [summary, participants.length]);

  return (
    <div
      className={`rounded-xl border ${bgGradient} p-4 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex justify-between items-start">
        <div className={`text-lg font-semibold ${color}`}>{formatted}</div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${rateColor}`}>
          {responseRate}%
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center" data-testid="ok-count">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100">
              <Check className="h-3.5 w-3.5 text-green-600" />
            </div>
            <span className="ml-1.5 text-green-700">{summary["◯"]}人</span>
          </div>
          <div className="flex items-center" data-testid="ng-count">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100">
              <X className="h-3.5 w-3.5 text-red-600" />
            </div>
            <span className="ml-1.5 text-red-700">{summary["×"]}人</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center" data-testid="maybe-count">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
            </div>
            <span className="ml-1.5 text-yellow-700">{summary["△"]}人</span>
          </div>
          <div className="flex items-center" data-testid="unreplied-count">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <span className="ml-1.5 text-gray-500">{summary["未回答"]}人</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">OK🙆率</span>
          <span className="font-medium">
            {participants.length > 0
              ? Math.round((summary["◯"] / participants.length) * 100)
              : 0}
            %
          </span>
        </div>
      </div>
    </div>
  );
};