// components/events/Calendar.tsx
// components/events/Calendar.tsx
import { memo } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  year: number;
  month: number;
  selectedDates: string[];
  onDateSelect: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
}

export const Calendar = memo(function Calendar({ 
  year, 
  month, 
  selectedDates,
  onDateSelect,
  onMonthChange
}: CalendarProps) {
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  const generateCalendarDays = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const calendar: (number | null)[][] = [];
    let week: (number | null)[] = Array(startDayOfWeek).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      
      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      week = week.concat(Array(7 - week.length).fill(null));
      calendar.push(week);
    }

    return calendar;
  };

  const isPastMonth = (year: number, month: number) => {
    const today = new Date();
    const compareDate = new Date(year, month - 1);
    return compareDate < new Date(today.getFullYear(), today.getMonth());
  };

  const renderMonthControls = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (month === 1) {
              onMonthChange(year - 1, 12);
            } else {
              onMonthChange(year, month - 1);
            }
          }}
          disabled={isPastMonth(year, month - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (month === 12) {
              onMonthChange(year + 1, 1);
            } else {
              onMonthChange(year, month + 1);
            }
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const isDateSelected = (day: number) => {
    const dateStr = formatDate(year, month, day);
    return selectedDates.includes(dateStr);
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month - 1, day);
    return checkDate < today;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      year === today.getFullYear() &&
      month === today.getMonth() + 1 &&
      day === today.getDate()
    );
  };

  const formatDate = (year: number, month: number, day: number): string => {
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  const handleDateSelection = (day: number) => {
    if (!isPastDate(day)) {
      const dateStr = formatDate(year, month, day);
      onDateSelect(dateStr);
    }
  };

  const handleDateClick = (day: number) => {
    handleDateSelection(day);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, day: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDateSelection(day);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden mx-auto max-w-full">
      {renderMonthControls()}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day, index) => (
          <div 
            key={day}
            className={`
              p-2 text-center text-sm font-medium
              ${index === 0 ? 'text-[#d54040]' : ''}
              ${index === 6 ? 'text-[#00b0e9]' : ''}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      <div>
        {generateCalendarDays().map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((day, dayIndex) => {
              if (day === null) {
                return <div key={`${weekIndex}-${dayIndex}`} className="p-2" />;
              }

              const isSelected = isDateSelected(day);
              const isPast = isPastDate(day);
              const todayFlag = isToday(day);

              return (
                <button
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => handleDateClick(day)}
                  onKeyDown={(e) => handleKeyDown(e, day)}
                  disabled={isPast}
                  type="button"
                  className={`
                    relative w-full p-2 text-center transition-colors
                    ${!isPast ? 'hover:bg-gray-100' : ''}
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${isPast ? 'text-gray-300 cursor-not-allowed' : 
                      dayIndex === 0 ? 'text-[#d54040]' : 
                      dayIndex === 6 ? 'text-[#00b0e9]' : ''}
                    ${isSelected ? 'bg-blue-100 hover:bg-blue-200' : ''}
                    ${todayFlag ? 'font-bold' : ''}
                  `}
                >
                  <span className="relative z-10">{day}</span>
                  {isSelected && !isPast && (
                    <div className="absolute inset-0 bg-blue-100 opacity-50" />
                  )}
                  {todayFlag && (
                    <div className="absolute inset-0 border-2 border-green-500 rounded-full opacity-25" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});