// components/events/DateSummary.tsx
import React, { useMemo } from 'react';
import Image from 'next/image';

type ResponseStatus = '未回答' | '◯' | '×' | '△';
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
    return name.replace(/[\[\]\"]/g, ''); // 特殊文字を取り除く
  };

  // 集計処理を最適化
  const { summary, responseRate } = useMemo(() => {
    // 初期値を設定
    const initialSummary: Record<ResponseStatus, number> = {
      '◯': 0,
      '×': 0,
      '△': 0,
      '未回答': 0
    };

    // 回答状況を集計
    const summary = participants.reduce((acc, participant) => {
      const normalizedName = normalizeParticipantName(participant);
      // responsesのキーも正規化して比較
      const entry = Object.entries(responses).find(
        ([key]) => normalizeParticipantName(key) === normalizedName
      );
      
      const participantResponses = entry ? entry[1] : undefined;
      const status = participantResponses?.[date] || '未回答';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { ...initialSummary }); // 初期値のコピーを使用

    // 回答率の計算
    const totalResponses = participants.length;
    const respondedCount = totalResponses - (summary['未回答'] || 0);
    const responseRate = totalResponses > 0 
      ? Math.round((respondedCount / totalResponses) * 1000) / 10 
      : 0;

    return { summary, responseRate };
  }, [date, responses, participants]); // 必要最小限の依存関係

  // 日付フォーマット
  const { formatted, color } = useMemo(() => {
    const date_ = new Date(date);
    const month = date_.getMonth() + 1;
    const day = date_.getDate();
    const weekday = ['日', '月', '火', '水', '木', '金', '土'][date_.getDay()];
    return {
      formatted: `${month}/${day}(${weekday})`,
      color: weekday === '日' ? 'text-[#d54040]' : 
             weekday === '土' ? 'text-[#00b0e9]' : 
             'text-gray-900'
    };
  }, [date]);

  return (
    <div className="flex flex-wrap gap-3">
      <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
        <div className={color}>{formatted}</div>
        <div className="flex justify-between mt-2">
          <div className="flex items-center" data-testid="ok-count">
            <Image src="/icons/maru.svg" alt="◯" width={16} height={16} />
            <span className="ml-1 text-[#279600]">{summary['◯']}人</span>
          </div>
          <div className="flex items-center" data-testid="ng-count">
            <Image src="/icons/batsu.svg" alt="×" width={16} height={16} />
            <span className="ml-1 text-[#d54040]">{summary['×']}人</span>
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <div className="flex items-center" data-testid="maybe-count">
            <Image src="/icons/sankaku.svg" alt="△" width={16} height={16} />
            <span className="ml-1 text-[#e5ca00]">{summary['△']}人</span>
          </div>
          <div className="flex items-center" data-testid="unreplied-count">
            <span className="text-gray-400">未</span>
            <span className="ml-1 text-gray-400">{summary['未回答']}人</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-gray-500">回答率</span>
            <span data-testid="response-rate">{responseRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};