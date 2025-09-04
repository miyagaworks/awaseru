// frontend/src/app/create/page.tsx
"use client";

import React, { useState, useRef } from "react";
import { Calendar } from "../../components/events/Calendar";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { LoadingOverlay } from "../../components/ui/LoadingOverlay";
import {
  ArrowUp,
  ArrowDown,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  Check,
} from "lucide-react";
import { eventOperations } from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

function generateId(): string {
  try {
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.randomUUID
    ) {
      return window.crypto.randomUUID();
    }
  } catch (e) {
    console.warn("crypto.randomUUID is not available, using fallback");
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface DateItem {
  date: string; // YYYY-MM-DD形式で保持
}

interface Participant {
  id: string;
  name: string;
}

interface LoadingState {
  status: boolean;
  message: string;
}

export default function CreatePage() {
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<LoadingState>({
    status: false,
    message: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [selectedDates, setSelectedDates] = useState<DateItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [newParticipant, setNewParticipant] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: 参加者情報, 2: 日程選択

  // 参照
  const participantInputRef = useRef<HTMLInputElement>(null);

  // カレンダー操作メソッド
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  // 日付選択ハンドラー
  const handleDateSelect = (dateStr: string) => {
    const formattedDate = dateStr.replace(/\//g, "-");
    if (selectedDates.some((item) => item.date === formattedDate)) {
      setSelectedDates(
        selectedDates.filter((item) => item.date !== formattedDate)
      );
    } else {
      // 3ヶ月以内の日付かチェック
      const selectedDate = new Date(formattedDate);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      if (selectedDate > threeMonthsFromNow) {
        setError("3ヶ月以内の日付を選択してください");
        return;
      }
      setSelectedDates([...selectedDates, { date: formattedDate }]);
    }
    setError(null);
  };

  // 参加者管理メソッド
  const handleParticipantAdd = () => {
    if (isComposing) return;

    const trimmedName = newParticipant.trim();
    if (
      !trimmedName ||
      participants.length >= 10 ||
      participants.some((p) => p.name === trimmedName)
    ) {
      setError(participants.length >= 10 ? "参加者は最大10名までです" : "");
      return;
    }

    setParticipants((prev) => [
      ...prev,
      { id: generateId(), name: trimmedName },
    ]);
    setNewParticipant("");
    setError(null);

    // 追加後にフォーカスを戻す
    setTimeout(() => {
      participantInputRef.current?.focus();
    }, 0);
  };

  const handleParticipantRemove = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const moveParticipant = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === participants.length - 1)
    )
      return;

    const newParticipants = [...participants];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newParticipants[index], newParticipants[targetIndex]] = [
      newParticipants[targetIndex],
      newParticipants[index],
    ];
    setParticipants(newParticipants);
  };

  // 次のステップへ進む
  const goToNextStep = () => {
    if (participants.length < 2) {
      setError("2名以上の参加者を追加してください");
      return;
    }
    setCurrentStep(2);
    setError(null);
  };

  // 前のステップに戻る
  const goToPreviousStep = () => {
    setCurrentStep(1);
    setError(null);
  };

  // フォーム送信処理
  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      setError("日程を選択してください");
      return;
    }
    if (participants.length < 2) {
      setError("2名以上の参加者を追加してください");
      return;
    }

    setError(null);
    setLoadingState({ status: true, message: "イベントを作成中..." });

    try {
      const eventData = {
        title: "イベント調整", // タイトルを追加
        description: description || null,
        dates: selectedDates.map((item) => item.date),
        participants: participants.map((p) => p.name),
      };

      console.log("Creating event with data:", eventData);
      const event = await eventOperations.createEvent(eventData);
      console.log("Event creation response:", event);

      // 型アサーションを使用してeventオブジェクトの型を明示
      const eventWithId = event as { id: string };

      if (!eventWithId?.id) {
        throw new Error("イベントの作成に失敗しました");
      }

      console.log("Redirecting to:", `/${eventWithId.id}/results/`);
      setLoadingState({ status: true, message: "完了！リダイレクト中..." });
      router.push(`/${eventWithId.id}/results/`);
    } catch (err: any) {
      console.error("Error details:", err);
      setError(
        err?.message || "イベントの作成に失敗しました。もう一度お試しください。"
      );
    } finally {
      setLoadingState({ status: false, message: "" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="text-sm">トップページに戻る</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-4 animate-fade-in">
          日程調整を作成
        </h1>
        <div
          className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start gap-3 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="text-blue-500">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <p className="text-blue-800 text-sm text-justify">
            参加者と日程を設定して調整を始めましょう。作成後に共有URLが生成されます。
          </p>
        </div>
      </div>

      {/* ステップインジケーター */}
      <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 1
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm mt-1 font-medium">参加者設定</span>
          </div>
          <div className="flex-1 mx-2 h-1 bg-gray-200">
            <div
              className={`h-full bg-blue-500 transition-all ${
                currentStep === 1 ? "w-0" : "w-full"
              }`}
            ></div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === 2
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
            </div>
            <span className="text-sm mt-1 font-medium">日程選択</span>
          </div>
        </div>
      </div>

      {/* コンテンツコンテナ */}
      <div
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-in"
        style={{ animationDelay: "0.3s" }}
      >
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* イベントの説明 */}
            <div className="space-y-2">
              <h2 className="text-base flex items-center gap-2 font-medium">
                イベントの説明
                <span className="text-sm text-gray-500">（任意）</span>
              </h2>
              <Input
                type="text"
                placeholder="日程調整の名前"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 参加者管理 */}
            <div className="space-y-3">
              <h2 className="text-base flex items-center gap-2 font-medium">
                参加者の追加
                <span className="text-xs text-red-500">*2名以上必須</span>
              </h2>
              <div className="flex items-center gap-2">
                <Input
                  ref={participantInputRef}
                  type="text"
                  placeholder="お名前を入力ください。"
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={(e) => {
                    setIsComposing(false);
                    if (e.target instanceof HTMLInputElement) {
                      setNewParticipant(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isComposing) {
                      e.preventDefault();
                      handleParticipantAdd();
                    }
                  }}
                  className="bg-white focus:ring-blue-500 focus:border-blue-500"
                  maxLength={20}
                />
                <Button
                  onClick={handleParticipantAdd}
                  disabled={participants.length >= 10}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors whitespace-nowrap"
                >
                  追加
                </Button>
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {participants.length > 0 ? (
                  participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:border-blue-100 transition-colors"
                    >
                      <span className="flex-grow px-2">{participant.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveParticipant(index, "up")}
                            disabled={index === 0}
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveParticipant(index, "down")}
                            disabled={index === participants.length - 1}
                            className="text-gray-500 hover:text-blue-600"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleParticipantRemove(participant.id)
                          }
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    参加者を追加してください
                  </div>
                )}
              </div>

              {participants.length > 0 && (
                <div className="flex justify-between items-center text-sm text-gray-500 px-2">
                  <span>現在の参加者数: {participants.length}名</span>
                  <span>残り: {10 - participants.length}名まで追加可能</span>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base flex items-center gap-2 font-medium">
                日程選択
                <span className="text-xs text-red-500">*必須</span>
              </h2>
              <span className="text-sm text-gray-500">（複数選択可）</span>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-medium">
                  {currentYear}年{currentMonth}月
                </span>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (currentMonth === 1) {
                        handleMonthChange(currentYear - 1, 12);
                      } else {
                        handleMonthChange(currentYear, currentMonth - 1);
                      }
                    }}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (currentMonth === 12) {
                        handleMonthChange(currentYear + 1, 1);
                      } else {
                        handleMonthChange(currentYear, currentMonth + 1);
                      }
                    }}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <Calendar
                year={currentYear}
                month={currentMonth}
                selectedDates={selectedDates.map((item) => item.date)}
                onDateSelect={handleDateSelect}
                onMonthChange={handleMonthChange}
              />
            </div>

            {selectedDates.length > 0 ? (
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-2">
                  選択済みの日程:
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {selectedDates
                    .sort(
                      (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    )
                    .map((item) => (
                      <div
                        key={item.date}
                        className="flex items-center justify-between bg-blue-50 p-3 rounded-lg shadow-sm border border-blue-100"
                      >
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-blue-500 mr-2" />
                          <span>
                            {new Date(item.date).toLocaleDateString("ja-JP", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              weekday: "short",
                            })}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDateSelect(item.date)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                カレンダーから日程を選択してください
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 mt-6 animate-fade-in flex items-center gap-2">
            <div className="rounded-full bg-red-100 p-1">
              <X className="h-4 w-4 text-red-500" />
            </div>
            {error}
          </div>
        )}

        {/* ナビゲーションボタン */}
        <div className="flex gap-4 mt-8">
          {currentStep === 2 && (
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              className="flex-1 border-gray-300"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              戻る
            </Button>
          )}

          {currentStep === 1 ? (
            <Button
              onClick={goToNextStep}
              disabled={participants.length < 2 || loadingState.status}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              次へ
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={selectedDates.length === 0 || loadingState.status}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              {loadingState.status ? (
                <>
                  <span className="animate-spin mr-2">◯</span>
                  {loadingState.message}
                </>
              ) : (
                <>
                  作成する
                  <Check className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ローディングオーバーレイ */}
      <LoadingOverlay
        isVisible={loadingState.status}
        message={loadingState.message}
      />
    </div>
  );
}