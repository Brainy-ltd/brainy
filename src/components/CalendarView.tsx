import React, { useState } from 'react';
import { CalendarEvent, EventType } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Tag, 
  AlertCircle, 
  X,
  PlusCircle,
  BookOpen
} from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (newEvent: Omit<CalendarEvent, 'id'>) => void;
}

export function CalendarView({
  events,
  onAddEvent
}: CalendarViewProps) {
  // Center on October 2023 to match the pre-populated mocks
  const [currentYear, setCurrentYear] = useState(2023);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed, 9 is October
  const [selectedDateStr, setSelectedDateStr] = useState('2023-10-18'); // default Oct 18, 2023
  
  // Create Event Form State
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [newType, setNewType] = useState<EventType>('study');
  const [newDetails, setNewDetails] = useState('');
  const [newCourse, setNewCourse] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Helper values for generating days grid
  // In October 2023:
  // First day is Sunday, Oct 1 (index 0)
  // Total days: 31
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const startOffset = getFirstDayOfMonth(currentYear, currentMonth);

  // Pad arrays with empty slots for previous month
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysCount; d++) {
    calendarCells.push(d);
  }

  // Handle month/year changes
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDateString = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  // Filter events for selected cell
  const selectedEvents = events.filter(e => e.date === selectedDateStr);

  const handleCellClick = (day: number) => {
    setSelectedDateStr(getDateString(day));
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddEvent({
      title: newTitle,
      date: selectedDateStr,
      time: newTime,
      type: newType,
      details: newDetails,
      courseName: newCourse.trim() || undefined
    });

    // Reset
    setNewTitle('');
    setNewDetails('');
    setNewCourse('');
    setIsAddingEvent(false);
  };

  // Helper colors mapping
  const getTypeBadgeColor = (type: EventType) => {
    switch (type) {
      case 'deadline': return 'bg-error-container text-on-error-container border border-error/20';
      case 'lecture': return 'bg-primary-container/10 text-primary border border-primary/25';
      case 'study': return 'bg-secondary-container/10 text-secondary border border-secondary/25';
      case 'personal': return 'bg-surface-container-highest text-on-surface-variant border border-outline-variant';
    }
  };

  const getTypeDotColor = (type: EventType) => {
    switch (type) {
      case 'deadline': return 'bg-error';
      case 'lecture': return 'bg-primary';
      case 'study': return 'bg-secondary';
      case 'personal': return 'bg-outline';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* View Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-primary" />
            Academic Calendar
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Stay aligned with scheduled exams, lecture syllabi, and thesis deadlines.
          </p>
        </div>

        <button 
          onClick={() => setIsAddingEvent(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-primary/95 hover:shadow-md transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Custom Event
        </button>
      </section>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Days grid of month (8 columns) */}
        <div className="lg:col-span-8 bg-white border border-outline-variant rounded-xl p-6 shadow-xs">
          
          {/* Calendar Controller Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-lg font-heavy font-black text-on-surface">
                {months[currentMonth]} {currentYear}
              </span>
              <span className="text-xs text-outline px-2.5 py-0.5 rounded-full bg-surface-container font-semibold uppercase tracking-wider">
                Academic Term
              </span>
            </div>

            <div className="flex gap-1.5">
              <button 
                onClick={handlePrevMonth}
                className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
              </button>
              <button 
                onClick={() => { setCurrentMonth(9); setCurrentYear(2023); setSelectedDateStr('2023-10-18'); }}
                className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container transition-colors"
              >
                Reset Oct '23
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
          </div>

          {/* Days of Week Row */}
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-[11px] font-black text-outline pb-2 tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2.5">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return (
                  <div 
                    key={`empty-${idx}`} 
                    className="aspect-square bg-surface-low border border-outline-variant/30 rounded-lg"
                  ></div>
                );
              }

              const cellDateStr = getDateString(day);
              const isSelected = cellDateStr === selectedDateStr;
              const cellEvents = events.filter(e => e.date === cellDateStr);
              
              const isToday = day === 18 && currentMonth === 9 && currentYear === 2023; // Oct 18, 2023 static today highlight

              return (
                <div 
                  key={`day-${day}`}
                  onClick={() => handleCellClick(day)}
                  className={`aspect-square p-2 border rounded-lg cursor-pointer flex flex-col justify-between transition-all duration-200 relative group
                    ${isSelected ? 'bg-primary-container/10 border-primary ring-2 ring-primary/20' : 'bg-white border-outline-variant hover:border-primary/50'}
                    ${isToday ? 'bg-secondary/5 font-bold border-secondary border-dashed border-2' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs ${isSelected ? 'text-primary font-bold' : 'text-on-surface'} ${isToday ? 'text-secondary font-black' : ''}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[7px] bg-secondary text-white font-bold px-1 rounded-sm uppercase tracking-tight scale-90 -translate-x-1 shadow-xs">
                        Ref
                      </span>
                    )}
                  </div>

                  {/* Tiny Indicators list */}
                  <div className="space-y-1">
                    {cellEvents.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-h-[25px] overflow-hidden">
                        {cellEvents.slice(0, 3).map((ev) => (
                          <div 
                            key={ev.id} 
                            className={`w-1.5 h-1.5 rounded-full ${getTypeDotColor(ev.type)}`}
                            title={ev.title}
                          ></div>
                        ))}
                        {cellEvents.length > 3 && (
                          <span className="text-[7px] text-outline font-bold leading-none">
                            +{cellEvents.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Hover detail preview text */}
                    {cellEvents.length > 0 && (
                      <p className="text-[8px] text-outline truncate hidden group-hover:block transition-all">
                        {cellEvents[0].title}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Guide Keys Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-outline-variant/60">
            <span className="text-xs text-outline font-semibold">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
              <span className="text-xs text-on-surface-variant font-medium">Exams & Deadlines</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <span className="text-xs text-on-surface-variant font-medium">Lectures & Syllabi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <span className="text-xs text-on-surface-variant font-medium">Group Study & Labs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-outline"></span>
              <span className="text-xs text-on-surface-variant font-medium">Personal Planning</span>
            </div>
          </div>

        </div>

        {/* Right Side: Active day schedule (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-xs">
            {/* Header displaying selected date */}
            <div className="border-b border-outline-variant/60 pb-4 mb-4">
              <p className="text-[10px] text-outline font-bold tracking-wider uppercase">SCHEDULE FOR DATE</p>
              <h3 className="text-lg font-bold text-on-surface mt-0.5">
                {new Date(selectedDateStr).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
              {selectedDateStr === '2023-10-18' && (
                <span className="inline-block mt-1 bg-secondary-container/10 border border-secondary/25 text-secondary px-2 py-0.5 rounded-full text-[10px] font-bold">
                  ● TODAY'S HIGHLIGHTS
                </span>
              )}
            </div>

            {/* List of events on this date */}
            {selectedEvents.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="w-8 h-8 text-outline mx-auto mb-2" />
                <p className="text-sm font-bold text-on-surface">No events scheduled</p>
                <p className="text-xs text-outline mt-1">Make better use of time by adding a custom study event.</p>
                <button 
                  onClick={() => setIsAddingEvent(true)}
                  className="mt-4 px-4 py-1.5 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold rounded-lg transition-all"
                >
                  + Create Event
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedEvents.map((ev) => (
                  <div 
                    key={ev.id}
                    className="p-4 bg-surface-container-low rounded-xl border border-outline-variant hover:border-primary/40 transition-all"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-sm ${getTypeBadgeColor(ev.type)}`}>
                        {ev.type}
                      </span>
                      <span className="text-xs text-outline font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {ev.time}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-on-surface">{ev.title}</h4>
                    {ev.courseName && (
                      <p className="text-xs text-primary font-bold mt-1 inline-flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-sm">
                        <BookOpen className="w-3 h-3" />
                        {ev.courseName}
                      </p>
                    )}
                    <p className="text-xs text-on-surface-variant italic mt-2 border-t border-outline-variant/30 pt-2">
                      "{ev.details}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Productivity Tip Widget */}
          <div className="bg-linear-to-b from-secondary/15 to-transparent border border-outline-variant rounded-xl p-5 shadow-xs">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Academic Tip of the Day</h4>
            <p className="text-xs text-on-surface-variant mt-2 italic">
              "When prepping for the Advanced Programming midterm, emphasize modular testing. Creating dynamic edge cases first ensures algorithms yield reliable outputs."
            </p>
            <p className="text-[10px] text-outline mt-1 font-bold">— Department of CS & Mathematics</p>
          </div>

        </div>

      </div>

      {/* Add Custom Event Modal Dial / Drawer Overlay */}
      {isAddingEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-outline-variant w-full max-w-md rounded-2xl p-6 shadow-xl animate-fade-in text-on-surface">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">Add Custom Event</h3>
                <p className="text-xs text-on-surface-variant">Adding to Date: {selectedDateStr}</p>
              </div>
              <button 
                onClick={() => setIsAddingEvent(false)}
                className="p-1 hover:bg-surface-container-high rounded-full text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1">Event Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Midterm Preparation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary/25 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1">Event Time</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 11:30 AM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary/25 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1">Event Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as EventType)}
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary/25 outline-hidden"
                  >
                    <option value="deadline">Exam / Deadline</option>
                    <option value="lecture">Lecture / Class</option>
                    <option value="study">Group Study / Lab</option>
                    <option value="personal">Personal Plan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1">Subject / Course Name (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Advanced Algorithm Design"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary/25 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1">Instruction / Details</label>
                <textarea 
                  placeholder="e.g. Bring syllabus printout and study questions."
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary/25 outline-hidden"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="flex-1 py-2 bg-surface-container-high rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary-container transition-colors"
                >
                  Save Academic Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
