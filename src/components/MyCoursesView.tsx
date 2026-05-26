import React, { useState } from 'react';
import { Course, Book } from '../types';
import { 
  Filter, 
  Search, 
  Bookmark, 
  MoreVertical, 
  User, 
  ArrowRight, 
  School,
  Plus,
  BookOpen,
  RefreshCw,
  Check,
  AlertCircle,
  Database,
  Key
} from 'lucide-react';

interface MyCoursesViewProps {
  courses: Course[];
  libraryBooks: Book[];
  onNavigate: (tab: any) => void;
  onResumeCourse: (courseId: string) => void;
  onSyncMoodleCourses?: (newCourses: Course[]) => void;
}

export function MyCoursesView({
  courses,
  libraryBooks,
  onNavigate,
  onResumeCourse,
  onSyncMoodleCourses
}: MyCoursesViewProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'inprogress'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedList, setBookmarkedList] = useState<string[]>(['c1']);

  // Moodle REST API Sync States
  const [showMoodlePanel, setShowMoodlePanel] = useState(false);
  const [moodleUrl, setMoodleUrl] = useState('https://brainy.moodlecloud.com/');
  const [moodleToken, setMoodleToken] = useState('0872cddfbc41e4829151afab58383146');
  const [courseFilter, setCourseFilter] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [connectionType, setConnectionType] = useState<'none' | 'sandbox' | 'live'>('none');

  const handleMoodleSync = async (useSandbox: boolean) => {
    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncMessage('Authenticating with Moodle Web Services REST endpoint...');
    
    // Professional Multi-stage logs simulation
    setTimeout(() => {
      setSyncMessage('Resolving token credentials & course timelines from moodlewsrestformat...');
    }, 600);

    try {
      setTimeout(async () => {
        const response = await fetch('/api/moodle/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moodleUrl: useSandbox ? '' : moodleUrl,
            token: useSandbox ? '' : moodleToken,
            useSandbox
          })
        });

        const data = await response.json();
        setIsSyncing(false);

        if (data.success) {
          let synchronizedCourses = data.courses || [];
          let filterAppliedMessage = data.message;

          if (courseFilter.trim()) {
            const filterLower = courseFilter.toLowerCase().trim();
            synchronizedCourses = synchronizedCourses.filter((c: any) => {
              const matchesTitle = c.title.toLowerCase().includes(filterLower);
              const matchesDesc = c.description.toLowerCase().includes(filterLower);
              const matchesCode = c.code.toLowerCase().includes(filterLower);
              
              // Intelligent synonyms/alias matching for common "IT" search queries
              const isItQuery = filterLower === 'it' || filterLower === 'information technology' || filterLower === 'tech';
              const matchesItKeywords = isItQuery && (
                c.title.toLowerCase().includes('learning') || 
                c.title.toLowerCase().includes('networks') || 
                c.title.toLowerCase().includes('database') || 
                c.code.toLowerCase().includes('cs')
              );

              return matchesTitle || matchesDesc || matchesCode || matchesItKeywords;
            });
            
            filterAppliedMessage = `Synchronized ${data.courses.length} courses from Moodle. Applied topic filter: "${courseFilter}" (${synchronizedCourses.length} matches found).`;
          }

          setSyncStatus('success');
          setSyncMessage(filterAppliedMessage);
          setConnectionType(useSandbox ? 'sandbox' : 'live');
          if (onSyncMoodleCourses) {
            onSyncMoodleCourses(synchronizedCourses);
          }
        } else {
          setSyncStatus('error');
          setSyncMessage('Moodle Connection failed: ' + (data.details || 'Unknown error'));
        }
      }, 1300);

    } catch (err: any) {
      setIsSyncing(false);
      setSyncStatus('error');
      setSyncMessage('Moodle REST service is offline or unreachable locally.');
    }
  };

  // Trigger automatic Moodle API synchronization on mount
  React.useEffect(() => {
    if (connectionType === 'none' && !isSyncing) {
      handleMoodleSync(false); // Automatically sync Moodle Cloud on load!
    }
  }, []);

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarkedList.includes(id)) {
      setBookmarkedList(bookmarkedList.filter(item => item !== id));
    } else {
      setBookmarkedList([...bookmarkedList, id]);
    }
  };

  // Basic Filter based on activeTab
  const filteredCourses = courses.filter(course => {
    // Search query matching
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'inprogress') {
      return course.progress > 0 && course.progress < 90;
    } else if (activeTab === 'past') {
      return course.progress >= 90;
    }
    // 'current' default
    return true;
  });

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header with filters */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">My Courses</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            You have <span className="text-primary font-bold font-semibold">{courses.length} active courses</span> this semester. Keep up the great work!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tabs switch */}
          <div className="bg-surface-container-high p-1 rounded-lg flex gap-1">
            <button 
              onClick={() => setActiveTab('current')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'current' ? 'bg-white shadow-xs text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
            >
              Current
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'past' ? 'bg-white shadow-xs text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
            >
              Past
            </button>
            <button 
              onClick={() => setActiveTab('inprogress')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'inprogress' ? 'bg-white shadow-xs text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
            >
              In-Progress
            </button>
          </div>

          {/* Search bar helper */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Filter course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-outline-variant rounded-md px-3 py-1.5 pl-8 text-xs focus:ring-2 focus:ring-primary/20 outline-hidden w-40 md:w-48 text-on-surface"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-outline" />
          </div>

          <button className="flex items-center gap-1.5 px-4 py-1.5 border border-outline-variant rounded-lg text-xs font-medium bg-white text-on-surface hover:bg-surface-container-low transition-all">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>Filter</span>
          </button>
        </div>
      </section>

      {/* MOODLE REST API CONNECTION CENTER */}
      <section className="bg-white border border-outline-variant/60 rounded-xl overflow-hidden shadow-xs hover:border-primary/45 transition-all">
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 relative">
              <Database className="w-6 h-6" />
              {connectionType !== 'none' && (
                <span className="absolute top-[-2px] right-[-2px] w-3 h-3 bg-secondary rounded-full border-2 border-white animate-pulse"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-on-surface text-base">Moodle LMS REST Integration</h3>
                {connectionType === 'none' && (
                  <span className="bg-outline-variant/50 text-outline text-[9px] px-2 py-0.5 rounded-full font-bold">
                    Disconnected
                  </span>
                )}
                {connectionType === 'sandbox' && (
                  <span className="bg-secondary/15 text-secondary text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Connected: Demo Sandbox
                  </span>
                )}
                {connectionType === 'live' && (
                  <span className="bg-primary/20 text-on-primary-container text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Connected: Live LMS
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed font-medium">
                Synchronize your course modules, assignments, and grades directly from your Moodle server via Moodle Web Services API.
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setShowMoodlePanel(!showMoodlePanel)}
            className="w-full sm:w-auto px-4 py-2 border border-outline-variant hover:border-primary/50 text-on-surface-variant font-bold rounded-lg text-xs hover:bg-surface-container transition-all text-center shrink-0 cursor-pointer"
          >
            {showMoodlePanel ? 'Hide Settings' : 'Configure Moodle API'}
          </button>
        </div>

        {/* Collapsible Config Details */}
        {showMoodlePanel && (
          <div className="border-t border-outline-variant/40 bg-surface-container-low/30 p-6 space-y-6 relative overflow-hidden animate-fade-in">
            {isSyncing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-20 flex flex-col items-center justify-center text-center p-4">
                <RefreshCw className="w-9 h-9 text-primary animate-spin mb-3" />
                <p className="text-sm font-extrabold text-charcoal">{syncMessage}</p>
                <p className="text-[10px] text-outline mt-1 font-medium italic">Standard Moodle wstoken handshake in progress...</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* URL Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-charcoal uppercase tracking-wider block flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-primary" /> Moodle Host URL
                </label>
                <input
                  type="url"
                  placeholder="https://moodle.your-school.edu"
                  value={moodleUrl}
                  onChange={(e) => setMoodleUrl(e.target.value)}
                  disabled={isSyncing}
                  className="block w-full bg-white border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg py-2.5 px-3.5 text-xs font-semibold placeholder:text-outline/70 outline-hidden transition-all text-on-surface"
                />
              </div>

              {/* Token Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-charcoal uppercase tracking-wider block flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-primary" /> Access Token (wstoken)
                </label>
                <input
                  type="password"
                  placeholder="Paste wstoken here (e.g. 8fc3...)"
                  value={moodleToken}
                  onChange={(e) => setMoodleToken(e.target.value)}
                  disabled={isSyncing}
                  className="block w-full bg-white border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg py-2.5 px-3.5 text-xs font-semibold placeholder:text-outline/70 outline-hidden transition-all text-on-surface"
                />
              </div>

              {/* Filter Topic Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-charcoal uppercase tracking-wider block flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-primary" /> Course Topic Filter
                </label>
                <input
                  type="text"
                  placeholder="e.g. IT, CS, Deep Learning"
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  disabled={isSyncing}
                  className="block w-full bg-white border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg py-2.5 px-3.5 text-xs font-semibold placeholder:text-outline/70 outline-hidden transition-all text-on-surface"
                />
              </div>
            </div>

            {/* Response Alerts */}
            {syncStatus !== 'idle' && (
              <div className={`p-4 rounded-xl border flex gap-3 text-xs ${syncStatus === 'success' ? 'bg-primary-container/10 border-primary/20 text-on-primary-container' : 'bg-error-container/20 border-error/20 text-on-error-container'}`}>
                {syncStatus === 'success' ? (
                  <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-extrabold">{syncStatus === 'success' ? 'Synchronized!' : 'Connection Warning'}</h4>
                  <p className="mt-0.5 leading-relaxed font-semibold">{syncMessage}</p>
                </div>
              </div>
            )}

            {/* Instruction Notice Box */}
            <div className="bg-surface-container-high/40 border border-outline-variant/65 p-4 rounded-xl text-[11px] space-y-2 text-on-surface-variant font-medium">
              <span className="text-[10px] font-black uppercase text-secondary tracking-wider block">How to enable Moodle Web Services API:</span>
              <ul className="list-decimal pl-4 space-y-1.5">
                <li>Log into Moodle with admin access and go to <strong>Site Administration &gt; Advanced features &gt; Enable Web Services</strong>.</li>
                <li>Go to <strong>Plugins &gt; Web services &gt; Manage protocols</strong> and enable <strong>REST protocol</strong>.</li>
                <li>Go to <strong>Manage tokens</strong>, click <strong>Add</strong>, select your user and standard course service, then copy the generated <code>wstoken</code> and paste it here!</li>
              </ul>
            </div>

            {/* Sync Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => handleMoodleSync(true)}
                disabled={isSyncing}
                className="py-2.5 px-5 bg-primary text-on-primary font-extrabold rounded-xl shadow-xs hover:bg-gold-dark hover:shadow-md transition-all text-xs cursor-pointer text-center"
              >
                Connect Demo Sandbox
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!moodleUrl || !moodleToken) {
                    setSyncStatus('error');
                    setSyncMessage('Please provide your Moodle base URL and Access Token for live synchronization.');
                    return;
                  }
                  handleMoodleSync(false);
                }}
                disabled={isSyncing}
                className="py-2.5 px-5 border border-outline-variant text-on-surface-variant hover:border-primary/55 font-extrabold rounded-xl hover:bg-surface-container-high transition-all text-xs cursor-pointer text-center bg-white"
              >
                Sync Live Moodle Instance
              </button>
            </div>

          </div>
        )}
      </section>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, idx) => {
          // Render the first one taking 2 columns to represent the "Featured" large card
          const isFeatured = idx === 0 && activeTab === 'current' && searchQuery === '';

          if (isFeatured) {
            return (
              <article 
                key={course.id}
                className="bg-white rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-all group overflow-hidden md:col-span-2 flex flex-col md:flex-row"
              >
                <div className="w-full md:w-1/2 h-48 md:h-auto min-h-[220px] relative overflow-hidden shrink-0">
                  <img 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    src={course.banner}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5">
                    <span className="bg-primary text-on-primary px-3 py-1 rounded-sm text-[10px] uppercase tracking-wider font-bold">
                      Most Active
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                        {course.title}
                      </h2>
                      <button className="text-outline hover:text-primary p-0.5">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center">
                        <User className="w-3 h-3 text-on-secondary-container" />
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium">{course.instructor}</span>
                      <span className="text-xs text-outline">• {course.code}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-on-surface-variant font-medium">Course Progress</span>
                        <span className="text-xs font-bold text-primary">{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary-fixed/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded-full transition-all duration-1000"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button 
                        onClick={() => onResumeCourse(course.id)}
                        className="flex-1 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/95 transition-all active:scale-95"
                      >
                        Resume Learning
                      </button>
                      <button 
                        onClick={(e) => handleToggleBookmark(course.id, e)}
                        className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors shrink-0"
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarkedList.includes(course.id) ? 'fill-primary text-primary' : 'text-primary'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          }

          // Normal Course cards
          return (
            <article 
              key={course.id}
              className="bg-white rounded-xl border border-outline-variant shadow-xs hover:shadow-md transition-all group p-5 flex flex-col justify-between"
            >
              <div>
                <div className="h-32 w-full bg-surface-container rounded-lg mb-4 overflow-hidden border border-outline-variant shrink-0">
                  <img 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={course.banner}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant">{course.instructor} • <span className="text-outline font-mono text-[10px]">{course.code}</span></p>
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-on-surface-variant font-medium">{course.progress}% Complete</span>
                    <span className="text-xs text-outline">{course.completedLessons}/{course.lessonsCount} Lessons</span>
                  </div>
                  <div className="h-2 w-full bg-secondary-fixed/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onResumeCourse(course.id)}
                    className="flex-1 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-bold transition-all"
                  >
                    Resume
                  </button>
                  <button 
                    onClick={(e) => handleToggleBookmark(course.id, e)}
                    className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high text-outline hover:text-primary transition-colors"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarkedList.includes(course.id) ? 'fill-primary text-primary' : 'text-primary'}`} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {/* Explore More Dashed Box */}
        <article 
          onClick={() => onNavigate('explore')}
          className="rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-8 text-center hover:bg-surface-container-low transition-all cursor-pointer group min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-115 transition-transform">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-on-surface mb-1">Explore More Courses</h3>
          <p className="text-xs text-on-surface-variant max-w-[200px] mb-4">Discover new subjects and expand your academic horizons.</p>
          <button className="px-4 py-1.5 bg-surface-container-high text-primary font-bold rounded-lg hover:bg-primary/10 text-xs transition-all">
            Enroll Now
          </button>
        </article>
      </div>    </div>
  );
}
