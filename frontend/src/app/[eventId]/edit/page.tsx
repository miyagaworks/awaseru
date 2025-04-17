// frontend/src/app/[eventId]/edit/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { EventEditor } from "@/components/events/EventEditor";
import { eventOperations } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Users,
  ClipboardEdit,
  Loader2,
} from "lucide-react";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await eventOperations.getEvent(eventId);
        setEvent(eventData);
      } catch (err) {
        console.error("イベント取得エラー:", err);
        setError("イベントの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleSave = async (dates: string[], participants: string[]) => {
    setSaving(true);
    try {
      await eventOperations.updateEvent(eventId, {
        dates,
        participants,
      });
      router.push(`/${eventId}/results`);
    } catch (err) {
      console.error("保存エラー:", err);
      setError("イベントの更新に失敗しました");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${eventId}/results`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center space-y-4">
          <div className="relative h-16 w-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">
            イベント情報を読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-gradient-to-r from-red-50 to-red-100 rounded-xl shadow-lg animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
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
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              エラーが発生しました
            </h2>
            <p className="text-gray-700 mt-1">
              {error || "イベントが見つかりません。URLを確認してください。"}
            </p>
          </div>
        </div>

        <Link
          href={`/${eventId}/results`}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all transform hover:-translate-y-1 hover:shadow-lg inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          結果ページに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* ヘッダー部分 */}
      <div className="mb-8 animate-fade-in">
        <Link
          href={`/${eventId}/results`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4 group"
        >
          <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">結果ページに戻る</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          {event.title || "イベント調整"} の編集
        </h1>

        {event.description && (
          <p className="text-gray-600 mb-3">{event.description}</p>
        )}

        {/* ステータスバッジ */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Calendar className="w-4 h-4 mr-1.5" />
            {event.dates.length}日程
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Users className="w-4 h-4 mr-1.5" />
            {event.participants.length}人の参加者
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <ClipboardEdit className="w-4 h-4 mr-1.5" />
            編集モード
          </div>
        </div>
      </div>

      {/* 編集フォーム */}
      <div
        className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        {saving && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
              <p className="text-blue-700 font-medium">変更を保存中...</p>
            </div>
          </div>
        )}

        <EventEditor
          initialDates={event.dates}
          initialParticipants={event.participants}
          onSave={handleSave}
          onCancel={handleCancel}
          disabled={saving}
        />
      </div>

      {/* 注意事項 */}
      <div
        className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="w-5 h-5 text-amber-600 flex-shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              stroke="currentColor"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <p className="text-justify">
            編集した内容は即座に反映されます。参加者の回答状況は維持されますが、日程や参加者を削除すると対応する回答も削除されます。
          </p>
        </div>
      </div>
    </div>
  );
}