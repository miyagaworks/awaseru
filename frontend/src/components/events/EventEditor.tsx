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
  <div className="space-y-6 relative">
    {/* 日程セクション */}
    <div className="space-y-4" data-testid="date-section">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
          <CalendarIcon className="w-5 h-5 text-blue-500" />
          日程
        </h3>
        <Button 
          onClick={addDate}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          disabled={disabled}
          data-testid="add-date-button"
        >
          <Plus className="w-4 h-4" />
          追加
        </Button>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {dates.length > 0 ? (
          dates.map((date, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <Input
                type="text"
                value={new Date(date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                })}
                readOnly
                className="bg-white border-gray-200 group-hover:border-blue-200 transition-colors"
                disabled={disabled}
                data-testid={`date-input-${index}`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDate(index)}
                disabled={disabled}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                data-testid={`remove-date-button-${index}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            日程が設定されていません。「追加」ボタンから日程を設定してください。
          </div>
        )}
        {errors.dates && (
          <p className="text-sm text-red-500 mt-1 flex items-center gap-1.5" data-testid="date-error">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {errors.dates}
          </p>
        )}
      </div>
    </div>

    {/* カレンダーダイアログ */}
    <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <DialogContent className="w-[calc(100%-40px)] sm:w-[425px] bg-white rounded-lg p-4 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            日程を選択
          </DialogTitle>
          <DialogDescription>
            複数の日程を選択できます。選択が完了したら「完了」をクリックしてください。
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="text-xl font-medium mb-4 text-center text-gray-800">
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
            <Button onClick={() => setIsCalendarOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
              完了
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* 参加者セクション */}
    <div className="space-y-4 mt-8" data-testid="participant-section">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
          <Users className="w-5 h-5 text-blue-500" />
          参加者
        </h3>
        <Button 
          onClick={addParticipant}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          disabled={disabled || participants.length >= 20}
          data-testid="add-participant-button"
        >
          <Plus className="w-4 h-4" />
          追加
        </Button>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {participants.length > 0 ? (
          participants.map((participant, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <Input
                type="text"
                value={participant}
                onChange={(e) => updateParticipant(index, e.target.value)}
                placeholder="参加者名"
                maxLength={20}
                disabled={disabled}
                className="bg-white border-gray-200 group-hover:border-blue-200 transition-colors"
                data-testid={`participant-input-${index}`}
                ref={index === participants.length - 1 ? newParticipantInputRef : null}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeParticipant(index)}
                disabled={disabled}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                data-testid={`remove-participant-button-${index}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            参加者が設定されていません。「追加」ボタンから参加者を追加してください。
          </div>
        )}
        {errors.participants && (
          <div 
            role="alert"
            data-testid="participant-error"
            className="text-sm text-red-500 mt-1 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {errors.participants}
          </div>
        )}
      </div>
      
      {participants.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-500 px-2">
          <span>現在の参加者数: {participants.length}名</span>
          <span>残り: {20 - participants.length}名まで追加可能</span>
        </div>
      )}
    </div>

    {/* アクションボタン */}
    <div className="flex justify-end gap-4 pt-4 mt-8 border-t border-gray-200">
      <Button 
        variant="outline" 
        onClick={onCancel}
        disabled={disabled}
        className="border-gray-300 hover:bg-gray-100"
        data-testid="cancel-button"
      >
        キャンセル
      </Button>
      <Button 
        onClick={validateAndSave}
        disabled={disabled}
        className="bg-blue-600 hover:bg-blue-700 text-white"
        data-testid="save-button"
      >
        {disabled ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            保存中...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            保存
          </span>
        )}
      </Button>
    </div>
  </div>
);
}