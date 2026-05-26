import React, { useState } from 'react';
import { Course, Book, UserProfile } from '../types';
import { 
  Search, 
  Bookmark, 
  MoreVertical, 
  User, 
  ArrowRight, 
  School,
  Plus,
  BookOpen,
  MessageSquare,
  Star,
  CheckCircle2,
  X
} from 'lucide-react';

interface MyCoursesViewProps {
  courses: Course[];
  libraryBooks: Book[];
  onNavigate: (tab: any) => void;
  onResumeCourse: (courseId: string) => void;
  currentUser?: UserProfile;
}

export function MyCoursesView({
  courses,
  libraryBooks,
  onNavigate,
  onResumeCourse,
  currentUser
}: MyCoursesViewProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'inprogress'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedList, setBookmarkedList] = useState<string[]>(['c1']);

  // Course Feedback Modal States
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedCourseForFeedback, setSelectedCourseForFeedback] = useState<Course | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackClassification, setFeedbackClassification] = useState<'Problem' | 'Suggestion' | 'User Experience'>('Suggestion');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setFeedbackError('Please enter some detailed feedback.');
      return;
    }
    setFeedbackError('');

    // Read existing feedbacks from localStorage
    const saved = localStorage.getItem("rtb_lms_feedbacks");
    let currentFeedbacks = [];
    if (saved) {
      try {
        currentFeedbacks = JSON.parse(saved);
      } catch (err) {
        // Fallback
      }
    }

    const calculatedSeverity = feedbackClassification === "Problem" ? "Critical" : feedbackClassification === "Suggestion" ? "Medium" : "Low";

    const newFeedback = {
      id: `fb-${Date.now()}`,
      title: `Feedback on ${selectedCourseForFeedback?.title}`,
      description: feedbackText.trim(),
      userType: "Trainee",
      classification: feedbackClassification,
      severity: calculatedSeverity,
      votes: 1,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      courseName: selectedCourseForFeedback?.title,
      userName: currentUser?.name || "Alex Rivera",
      userAvatar: currentUser?.avatarUrl || ""
    };

    localStorage.setItem("rtb_lms_feedbacks", JSON.stringify([newFeedback, ...currentFeedbacks]));
    
    setFeedbackSubmitted(true);
    setFeedbackText('');
    setFeedbackRating(5);
    setFeedbackClassification('Suggestion');

    setTimeout(() => {
      setFeedbackSubmitted(false);
      setShowFeedbackModal(false);
      setSelectedCourseForFeedback(null);
    }, 2000);
  };



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
        </div>
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
                        onClick={() => {
                          setSelectedCourseForFeedback(course);
                          setShowFeedbackModal(true);
                        }}
                        className="py-2 px-3 border border-outline-variant hover:border-primary/50 text-on-surface-variant font-bold rounded-lg text-xs hover:bg-surface-container transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        title="Provide Course Feedback"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        <span className="hidden sm:inline">Feedback</span>
                      </button>
                      <button 
                        onClick={(e) => handleToggleBookmark(course.id, e)}
                        className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors shrink-0 cursor-pointer"
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
                    className="flex-1 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourseForFeedback(course);
                      setShowFeedbackModal(true);
                    }}
                    className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high text-outline hover:text-primary transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    title="Provide Course Feedback"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => handleToggleBookmark(course.id, e)}
                    className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high text-outline hover:text-primary transition-colors shrink-0 cursor-pointer"
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
      </div>
      
      {/* DIRECT COURSE FEEDBACK MODAL */}
      {showFeedbackModal && selectedCourseForFeedback && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-white border-2 border-primary/20 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative animate-scale-up text-on-surface">
            {/* Header */}
            <div className="bg-surface-container-high/60 px-6 py-4 flex justify-between items-center border-b border-outline-variant/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-base">Provide Course Feedback</h3>
              </div>
              <button 
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedCourseForFeedback(null);
                  setFeedbackError('');
                }}
                className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-md hover:bg-surface-container cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Success Overlay */}
            {feedbackSubmitted && (
              <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 border border-primary/20">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="text-lg font-black text-on-surface">
                  Course Feedback Submitted!
                </h3>
                <p className="text-xs text-on-surface-variant mt-2 max-w-sm leading-relaxed font-medium">
                  Your feedback on <strong>{selectedCourseForFeedback.title}</strong> has been logged to the central student voice board. Thank you for co-creating with us!
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-5">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-black uppercase text-primary tracking-wider block">Course Details</span>
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/40">
                  <h4 className="text-xs font-black text-on-surface leading-tight">{selectedCourseForFeedback.title}</h4>
                  <p className="text-[10px] text-on-surface-variant mt-1 font-semibold">{selectedCourseForFeedback.code} • {selectedCourseForFeedback.instructor}</p>
                </div>
              </div>

              {feedbackError && (
                <div className="bg-error-container/20 border border-error/20 text-on-error-container text-xs rounded-xl p-3 font-bold flex items-center gap-2">
                  <span className="shrink-0 font-bold">⚠️</span>
                  <span>{feedbackError}</span>
                </div>
              )}

              {/* Rating Star Selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-primary tracking-wider block">Course Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-115 transition-transform cursor-pointer"
                    >
                      <Star 
                        className={`w-7 h-7 transition-all ${
                          feedbackRating >= star ? 'fill-primary text-primary' : 'text-outline-variant hover:text-primary/70'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-on-surface-variant ml-2">({feedbackRating} / 5 Stars)</span>
                </div>
              </div>

              {/* Classification category */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-primary tracking-wider block">Feedback Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Problem", "Suggestion", "User Experience"] as const).map((cat) => {
                    const isSelected = feedbackClassification === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFeedbackClassification(cat)}
                        className={`py-2 px-1.5 border rounded-xl text-[10px] font-black text-center transition-all cursor-pointer select-none relative
                          ${
                            isSelected
                              ? "bg-primary text-on-primary border-primary shadow-xs"
                              : "bg-white border-outline-variant/65 text-on-surface-variant hover:bg-surface-container-low"
                          }`}
                      >
                        <span>{cat}</span>
                        {isSelected && (
                          <div className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-on-primary rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed observation textarea */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase text-primary tracking-wider block">Detailed Comments</label>
                <textarea
                  rows={4}
                  maxLength={500}
                  placeholder={`Share what you liked or what could be improved about ${selectedCourseForFeedback.title}...`}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl text-xs px-3 py-2 outline-hidden font-semibold text-on-surface placeholder:text-outline leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2 border-t border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedCourseForFeedback(null);
                    setFeedbackError('');
                  }}
                  className="py-2.5 px-4 border border-outline-variant hover:bg-surface-container rounded-xl text-xs font-extrabold text-on-surface-variant transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-primary hover:bg-primary/95 text-on-primary font-extrabold rounded-xl shadow-xs hover:shadow-md transition-all text-xs cursor-pointer"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
