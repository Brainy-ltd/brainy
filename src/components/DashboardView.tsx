import React, { useState } from 'react';
import { Course, CalendarEvent, Book, Chat } from '../types';
import { 
  Terminal, 
  Brain, 
  Layers, 
  Lock, 
  Plus, 
  Video, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Database,
  Code,
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface DashboardViewProps {
  userName: string;
  major: string;
  courses: Course[];
  calendarEvents: CalendarEvent[];
  books: Book[];
  chats: Chat[];
  onNavigate: (tab: any) => void;
  onResumeCourse: (courseId: string) => void;
  onJoinSession: () => void;
  activityLog: { id: string; text: string; time: string; course: string; type: 'grade' | 'forum' | 'custom' }[];
  onAddActivity: (msg: string, course: string, type: 'grade' | 'forum') => void;
}

export function DashboardView({
  userName,
  major,
  courses,
  calendarEvents,
  books,
  chats,
  onNavigate,
  onResumeCourse,
  onJoinSession,
  activityLog,
  onAddActivity
}: DashboardViewProps) {
  const [forumInput, setForumInput] = useState('');

  // Get Today / Oct 18, 2023 calendar events
  const todayDate = '2023-10-18';
  const todayEvents = calendarEvents.filter(e => e.date === todayDate);

  // Get upcoming events
  const deadlines = calendarEvents.filter(e => e.type === 'deadline');

  const handlePostForum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumInput.trim()) return;
    onAddActivity(forumInput, 'CS General Help', 'forum');
    setForumInput('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-linear-to-r from-primary-container/10 to-transparent p-6 rounded-2xl border border-outline-variant/30">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Welcome back, {userName}.</h2>
          <p className="text-lg text-on-surface-variant mt-1">
            You have <span className="text-primary font-bold">3 classes</span> active today and a project milestone due soon.
          </p>
          <p className="text-xs text-outline mt-1 italic">Major: {major} • Semester: Spring 2024</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={onJoinSession}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-medium hover:bg-primary-container hover:shadow-md transition-all active:scale-95 text-sm"
          >
            <Video className="w-4 h-4" />
            Join Live Session
          </button>
          <button 
            onClick={() => onNavigate('messages')}
            className="flex items-center gap-2 bg-white border border-outline-variant text-on-surface px-5 py-2.5 rounded-lg font-medium hover:bg-surface-container transition-all text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            Message Instructor
          </button>
        </div>
      </section>

      {/* Main Grid: Left 8 col, Right 4 col equivalents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Courses in Progress */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-on-surface">Courses in Progress</h3>
              <button 
                onClick={() => onNavigate('courses')}
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View All Courses
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.slice(0, 2).map((course) => (
                <div 
                  key={course.id} 
                  className="bg-white border border-outline-variant p-5 rounded-xl hover:shadow-md hover:border-primary/50 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                        {course.icon === 'Brain' ? <Brain className="w-5 h-5" /> : 
                         course.icon === 'Terminal' ? <Terminal className="w-5 h-5" /> : 
                         course.icon === 'Layers' ? <Layers className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </div>
                      <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-semibold">
                        Grade: {course.gradePercentage}% ({course.grade})
                      </span>
                    </div>
                    <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors text-base line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-1 mb-4 line-clamp-2">{course.description}</p>
                  </div>

                  <div>
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                        <span>Course Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary-container/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded-full transition-all duration-1000"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <button 
                      onClick={() => onResumeCourse(course.id)}
                      className="w-full flex items-center justify-between p-3 bg-surface-container-low rounded-lg hover:bg-primary-fixed transition-colors text-left"
                    >
                      <div>
                        <p className="text-[10px] text-outline uppercase font-bold tracking-wider">NEXT LESSON</p>
                        <p className="text-xs font-bold text-on-surface mt-0.5 line-clamp-1">{course.nextLesson}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-on-surface">Recent Activity Feed</h3>
              <span className="text-xs text-outline italic">Updated live from student center</span>
            </div>

            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant/50 shadow-xs">
              {activityLog.map((log) => (
                <div key={log.id} className="p-4 flex gap-4 hover:bg-surface-container-low transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {log.type === 'grade' ? (
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {log.type === 'grade' ? 'Grade Posted: ' : 'Forum Discussion Post: '}
                        <span className="font-bold text-primary">{log.course}</span>
                      </p>
                      <span className="text-xs text-outline shrink-0 whitespace-nowrap">{log.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 italic">"{log.text}"</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Post mock update to feed */}
            <form onSubmit={handlePostForum} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Share a thought or ask a question in CS General Help forum..."
                value={forumInput}
                onChange={(e) => setForumInput(e.target.value)}
                className="flex-1 bg-white border border-outline-variant focus:ring-2 focus:ring-primary/20 rounded-lg text-sm px-4 py-2 outline-hidden"
              />
              <button
                type="submit"
                className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/95 transition-all text-sm shrink-0"
              >
                Post
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upcoming Deadlines Widget */}
          <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-on-surface">Upcoming Deadlines</h3>
              <button 
                onClick={() => onNavigate('calendar')}
                className="p-1.5 text-primary hover:bg-primary/15 rounded-full transition-colors"
                title="View Calendar"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {deadlines.slice(0, 2).map((dl) => (
                <div key={dl.id} className="flex gap-3 group cursor-pointer" onClick={() => onNavigate('calendar')}>
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-error ring-4 ring-error/15 shrink-0"></div>
                    <div className="w-px flex-1 bg-outline-variant mt-2 min-h-[30px]"></div>
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-error-container text-on-error-container whitespace-nowrap">
                        DUE SOON
                      </span>
                      <span className="text-[11px] text-error font-medium flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {dl.time}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">{dl.title}</h5>
                    <p className="text-[11px] text-on-surface-variant italic truncate">{dl.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Pending Feedback Survey List */}
          <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-xs">
            <h3 className="text-base font-bold text-on-surface mb-3">Pending Surveys</h3>
            <div className="space-y-3">
              <div 
                onClick={() => onNavigate('settings')}
                className="p-3 bg-surface-container-low rounded-lg border-l-4 border-secondary hover:bg-surface-container-high transition-colors cursor-pointer group"
              >
                <p className="text-xs font-bold text-on-surface group-hover:text-secondary transition-colors">Course Survey: Dr. Alan Turing</p>
                <p className="text-[10px] text-on-surface-variant italic">Advanced Algorithms • Due in 2 days</p>
              </div>
              <div 
                onClick={() => onNavigate('settings')}
                className="p-3 bg-surface-container-low rounded-lg border-l-4 border-secondary hover:bg-surface-container-high transition-colors cursor-pointer group"
              >
                <p className="text-xs font-bold text-on-surface group-hover:text-secondary transition-colors">Review Syllabus: Prof. Sarah Chen</p>
                <p className="text-[10px] text-on-surface-variant italic">Neural Networks 101 • Verified</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('calendar')}
              className="w-full mt-4 py-2.5 border border-dashed border-outline-variant rounded-lg text-xs text-on-surface-variant font-semibold hover:border-primary hover:text-primary transition-all"
            >
              + Sync with Personal Calendar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
