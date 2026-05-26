import React, { useState } from 'react';
import { Course, GPAHistory } from '../types';
import { 
  Award,
  BookOpen,
  TrendingUp,
  Sliders,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';

interface GradesViewProps {
  courses: Course[];
  gpaHistory: GPAHistory[];
}

export function GradesView({
  courses,
  gpaHistory
}: GradesViewProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('c1');
  const [targetFilterSemester, setTargetFilterSemester] = useState('Spring 2024');

  // Slider inputs forgrade simulation
  const [simAssigScore, setSimAssigScore] = useState(90);
  const [simMidtermScore, setSimMidtermScore] = useState(85);
  const [simFinalScore, setSimFinalScore] = useState(95);
  const [simPartScore, setSimPartScore] = useState(100);

  // Selected Course
  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  // Specific course breakdown details (statically loaded per mock template/image coordinates)
  const getCourseBreakdown = (id: string) => {
    switch (id) {
      case 'c1': // Algorithm Design (94.2%)
        return {
          assignments: { weight: 40, score: 95 },
          midterm: { weight: 25, score: 92 },
          final: { weight: 30, score: 94 },
          participation: { weight: 5, score: 100 },
        };
      case 'c2': // Neural Networks 101 (88.5%)
        return {
          assignments: { weight: 30, score: 86 },
          midterm: { weight: 30, score: 85 },
          final: { weight: 30, score: 91 },
          participation: { weight: 10, score: 96 },
        };
      case 'c3': // Software Engineering (91.8%)
        return {
          assignments: { weight: 50, score: 92 },
          midterm: { weight: 20, score: 90 },
          final: { weight: 20, score: 92 },
          participation: { weight: 10, score: 95 },
        };
      default: // Cryptography standard (96.0%)
        return {
          assignments: { weight: 40, score: 98 },
          midterm: { weight: 25, score: 94 },
          final: { weight: 30, score: 95 },
          participation: { weight: 5, score: 100 },
        };
    }
  };

  const currentBreakdown = getCourseBreakdown(activeCourse.id);

  // Calculate simulated overall grade
  const simWeightedResult = (
    (simAssigScore * (currentBreakdown.assignments.weight / 100)) +
    (simMidtermScore * (currentBreakdown.midterm.weight / 100)) +
    (simFinalScore * (currentBreakdown.final.weight / 100)) +
    (simPartScore * (currentBreakdown.participation.weight / 100))
  ).toFixed(1);

  const getLetterFromPercentage = (pct: number) => {
    if (pct >= 93) return 'A';
    if (pct >= 90) return 'A-';
    if (pct >= 87) return 'B+';
    if (pct >= 83) return 'B';
    return 'B-';
  };

  const simulatedLetter = getLetterFromPercentage(parseFloat(simWeightedResult));

  // Handle Preset Reset
  const applyActualScoresPreset = () => {
    setSimAssigScore(currentBreakdown.assignments.score);
    setSimMidtermScore(currentBreakdown.midterm.score);
    setSimFinalScore(currentBreakdown.final.score);
    setSimPartScore(currentBreakdown.participation.score);
  };

  // Sync state when course changes
  React.useEffect(() => {
    applyActualScoresPreset();
  }, [selectedCourseId]);

  return (
    <div className="space-y-8 animate-fade-in text-on-surface">
      {/* View Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Academic Performance & Grades</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Analyze historical GPA trends, view current semester grade sheets, and simulate weights.
          </p>
        </div>

        <div className="flex bg-white border border-outline-variant p-1 rounded-lg shrink-0 text-xs font-semibold">
          <span className="bg-primary-container/10 text-primary px-3 py-1 rounded-sm">
            Cumulative GPA: 3.85
          </span>
          <span className="text-outline px-3 py-1">
            Rank #12 in Major
          </span>
        </div>
      </section>

      {/* Stats Summary Bento & Historical GPA Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Bento Cards */}
        <div className="space-y-4">
          
          <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Cumulative GPA</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-extrabold text-on-surface">3.85</h3>
                  <span className="text-xs text-secondary font-bold" title="Improved from last period">
                    +0.12 pts
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant italic mt-3">Calculated over 7 completed academic semesters.</p>
          </div>

          <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Class Standing & Honors</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-on-surface">Summa Cum Laude</h3>
                  <span className="text-xs text-outline italic">Rank #12</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant italic mt-3">Active Dean's list scholar status since Fall 2022.</p>
          </div>

          <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Program Milestones</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-on-surface">114 / 120</h3>
                  <span className="text-xs text-outline">Credits Completed</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant italic mt-3">Degree progress is 95% finalized.</p>
          </div>

        </div>

        {/* Right Side: Visual SVG Line Chart of GPA Trend (2 columns) */}
        <div className="lg:col-span-2 bg-white border border-outline-variant rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold">GPA Performance History</h3>
                <p className="text-xs text-on-surface-variant">Continuous GPA improvement across consecutive semesters</p>
              </div>
              <span className="text-xs bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-md">
                Trend: Upward
              </span>
            </div>

            {/* Custom SVG line graph render */}
            <div className="h-44 w-full mt-4 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                {/* Grid guidelines */}
                <line x1="50" y1="30" x2="480" y2="30" stroke="#FEF3D6" strokeWidth="1" strokeDasharray="3" />
                <line x1="50" y1="70" x2="480" y2="70" stroke="#FEF3D6" strokeWidth="1" strokeDasharray="3" />
                <line x1="50" y1="110" x2="480" y2="110" stroke="#FEF3D6" strokeWidth="1" strokeDasharray="3" />
                <line x1="50" y1="140" x2="480" y2="140" stroke="#FEF3D6" strokeWidth="1" />

                {/* Y-axis labels */}
                <text x="15" y="34" className="text-[10px] fill-outline font-semibold">4.0</text>
                <text x="15" y="74" className="text-[10px] fill-outline font-semibold">3.8</text>
                <text x="15" y="114" className="text-[10px] fill-outline font-semibold">3.6</text>
                <text x="15" y="144" className="text-[10px] fill-outline font-semibold font-mono">GPA</text>

                {/* X-axis labels coordinates */}
                {/* FA22: (80, 110), SP23: (200, 70), FA23: (320, 85), SP24: (440, 30) */}
                <text x="80" y="165" className="text-[10px] fill-on-surface-variant font-bold text-center">FA '22</text>
                <text x="200" y="165" className="text-[10px] fill-on-surface-variant font-bold text-center">SP '23</text>
                <text x="320" y="165" className="text-[10px] fill-on-surface-variant font-bold text-center">FA '23</text>
                <text x="440" y="165" className="text-[10px] fill-primary font-black text-center">SP '24</text>

                {/* Gradient Fill under Path */}
                <defs>
                  <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F6AC0D" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#F6AC0D" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 80 106 L 200 80 L 320 92 L 440 40 L 440 140 L 80 140 Z" 
                  fill="url(#gpaGradient)" 
                />

                {/* Line Path */}
                <path 
                  d="M 80 106 Q 140 93 200 80 T 320 92 Q 380 66 440 40" 
                  fill="none" 
                  stroke="#F6AC0D" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />

                {/* Plot Nodes (Circles) */}
                <circle cx="80" cy="106" r="5" fill="#ffffff" stroke="#F6AC0D" strokeWidth="3" />
                <circle cx="200" cy="80" r="5" fill="#ffffff" stroke="#F6AC0D" strokeWidth="3" />
                <circle cx="320" cy="92" r="5" fill="#ffffff" stroke="#F6AC0D" strokeWidth="3" />
                <circle cx="440" cy="40" r="6" fill="#F6AC0D" stroke="#ffffff" strokeWidth="2.5" />

                {/* Popup scores indicators */}
                <text x="70" y="93" className="text-[9px] fill-on-surface-variant font-bold">3.65</text>
                <text x="190" y="67" className="text-[9px] fill-on-surface-variant font-bold">3.78</text>
                <text x="310" y="79" className="text-[9px] fill-on-surface-variant font-bold">3.72</text>
                <text x="430" y="25" className="text-[10px] fill-primary font-black">3.94</text>
              </svg>
            </div>
          </div>
          
          <div className="flex gap-4 items-center bg-surface-container-low p-2 rounded-lg mt-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-[11px] text-on-surface-variant font-medium">
              Dean's Honorable Distinction is maintained above <span className="font-bold">3.75 GPA</span>.
            </p>
          </div>
        </div>

      </div>

      {/* Course Grade Cards and Simulator Controls */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left List of current Courses (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Selected Term: Spring 2024</h3>
            <span className="text-xs text-outline italic">4 Subjects total</span>
          </div>

          <div className="space-y-3">
            {courses.map((course) => {
              const isActive = course.id === selectedCourseId;
              
              return (
                <div 
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group
                    ${isActive ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-white border-outline-variant hover:border-primary/40'}
                  `}
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-[10px] text-outline font-bold tracking-wider font-mono">{course.code}</p>
                    <h4 className={`text-sm font-bold truncate mt-0.5 ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                      {course.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant truncate italic mt-0.5">{course.instructor}</p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className={`text-base font-black px-2.5 py-1 rounded-md ml-3 inline-block 
                      ${isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}
                    `}>
                      {course.grade}
                    </span>
                    <p className="text-xs font-semibold text-on-surface-variant mt-1">{course.gradePercentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Dynamic Category Weights Simulator (7 columns) */}
        <div className="lg:col-span-7 bg-white border border-outline-variant rounded-xl p-6 shadow-xs space-y-6">
          
          <div className="flex justify-between items-start border-b border-outline-variant/60 pb-3">
            <div>
              <p className="text-[10px] text-outline font-bold uppercase tracking-widest font-mono">WEIGHTS ANALYSIS • {activeCourse.code}</p>
              <h3 className="text-base font-bold text-primary mt-0.5">{activeCourse.title}</h3>
            </div>
            
            <button 
              onClick={applyActualScoresPreset}
              className="text-xs text-primary font-bold hover:underline"
            >
              Reset to Actual Scores
            </button>
          </div>

          {/* Silder Controls */}
          <div className="space-y-4">
            
            {/* Assignments Category Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-on-surface font-semibold">
                  Assignments <span className="text-outline font-normal">({currentBreakdown.assignments.weight}%)</span>
                </span>
                <span className="font-bold text-on-surface-variant">
                  {simAssigScore} / 100 <span className="text-outline font-normal"> (Actual: {currentBreakdown.assignments.score})</span>
                </span>
              </div>
              <input 
                type="range"
                min="50"
                max="100"
                value={simAssigScore}
                onChange={(e) => setSimAssigScore(parseInt(e.target.value))}
                className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Midterm Category Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-on-surface font-semibold">
                  Midterm Exam <span className="text-outline font-normal">({currentBreakdown.midterm.weight}%)</span>
                </span>
                <span className="font-bold text-on-surface-variant">
                  {simMidtermScore} / 100 <span className="text-outline font-normal"> (Actual: {currentBreakdown.midterm.score})</span>
                </span>
              </div>
              <input 
                type="range"
                min="50"
                max="100"
                value={simMidtermScore}
                onChange={(e) => setSimMidtermScore(parseInt(e.target.value))}
                className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Final Exam Category Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-on-surface font-semibold">
                  Final Exam <span className="text-outline font-normal">({currentBreakdown.final.weight}%)</span>
                </span>
                <span className="font-bold text-on-surface-variant">
                  {simFinalScore} / 100 <span className="text-outline font-normal"> (Actual: {currentBreakdown.final.score})</span>
                </span>
              </div>
              <input 
                type="range"
                min="50"
                max="100"
                value={simFinalScore}
                onChange={(e) => setSimFinalScore(parseInt(e.target.value))}
                className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Participation Category Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-on-surface font-semibold">
                  Syllabus & Participation <span className="text-outline font-normal">({currentBreakdown.participation.weight}%)</span>
                </span>
                <span className="font-bold text-on-surface-variant">
                  {simPartScore} / 100 <span className="text-outline font-normal"> (Actual: {currentBreakdown.participation.score})</span>
                </span>
              </div>
              <input 
                type="range"
                min="50"
                max="100"
                value={simPartScore}
                onChange={(e) => setSimPartScore(parseInt(e.target.value))}
                className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

          </div>

          {/* Simulation Output Card Info Box */}
          <div className="p-4 bg-surface-container rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex gap-2.5 items-center">
              <Sliders className="w-5 h-5 text-primary shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-on-surface">Weighted Grade Simulation</h4>
                <p className="text-[10px] text-outline mt-0.5">Drag targets to test hypothetical GPA scores</p>
              </div>
            </div>

            <div className="text-right flex items-center gap-3">
              <div>
                <p className="text-[11px] text-on-surface-variant font-bold">Simulated Score</p>
                <p className="text-lg font-black text-primary font-mono">{simWeightedResult}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary text-on-primary flex items-center justify-center font-black text-xl">
                {simulatedLetter}
              </div>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
