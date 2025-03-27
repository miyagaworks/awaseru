// src/components/events/EventEditor.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Plus, Calendar as CalendarIcon, Users } from 'lucide-react';
import { Calendar } from './Calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';

interface EventEditorProps {
  initialDates?: string[];
  initialParticipants?: string[];
  onSave: (dates: string[], participants: string[]) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const EventEditor = ({
  initialDates = [],
  initialParticipants = [],
  onSave,
  onCancel,
  disabled = false
}: EventEditorProps) => {
  const [dates, setDates] = useState<string[]>(
    [...initialDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  );
  const [participants, setParticipants] = useState<string[]>(initialParticipants);
  const [errors, setErrors] = useState<{
    dates?: string;
    participants?: string;
  }>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const newParticipantInputRef = useRef<HTMLInputElement>(null);

  const handleDateSelect = (selectedDate: string) => {
    if (dates.includes(selectedDate)) {
      setErrors(prev => ({
        ...prev,
        dates: '同じ日程が既に存在します'
      }));
      return;
    }

    setDates(prevDates => {
      const newDates = [...prevDates, selectedDate];
      return newDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    });
    setErrors(prev => ({ ...prev, dates: undefined }));
  };

  const addDate = () => {
    if (dates.some(date => !date)) {
      setErrors(prev => ({
        ...prev,
        dates: '未入力の日程があります'
      }));
      return;
    }
    setIsCalendarOpen(true);
  };

  const removeDate = (index: number) => {
    setDates(dates.filter((_, i) => i !== index));
    setErrors(prev => ({ ...prev, dates: undefined }));
  };

  const addParticipant = () => {
    if (participants.length >= 20) {
      setErrors(prev => ({ 
        ...prev, 
        participants: '参加者は最大20名までです' 
      }));
      return;
    }
    
    if (participants.some(participant => !participant.trim())) {
      setErrors(prev => ({ 
        ...prev, 
        participants: '未入力の参加者名を先に入力してください' 
      }));
      return;
    }
    
    setParticipants(prev => [...prev, '']);
    setErrors(prev => ({ ...prev, participants: undefined }));

    // より確実なフォーカス制御のために requestAnimationFrame を使用
    requestAnimationFrame(() => {
      newParticipantInputRef.current?.focus();
      // 入力欄の先頭にカーソルを配置
      newParticipantInputRef.current?.setSelectionRange(0, 0);
    });
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
    setErrors(prev => ({ ...prev, participants: undefined }));
  };

  const updateParticipant = (index: number, value: string) => {
    const newParticipants = [...participants];
    const sanitizedValue = value.replace(/[\[\]\"]/g, '').trim();
    
    const isDuplicate = participants.some((p, i) => 
      i !== index && p.trim() === sanitizedValue
    );
    
    if (isDuplicate) {
      setErrors(prev => ({
        ...prev,
        participants: '同じ名前の参加者が既に存在します'
      }));
      return;
    }
    
    newParticipants[index] = sanitizedValue;
    setParticipants(newParticipants);
    setErrors(prev => ({ ...prev, participants: undefined }));
  };
  
  const validateAndSave = () => {
    const newErrors: { dates?: string; participants?: string } = {};
  
    if (dates.length === 0) {
      newErrors.dates = '少なくとも1つの日程を設定してください';
    } else if (dates.some(date => !date)) {
      newErrors.dates = '未入力の日程があります';
    } else {
      const uniqueDates = new Set(dates);
      if (uniqueDates.size !== dates.length) {
        newErrors.dates = '同じ日程が存在します';
        setErrors(newErrors);
        return;
      }
    }
  
    if (participants.length === 0) {
      newErrors.participants = '少なくとも1名の参加者を設定してください';
    } else if (participants.some(participant => !participant)) {
      newErrors.participants = '未入力の参加者名があります';
    } else {
      const uniqueParticipants = new Set(participants.map(p => p.trim()));
      if (uniqueParticipants.size !== participants.length) {
        newErrors.participants = '同じ名前の参加者が存在します';
      }
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    const sortedDates = [...dates].sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    onSave(sortedDates, participants.map(p => p.trim()));
  };

  return (
    <div className="space-y-6">
      {/* 日程セクション */}
      <div className="space-y-4" data-testid="date-section">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            日程
          </h3>
          <Button 
            onClick={addDate}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            disabled={disabled}
            data-testid="add-date-button"
          >
            <Plus className="w-4 h-4" />
            追加
          </Button>
        </div>
        
        <div className="space-y-2">
          {dates.map((date, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="text"
                value={new Date(date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                })}
                readOnly
                className="bg-white"
                disabled={disabled}
                data-testid={`date-input-${index}`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDate(index)}
                disabled={disabled}
                data-testid={`remove-date-button-${index}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {errors.dates && (
            <p className="text-sm text-red-500 mt-1" data-testid="date-error">
              {errors.dates}
            </p>
          )}
        </div>
      </div>

      {/* カレンダーダイアログ */}
      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-40px)] sm:w-[425px] bg-white rounded-lg p-4">
          <DialogHeader>
            <DialogTitle>日程を選択</DialogTitle>
            <DialogDescription>
              複数の日程を選択できます。選択が完了したら「完了」をクリックしてください。
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="text-xl font-medium mb-4 text-center">
              {selectedYear}年{selectedMonth}月
            </div>
            <Calendar
              year={selectedYear}
              month={selectedMonth}
              selectedDates={dates}
              onDateSelect={handleDateSelect}
              onMonthChange={(year, month) => {
                setSelectedYear(year);
                setSelectedMonth(month);
              }}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIsCalendarOpen(false)}>
                完了
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 参加者セクション */}
      <div className="space-y-4" data-testid="participant-section">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Users className="w-5 h-5" />
            参加者
          </h3>
          <Button 
            onClick={addParticipant}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            disabled={disabled || participants.length >= 20}
            data-testid="add-participant-button"
          >
            <Plus className="w-4 h-4" />
            追加
          </Button>
        </div>
        
        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="text"
                value={participant}
                onChange={(e) => updateParticipant(index, e.target.value)}
                placeholder="参加者名"
                maxLength={20}
                disabled={disabled}
                data-testid={`participant-input-${index}`}
                ref={index === participants.length - 1 ? newParticipantInputRef : null} // 最後の入力フィールドにrefを設定
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeParticipant(index)}
                disabled={disabled}
                data-testid={`remove-participant-button-${index}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {errors.participants && (
            <div 
              role="alert"
              data-testid="participant-error"
              className="text-sm text-red-500 mt-1"
            >
              {errors.participants}
            </div>
          )}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-end gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={disabled}
          data-testid="cancel-button"
        >
          キャンセル
        </Button>
        <Button 
          onClick={validateAndSave}
          disabled={disabled}
          data-testid="save-button"
        >
          {disabled ? '保存中...' : '保存'}
        </Button>
      </div>
    </div>
  );
};