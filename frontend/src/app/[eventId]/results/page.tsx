// frontend/src/app/[eventId]/results/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ResultsContainer } from "@/components/results/ResultsContainer";
import { formatResponses } from "@/lib/helpers";
import type { Event, EventData } from "@/types/database";
import { RefreshCw } from "lucide-react";

export default function EventResultsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    event: Event;
    eventData: EventData;
  } | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // APIを通じてイベント情報を取得
        const eventRes = await fetch(`/api/events?eventId=${eventId}`);
        if (!eventRes.ok) throw new Error("イベントの取得に失敗しました");
        const event = await eventRes.json();

        // APIを通じてレスポンスデータを取得
        const responsesRes = await fetch(`/api/responses/${eventId}`);
        if (!responsesRes.ok) throw new Error("レスポンスの取得に失敗しました");
        const responsesData = await responsesRes.json();

        // レスポンスデータをフォーマット
        const formattedResponses = formatResponses(responsesData);

        // データを設定
        setData({
          event,
          eventData: {
            dates: event.dates,
            participants: event.participants,
            responses: formattedResponses,
          },
        });
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError("イベントデータの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative h-24 w-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <p className="text-gray-600 text-lg">データを準備しています...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-gradient-to-r from-red-50 to-red-100 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            エラーが発生しました
          </h2>
        </div>
        <p className="text-gray-700 mb-6">
          {error || "イベントが見つかりません。URLを確認してください。"}
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          トップページに戻る
        </button>
      </div>
    );
  }

  return <ResultsContainer eventId={eventId} initialData={data} />;
}
