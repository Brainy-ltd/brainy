import React, { useState } from 'react';
import { TabId, Course, Book, CalendarEvent, Chat, UserProfile, Message } from './types';
import { 
  initialUserProfile, 
  initialCourses, 
  initialBooks, 
  initialCalendarEvents, 
  initialChats, 
  initialGpaHistory 
} from './data';

// Components
import { DashboardView } from './components/DashboardView';
import { MyCoursesView } from './components/MyCoursesView';
import { CalendarView } from './components/CalendarView';
import { GradesView } from './components/GradesView';
import { MessagesView } from './components/MessagesView';
import { SettingsView } from './components/SettingsView';
import { ExploreCoursesView } from './components/ExploreCoursesView';
import { LibraryView } from './components/LibraryView';
import { FeedbackView } from './components/FeedbackView';
import { LoginView } from './components/LoginView';
import { CourseWorkspaceView } from './components/CourseWorkspaceView';
import logoBrainy from '../logo_brainy.jpeg';

// Icons
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Compass, 
  Calendar, 
  BarChart2, 
  MessageSquare, 
  Settings, 
  Menu, 
  X, 
  Bell, 
  Video, 
  User, 
  ShieldCheck, 
  Clock, 
  CheckCircle,
  HelpCircle,
  ChevronDown,
  LogOut
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Navigation & Svg Layout State
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Selected active course for the CourseWorkspaceView
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Collapsible multi-menu groups in sidebar
  const [learningMenuOpen, setLearningMenuOpen] = useState(true);
  const [libraryMenuOpen, setLibraryMenuOpen] = useState(true);
  const [feedbackMenuOpen, setFeedbackMenuOpen] = useState(true);

  // Core Central States
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  
  // Extra customizable states
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<any[]>([
    { id: 'f1', subject: 'Open Library textbook search is fast!', category: 'Portal UI/System', rating: 5, message: 'The new open-source book integration loads textbook references instantly. Extremely helpful!', date: 'May 22, 2026', status: 'Resolved' },
    { id: 'f2', subject: 'Need more seating options in North library wing', category: 'Campus Facilities', rating: 4, message: 'The study rooms are crowded after 2 PM. Please consider adding more workspace desk options.', date: 'May 23, 2026', status: 'Pending' }
  ]);
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);

  // Global activity logger for recent activities Feed
  const [activityLog, setActivityLog] = useState<any[]>([
    { id: 'act1', text: 'Prof. Sarah Jenkins posted a B+ on Neural Networks quiz 2', time: '10 min ago', course: 'Neural Networks 101', type: 'grade' },
    { id: 'act2', text: 'Alex Rivera posted: "Is anyone down for group study regarding NP-completeness?"', time: '2 hours ago', course: 'Advanced Algorithm Design', type: 'forum' }
  ]);

  // Virtual session conference dial state
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);

  // Notification dropdown state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationList, setNotificationList] = useState([
    { id: 'n1', text: 'New grade listed: AI-310 (88.5%)', unread: true, time: '10 min ago' },
    { id: 'n2', text: 'Prof. Sarah Jenkins recommended a book', unread: true, time: '1 hour ago' },
    { id: 'n3', text: 'Midterm Discrete Math exam coming soon', unread: false, time: '2 days ago' }
  ]);

  // Handlers for dynamic actions
  const handleNavigate = (tab: TabId) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleResumeCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setActiveTab('course-workspace');
      setIsMobileMenuOpen(false);
    }
  };

  const handleUpdateCourseProgress = (courseId: string, progress: number, completedCount: number) => {
    setCourses(courses.map(c => {
      if (c.id === courseId) {
        let grade = 'C';
        if (progress > 85) grade = 'A';
        else if (progress > 70) grade = 'B+';
        else if (progress > 45) grade = 'B';
        else if (progress > 20) grade = 'C+';
        
        const gradePercentage = Math.round(70 + (progress / 100) * 28);

        return {
          ...c,
          progress,
          completedLessons: completedCount,
          grade,
          gradePercentage,
          nextLesson: progress >= 100 ? "Course Completed!" : `Module ${completedCount + 1} Workspace Review`
        };
      }
      return c;
    }));
  };

  const handleAddActivity = (msg: string, course: string, type: 'grade' | 'forum') => {
    const newLog = {
      id: `act-${Date.now()}`,
      text: `${userProfile.name} posted: "${msg}"`,
      time: 'Just now',
      course,
      type
    };
    setActivityLog([newLog, ...activityLog]);
  };

  const handleSendMessage = (
    chatId: string, 
    text: string, 
    isFile = false, 
    fileName = '', 
    fileSize = ''
  ) => {
    const activeChat = chats.find(c => c.id === chatId);
    if (!activeChat) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderId: 'user',
      senderName: userProfile.name,
      senderAvatar: userProfile.avatarUrl,
      text: text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isSent: true,
      isFile,
      fileName,
      fileSize
    };

    const updatedChats = chats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          unreadCount: 0 // clear unread count as we are active inside chat 
        };
      }
      return c;
    });

    setChats(updatedChats);
  };

  const handleSimulateReply = (chatId: string, text: string) => {
    const activeChat = chats.find(c => c.id === chatId);
    if (!activeChat) return;

    const newReply: Message = {
      id: `reply-${Date.now()}`,
      senderId: 'other',
      senderName: activeChat.contactName,
      senderAvatar: activeChat.contactAvatar,
      text: text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isSent: false
    };

    const updatedChats = chats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [...c.messages, newReply],
          // if we are NOT viewing this chat currently, increment unread count
          unreadCount: activeTab !== 'messages' || selectedChatIdCopy(chatId) ? c.unreadCount + 1 : 0
        };
      }
      return c;
    });

    setChats(updatedChats);

    // Also send general browser notification simulation in our bell widget!
    const newNotif = {
      id: `notif-${Date.now()}`,
      text: `New DM from ${activeChat.contactName}`,
      unread: true,
      time: 'Just now'
    };
    setNotificationList([newNotif, ...notificationList]);
  };

  const selectedChatIdCopy = (id: string) => {
    // helper logic
    return false;
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  const handleAddNewBook = (title: string, author: string, coverType: 'math' | 'science' | 'art' | 'code' | 'general') => {
    // Map theme to hotlinked illustrations
    const coversMap = {
      code: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8d90BLUHFeKEIOIBxzwQr0ACfdKCTQKp_ncU6rADHx2uKFo4PE7eAYMpB_y1USug36qE8HBMe7HjJQTnapR5PXbQ6mPzGxaYJ1J8wHqlSRG2L3CTJm34yFbf4K4ldquSfKsBwKvFREqnJDeCH4zQixdl6bkaefixOedHDQLGSn3lrd09ApiTlk1WF_yFtTds7Yt0D7pATWStvQmp7TWYAuBZZHSZ8_LruoLG0Jhzc0WmuaO-xzCfebErQgzuX-myCYCXc-ayUaAuM',
      science: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCISfK_MZwXZoyB6jTz5D-ImlaTjcRt4sFhxbiXAXNn8yBSj3SaDQ6kv2GH3XUQWyzB6AFMXcgFE6Pij61uQNXddNEZTzu1gEUqCxoGBB5hxlWflbaZ9WBnxJFRj1aNEd3bc3jsdeksLQSTwCGk6Jbjmjc7OGTCuigA390b6_5bM4uD2C0Hp60paUMiijEG_LL7lk-2oG-MZ_zUavnkbzY7176tkzj7laRMv-EQHl7sqLhbh1Ssh6fCMgmJ_XlEMYYKovVJq_ge6zhM',
      art: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZKl6FT4PhHopWKs0gEFqQLrcW_NV6h9EizjeMDYIXIebtNk-8gqEMpK8F-6yzUV4ha4of7SIjbyFC-SHwOTPD7VATo5XsCnOX07GQ8uieAAywuF4UPy4qT7jSjAO3k7ORh3cAIcOCvdTQx6kCvIVfhZK0rDFsRbvGJaHozKYA3ak1tgRCSgHlPLddFfbKAKgtSfgWIbaAShLPrS18ovBXiGBIDbvq1pJyY6pV9qNuP26NYJrMuWr-v7HUq3A_m0IbWs5cqMH_1T9O',
      math: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZpWyS90ppm80O8BCPKJtgU5Pok3Fe_yyM7fgocGpkPKwzJKGRm9ZROKHWLZVFNeYRAGmvafgZChMxlRQOx_yuZdgc69WJDJzFqcBImeK94v8SlaRMN3jjA1JBX-KEaDNU72ak6-wksDQr6_fOfib1XJq_YlYmidQgUUNvzOD0CBJwnp0ZCnP_iosYQVNtK10203e4ofH2ZTmYKJG9GTI162ZQpBxNHa1j1zUnVpUkeQDmhGuk627aG_5yj53oaGxoPZ_3-0mhzFGl',
      general: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5SSx6n765uPJcOV3lpd0zW-ScgFpNxD9gMH1zqjbDO6KWQpu2v56fh3kRs63xdqdMdL5ccZHU6sEyVWP2N6RsWaVWzi81WtEPLJy4OLEiyMrM6TIX2BmAHI6-EdYNDPWdPvYFj6KsiiYPmGSLimzPiJh1yIBhJBX31zF3spGx0aXq9URwCVFHXMAAsRFl-5lDrZD0dscztyu1DJNEQuzxUuASkQNvaxkZdDKAzN6iP2Cwqe_oqLxoMUgIkon_1yJ6XdYqv-srAQvI'
    };

    const newBk: Book = {
      id: `b-${Date.now()}`,
      title,
      author,
      coverUrl: coversMap[coverType] || coversMap.general,
      isReserved: false,
      iconType: coverType
    };
    setBooks([...books, newBk]);
  };

  const handleAddFeedback = (subject: string, category: string = 'Opinion Hub', rating: number = 5, message: string = '', anonymous: boolean = false) => {
    const newTkt = {
      id: `t-${Date.now()}`,
      subject,
      category,
      rating,
      message,
      anonymous,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending'
    };
    setFeedbackSubmissions([newTkt, ...feedbackSubmissions]);
  };

  const handleAddCalendarEvent = (newEvent: Omit<CalendarEvent, 'id'>) => {
    const ev: CalendarEvent = {
      ...newEvent,
      id: `e-${Date.now()}`
    };
    setCalendarEvents([...calendarEvents, ev]);
    
    // Log dynamic activity is also great!
    const logVal = {
      id: `act-${Date.now()}`,
      text: `Added event: "${newEvent.title}" on ${newEvent.date}`,
      time: 'Just now',
      course: newEvent.courseName || 'Personal Calendar',
      type: 'forum'
    };
    setActivityLog([logVal, ...activityLog]);
  };

  const handleEnrollInCourse = (courseData: { title: string; code: string; instructor: string; description: string; banner: string }) => {
    const newC: Course = {
      id: `c-${Date.now()}`,
      title: courseData.title,
      code: courseData.code,
      instructor: courseData.instructor,
      progress: 0,
      lessonsCount: 20,
      completedLessons: 0,
      grade: 'N/A',
      gradePercentage: 0,
      description: courseData.description,
      nextLesson: 'Introductory Lecture Slides',
      icon: 'BookOpen',
      banner: courseData.banner
    };

    setCourses([...courses, newC]);
    
    // Log activity
    const activityMsg = {
      id: `act-${Date.now()}`,
      text: `Enrolled in new library elective: "${courseData.title}" [${courseData.code}]`,
      time: 'Just now',
      course: courseData.title,
      type: 'grade'
    };
    setActivityLog([activityMsg, ...activityLog]);
  };



  const unreadCount = chats.reduce((total, c) => total + c.unreadCount, 0);

  if (!isLoggedIn) {
    return <LoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div id="brainy_scholar_root" className="min-h-screen bg-surface flex flex-col lg:flex-row font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* SIDEBAR ON DESKTOP & FLIABLE DRAWER FOR MOBILE */}
      <aside 
        id="sidebar_pnl"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-outline-variant flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen shrink-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-outline-variant/50 shrink-0 relative flex flex-col items-center">
            <div className="flex flex-col items-center text-center py-2 select-none">
              <img 
                src={logoBrainy} 
                alt="Logo" 
                className="w-24 h-24 rounded-2xl border border-primary shrink-0 select-none transition-transform hover:scale-105 duration-300 object-cover shadow-xs"
              />
              <span className="text-[9px] text-warm-gray font-black tracking-widest uppercase mt-2.5">ACADEMIC PORTAL</span>
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant z-10"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items grouped into 3 distinctive collapsible menus */}
          <nav className="p-4 space-y-4 flex-1 overflow-y-auto select-none">
            
            {/* 1. LEARNING SPACE MENU */}
            <div className="space-y-1">
              <button 
                onClick={() => setLearningMenuOpen(!learningMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-black text-on-surface-variant/85 uppercase tracking-wider hover:bg-surface-container-low transition-all text-left font-sans"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                  <span>Learning Space</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-outline transition-transform duration-200 shrink-0 ${learningMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {learningMenuOpen && (
                <div className="space-y-1 pl-1.5 border-l border-outline-variant/50 ml-3.5 animate-fade-in">
                  <button 
                    onClick={() => handleNavigate('dashboard')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left
                      ${activeTab === 'dashboard' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-low'}
                    `}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                    <span>Dashboard Overview</span>
                  </button>

                  <button 
                    onClick={() => handleNavigate('courses')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left
                      ${activeTab === 'courses' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-low'}
                    `}
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>My Active Courses</span>
                  </button>

                  <button 
                    onClick={() => handleNavigate('calendar')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left
                      ${activeTab === 'calendar' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-low'}
                    `}
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Academic Calendar</span>
                  </button>

                  <button 
                    onClick={() => handleNavigate('grades')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left
                      ${activeTab === 'grades' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-low'}
                    `}
                  >
                    <BarChart2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Grades & GPA Summary</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. LIBRARY & RESOURCES MENU */}
            <div className="space-y-1">
              <button 
                onClick={() => setLibraryMenuOpen(!libraryMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-black text-on-surface-variant/85 uppercase tracking-wider hover:bg-surface-container-low transition-all text-left font-sans"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  <span>Library & Resources</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-outline transition-transform duration-200 shrink-0 ${libraryMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {libraryMenuOpen && (
                <div className="space-y-1 pl-1.5 border-l border-outline-variant/50 ml-3.5 animate-fade-in">
                  <button 
                    onClick={() => handleNavigate('library')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left
                      ${activeTab === 'library' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-low'}
                    `}
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>Virtual Library Search</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. INQUIRIES & FEEDBACKS MENU */}
            <div className="space-y-1">
              <button 
                onClick={() => setFeedbackMenuOpen(!feedbackMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-black text-on-surface-variant/85 uppercase tracking-wider hover:bg-surface-container-low transition-all text-left font-sans"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                  <span>Inquiries & Feedbacks</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-outline transition-transform duration-200 shrink-0 ${feedbackMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {feedbackMenuOpen && (
                <div className="space-y-1 pl-1.5 border-l border-outline-variant/50 ml-3.5 animate-fade-in">
                  <button 
                    onClick={() => handleNavigate('feedback')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left
                      ${activeTab === 'feedback' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-low'}
                    `}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>Provide Feedback</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Student Identity profile container in sidebar panel bottom */}
          <div 
            className="p-4 border-t border-outline-variant/50 flex items-center justify-between shrink-0 select-none bg-surface-container-low"
          >
            <div 
              onClick={() => handleNavigate('settings')}
              className={`flex items-center gap-3 min-w-0 cursor-pointer flex-1 p-2 rounded-lg transition-colors hover:bg-surface-container-high
                ${activeTab === 'settings' ? 'bg-primary/5 border-l-2 border-primary' : ''}
              `}
              title="Configure Portal Settings"
            >
              <div className="relative shrink-0">
                <img 
                  src={userProfile.avatarUrl} 
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full border border-outline-variant/80 object-cover"
                />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ring-2 ring-white rounded-full
                  ${userProfile.status === 'Learning Now' ? 'bg-secondary' : userProfile.status === 'Away' ? 'bg-amber-400' : 'bg-outline-variant'}
                `}></span>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-extrabold text-on-surface truncate leading-tight">{userProfile.name}</h4>
                <p className="text-[9px] text-on-surface-variant font-medium truncate leading-tight">{userProfile.major}</p>
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-primary inline-block mt-0.5 leading-none">
                  {userProfile.status}
                </span>
              </div>
            </div>

            <button 
              onClick={() => setIsLoggedIn(false)}
              className="p-2 hover:bg-error/10 hover:text-error text-on-surface-variant/80 rounded-lg transition-colors cursor-pointer ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

      {/* Overlay backdrop on mobile */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        ></div>
      )}

      {/* INDEPENDENT CANVAS CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-surface-low relative">
        
        {/* TOP LEVEL NAVIGATION CANVAS HEADER */}
        <header className="bg-white border-b border-outline-variant/50 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-surface-container rounded-lg text-on-surface-variant shrink-0"
              title="Toggle Menu Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 shrink-0 select-none">
            {/* Real-time date formatted output */}
            <span className="text-xs text-on-surface-variant font-bold hidden md:inline-block">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>

            {/* Notification Bell block */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant relative transition-colors"
                title="View Notifications Alert"
              >
                <Bell className="w-4 h-4" />
                {notificationList.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 bg-white border border-outline-variant w-72 rounded-xl p-4 shadow-xl z-50 text-on-surface space-y-3">
                  <div className="flex justify-between items-baseline border-b border-outline-variant/50 pb-2">
                    <h4 className="text-xs font-bold">Unread Notifications</h4>
                    <button 
                      onClick={() => setNotificationList(notificationList.map(n => ({ ...n, unread: false })))}
                      className="text-[10px] text-primary font-bold hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                    {notificationList.map((notif) => (
                      <div key={notif.id} className="text-xs leading-normal hover:bg-surface-container-low p-2 rounded-lg transition-colors cursor-pointer" onClick={() => setShowNotifications(false)}>
                        <p className={`${notif.unread ? 'font-bold' : 'text-on-surface-variant'}`}>{notif.text}</p>
                        <p className="text-[9px] text-outline italic mt-0.5">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PRIMARY SUBPANEL VIEW DISPLAY CONTAINER */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-16">
          
          {activeTab === 'dashboard' && (
            <DashboardView 
              userName={userProfile.name}
              major={userProfile.major}
              courses={courses}
              calendarEvents={calendarEvents}
              books={books}
              chats={chats}
              onNavigate={handleNavigate}
              onResumeCourse={handleResumeCourse}
              onJoinSession={() => setIsLiveSessionActive(true)}
              activityLog={activityLog}
              onAddActivity={handleAddActivity}
            />
          )}

          {activeTab === 'courses' && (
            <MyCoursesView 
              courses={courses}
              libraryBooks={books}
              onNavigate={handleNavigate}
              onResumeCourse={handleResumeCourse}
              currentUser={userProfile}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreCoursesView 
              onEnroll={handleEnrollInCourse}
              enrolledCourseCodes={courses.map(c => c.code)}
            />
          )}

          {activeTab === 'library' && (
            <LibraryView />
          )}

          {activeTab === 'calendar' && (
            <CalendarView 
              events={calendarEvents}
              onAddEvent={handleAddCalendarEvent}
            />
          )}

          {activeTab === 'grades' && (
            <GradesView 
              courses={courses}
              gpaHistory={initialGpaHistory}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesView 
              chats={chats}
              onSendMessage={handleSendMessage}
              onSimulateReply={handleSimulateReply}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackView currentUser={userProfile} courses={courses} />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              userProfile={userProfile}
              books={books}
              onSaveProfile={handleSaveProfile}
              onAddBook={handleAddNewBook}
              feedbackSubmissions={feedbackSubmissions}
              onAddFeedback={handleAddFeedback}
              isGoogleDriveConnected={isGoogleDriveConnected}
              onToggleGoogleDrive={() => setIsGoogleDriveConnected(!isGoogleDriveConnected)}
            />
          )}

          {activeTab === 'course-workspace' && selectedCourse && (
            <CourseWorkspaceView 
              course={courses.find(c => c.id === selectedCourse.id) || selectedCourse}
              onNavigate={handleNavigate}
              onUpdateCourseProgress={handleUpdateCourseProgress}
            />
          )}

        </main>

        {/* MODAL OVERLAY WRAPPERS: ACTIVE VIRTUAL CONFERENCE SESSION SCREEN */}
        {isLiveSessionActive && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 text-white w-full max-w-4xl rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row h-[550px] overflow-hidden">
              
              {/* Screen video canvas container */}
              <div className="flex-1 bg-slate-950 p-6 flex flex-col justify-between relative">
                
                {/* Header info */}
                <div className="absolute top-4 left-4 right-4 bg-black/40 p-3 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded-sm font-bold animate-pulse">LOBBY LIVE</span>
                    <h4 className="font-extrabold mt-0.5">CS-402 Bellman-Ford Recitation Class</h4>
                  </div>
                  <span className="text-slate-400 font-mono">Duration: 14:02 mins</span>
                </div>

                {/* Simulated Screen share graphics placeholder background layout */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-center space-y-3">
                    <GraduationCap className="w-16 h-16 text-primary mx-auto animate-bounce" />
                    <p className="text-base font-bold text-slate-100">Prof. Alan Turing Jr. is presenting</p>
                    <p className="text-xs text-slate-400 italic">"Simplifying NP-Completeness reduction formulas over network flows."</p>
                  </div>
                </div>

                {/* Control utility buttons bar */}
                <div className="flex justify-center gap-3">
                  <button onClick={() => alert("Simulating mic muted toggle")} className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-xs font-bold">
                    Mute Mic
                  </button>
                  <button onClick={() => alert("Simulating screen capture lock")} className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-xs font-bold">
                    Pause Video
                  </button>
                  <button 
                    onClick={() => setIsLiveSessionActive(false)}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg text-xs"
                  >
                    Leave Session
                  </button>
                </div>
              </div>

              {/* Sidebar list participants (Right side) */}
              <div className="w-full md:w-64 bg-slate-900 border-l border-slate-800 p-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Moderator & Students</h3>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                      <span className="font-bold">Prof. Alan Turing Jr. (Host)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                      <span>{userProfile.name} (You)</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                      <span>David Miller (TA)</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <p className="text-[10px] text-slate-400">
                    Use headgear to avoid audio feedback. Sync with your browser mic access.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
