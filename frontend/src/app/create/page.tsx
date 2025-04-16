// frontend/src/app/create/page.tsx
'use client';

import React from 'react';
import { useState } from 'react';
import { Calendar } from '../../components/events/Calendar';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ArrowUp, ArrowDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { eventOperations } from "../../lib/supabase";
import { useRouter } from 'next/navigation';
import { CreateButton } from '../..//components/events/CreateButton';

function generateId(): string {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
  } catch (e) {
    console.warn('crypto.randomUUID is not available, using fallback');
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface DateItem {
  date: string;  // YYYY-MM-DD形式で保持
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
    message: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [selectedDates, setSelectedDates] = useState<DateItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [newParticipant, setNewParticipant] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  // カレンダー操作メソッド
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  // 日付選択ハンドラー
  const handleDateSelect = (dateStr: string) => {
    const formattedDate = dateStr.replace(/\//g, '-');
    if (selectedDates.some(item => item.date === formattedDate)) {
      setSelectedDates(selectedDates.filter(item => item.date !== formattedDate));
    } else {
      // 3ヶ月以内の日付かチェック
      const selectedDate = new Date(formattedDate);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      if (selectedDate > threeMonthsFromNow) {
        setError('3ヶ月以内の日付を選択してください');
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
    if (!trimmedName || participants.length >= 10 ||
      participants.some(p => p.name === trimmedName)) {
      setError(participants.length >= 10 ? '参加者は最大10名までです' : '');
      return;
    }

    setParticipants(prev => [
      ...prev,
      { id: generateId(), name: trimmedName }
    ]);
    setNewParticipant('');
    setError(null);
  };

  const handleParticipantRemove = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const moveParticipant = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) ||
      (direction === 'down' && index === participants.length - 1)) return;

    const newParticipants = [...participants];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newParticipants[index], newParticipants[targetIndex]] =
      [newParticipants[targetIndex], newParticipants[index]];
    setParticipants(newParticipants);
  };

  // フォーム送信処理
  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      setError('日程を選択してください');
      return;
    }
    if (participants.length < 2) {
      setError('2名以上の参加者を追加してください');
      return;
    }

    setError(null);
    setLoadingState({ status: true, message: 'イベントを作成中...' });

    try {
      const eventData = {
        title: 'イベント調整', // タイトルを追加
        description: description || null,
        dates: selectedDates.map(item => item.date),
        participants: participants.map(p => p.name)
      };

      console.log('Creating event:', eventData);
      const event = await eventOperations.createEvent(eventData);

      // 型アサーションを使用してeventオブジェクトの型を明示
      const eventWithId = event as { id: string };

      if (!eventWithId?.id) {
        throw new Error('イベントの作成に失敗しました');
      }

      setLoadingState({ status: true, message: '完了！リダイレクト中...' });
      router.push(`/${eventWithId.id}/results/`);

    } catch (err: any) {
      console.error('Error details:', err);
      setError(err?.message || 'イベントの作成に失敗しました。もう一度お試しください。');

    } finally {
      setLoadingState({ status: false, message: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* イベントの説明 */}
      <div className="space-y-2">
        <h2 className="text-base flex items-center gap-2">
          イベントの説明
          <span className="text-sm text-gray-500">（任意）</span>
        </h2>
        <Input
          type="text"
          placeholder="〇〇〇の日程調整をお願いします。"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* 日程選択 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base flex items-center gap-2">
            日程選択
            <span className="text-xs text-red-500">*必須</span>
          </h2>
          <span className="text-sm text-gray-500">（複数選択可）</span>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl">{currentYear}年{currentMonth}月</span>
          </div>

          <Calendar
            year={currentYear}
            month={currentMonth}
            selectedDates={selectedDates.map(item => item.date)}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
          />
        </div>

        {selectedDates.length > 0 && (
          <div className="space-y-2">
            {selectedDates
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((item) => (
                <div
                  key={item.date}
                  className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                >
                  <span>
                    {new Date(item.date).toLocaleDateString('ja-JP', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateSelect(item.date)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 参加者管理 */}
      <div className="space-y-2">
        <h2 className="text-base flex items-center gap-2">
          参加者の追加
          <span className="text-xs text-red-500">*2名以上必須</span>
        </h2>
        <div className="flex items-center gap-2">
          <Input
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
              if (e.key === 'Enter' && !isComposing) {
                e.preventDefault();
                handleParticipantAdd();
              }
            }}
            className="bg-white"
            maxLength={20}
          />
          <Button
            onClick={handleParticipantAdd}
            disabled={participants.length >= 10}
          >
            ＋
          </Button>
        </div>

        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
            >
              <span className="flex-grow px-2">{participant.name}</span>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveParticipant(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveParticipant(index, 'down')}
                    disabled={index === participants.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleParticipantRemove(participant.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* 作成ボタン */}
      <CreateButton
        onClick={handleSubmit}
        disabled={loadingState.status || selectedDates.length === 0 || participants.length < 2} // 条件を変更
        loading={loadingState.status}
        loadingMessage={loadingState.message}
      />

      {/* ローディングオーバーレイ */}
      <LoadingOverlay
        isVisible={loadingState.status}
        message={loadingState.message}
      />
    </div>
  );
}