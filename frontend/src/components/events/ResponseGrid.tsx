// components/events/ResponseGrid.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { eventOperations } from "../../lib/api";
import type { ResponseStatus, FormattedResponses } from '../../types/database';
import { ErrorHandler } from '../../lib/errors/errorHandler';
import type { ErrorState } from '../../lib/errors/types';
import { ErrorAlert } from '../../components/ui/ErrorAlert';

interface ResponseGridProps {
  eventId: string;
  dates: string[];
  participants: string[];
  responses: FormattedResponses;
  readonly?: boolean;
  onResponseUpdate?: (participant: string, date: string, status: ResponseStatus) => void;
}

interface RecommendedDatesProps {
  dates: string[];
  responses: FormattedResponses;
  participants: string[];
}

const RecommendedDates: React.FC<RecommendedDatesProps> = ({
  dates,
  responses,
  participants
}) => {
  const normalizeParticipantName = (participant: string | string[] | any): string => {
    if (Array.isArray(participant)) {
      return participant[0].replace(/[\[\]\"]/g, '');
    }
    if (typeof participant === 'string') {
      return participant.replace(/[\[\]\"]/g, '');
    }
    return String(participant).replace(/[\[\]\"]/g, '');
  };

  const dateStats = dates.map(date => {
    const okCount = participants.reduce((count, participant) => {
      const participantName = normalizeParticipantName(participant);
      return count + (responses[participantName]?.[date] === '◯' ? 1 : 0);
    }, 0);

    const noResponseCount = participants.reduce((count, participant) => {
      const participantName = normalizeParticipantName(participant);
      return count + (!responses[participantName]?.[date] || responses[participantName]?.[date] === '未回答' ? 1 : 0);
    }, 0);

    return {
      date,
      formattedDate: new Date(date).toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      }),
      okCount,
      noResponseCount,
      percentage: Math.round((okCount / participants.length) * 100)
    };
  }).sort((a, b) => b.okCount - a.okCount || a.date.localeCompare(b.date));

  const maxOkCount = dateStats.filter(stat => stat.okCount > 0)[0]?.okCount || 0;
  const bestDates = dateStats.filter(stat => stat.okCount === maxOkCount && maxOkCount > 0);
  const otherDates = dateStats.filter(stat => stat.okCount < maxOkCount || maxOkCount === 0);

  if (dateStats.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-xl font-medium mb-4">おすすめ日程</h3>

        {bestDates.length > 0 && (
          <div className="space-y-2">
            {bestDates.map(date => (
              <div
                key={date.date}
                className="bg-[#dcfce7] rounded-lg border border-[#279600] p-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Image src="/icons/maru.svg" alt="◯" width={16} height={16} />
                    <span>{date.formattedDate}</span>
                  </div>
                  <div className="text-[#279600]">
                    {date.okCount}人参加可能（{date.percentage}%）
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 mt-2">
          {otherDates.map(date => (
            <div
              key={date.date}
              className="bg-[#ececec] rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
            >
              <span className="text-gray-600">{date.formattedDate}</span>
              {date.noResponseCount === participants.length ? (
                <span className="text-gray-500">
                  未回答
                </span>
              ) : (
                <span className="text-gray-600">
                  {date.okCount}人参加可能（{date.percentage}%）
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ResponseGrid: React.FC<ResponseGridProps> = ({
  eventId,
  dates,
  participants,
  responses: initialResponses,
  readonly = false,
  onResponseUpdate
}) => {
  // refs
  const tableRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // state
  const [localResponses, setLocalResponses] = useState<FormattedResponses>(initialResponses);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // responseOptionsの定義
  const responseOptions: ResponseStatus[] = ['◯', '×', '△', '未回答'];

  // レスポンス更新処理
  const handleResponseChange = async (
    participant: string,
    date: string,
    status: ResponseStatus
  ) => {
    const cellId = `${participant}-${date}`;
    setUpdating(cellId);
    setError(null);

    try {
      const participantName = Array.isArray(participant) ? participant[0] : participant;

      if (!eventId || !participantName || !date || !status) {
        throw new Error('必要なデータが不足しています');
      }

      const newResponses = {
        ...localResponses,
        [participantName]: {
          ...(localResponses[participantName] || {}),
          [date]: status
        }
      };

      setLocalResponses(newResponses);

      // onResponseUpdateがある場合はそれを使用、なければAPI呼び出し
      if (onResponseUpdate) {
        onResponseUpdate(participantName, date, status);
      } else {
        // 直接APIを呼び出す場合
        await eventOperations.updateResponse({
          event_id: eventId,
          participant_name: participantName,
          date,
          status
        });
      }

      setActiveDropdown(null);

    } catch (error) {
      const errorState = ErrorHandler.handle(error);
      setLocalResponses(initialResponses);
      setError(errorState);
      console.error('Response update error:', {
        participantName: participant,
        date,
        status,
        error: errorState
      });
    } finally {
      setUpdating(null);
    }
  };

  // ユーティリティ関数
  const getResponseStyle = (status: ResponseStatus) => {
    switch (status) {
      case '◯':
        return {
          bg: 'bg-[#dcfce7]',
          icon: '/icons/maru.svg',
          border: 'border-[#279600]'
        };
      case '×':
        return {
          bg: 'bg-[#fee2e2]',
          icon: '/icons/batsu.svg',
          border: 'border-[#d54040]'
        };
      case '△':
        return {
          bg: 'bg-[#fff9c3]',
          icon: '/icons/sankaku.svg',
          border: 'border-[#e5ca00]'
        };
      default:
        return {
          bg: 'bg-white',
          icon: null,
          border: 'border-[#939393]'
        };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const dayStr = ['日', '月', '火', '水', '木', '金', '土'][day];
    const textColor = day === 0 ? 'text-[#d54040]' :
      day === 6 ? 'text-[#00b0e9]' :
        'text-black';
    return {
      text: `${date.getDate()}日(${dayStr})`,
      color: textColor
    };
  };

  const normalizeParticipantName = (participant: string | string[] | any): string => {
    if (Array.isArray(participant)) {
      return participant[0].replace(/[\[\]\"]/g, '');
    }
    if (typeof participant === 'string') {
      return participant.replace(/[\[\]\"]/g, '');
    }
    return String(participant).replace(/[\[\]\"]/g, '');
  };

  // ドロップダウン制御
  const handleDropdownToggle = (cellId: string) => {
    setActiveDropdown(activeDropdown === cellId ? null : cellId);
  };

  // クリックアウトサイド処理
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      !(event.target as Element).closest('.response-button')
    ) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setLocalResponses(initialResponses);
  }, [initialResponses]);

  // 日程の統計計算
  const dateStats = dates.map(date => {
    const okCount = participants.reduce((count, participant) => {
      const participantName = normalizeParticipantName(participant);
      return count + (localResponses[participantName]?.[date] === '◯' ? 1 : 0);
    }, 0);

    const noResponseCount = participants.reduce((count, participant) => {
      const participantName = normalizeParticipantName(participant);
      return count + (!localResponses[participantName]?.[date] || localResponses[participantName]?.[date] === '未回答' ? 1 : 0);
    }, 0);

    return {
      date,
      formattedDate: new Date(date).toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      }),
      okCount,
      noResponseCount,
      percentage: Math.round((okCount / participants.length) * 100)
    };
  }).sort((a, b) => b.okCount - a.okCount || a.date.localeCompare(b.date));

  const maxOkCount = dateStats.filter(stat => stat.okCount > 0)[0]?.okCount || 0;
  const bestDates = dateStats.filter(stat => stat.okCount === maxOkCount && maxOkCount > 0);
  const otherDates = dateStats.filter(stat => stat.okCount < maxOkCount || maxOkCount === 0);

  // 共有メッセージの状態
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  // 共有処理
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error('URLのコピーに失敗しました:', err);
    }
  };

  return (
    <div className="relative" ref={tableRef}>
      {error && (
        <ErrorAlert
          message={error.message + (error.recovery ? `\n${error.recovery}` : '')}
          onDismiss={() => setError(null)}
        />
      )}

      <div className="relative overflow-x-auto rounded-lg bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-[180px] min-w-[110px] sticky left-0 z-20 h-[50px] bg-[#d9d9d9] border-r border-b border-[#939393] text-center text-sm">
                参加者
              </th>
              {dates.map((date, index) => {
                const { text, color } = formatDate(date);
                return (
                  <th
                    key={date}
                    className={`w-[110px] min-w-[110px] h-[50px] ${index < dates.length - 1 ? 'border-r' : ''} border-b border-[#939393] bg-[#d9d9d9] p-4 ${color} text-center text-sm`}
                  >
                    {text}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, pIndex) => {
              const participantName = normalizeParticipantName(participant);

              return (
                <tr key={participantName}>
                  <td className={`sticky left-0 z-20 w-[90px] min-w-[90px] h-[50px] border-r ${pIndex !== participants.length - 1 ? 'border-b' : ''
                    } border-[#939393] bg-white text-center text-sm`}>
                    {normalizeParticipantName(participant)}
                  </td>
                  {dates.map((date, dIndex) => {
                    const cellId = `${participantName}-${date}`;
                    const status = localResponses[participantName]?.[date] || '未回答';
                    const { bg, icon } = getResponseStyle(status);
                    const isLastRow = pIndex === participants.length - 1;
                    const isUpdating = updating === cellId;

                    return (
                      <td
                        key={cellId}
                        className={`relative w-[110px] min-w-[110px] h-[50px] 
                          ${dIndex < dates.length - 1 ? 'border-r' : ''} 
                          ${!isLastRow ? 'border-b' : ''} 
                          border-[#939393] ${bg} p-[6px]`}
                      >
                        <button
                          data-cell-id={cellId}
                          className={`response-button w-full h-full flex items-center justify-center gap-2 
                            border border-[#939393] rounded-lg 
                            hover:bg-opacity-90 transition-colors text-sm
                            ${isUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                          onClick={() => handleDropdownToggle(cellId)}
                          disabled={readonly || isUpdating}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {icon ? (
                              <div className="flex items-center justify-center">
                                <Image
                                  src={icon}
                                  alt={status}
                                  width={18}
                                  height={18}
                                />
                              </div>
                            ) : (
                              <span className="text-[#c4c4c4]">未回答</span>
                            )}
                            {!readonly && (
                              <svg
                                className="w-4 h-4 text-[#939393]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            )}
                          </div>
                        </button>

                        {activeDropdown === cellId && (
                          <div
                            ref={dropdownRef}
                            className="absolute z-[9999] w-[98px] bg-white border border-[#939393] rounded-lg shadow-lg overflow-hidden"
                            style={{
                              position: 'fixed',
                              left: (() => {
                                const button = document.querySelector(`[data-cell-id="${cellId}"]`);
                                if (button) {
                                  const rect = button.getBoundingClientRect();
                                  return `${rect.left + rect.width / 2}px`;
                                }
                                return '50%';
                              })(),
                              top: (() => {
                                const button = document.querySelector(`[data-cell-id="${cellId}"]`);
                                if (button) {
                                  const rect = button.getBoundingClientRect();
                                  return `${rect.bottom + 4}px`;
                                }
                                return '100%';
                              })(),
                              transform: 'translateX(-50%)',
                            }}
                          >
                            {responseOptions.map((option) => {
                              const { icon } = getResponseStyle(option);
                              return (
                                <button
                                  key={option}
                                  className={`w-full px-2 py-2 flex items-center justify-center gap-1.5 hover:bg-gray-100 ${status === option ? 'bg-gray-100' : ''
                                    }`}
                                  onClick={() => handleResponseChange(participantName, date, option)}
                                  disabled={isUpdating}
                                >
                                  {icon ? (
                                    <div className="flex items-center justify-center w-5 h-5">
                                      <Image
                                        src={icon}
                                        alt={option}
                                        width={18}
                                        height={18}
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-[#c4c4c4]">未回答</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-3">
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-xl font-medium mb-4">おすすめ日程</h3>

          {bestDates.length > 0 && (
            <div className="space-y-2">
              {bestDates.map(date => (
                <div
                  key={date.date}
                  className="bg-[#dcfce7] rounded-lg border border-[#279600] p-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Image src="/icons/maru.svg" alt="◯" width={16} height={16} />
                      <span>{date.formattedDate}</span>
                    </div>
                    <div className="text-[#279600]">
                      {date.okCount}人参加可能（{date.percentage}%）
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 mt-2">
            {otherDates.map(date => (
              <div
                key={date.date}
                className="bg-[#ececec] rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <span className="text-gray-600">{date.formattedDate}</span>
                {date.noResponseCount === participants.length ? (
                  <span className="text-gray-500">
                    未回答
                  </span>
                ) : (
                  <span className="text-gray-600">
                    {date.okCount}人参加可能（{date.percentage}%）
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="fixed left-0 bottom-10 z-50 flex items-center justify-center bg-blue-600 p-3 rounded-r-lg shadow-md hover:bg-blue-800 transition-colors"
      >
        <Image
          src="/icons/share.svg"
          alt="共有"
          width={24}
          height={24}
          className="brightness-0 invert" // SVGを白色に
        />
      </button>

      {showCopiedMessage && (
        <div className="fixed left-4 bottom-24 z-50 px-4 py-2 bg-gray-800 text-white rounded-md text-sm whitespace-nowrap">
          共有用URLをコピーしました
        </div>
      )}
    </div>
  );
};

export default ResponseGrid;