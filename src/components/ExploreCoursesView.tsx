import React, { useState } from 'react';
import { Course } from '../types';
import { 
  Search, 
  Map, 
  BookOpen, 
  Star, 
  Sparkles, 
  CheckCircle, 
  Bookmark, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { exploreCourses } from '../data';

interface ExploreCoursesViewProps {
  onEnroll: (courseData: { title: string; code: string; instructor: string; description: string; banner: string }) => void;
  enrolledCourseCodes: string[];
}

export function ExploreCoursesView({
  onEnroll,
  enrolledCourseCodes
}: ExploreCoursesViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollToast, setEnrollToast] = useState<string | null>(null);

  const categories = ['All', 'Computer Science', 'Physics', 'Arts & Design'];

  const filteredExplore = exploreCourses.filter(course => {
    // category filter
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    
    // search query
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleEnrollClick = (course: typeof exploreCourses[0]) => {
    // Create random course code
    const codesMap: Record<string, string> = {
      'exp1': 'PH-410',
      'exp2': 'CS-480',
      'exp3': 'AR-190'
    };
    const code = codesMap[course.id] || 'CS-999';

    onEnroll({
      title: course.title,
      code: code,
      instructor: course.instructor,
      description: course.description,
      banner: course.banner
    });

    setEnrollToast(course.title);
    setTimeout(() => setEnrollToast(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-on-surface">
      
      {/* Search Header and Categories */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface flex items-center gap-2">
            <Compass className="w-8 h-8 text-primary" />
            Explore New Subjects
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Browse graduate and undergraduate syllabi, discover electives, and instantly enroll.
          </p>
        </div>

        {/* Input & categories */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:w-60">
            <input 
              type="text"
              placeholder="Search library catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-outline-variant focus:ring-2 focus:ring-primary/25 rounded-lg text-xs pl-8 pr-3 py-2 outline-hidden text-on-surface font-medium"
            />
            <Search className="w-4 h-4 text-outline absolute left-2.5 top-2.5" />
          </div>

          <div className="bg-surface-container-high p-1 rounded-lg flex gap-1">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeCategory === cat ? 'bg-white shadow-xs text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
              >
                {cat.split(' ')[0]} 
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Upgrade Promotion Banner */}
      <section className="bg-linear-to-r from-primary-container/10 via-primary-container/5 to-transparent border border-outline-variant p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div className="space-y-1">
          <span className="bg-primary/15 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-primary" />
            Scholar Premium Upgrade
          </span>
          <h3 className="text-base font-extrabold text-on-surface">Unlock Graduate Level Courses & 1-on-1 TA hours</h3>
          <p className="text-xs text-on-surface-variant italic">Instant access to certified courses, private discord, and backup sync options.</p>
        </div>
        <button 
          onClick={() => alert("Simulating premium upgrade checkout sheet initialization...")}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-primary-container transition-all shadow-xs hover:shadow-md shrink-0 active:scale-95"
        >
          Upgrade For $19/mo
        </button>
      </section>

      {/* Enroll Confirmation Banner Toast */}
      {enrollToast && (
        <div className="bg-secondary-container/15 border border-secondary text-secondary p-4 rounded-xl flex items-center justify-between animate-slide-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
            <p className="text-xs font-bold">
              Enrolled successfully in <span className="underline italic">"{enrollToast}"</span>! Check the "My Courses" tab to study.
            </p>
          </div>
          <span className="text-[10px] font-semibold text-outline">Academic record updated</span>
        </div>
      )}

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExplore.map((course) => {
          // Check if already enrolled
          const codesMap: Record<string, string> = {
            'exp1': 'PH-410',
            'exp2': 'CS-480',
            'exp3': 'AR-190'
          };
          const courseCode = codesMap[course.id] || 'CS-999';
          const isEnrolled = enrolledCourseCodes.includes(courseCode);

          return (
            <article 
              key={course.id}
              className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all group p-5 flex flex-col justify-between"
            >
              <div>
                <div className="h-40 w-full rounded-lg bg-surface-container overflow-hidden border border-outline-variant mb-4 relative">
                  <img 
                    src={course.banner} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  {course.bestseller && (
                    <span className="absolute top-3 left-3 bg-secondary text-on-secondary px-2.5 py-0.5 rounded-sm text-[9px] uppercase tracking-wider font-extrabold shadow-sm">
                      Bestseller
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs text-primary font-bold">{course.category} • {course.duration}</span>
                    <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {course.rating}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-extrabold text-on-surface mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant italic leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-outline-variant/50 flex justify-between items-center">
                <div className="min-w-0 pr-3">
                  <p className="text-[9px] text-outline font-bold uppercase">INSTRUCTOR</p>
                  <p className="text-xs font-bold text-on-surface truncate">{course.instructor}</p>
                </div>
                
                {isEnrolled ? (
                  <span className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Enrolled
                  </span>
                ) : (
                  <button 
                    onClick={() => handleEnrollClick(course)}
                    className="flex items-center gap-1 shrink-0 px-4 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-on-primary transition-all active:scale-95"
                  >
                    <span>Enroll Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
}
