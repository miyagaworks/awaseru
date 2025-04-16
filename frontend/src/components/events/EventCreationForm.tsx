// frontend/src/components/events/EventCreationForm.tsx
import { useState, useRef } from 'react';
import { Calendar } from './Calendar';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ArrowUp, ArrowDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { eventOperations } from "../../lib/api";

interface DateItem {
  date: string;
}

interface Participant {
  id: string;
  name: string;
}

interface LoadingState {
  status: boolean;
  message: string;
}

interface EventCreationFormProps {
  onSuccess?: (eventId: string) => void;
  onError?: (error: Error) => void;
}

export const EventCreationForm: React.FC<EventCreationFormProps> = ({
  onSuccess,
  onError
}) => {
  // State管理
  const [step, setStep] = useState<1 | 2>(1);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    status: false,
    message: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    message: '',
    selectedDates: [] as DateItem[],
    participants: [] as Participant[],
    newParticipant: ''
  });
  const [calendarState, setCalendarState] = useState({
    currentMonth: new Date().getMonth() + 1,
    currentYear: new Date().getFullYear(),
  });
  const [isComposing, setIsComposing] = useState(false);
  const participantInputRef = useRef<HTMLInputElement>(null);

  // カレンダー操作メソッド
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCalendarState(prev => {
      if (direction === 'prev') {
        if (prev.currentMonth === 1) {
          return {
            currentMonth: 12,
            currentYear: prev.currentYear - 1
          };
        }
        return {
          ...prev,
          currentMonth: prev.currentMonth - 1
        };
      } else {
        if (prev.currentMonth === 12) {
          return {
            currentMonth: 1,
            currentYear: prev.currentYear + 1
          };
        }
        return {
          ...prev,
          currentMonth: prev.currentMonth + 1
        };
      }
    });
  };

  // 日付選択ハンドラー
  const handleDateSelect = (dateStr: string) => {
    const formattedDate = dateStr.replace(/\//g, '-');
    setFormData(prev => {
      if (prev.selectedDates.some(item => item.date === formattedDate)) {
        return {
          ...prev,
          selectedDates: prev.selectedDates.filter(item => item.date !== formattedDate)
        };
      }
      return {
        ...prev,
        selectedDates: [...prev.selectedDates, { date: formattedDate }]
      };
    });
  };

  // 参加者管理メソッド
  const handleParticipantAdd = () => {
    if (isComposing) return;

    const trimmedName = formData.newParticipant.trim();
    if (!trimmedName || formData.participants.length >= 10 ||
      formData.participants.some(p => p.name === trimmedName)) return;

    setFormData(prev => ({
      ...prev,
      participants: [
        ...prev.participants,
        { id: crypto.randomUUID(), name: trimmedName }
      ],
      newParticipant: ''
    }));

    // 追加：入力欄にフォーカスを設定
    setTimeout(() => {
      participantInputRef.current?.focus();
    }, 0);
  };

  const handleParticipantRemove = (id: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }));
  };

  const moveParticipant = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.participants.length - 1)) return;

    setFormData(prev => {
      const newParticipants = [...prev.participants];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newParticipants[index], newParticipants[targetIndex]] =
        [newParticipants[targetIndex], newParticipants[index]];
      return {
        ...prev,
        participants: newParticipants
      };
    });
  };

  // フォーム送信処理
  const handleSubmit = async () => {
    if (step === 1) {
      // Step 1のバリデーション
      if (formData.participants.length < 2) {
        setError('参加者を2名以上追加してください');
        return;
      }
      setStep(2);
      setError(null);
      return;
    }

    // Step 2のバリデーション
    if (formData.selectedDates.length === 0) {
      setError('日程を選択してください');
      return;
    }

    setError(null);
    setLoadingState({ status: true, message: 'イベントを作成中...' });

    try {
      // イベントを作成
      const eventResult = await eventOperations.createEvent({
        title: formData.message || '日程調整',
        description: null,
        dates: formData.selectedDates.map(item => item.date),
        participants: formData.participants.map(p => p.name)
      });

      // 型を明示的に指定
      const event = eventResult as { id: string, [key: string]: any };

      if (!event?.id) {
        throw new Error('イベントの作成に失敗しました');
      }

      // 初期レスポンスを生成して保存
      const initialResponses = eventOperations.generateInitialResponses(
        event.id,
        formData.participants.map(p => p.name),
        formData.selectedDates.map(item => item.date)
      );

      setLoadingState({ status: true, message: '回答を初期化中...' });
      await eventOperations.updateResponses(event.id, initialResponses);

      setLoadingState({ status: true, message: '完了！リダイレクト中...' });
      onSuccess?.(event.id);

    } catch (err: any) {
      console.error('Error details:', err);
      const errorMessage = err?.message || 'イベントの作成に失敗しました。もう一度お試しください。';
      setError(errorMessage);
      onError?.(err);

    } finally {
      setLoadingState({ status: false, message: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: 基本情報入力 */}
      {step === 1 && (
        <>
          {/* メッセージ入力 */}
          <div className="space-y-2">
            <h2 className="text-base flex items-center gap-2">
              参加者へのメッセージ
              <span className="text-sm text-gray-500">（任意）</span>
            </h2>
            <Input
              type="text"
              placeholder="〇〇〇の日程調整をお願いします。"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="bg-white"
            />
          </div>

          {/* 参加者管理 */}
          <div className="space-y-2">
            <h2 className="text-base flex items-center gap-2">
              参加者の追加
              <span className="text-xs text-red-500">*2名以上必須</span>
            </h2>
            <div className="flex items-center gap-2">
              <Input
                ref={participantInputRef}
                type="text"
                placeholder="お名前を入力ください。"
                value={formData.newParticipant}
                onChange={(e) => setFormData(prev => ({ ...prev, newParticipant: e.target.value }))}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={(e: React.CompositionEvent<HTMLInputElement>) => {
                  setIsComposing(false);
                  const target = e.target as HTMLInputElement;
                  setFormData(prev => ({ ...prev, newParticipant: target.value }));
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
                disabled={formData.participants.length >= 10}
              >
                ＋
              </Button>
            </div>

            <div className="space-y-2">
              {formData.participants.map((participant, index) => (
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
                        disabled={index === formData.participants.length - 1}
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
        </>
      )}

      {/* Step 2: 日程選択 */}
      {step === 2 && (
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
              <span className="text-xl">
                {calendarState.currentYear}年{calendarState.currentMonth}月
              </span>
              <div className="space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMonthChange('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMonthChange('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Calendar
              year={calendarState.currentYear}
              month={calendarState.currentMonth}
              selectedDates={formData.selectedDates.map(item => item.date)}
              onDateSelect={handleDateSelect}
              onMonthChange={(year, month) => {
                setCalendarState({ currentYear: year, currentMonth: month });
              }}
            />
          </div>

          {formData.selectedDates.length > 0 && (
            <div className="space-y-2">
              {formData.selectedDates
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
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* ステップ切り替え・作成ボタン */}
      <div className="flex gap-4">
        {step === 2 && (
          <Button
            variant="outline"
            onClick={() => {
              setStep(1);
              setError(null);
            }}
            className="flex-1"
          >
            戻る
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={
            loadingState.status ||
            (step === 1 && formData.participants.length < 2) ||
            (step === 2 && formData.selectedDates.length === 0)
          }
        >
          {loadingState.status
            ? loadingState.message
            : step === 1
              ? '次へ'
              : '作成する'
          }
        </Button>
      </div>

      {/* ローディングオーバーレイ */}
      <LoadingOverlay
        isVisible={loadingState.status}
        message={loadingState.message}
      />
    </div>
  );
};