// frontend/src/components/results/ResultsContainer.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { DateSummary } from '../events/DateSummary';
import { ResponseGrid } from '../events/ResponseGrid';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { useErrorHandler } from '../../lib/hooks/useErrorHandler';
import type { Event, EventData, FormattedResponses, ResponseStatus } from '../../types/database';
import { useRouter } from 'next/navigation';
import { eventOperations } from "../../lib/supabase";
import usePolling from '../../lib/hooks/usePolling'; // ポーリングフック追加

interface ResultsContainerProps {
  eventId: string;
  initialData: {
    event: Event;
    eventData: EventData;
  };
}

// カスタムフック: レスポンス管理（ポーリング対応版）
const useResponses = (eventId: string, initialResponses: FormattedResponses) => {
  const [responses, setResponses] = useState<FormattedResponses>(initialResponses);
  const { error, handleError, clearError } = useErrorHandler();
  const [isUpdating, setIsUpdating] = useState(false);

  // ポーリング用のデータフェッチコールバック
  const fetchResponses = useCallback(async (): Promise<FormattedResponses> => {
    try {
      // レスポンスデータを取得（配列形式）
      const responsesData = await eventOperations.getResponses(eventId);

      // 配列からFormattedResponses形式に変換
      const formattedResponses = eventOperations.formatResponses(responsesData);

      setResponses(formattedResponses);
      return formattedResponses;
    } catch (err) {
      console.error("Error fetching responses:", err);
      handleError(err);
      throw err;
    }
  }, [eventId, handleError]);

  // ポーリング設定
  const { loading } = usePolling(fetchResponses, {
    interval: 10000, // 10秒間隔
    enabled: true,
    initialData: initialResponses
  });

  // レスポンス更新処理
  const updateResponse = useCallback(async (
    participant: string,
    date: string,
    status: ResponseStatus
  ) => {
    setIsUpdating(true);
    clearError();

    try {
      // 現在の状態と同じ場合は更新しない
      const currentStatus = responses[participant]?.[date];
      if (currentStatus === status) {
        setIsUpdating(false);
        return;
      }

      // レスポンスの更新
      await eventOperations.updateResponse({
        event_id: eventId,
        participant_name: participant,
        date,
        status
      });

      // 状態を更新
      setResponses(prev => ({
        ...prev,
        [participant]: {
          ...(prev[participant] || {}),
          [date]: status
        }
      }));

    } catch (err) {
      handleError(err);
    } finally {
      setIsUpdating(false);
    }
  }, [responses, clearError, handleError, eventId]);

  return {
    responses,
    isUpdating: isUpdating || loading,
    error,
    updateResponse,
    clearError
  };
};

export const ResultsContainer: React.FC<ResultsContainerProps> = ({
  eventId,
  initialData
}) => {
  const router = useRouter();
  const { event, eventData } = initialData;

  // メモ化された参加者リスト
  const normalizedParticipants = useMemo(() =>
    eventData.participants.map(p => Array.isArray(p) ? p[0] : p),
    [eventData.participants]
  );

  // レスポンス管理フック
  const {
    responses,
    isUpdating,
    error,
    updateResponse,
    clearError
  } = useResponses(eventId, eventData.responses);

  // メモ化されたイベントタイトル
  const displayTitle = useMemo(() =>
    event.title || '日程調整',
    [event.title]
  );

  const handleEditClick = useCallback(() => {
    router.push(`/${eventId}/edit`);
  }, [router, eventId]);

  return (
    <div
      className="space-y-6"
      role="main"
      aria-label="イベント日程調整"
      data-testid="results-container"
    >
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error.message}
          <button
            onClick={clearError}
            className="ml-2 text-sm underline"
          >
            閉じる
          </button>
        </div>
      )}

      {event.description && (
        <p
          className="text-sm text-black"
          role="contentinfo"
          aria-label="イベントの説明"
          data-testid="event-description"
        >
          {event.description}
        </p>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" tabIndex={0} data-testid="event-title">
          {displayTitle}
        </h1>
        <button
          className="px-5 py-2 bg-background hover:bg-[#f3f4f6] text-sm text-black rounded transition-colors border border-[#939393]"
          onClick={handleEditClick}
          aria-label="日程と参加者を編集する"
          data-testid="edit-button"
        >
          日程・参加者を編集
        </button>
      </div>

      <div
        className="w-full overflow-x-auto"
        role="region"
        aria-label="回答グリッド"
        data-testid="response-grid-container"
      >
        <div className="min-w-full">
          <ResponseGrid
            eventId={eventId}
            dates={eventData.dates}
            participants={normalizedParticipants}
            responses={responses}
            readonly={false}
            onResponseUpdate={updateResponse}
          />
        </div>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        role="region"
        aria-label="日付ごとの集計"
        data-testid="date-summaries"
      >
        {eventData.dates.map(date => (
          <DateSummary
            key={date}
            date={date}
            responses={responses}
            participants={normalizedParticipants}
          />
        ))}
      </div>

      <LoadingOverlay
        message="更新中..."
        isVisible={isUpdating}
        data-testid="loading-overlay"
      />
    </div>
  );
};