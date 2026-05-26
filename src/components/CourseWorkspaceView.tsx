import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  FileText, 
  Save, 
  Edit3,
  Check,
  ChevronRight,
  Database
} from 'lucide-react';

interface CourseWorkspaceViewProps {
  course: Course;
  onNavigate: (tab: any) => void;
  onUpdateCourseProgress: (courseId: string, progress: number, completedCount: number) => void;
}

interface SyllabusTopic {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  content: string;
  slides: string[];
}

export function CourseWorkspaceView({
  course,
  onNavigate,
  onUpdateCourseProgress
}: CourseWorkspaceViewProps) {
  // Pre-populated real syllabus data based on course code
  const isMlCourse = course.code.includes('504') || course.title.toLowerCase().includes('machine');
  
  const initialTopics: SyllabusTopic[] = isMlCourse ? [
    {
      id: 'topic-1',
      title: 'Module 1: Introduction to Gradient Descents & Neural Networks',
      duration: '45 mins',
      completed: true,
      content: 'In this module, we explore the mathematical foundations of gradient descent optimization, cost functions, learning rate schedules, and the basic forward propagation in deep multilayer perceptrons.',
      slides: [
        'Slide 1: Optimization focuses on minimizing the loss function J(W).',
        'Slide 2: Gradient descent computes the partial derivative of loss with respect to each weight.',
        'Slide 3: Stochastic (SGD) vs Mini-batch vs Batch gradient descent performance trade-offs.'
      ]
    },
    {
      id: 'topic-2',
      title: 'Module 2: Regularizations, Batch Normalization & Dropout',
      duration: '50 mins',
      completed: true,
      content: 'Covers practical strategies to prevent overfitting in deep architectures, including L1/L2 weight decays, Dropout layers (inverted dropout matrices), and the mathematics of Batch Normalization layers.',
      slides: [
        'Slide 1: Overfitting occurs when the network models noise in the training set.',
        'Slide 2: L2 regularization adds a penalty term proportional to the square of the weights.',
        'Slide 3: Batch Normalization standardizes inputs to each layer, mitigating internal covariate shift.'
      ]
    },
    {
      id: 'topic-3',
      title: 'Module 3: Backpropagation & Optimization Algorithms',
      duration: '60 mins',
      completed: course.progress >= 40,
      content: 'Deep dive into the chain rule of calculus for computing backpropagation derivatives. Explores advanced optimizers: Momentum, RMSprop, and Adam (Adaptive Moment Estimation).',
      slides: [
        'Slide 1: Backpropagation is a recursive application of the calculus chain rule.',
        'Slide 2: Momentum adds a fraction of the past update vector to smooth gradient oscillations.',
        'Slide 3: Adam combines RMSprop (moving average of squared gradients) and Momentum.'
      ]
    },
    {
      id: 'topic-4',
      title: 'Module 4: Convolutional Neural Nets (CNNs) Spatial Extraction',
      duration: '75 mins',
      completed: course.progress >= 70,
      content: 'Detailed focus on spatial feature extractions. Reviews convolutional layers, kernel filters, stride and zero-padding configurations, max-pooling layers, and classic architectures (LeNet, AlexNet, VGG).',
      slides: [
        'Slide 1: CNNs exploit local spatial correlations in two-dimensional inputs.',
        'Slide 2: Kernels convolve across width and height, calculating dot products of weights and inputs.',
        'Slide 3: Pooling layers reduce spatial dimensions, controlling parameter sizes.'
      ]
    },
    {
      id: 'topic-5',
      title: 'Module 5: Recurrent Nets & Attention Mechanisms',
      duration: '90 mins',
      completed: course.progress >= 95,
      content: 'Examines sequential data modelling, exploding/vanishing gradients, LSTM cell structures, GRU layers, and an introductory review of the self-attention formula in Transformer blocks.',
      slides: [
        'Slide 1: RNNs process sequences step-by-step, maintaining an internal hidden state memory.',
        'Slide 2: LSTM resolves vanishing gradients using input, forget, and output gates.',
        'Slide 3: Self-Attention allows token nodes to dynamically weight connections to other tokens.'
      ]
    }
  ] : [
    {
      id: 'topic-1',
      title: 'Module 1: Query Execution Engines & Optimization Rules',
      duration: '45 mins',
      completed: true,
      content: 'Explores standard SQL query parsers, optimization trees, cost-based optimizers, relational algebra equivalences, and query execution plans (Nested Loops, Hash Joins).',
      slides: [
        'Slide 1: The query parser converts raw SQL into a logical relational query tree.',
        'Slide 2: Cost-based optimizers estimate IO costs based on table statistics (cardinality).',
        'Slide 3: Join execution types: Hash Join, Merge Join, and Nested Loops.'
      ]
    },
    {
      id: 'topic-2',
      title: 'Module 2: Indexing Architectures (B-Trees & Hash Lists)',
      duration: '50 mins',
      completed: true,
      content: 'Covers physical data structures, the lookup speeds of B+ Tree indices, clustering indices vs non-clustered, index page splits, and cover indexing techniques.',
      slides: [
        'Slide 1: B+ Trees keep data sorted, allowing search, sequential access, and insertions in logarithmic time.',
        'Slide 2: Clustered index controls the physical sorting order of rows on disk blocks.',
        'Slide 3: Over-indexing slows down write queries (INSERT/UPDATE) as indices must rebuild.'
      ]
    },
    {
      id: 'topic-3',
      title: 'Module 3: Database Transactions & Concurrency Control',
      duration: '60 mins',
      completed: course.progress >= 40,
      content: 'Investigates ACID properties, Two-Phase Locking (2PL), deadlock detections, transaction isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable), and MVCC.',
      slides: [
        'Slide 1: ACID stands for Atomicity, Consistency, Isolation, and Durability.',
        'Slide 2: Strict 2PL guarantees serializability by holding exclusive locks until transaction commit.',
        'Slide 3: Multi-Version Concurrency Control (MVCC) lets readers read older snapshot rows without locks.'
      ]
    },
    {
      id: 'topic-4',
      title: 'Module 4: Replication, Clustering & High Availability',
      duration: '75 mins',
      completed: course.progress >= 70,
      content: 'Practical server clustering configurations, primary-replica setups, asynchronous vs synchronous log replications, load balancing read replicas, and automatic failovers.',
      slides: [
        'Slide 1: Replication duplicates database transactions across separate node servers.',
        'Slide 2: Primary nodes accept writes, while Read Replicas scale query loads.',
        'Slide 3: Asynchronous replication improves write speeds but risks data loss during primary crashes.'
      ]
    },
    {
      id: 'topic-5',
      title: 'Module 5: Dataset Partitioning & Database Sharding',
      duration: '90 mins',
      completed: course.progress >= 95,
      content: 'Deals with massive databases. Explores horizontal vs vertical partitioning, range-based sharding, hash key sharding, lookup sharding, and distributed transaction rollbacks.',
      slides: [
        'Slide 1: Horizontal partitioning splits rows across multiple partition tables.',
        'Slide 2: Sharding distributes partitions across completely separate physical server nodes.',
        'Slide 3: Shard key selection is critical; poor keys cause "hotspotting" on single nodes.'
      ]
    }
  ];

  const [topics, setTopics] = useState<SyllabusTopic[]>(initialTopics);
  const [selectedTopic, setSelectedTopic] = useState<SyllabusTopic>(initialTopics[isMlCourse ? 3 : 3] || initialTopics[0]);
  const [studyNotes, setStudyNotes] = useState('');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [notesStatus, setNotesStatus] = useState<'idle' | 'saved'>('idle');

  // Load saved study notes for this course from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem(`notes-${course.id}`);
    if (saved) {
      setStudyNotes(saved);
    } else {
      setStudyNotes(`Personal Study Notes for: ${course.title}\n=====================================\n\n- Focus: ${selectedTopic.title}\n- Key Concepts:\n  * `);
    }
  }, [course.id]);

  const handleSelectTopic = (topic: SyllabusTopic) => {
    setSelectedTopic(topic);
    setActiveSlideIndex(0);
  };

  const handleToggleTopicCompletion = (topicId: string) => {
    const updatedTopics = topics.map(t => {
      if (t.id === topicId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    setTopics(updatedTopics);

    // Calculate new progress in real time
    const completedCount = updatedTopics.filter(t => t.completed).length;
    const newProgress = Math.round((completedCount / updatedTopics.length) * 100);

    // Trigger parent state synchronization
    onUpdateCourseProgress(course.id, newProgress, completedCount);
  };

  const handleSaveNotes = () => {
    localStorage.setItem(`notes-${course.id}`, studyNotes);
    setNotesStatus('saved');
    setTimeout(() => setNotesStatus('idle'), 2000);
  };

  const handleGenerateAiStudyNotes = () => {
    setIsAiGenerating(true);

    setTimeout(() => {
      const generated = `Personal Study Notes for: ${course.title}
=====================================
Synced from Academic Syllabus

📖 ACTIVE TOPIC: ${selectedTopic.title}
-------------------------------------
Key Takeaways & Conceptual Architecture:

1. CORE OBJECTIVE:
   * ${selectedTopic.content}

2. DETAILED LECTURE SUMMARIES:
   ${selectedTopic.slides.map((s, i) => `* Slide #${i+1} Note: ${s.split(': ')[1] || s}`).join('\n   ')}

3. SUGGESTED DISPATCH STEPS:
   * Review course workbook and complete the mock exam prep.
   * Schedule practical command lab testing during next self-study block.

[AI Study Guide compiled successfully - ${new Date().toLocaleDateString()}]
`;
      setStudyNotes(generated);
      setIsAiGenerating(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-on-surface">
      
      {/* Top action header */}
      <section className="flex items-center justify-between border-b border-outline-variant/50 pb-4 select-none">
        <button 
          onClick={() => onNavigate('courses')}
          className="flex items-center gap-2 text-xs font-black text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </button>
        <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> Enrolled Course Workspace
        </span>
      </section>

      {/* Course Intro banner */}
      <section className="bg-white border border-outline-variant rounded-2xl overflow-hidden relative shadow-xs flex flex-col md:flex-row">
        <div className="w-full md:w-64 h-40 md:h-auto min-h-[160px] relative overflow-hidden shrink-0">
          <img 
            src={course.banner} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black tracking-widest text-primary uppercase">{course.code}</span>
            <h1 className="text-2xl font-black text-charcoal mt-1">{course.title}</h1>
            <p className="text-xs text-on-surface-variant mt-2 max-w-2xl leading-relaxed">{course.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-6 pt-4 border-t border-outline-variant/50 text-xs">
            <div>
              <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Instructor</p>
              <p className="font-extrabold text-charcoal mt-0.5">{course.instructor}</p>
            </div>
            <div>
              <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Course Progress</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-24 h-2 bg-secondary-fixed/20 rounded-full overflow-hidden shrink-0">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${course.progress}%` }}></div>
                </div>
                <span className="font-extrabold text-primary">{course.progress}%</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Active Subject Status</p>
              <span className="bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-block mt-0.5">
                Grade: {course.gradePercentage}% ({course.grade})
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN SPLIT STUDY SPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SYLLABUS CHECKLIST (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-outline-variant rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-black text-charcoal text-sm uppercase tracking-wider">Course Syllabus</h3>
              <p className="text-[11px] text-outline mt-0.5 font-medium">Check off topics to automatically update course progress</p>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {topics.map((topic) => {
                const isActive = selectedTopic.id === topic.id;
                return (
                  <div 
                    key={topic.id}
                    onClick={() => handleSelectTopic(topic)}
                    className={`p-3 rounded-xl border flex gap-3 cursor-pointer transition-all text-left relative group
                      ${isActive ? 'bg-primary/5 border-primary shadow-xs' : 'bg-surface-container-low/40 border-outline-variant hover:bg-surface-container-low'}
                    `}
                  >
                    <div className="flex items-start pt-0.5 shrink-0">
                      <input 
                        type="checkbox"
                        checked={topic.completed}
                        onChange={() => handleToggleTopicCompletion(topic.id)}
                        onClick={(e) => e.stopPropagation()} // stop selector trigger
                        className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-bold leading-tight ${isActive ? 'text-primary' : 'text-on-surface'}`}>{topic.title}</h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[9px] text-outline font-bold">
                        <span className="bg-surface-container-high px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{topic.duration}</span>
                        {topic.completed ? (
                          <span className="text-secondary flex items-center gap-0.5"><Check className="w-3 h-3" /> Completed</span>
                        ) : (
                          <span className="text-primary-container font-medium flex items-center gap-0.5"><Play className="w-2.5 h-2.5" /> Incomplete</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-outline-variant/50 pt-4 mt-6 text-[10px] text-outline font-medium leading-relaxed bg-surface-container-low/30 p-3 rounded-lg">
            <strong>Pro Tip:</strong> All syllabus completions and progress values sync back to your main portal dashboard automatically!
          </div>
        </div>

        {/* RIGHT COLUMN: READER AND AI NOTES CANVAS (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* LECTURE SLIDE READER CARD */}
          <div className="bg-charcoal text-white border border-slate-800 rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            {/* Ambient gold glow */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full bg-primary/10 blur-3xl select-none pointer-events-none"></div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-baseline border-b border-white/10 pb-3 select-none">
                <span className="text-[10px] bg-primary/20 text-primary border border-primary/20 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Slide {activeSlideIndex + 1} of {selectedTopic.slides.length}
                </span>
                <span className="text-xs text-warm-gray font-semibold italic">Study Deck Reader</span>
              </div>

              {/* Slide text contents */}
              <div className="py-6 flex flex-col justify-center min-h-[120px] text-center">
                <h4 className="text-base font-extrabold text-primary mb-2.5">{selectedTopic.title}</h4>
                <p className="text-lg lg:text-xl font-bold tracking-tight text-white leading-relaxed">
                  "{selectedTopic.slides[activeSlideIndex]}"
                </p>
              </div>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10 select-none">
              <button 
                type="button"
                onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                disabled={activeSlideIndex === 0}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous Slide
              </button>
              <button 
                type="button"
                onClick={() => setActiveSlideIndex(Math.min(selectedTopic.slides.length - 1, activeSlideIndex + 1))}
                disabled={activeSlideIndex === selectedTopic.slides.length - 1}
                className="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-bold hover:bg-gold-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs cursor-pointer"
              >
                Next Slide
              </button>
            </div>
          </div>

          {/* ACTIVE SYLLABUS DETAILS & TEXT NOTES */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-black text-charcoal text-sm uppercase tracking-wider">Detailed Subject Syllabus</h3>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">{selectedTopic.content}</p>
            </div>

            {/* Notepad area */}
            <div className="space-y-3 pt-4 border-t border-outline-variant/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 select-none">
                  <Edit3 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black text-charcoal uppercase tracking-wider">Syllabus Study Notepad</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={handleGenerateAiStudyNotes}
                    disabled={isAiGenerating}
                    className="flex items-center gap-1 py-1.5 px-3 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-[11px] font-black rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAiGenerating ? 'AI Compiling...' : 'Generate AI Notes'}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1 py-1.5 px-3.5 bg-primary text-on-primary hover:bg-gold-dark text-[11px] font-black rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer uppercase tracking-wider"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{notesStatus === 'saved' ? 'Saved!' : 'Save Notes'}</span>
                  </button>
                </div>
              </div>

              <textarea 
                value={studyNotes}
                onChange={(e) => setStudyNotes(e.target.value)}
                placeholder="Write down personal notes, definitions, or study strategies..."
                rows={6}
                className="w-full bg-surface-container-low/40 border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl py-3 px-4 text-xs font-semibold placeholder:text-outline/70 outline-hidden transition-all text-on-surface resize-none leading-relaxed"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
