// frontend/src/components/results/ResultsContainer.tsx
"use client";

import React, { useState, useCallback, useMemo } from "react";
import { DateSummary } from "../events/DateSummary";
import { ResponseGrid } from "../events/ResponseGrid";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { useErrorHandler } from "../../lib/hooks/useErrorHandler";
import type {
  Event,
  EventData,
  FormattedResponses,
  ResponseStatus,
} from "../../types/database";
import { useRouter } from "next/navigation";
import { eventOperations } from "../../lib/supabase";
import usePolling from "../../lib/hooks/usePolling";
import { Calendar, Users, Clock, Edit, Share, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ResultsContainerProps {
  eventId: string;
  initialData: {
    event: Event;
    eventData: EventData;
  };
}

// カスタムフック: レスポンス管理（ポーリング対応版）
const useResponses = (
  eventId: string,
  initialResponses: FormattedResponses
) => {
  const [responses, setResponses] =
    useState<FormattedResponses>(initialResponses);
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
    initialData: initialResponses,
  });

  // レスポンス更新処理
  const updateResponse = useCallback(
    async (participant: string, date: string, status: ResponseStatus) => {
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
          status,
        });

        // 状態を更新
        setResponses((prev) => ({
          ...prev,
          [participant]: {
            ...(prev[participant] || {}),
            [date]: status,
          },
        }));
      } catch (err) {
        handleError(err);
      } finally {
        setIsUpdating(false);
      }
    },
    [responses, clearError, handleError, eventId]
  );

  return {
    responses,
    isUpdating: isUpdating || loading,
    error,
    updateResponse,
    clearError,
  };
};

export const ResultsContainer: React.FC<ResultsContainerProps> = ({
  eventId,
  initialData,
}) => {
  const router = useRouter();
  const { event, eventData } = initialData;
  const [showShareMessage, setShowShareMessage] = useState(false);

  // メモ化された参加者リスト
  const normalizedParticipants = useMemo(
    () => eventData.participants.map((p) => (Array.isArray(p) ? p[0] : p)),
    [eventData.participants]
  );

  // レスポンス管理フック
  const { responses, isUpdating, error, updateResponse, clearError } =
    useResponses(eventId, eventData.responses);

  // メモ化されたイベントタイトル
  const displayTitle = useMemo(() => event.title || "日程調整", [event.title]);

  const handleEditClick = useCallback(() => {
    router.push(`/${eventId}/edit`);
  }, [router, eventId]);

  // 共有機能
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareMessage(true);
      setTimeout(() => setShowShareMessage(false), 3000);
    } catch (err) {
      console.error("URLのコピーに失敗しました:", err);
    }
  };

  // 作成日時のフォーマット
  const formattedCreationDate = useMemo(() => {
    if (!event.created_at) return "";
    const date = new Date(event.created_at);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [event.created_at]);

  return (
    <div className="space-y-8">
      {/* ヘッダー部分 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-sm">トップページに戻る</span>
            </Link>

            <h1
              className="text-3xl font-bold text-gray-800"
              tabIndex={0}
              data-testid="event-title"
            >
              {displayTitle}
            </h1>

            {event.description && (
              <p className="text-gray-600" data-testid="event-description">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                <span>{eventData.dates.length}日程</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-blue-500" />
                <span>{normalizedParticipants.length}人の参加者</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-blue-500" />
                <span>作成: {formattedCreationDate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              className="px-4 py-2 flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
              onClick={handleEditClick}
              aria-label="日程と参加者を編集する"
              data-testid="edit-button"
            >
              <Edit className="h-4 w-4" />
              編集する
            </button>

            <button
              className="px-4 py-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              onClick={handleShare}
              aria-label="URLを共有する"
            >
              <Share className="h-4 w-4" />
              共有する
            </button>

            {showShareMessage && (
              <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
                URLをコピーしました
              </div>
            )}
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && error.message && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border-l-4 border-red-500 flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-grow">
            <div className="text-sm font-medium text-red-600">
              {error.message}
            </div>
            {error.recovery && (
              <div className="text-sm text-red-500 mt-1">{error.recovery}</div>
            )}
          </div>
          <button
            onClick={clearError}
            className="flex-shrink-0 bg-red-50 rounded-full p-1 hover:bg-red-100 transition-colors"
            aria-label="エラーメッセージを閉じる"
          >
            <svg
              className="h-5 w-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div
          className="overflow-x-auto"
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
      </div>

      {/* 日付ごとの集計 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">日付ごとの集計</h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          role="region"
          aria-label="日付ごとの集計"
          data-testid="date-summaries"
        >
          {eventData.dates.map((date) => (
            <DateSummary
              key={date}
              date={date}
              responses={responses}
              participants={normalizedParticipants}
            />
          ))}
        </div>
      </div>

      <LoadingOverlay
        message="更新中..."
        isVisible={isUpdating}
        data-testid="loading-overlay"
      />
    </div>
  );
};