import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/portal/components/ui/button';
import { Badge } from '@/portal/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/portal/components/ui/card';

interface CalendarEvent {
  id: string;
  date: string; // ISO date
  title: string;
  duration: number; // minutes
  status: string; // scheduled, completed, cancelled
  participants: string[];
}

interface ProgramCalendarProps {
  events: CalendarEvent[];
  title?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function statusColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-500';
    case 'scheduled': return 'bg-blue-500';
    case 'cancelled': return 'bg-red-400';
    default: return 'bg-slate-400';
  }
}

export type { CalendarEvent };

export default function ProgramCalendar({ events, title = 'Program Calendar' }: ProgramCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: Array<{ date: string; day: number; isCurrentMonth: boolean }> = [];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      days.push({
        date: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding (fill to 42 cells = 6 rows)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      days.push({
        date: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month, daysInMonth, firstDayOfWeek]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const dateKey = e.date.slice(0, 10);
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(e);
    }
    return map;
  }, [events]);

  const selectedEvents = selectedDate ? (eventsByDate.get(selectedDate) || []) : [];

  const today = new Date().toISOString().slice(0, 10);

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-36 text-center">
              {MONTHS[month]} {year}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-lg overflow-hidden">
          {calendarDays.map((day, i) => {
            const dayEvents = eventsByDate.get(day.date) || [];
            const isToday = day.date === today;
            const isSelected = day.date === selectedDate;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day.date === selectedDate ? null : day.date)}
                className={`relative bg-white p-1.5 min-h-[60px] text-left transition-colors hover:bg-blue-50 ${
                  !day.isCurrentMonth ? 'opacity-40' : ''
                } ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
              >
                <span
                  className={`text-xs font-medium ${
                    isToday
                      ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                      : 'text-slate-700'
                  }`}
                >
                  {day.day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap">
                    {dayEvents.slice(0, 3).map((e, j) => (
                      <div
                        key={j}
                        className={`h-1.5 w-1.5 rounded-full ${statusColor(e.status)}`}
                        title={e.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-slate-400">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected date detail */}
        {selectedDate && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h4>
            {selectedEvents.length === 0 ? (
              <p className="text-xs text-slate-400">No sessions on this day</p>
            ) : (
              selectedEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-md border p-3">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${statusColor(e.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs text-slate-500">
                      {e.duration}min &middot; {e.participants.join(', ')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {e.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-slate-500">Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-slate-500">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <span className="text-[10px] text-slate-500">Cancelled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
