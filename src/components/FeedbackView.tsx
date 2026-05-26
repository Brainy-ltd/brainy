import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  Inbox, 
  Filter, 
  User, 
  Search, 
  CheckCircle, 
  ThumbsUp, 
  AlertCircle, 
  Lightbulb, 
  Compass,
  Plus,
  BarChart3,
  ShieldAlert,
  ArrowUpDown,
  TrendingUp,
  AlertTriangle,
  Flame,
  Activity,
  Layers
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  userType: 'Trainer' | 'Trainee' | 'Admin';
  classification: 'Problem' | 'Suggestion' | 'User Experience';
  severity: 'Critical' | 'Medium' | 'Low';
  votes: number;
  date: string;
}

const INITIAL_FEEDBACKS: FeedbackItem[] = [
  {
    id: 'fb-4',
    title: 'Batch digital certificate issuance crashes browser',
    description: 'Attempting to issue digital badges and certificates to over 200 graduating trainees trigger request limits or timeouts.',
    userType: 'Admin',
    classification: 'Problem',
    severity: 'Critical',
    votes: 38,
    date: 'May 22, 2026'
  },
  {
    id: 'fb-1',
    title: 'Moodle sync delay on progress completion cards',
    description: 'Grades entered in Moodle content bank are taking up to 30 minutes to appear on the outer student dashboard.',
    userType: 'Trainer',
    classification: 'Problem',
    severity: 'Critical',
    votes: 28,
    date: 'May 24, 2026'
  },
  {
    id: 'fb-2',
    title: 'Support offline access via downloadable PDF packs',
    description: 'In rural TVET hubs, internet coverage is intermittent. Providing compressed curriculum booklets as downloadable files would help considerably.',
    userType: 'Trainee',
    classification: 'Suggestion',
    severity: 'Medium',
    votes: 34,
    date: 'May 24, 2026'
  },
  {
    id: 'fb-3',
    title: 'More interactive lab simulations for solar installations',
    description: 'The current step-by-step text manuals are hard to visualize. Animated interactive schematic drills would increase engagement.',
    userType: 'Trainee',
    classification: 'User Experience',
    severity: 'Low',
    votes: 25,
    date: 'May 23, 2026'
  },
  {
    id: 'fb-7',
    title: 'SCORM interactive packages render truncated on mobile display',
    description: 'Some older compliance widgets force a horizontal scroll and render partially cut off on standard Android browsers.',
    userType: 'Trainee',
    classification: 'Problem',
    severity: 'Medium',
    votes: 21,
    date: 'May 20, 2026'
  },
  {
    id: 'fb-10',
    title: 'Integrate native H5P quiz creator direct inside repository',
    description: 'It would be wonderful to customize interactive questions on the fly while curating general educational resources in the library.',
    userType: 'Trainer',
    classification: 'Suggestion',
    severity: 'Medium',
    votes: 22,
    date: 'May 17, 2026'
  },
  {
    id: 'fb-5',
    title: 'Excellent color contrast on high-contrast dashboard',
    description: 'The warm gold and deep charcoal dark/light background states are incredibly readable and accessible for low-vision trainers.',
    userType: 'Trainer',
    classification: 'User Experience',
    severity: 'Low',
    votes: 9,
    date: 'May 22, 2026'
  },
  {
    id: 'fb-6',
    title: 'Provide automatic alerts for delayed industrial attachments',
    description: 'We need automated system notifications if a trainee has not successfully locked in an industrial placement by the end of week 4.',
    userType: 'Admin',
    classification: 'Suggestion',
    severity: 'Medium',
    votes: 15,
    date: 'May 21, 2026'
  },
  {
    id: 'fb-8',
    title: 'Option to batch-approve educational video uploads',
    description: 'As curriculum creators, we want to choose multiple videos and bulk-approve and publish them to minimize manual dashboard clicks.',
    userType: 'Trainer',
    classification: 'Suggestion',
    severity: 'Low',
    votes: 14,
    date: 'May 19, 2026'
  },
  {
    id: 'fb-9',
    title: 'Complicated navigation to locate physical practical exam slots',
    description: 'It takes four separate clicks on the course menu drawer to find where physically scheduled assessments are stored.',
    userType: 'Trainee',
    classification: 'User Experience',
    severity: 'Low',
    votes: 11,
    date: 'May 18, 2026'
  }
];

export function FeedbackView() {
  const [activeTab, setActiveTab] = useState<'submit' | 'board' | 'prioritization'>('submit');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {
    const saved = localStorage.getItem('rtb_lms_feedbacks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_FEEDBACKS;
      }
    }
    return INITIAL_FEEDBACKS;
  });

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userType, setUserType] = useState<'Trainer' | 'Trainee' | 'Admin'>('Trainee');
  const [classification, setClassification] = useState<'Problem' | 'Suggestion' | 'User Experience'>('Suggestion');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Filters State for Board Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUserType, setFilterUserType] = useState<string>('All');
  const [filterClassification, setFilterClassification] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');

  // Prioritization Dashboard configuration states
  const [prioSortBy, setPrioSortBy] = useState<'calculated' | 'frequency' | 'recency'>('calculated');
  const [prioFilterUser, setPrioFilterUser] = useState<string>('All');
  const [prioFilterSev, setPrioFilterSev] = useState<string>('All');

  // AI assistant states
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant', text: string }>>([
    {
      sender: 'assistant',
      text: "Hello! I am your Brainy AI Feedback Analyst. Use me to discuss logged trainee feedback, organize suggestions, analyze priorities, or design strategic resolution roadmap dispatches!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('rtb_lms_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please fill in both the summary title and concrete description fields.');
      return;
    }
    setError('');

    // Auto-calculate severity objectively based on user-designated classification category
    const calculatedSeverity: 'Critical' | 'Medium' | 'Low' = 
      classification === 'Problem' ? 'Critical' : 
      classification === 'Suggestion' ? 'Medium' : 'Low';

    const newFeedback: FeedbackItem = {
      id: `fb-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      userType,
      classification,
      severity: calculatedSeverity,
      votes: 1,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setFeedbacks([newFeedback, ...feedbacks]);
    setTitle('');
    setDescription('');
    setSubmitted(true);

    // Navigate to dashboard or board tab after a short delay
    setTimeout(() => {
      setSubmitted(false);
      setActiveTab('prioritization');
    }, 2000);
  };

  // Upvote item
  const handleUpvote = (id: string) => {
    setFeedbacks(prev => 
      prev.map(item => 
        item.id === id ? { ...item, votes: item.votes + 1 } : item
      )
    );
  };

  // Get matching classification icon and styling
  const getClassificationStyles = (type: string) => {
    switch (type) {
      case 'Problem':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: <AlertCircle className="w-3.5 h-3.5" />
        };
      case 'Suggestion':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Lightbulb className="w-3.5 h-3.5" />
        };
      case 'User Experience':
      default:
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <Compass className="w-3.5 h-3.5" />
        };
    }
  };

  // Get severity styles
  const getSeverityStyles = (sev: 'Critical' | 'Medium' | 'Low') => {
    switch (sev) {
      case 'Critical':
        return {
          badge: 'bg-red-500 text-white border-red-600',
          text: 'text-red-600',
          bg: 'bg-red-50',
          accent: 'border-red-500',
          score: 3
        };
      case 'Medium':
        return {
          badge: 'bg-amber-400 text-charcoal border-amber-500',
          text: 'text-amber-700',
          bg: 'bg-amber-50/75',
          accent: 'border-amber-400',
          score: 2
        };
      case 'Low':
      default:
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          text: 'text-emerald-700',
          bg: 'bg-emerald-50/40',
          accent: 'border-emerald-300',
          score: 1
        };
    }
  };

  // Calculate high-utility values for the dashboard
  const totalCount = feedbacks.length;
  const criticalCount = feedbacks.filter(f => f.severity === 'Critical').length;
  const mediumCount = feedbacks.filter(f => f.severity === 'Medium').length;
  const lowCount = feedbacks.filter(f => f.severity === 'Low').length;

  const totalVotesAcrossFeedbacks = feedbacks.reduce((acc, curr) => acc + curr.votes, 0);

  // Compute stats by user segment
  const trainerFeedbacks = feedbacks.filter(f => f.userType === 'Trainer');
  const traineeFeedbacks = feedbacks.filter(f => f.userType === 'Trainee');
  const adminFeedbacks = feedbacks.filter(f => f.userType === 'Admin');

  // Prioritization score formula: Priority Index = Severity Weight (Critical: 30, Medium: 20, Low: 10) + Frequency (Votes counts)
  const getPriorityScore = (item: FeedbackItem) => {
    const severityWeight = item.severity === 'Critical' ? 35 : item.severity === 'Medium' ? 20 : 8;
    return severityWeight + item.votes;
  };

  // Filter items for general Board tab
  const filteredFeedbacks = feedbacks.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUser = filterUserType === 'All' || item.userType === filterUserType;
    const matchesClass = filterClassification === 'All' || item.classification === filterClassification;
    const matchesSeverity = filterSeverity === 'All' || item.severity === filterSeverity;

    return matchesSearch && matchesUser && matchesClass && matchesSeverity;
  });

  // Filter and sort items specifically for the active Prioritization List Tab
  const processedPrioFeedbacks = feedbacks
    .filter(item => {
      const matchesUser = prioFilterUser === 'All' || item.userType === prioFilterUser;
      const matchesSev = prioFilterSev === 'All' || item.severity === prioFilterSev;
      return matchesUser && matchesSev;
    })
    .sort((a, b) => {
      if (prioSortBy === 'frequency') {
        return b.votes - a.votes;
      } else if (prioSortBy === 'recency') {
        const indexA = feedbacks.findIndex(f => f.id === a.id);
        const indexB = feedbacks.findIndex(f => f.id === b.id);
        return indexA - indexB; // Initial items are ordered newest to oldest in array
      } else {
        // 'calculated' priority index
        return getPriorityScore(b) - getPriorityScore(a);
      }
    });

  const handleSendChatMessage = async (presetText?: string) => {
    const text = presetText || chatInput;
    if (!text.trim() || chatLoading) return;

    const userMessage = { sender: 'user' as const, text: text.trim() };
    setChatMessages(prev => [...prev, userMessage]);
    if (!presetText) {
      setChatInput('');
    }
    setChatLoading(true);

    try {
      const response = await fetch('/api/ai/feedback-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text.trim(),
          history: chatMessages,
          feedbacks: feedbacks
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'assistant' as const, text: data.text }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { 
        sender: 'assistant' as const, 
        text: "I encountered an error querying the intelligence service. Please make sure your server is online and GEMINI_API_KEY is configured." 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatMarkdown = (text: string): React.ReactNode => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-[11px] font-black text-charcoal mt-2 mb-0.5 uppercase tracking-wider">{line.slice(4)}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-xs font-black text-charcoal mt-3 mb-1 uppercase tracking-tight">{line.slice(3)}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-sm font-black text-charcoal mt-4 mb-2 tracking-tight">{line.slice(2)}</h2>;
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const parts = line.replace(/^[\s-*]+/, '').split('**');
        return (
          <li key={idx} className="ml-3 list-disc text-[10px] leading-relaxed text-charcoal/90 my-0.5">
            {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-gold-dark">{p}</strong> : p)}
          </li>
        );
      }
      const parts = line.split('**');
      if (parts.length > 1) {
        return (
          <p key={idx} className="text-[10px] leading-relaxed text-charcoal/90 my-1 font-sans font-medium">
            {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-black text-gold-dark">{p}</strong> : p)}
          </p>
        );
      }
      return <p key={idx} className="text-[10px] leading-relaxed text-charcoal/90 my-1 font-sans font-medium">{line}</p>;
    });
  };

  const renderAiAssistantSidebar = () => {
    return (
      <div className="bg-white border-2 border-brainy-gold/45 rounded-2xl p-4 shadow-xs flex flex-col h-[580px] shrink-0 w-full" id="feedback-ai-sidebar">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="p-1 bg-light-gold rounded-lg text-gold-dark animate-pulse">
              <Sparkles className="w-4 h-4 text-gold-dark" />
            </span>
            <div>
              <h3 className="text-[11px] font-black text-charcoal uppercase tracking-wider leading-none">
                AI Advisory Workspace
              </h3>
              <p className="text-[9px] text-warm-gray font-bold">Feedback & Roadmaps Partner</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setIsAiPanelOpen(false)}
            className="text-warm-gray hover:text-charcoal font-black text-[10px] uppercase cursor-pointer flex items-center justify-center p-1 rounded-sm hover:bg-cream/40"
            title="Collapse Advisor Panel"
          >
            ✕
          </button>
        </div>

        {/* Message Logs */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs mb-3" id="ai-chat-messages-container">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-1.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender !== 'user' && (
                <div className="w-5 h-5 rounded-full bg-light-gold flex items-center justify-center shrink-0 border border-brainy-gold/20 font-mono text-[9px] font-black text-gold-dark">
                  AI
                </div>
              )}
              <div className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-charcoal text-white rounded-tr-none text-left'
                  : 'bg-cream/30 border border-outline-variant/40 text-charcoal rounded-tl-none text-left font-sans font-medium'
              }`}>
                {msg.sender === 'user' ? (
                  <p className="text-[10px] font-semibold">{msg.text}</p>
                ) : (
                  <div className="space-y-1">{formatMarkdown(msg.text)}</div>
                )}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex gap-1.5 justify-start items-center">
              <div className="w-5 h-5 rounded-full bg-light-gold flex items-center justify-center border border-brainy-gold/20 font-mono text-[9px] font-black text-gold-dark animate-bounce">
                AI
              </div>
              <div className="bg-cream/30 border border-outline-variant/40 rounded-xl px-3 py-2 text-[10px] text-warm-gray font-medium flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-brainy-gold rounded-full animate-ping"></span>
                <span>Analysing roadmap parameters...</span>
              </div>
            </div>
          )}
        </div>

        {/* Prompt presets */}
        <div className="space-y-1 mb-3 shrink-0 border-t border-outline-variant/20 pt-2.5">
          <span className="text-[9px] font-black uppercase text-gold-dark tracking-wide block">
            Co-Creation Suggestions:
          </span>
          <div className="grid grid-cols-1 gap-1">
            {[
              "Synthesize trainee feedback blockers",
              "Suggest resolution plan for Rank #1",
              "Cluster suggestions by classifications"
            ].map((pText, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => handleSendChatMessage(pText)}
                disabled={chatLoading}
                className="text-[9px] font-extrabold bg-cream hover:bg-light-gold text-gold-dark border border-outline-variant/50 hover:border-brainy-gold rounded-lg px-2 py-1 text-left transition-all truncate cursor-pointer disabled:opacity-50"
              >
                ✦ {pText}
              </button>
            ))}
          </div>
        </div>

        {/* Form Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChatMessage();
          }}
          className="flex gap-1.5 mt-auto shrink-0 border-t border-outline-variant/30 pt-2.5"
        >
          <input
            type="text"
            placeholder="Discuss queues, logs..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={chatLoading}
            className="flex-1 bg-white border border-outline-variant/80 focus:border-brainy-gold focus:ring-1 focus:ring-brainy-gold/15 rounded-xl text-[10px] px-3 py-2 outline-hidden font-semibold text-charcoal"
          />
          <button
            type="submit"
            disabled={chatLoading || !chatInput.trim()}
            className="bg-brainy-gold hover:bg-gold-dark text-charcoal rounded-xl p-2 px-3 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in" id="feedback-main-wrapper">
      
      {/* Upper Header Card */}
      <div className="bg-cream/45 border border-outline-variant/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="feedback-top-hero">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-light-gold rounded-lg text-gold-dark">
              <MessageSquare className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-gold-dark font-mono">
              Academic Co-creation Space
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-charcoal tracking-tight">
            RTB Feedback & Voice Portal
          </h1>
          <p className="text-sm text-warm-gray max-w-xl leading-relaxed font-medium">
            Review live evaluations, submit structural friction points, and explore our dynamic platform prioritization rankings.
          </p>
        </div>

        {/* Tab switch control row */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto shrink-0">
          <div className="flex flex-wrap md:flex-nowrap bg-white border border-outline-variant/60 p-1.5 rounded-xl gap-1 shrink-0 w-full md:w-auto shadow-2xs">
            <button
              id="tab-btn-submit"
              type="button"
              onClick={() => setActiveTab('submit')}
              className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 select-none
                ${activeTab === 'submit'
                  ? 'bg-brainy-gold text-charcoal shadow-xs'
                  : 'text-warm-gray hover:text-charcoal bg-transparent'
                }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Log Feedback
            </button>

            <button
              id="tab-btn-board"
              type="button"
              onClick={() => setActiveTab('board')}
              className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none
                ${activeTab === 'board'
                  ? 'bg-brainy-gold text-charcoal shadow-xs'
                  : 'text-warm-gray hover:text-charcoal bg-transparent'
                }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              Board ({feedbacks.length})
            </button>

            <button
              id="tab-btn-prioritization"
              type="button"
              onClick={() => setActiveTab('prioritization')}
              className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 select-none
                ${activeTab === 'prioritization'
                  ? 'bg-brainy-gold text-charcoal shadow-xs'
                  : 'text-warm-gray hover:text-charcoal bg-transparent'
                }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-gold-dark animate-pulse" />
              Prioritization App
            </button>
          </div>

          {activeTab !== 'submit' && (
            <button
              id="ai-advisor-toggle-btn"
              type="button"
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border flex items-center gap-1.5 transition-all shrink-0 w-full md:w-auto justify-center select-none shadow-2xs
                ${isAiPanelOpen
                  ? 'bg-charcoal text-white border-charcoal hover:bg-charcoal/90'
                  : 'bg-cream hover:bg-light-gold text-gold-dark border-brainy-gold/50'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brainy-gold animate-pulse" />
              <span>{isAiPanelOpen ? "Close Assistant" : "Ask AI Assistant"}</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'prioritization' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in text-left" id="feedback-prioritization-dashboard">
          
          {/* Left panel running everything (takes 8 cols if AI is active, 12 otherwise) */}
          <div className={isAiPanelOpen ? "lg:col-span-8 space-y-8" : "lg:col-span-12 space-y-8"}>
            
            {/* Key Stat Blocks */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white border border-outline-variant/60 rounded-2xl p-5 space-y-1 shadow-2xs relative overflow-hidden">
                <span className="text-[10px] font-black text-warm-gray uppercase tracking-wider block">Total Voice Logs</span>
                <div className="text-3xl font-black text-charcoal font-mono leading-none py-1">
                  {totalCount}
                </div>
                <p className="text-[10px] text-warm-gray leading-normal">Active recommendations registered</p>
                <div className="absolute right-3 bottom-3 text-gold-dark/15">
                  <Inbox className="w-10 h-10 stroke-[2.5]" />
                </div>
              </div>

              <div className="bg-red-50/40 border border-red-200 rounded-2xl p-5 space-y-1 shadow-2xs relative overflow-hidden">
                <span className="text-[10px] font-black text-red-700 uppercase tracking-wider block">Critical Severity Blockers</span>
                <div className="text-3xl font-black text-red-600 font-mono leading-none py-1">
                  {criticalCount}
                </div>
                <p className="text-[10px] text-red-700/80 leading-normal">Requires urgent developer dispatch</p>
                <div className="absolute right-3 bottom-3 text-red-500/10">
                  <Flame className="w-10 h-10 stroke-[2.5]" />
                </div>
              </div>

              <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-5 space-y-1 shadow-2xs relative overflow-hidden">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Medium Priority Tasks</span>
                <div className="text-3xl font-black text-amber-700 font-mono leading-none py-1">
                  {mediumCount}
                </div>
                <p className="text-[10px] text-amber-700/85 leading-normal">Usability and offline features</p>
                <div className="absolute right-3 bottom-3 text-amber-500/10">
                  <AlertTriangle className="w-10 h-10 stroke-[2.5]" />
                </div>
              </div>

              <div className="bg-emerald-50/30 border border-emerald-200 rounded-2xl p-5 space-y-1 shadow-2xs relative overflow-hidden">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">Total Interest Votes</span>
                <div className="text-3xl font-black text-emerald-700 font-mono leading-none py-1">
                  {totalVotesAcrossFeedbacks}
                </div>
                <p className="text-[10px] text-emerald-700/85 leading-normal">Collective user signal frequency</p>
                <div className="absolute right-3 bottom-3 text-emerald-500/10">
                  <Activity className="w-10 h-10 stroke-[2.5]" />
                </div>
              </div>

            </div>

            {/* Interactive Segmentation Breakdown Column */}
            <div className={`grid grid-cols-1 ${isAiPanelOpen ? 'xl:grid-cols-3' : 'lg:grid-cols-3'} gap-8`}>
              
              {/* Left Box: Impact Matrices & Statistics */}
              <div className="bg-cream/40 border border-outline-variant/60 rounded-2xl p-6 space-y-6">
                
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-charcoal uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-gold-dark" />
                    Impact Metric Segments
                  </h3>
                  <p className="text-[11px] text-warm-gray leading-normal">
                    Weighted metrics matching feedback frequency count and designated system severity levels.
                  </p>
                </div>

                {/* Affected User Segments */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase text-gold-dark/95 tracking-wider block border-b border-outline-variant/30 pb-1.5">
                    Affected User Segments
                  </span>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-charcoal/90">Trainees / Students</span>
                        <span className="font-mono font-black text-gold-dark">{traineeFeedbacks.length} items</span>
                      </div>
                      <div className="h-2 bg-white border border-outline-variant/30 rounded-full overflow-hidden">
                        <div 
                          className="bg-gold-dark h-full rounded-full transition-all duration-500"
                          style={{ width: `${totalCount > 0 ? (traineeFeedbacks.length / totalCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-charcoal/90">Trainers & Instructors</span>
                        <span className="font-mono font-black text-gold-dark">{trainerFeedbacks.length} items</span>
                      </div>
                      <div className="h-2 bg-white border border-outline-variant/30 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${totalCount > 0 ? (trainerFeedbacks.length / totalCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-charcoal/90">LMS Administrators</span>
                        <span className="font-mono font-black text-gold-dark">{adminFeedbacks.length} items</span>
                      </div>
                      <div className="h-2 bg-white border border-outline-variant/30 rounded-full overflow-hidden">
                        <div 
                          className="bg-red-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${totalCount > 0 ? (adminFeedbacks.length / totalCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Classification category indices */}
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-black uppercase text-gold-dark/95 tracking-wider block border-b border-outline-variant/30 pb-1.5">
                    Issues by Classification
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white border border-outline-variant/40 rounded-xl p-3 text-center space-y-0.5">
                      <span className="text-[9px] text-red-600 font-bold block">Problems</span>
                      <span className="text-lg font-black text-charcoal font-mono">
                        {feedbacks.filter(f => f.classification === 'Problem').length}
                      </span>
                    </div>

                    <div className="bg-white border border-outline-variant/40 rounded-xl p-3 text-center space-y-0.5">
                      <span className="text-[9px] text-amber-600 font-bold block">Suggestions</span>
                      <span className="text-lg font-black text-charcoal font-mono">
                        {feedbacks.filter(f => f.classification === 'Suggestion').length}
                      </span>
                    </div>

                    <div className="bg-white border border-outline-variant/40 rounded-xl p-3 text-center space-y-0.5">
                      <span className="text-[9px] text-sky-600 font-bold block">UX Slips</span>
                      <span className="text-lg font-black text-charcoal font-mono">
                        {feedbacks.filter(f => f.classification === 'User Experience').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Formula Tip */}
                <div className="border border-brainy-gold/30 bg-white rounded-xl p-4 text-[11px] leading-relaxed text-charcoal font-medium space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-gold-dark uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-brainy-gold animate-pulse" />
                    Priority Score formula
                  </div>
                  <p>
                    Calculated dynamic score ranks voice logs based on the assigned severity and community support size:
                  </p>
                  <div className="bg-cream/45 p-1 px-2 rounded-sm font-mono text-[10px] font-extrabold text-center text-gold-dark mt-1 border border-outline-variant/20">
                    Priority = (Severity Weight) + (Votes Count)
                  </div>
                  <div className="text-[10px] text-warm-gray mt-1 leading-normal">
                    Where Critical is 35 points, Medium is 20, and Low is 8.
                  </div>
                </div>

              </div>

              {/* Right Box: Interactive Prioritizer Ranker  (takes 2 cols if AI closed, otherwise full of sub-grid column) */}
              <div className={isAiPanelOpen ? "xl:col-span-2 space-y-5" : "lg:col-span-2 space-y-5"}>
                
                {/* Prioritizer Filters bar */}
                <div className="bg-white border border-outline-variant/60 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  
                  <h3 className="text-xs font-black text-charcoal uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brainy-gold" />
                    Ranked Priority Queues ({processedPrioFeedbacks.length})
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    
                    {/* Select sort criteria */}
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black text-warm-gray uppercase">Sort:</span>
                      <select
                        id="prio-sort-select"
                        value={prioSortBy}
                        onChange={(e) => setPrioSortBy(e.target.value as any)}
                        className="bg-cream/35 border border-outline-variant/60 rounded-lg text-[10px] font-bold px-2 py-1.5 text-charcoal cursor-pointer"
                      >
                        <option value="calculated">Calculated Priority</option>
                        <option value="frequency">Frequency (Votes)</option>
                        <option value="recency">Logged Date</option>
                      </select>
                    </div>

                    {/* Filter segment */}
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black text-warm-gray uppercase">User:</span>
                      <select
                        id="prio-filter-user"
                        value={prioFilterUser}
                        onChange={(e) => setPrioFilterUser(e.target.value)}
                        className="bg-cream/35 border border-outline-variant/60 rounded-lg text-[10px] font-bold px-2 py-1.5 text-charcoal cursor-pointer"
                      >
                        <option value="All">All Roles</option>
                        <option value="Trainer">Trainer</option>
                        <option value="Trainee">Trainee</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>

                    {/* Filter severity */}
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black text-warm-gray uppercase">Sev:</span>
                      <select
                        id="prio-filter-sev"
                        value={prioFilterSev}
                        onChange={(e) => setPrioFilterSev(e.target.value)}
                        className="bg-cream/35 border border-outline-variant/60 rounded-lg text-[10px] font-bold px-2 py-1.5 text-charcoal cursor-pointer"
                      >
                        <option value="All">All Sev</option>
                        <option value="Critical">Critical</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                  </div>

                </div>

                {/* Priority list display */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {processedPrioFeedbacks.length === 0 ? (
                    <div className="py-16 text-center bg-white border border-dashed border-outline-variant/50 rounded-2xl p-8 space-y-2">
                      <AlertCircle className="w-10 h-10 text-warm-gray/40 mx-auto" />
                      <h3 className="text-xs font-black text-charcoal uppercase">No matching queues</h3>
                      <p className="text-xs text-warm-gray max-w-sm mx-auto">
                        Adjust your active prioritized filters to find relevant logged items.
                      </p>
                    </div>
                  ) : (
                    processedPrioFeedbacks.map((item, idx) => {
                      const styleMeta = getClassificationStyles(item.classification);
                      const sevStyles = getSeverityStyles(item.severity);
                      const prioScore = getPriorityScore(item);

                      return (
                        <div
                          key={item.id}
                          className={`bg-white border-2 hover:border-brainy-gold/60 p-4.5 rounded-2xl transition-all shadow-2xs hover:shadow-xs relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${sevStyles.accent}`}
                        >
                          {/* Numerical Badge for dynamic priority index */}
                          <div className="absolute top-0 right-0 p-1 px-2.5 rounded-bl-xl bg-charcoal text-white font-mono text-[9px] font-black uppercase tracking-wider">
                            Rank #{idx + 1}
                          </div>

                          <div className="space-y-2.5 flex-1 pr-6">
                            
                            {/* Badging indicator row */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Priority calculations pill */}
                              <span className="text-[9px] bg-charcoal text-white font-mono font-black px-2 py-0.5 rounded-sm">
                                Score: {prioScore}
                              </span>

                              {/* Severity badge */}
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${sevStyles.badge}`}>
                                {item.severity} severity
                              </span>

                              {/* Classification */}
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-1 ${styleMeta.bg}`}>
                                {styleMeta.icon}
                                <span>{item.classification}</span>
                              </span>

                              {/* User role */}
                              <span className="text-[9px] text-warm-gray font-bold border border-outline-variant/30 px-2 py-0.5 rounded-md uppercase">
                                {item.userType}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="space-y-1 text-left">
                              <h4 className="text-xs font-black text-charcoal leading-snug tracking-tight">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-warm-gray leading-normal font-sans font-medium">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          {/* Fast dynamic voting widget */}
                          <div className="shrink-0 self-stretch md:self-auto flex md:flex-col items-center justify-between border-t md:border-t-0 md:border-l border-outline-variant/30 pt-3.5 md:pt-0 md:pl-5 mt-1 md:mt-0 gap-3">
                            <div className="text-left md:text-center">
                              <span className="text-[9px] text-warm-gray font-mono block">UPVOTES</span>
                              <span className="text-sm font-black text-charcoal font-mono">{item.votes}</span>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => handleUpvote(item.id)}
                              className="bg-cream hover:bg-light-gold text-gold-dark hover:border-brainy-gold font-black text-[10px] px-3 py-2 rounded-lg border border-outline-variant/60 flex items-center gap-1 transition-all select-none cursor-pointer active:scale-95"
                              title="Upvote item relevance"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>VOTE</span>
                            </button>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* Right Work Desk: AI Companion Sidebar */}
          {isAiPanelOpen && (
            <div className="lg:col-span-4 lg:sticky lg:top-24 w-full">
              {renderAiAssistantSidebar()}
            </div>
          )}

        </div>
      )}

      {activeTab === 'submit' && (
        <div className="max-w-3xl mx-auto" id="feedback-form-section">
          <div className="bg-white border border-outline-variant/75 rounded-2xl p-6 md:p-8 shadow-xs relative overflow-hidden">
            
            {/* Embedded success state overlay */}
            {submitted && (
              <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-gold-dark mb-4 border border-brainy-gold/30">
                  <CheckCircle className="w-10 h-10 text-brainy-gold animate-bounce" />
                </div>
                <h3 className="text-lg font-black text-charcoal">Feedback Logged Successfully!</h3>
                <p className="text-xs text-warm-gray mt-2 max-w-sm leading-relaxed font-medium">
                  Your comments and details have been registered into the community Board. switching to dashboard overview...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-1">
                <h2 className="text-sm font-black text-charcoal uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brainy-gold animate-pulse" />
                  Express Your Experience
                </h2>
                <p className="text-xs text-warm-gray">
                  Provide high-quality recommendations that directly target LMS usability.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3.5 font-bold flex items-center gap-2" id="form-error-banner">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Title Input field */}
              <div className="space-y-1.5" id="form-group-title">
                <label className="text-[11px] font-black uppercase text-gold-dark tracking-wide block">
                  1. Concise Summary / Title
                </label>
                <input 
                  id="feedback-title-input"
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Mobile layouts shrink interactive quizzes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-outline-variant/80 focus:border-brainy-gold focus:ring-2 focus:ring-brainy-gold/15 rounded-xl text-xs px-3.5 py-3 outline-hidden font-semibold placeholder-warm-gray/60 transition-all shadow-2xs text-charcoal"
                />
              </div>

              {/* User Type - Single option Select */}
              <div className="space-y-2" id="form-group-usertype">
                <label className="text-[11px] font-black uppercase text-gold-dark tracking-wide block">
                  2. Choose Your User Identity (Select One)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Trainee', 'Trainer', 'Admin'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserType(type)}
                      className={`py-3 px-3 border rounded-xl text-xs font-black text-center transition-all cursor-pointer select-none relative flex flex-col items-center gap-1.5
                        ${userType === type 
                          ? 'bg-light-gold text-gold-dark border-brainy-gold shadow-2xs font-bold' 
                          : 'bg-white border-outline-variant/65 text-charcoal/80 hover:bg-cream/20'
                        }`}
                    >
                      <User className={`w-4 h-4 ${userType === type ? 'text-gold-dark' : 'text-warm-gray/60'}`} />
                      <span>{type}</span>
                      
                      {userType === type && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gold-dark rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Classification Option - Single option Select */}
              <div className="space-y-2" id="form-group-classification">
                <label className="text-[11px] font-black uppercase text-gold-dark tracking-wide block">
                  3. Select Classification Category (Select One)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Problem', 'Suggestion', 'User Experience'] as const).map((cat) => {
                    const styleMeta = getClassificationStyles(cat);
                    const isSelected = classification === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setClassification(cat)}
                        className={`py-3 px-3 border rounded-xl text-xs font-black text-center transition-all cursor-pointer select-none relative flex flex-col items-center gap-1.5
                          ${isSelected 
                            ? 'bg-charcoal text-white border-charcoal shadow-sm' 
                            : 'bg-white border-outline-variant/65 text-charcoal/80 hover:bg-cream/20'
                          }`}
                      >
                        <span className={isSelected ? 'text-brainy-gold' : 'text-warm-gray'}>
                          {styleMeta.icon}
                        </span>
                        <span>{cat}</span>

                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brainy-gold rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Feedback content */}
              <div className="space-y-1.5" id="form-group-description">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black uppercase text-gold-dark tracking-wide">
                    4. Concrete Observation & Recommendation Details
                  </label>
                  <span className="text-[10px] text-warm-gray font-mono font-medium">
                    {description.length} / 500 characters
                  </span>
                </div>
                <textarea 
                  id="feedback-description-textarea"
                  rows={5}
                  maxLength={500}
                  placeholder="Detail the issue or suggestion. Try list specific steps so administrative trainers or developers can troubleshoot immediately..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-outline-variant/80 focus:border-brainy-gold focus:ring-2 focus:ring-brainy-gold/15 rounded-xl text-xs px-3.5 py-3 outline-hidden font-medium placeholder-warm-gray/60 transition-all shadow-2xs text-charcoal leading-relaxed"
                />
              </div>

              {/* Form submit button */}
              <div className="pt-3 border-t border-outline-variant/40 flex justify-end">
                <button
                  id="submit-feedback-action"
                  type="submit"
                  className="bg-brainy-gold hover:bg-gold-dark text-charcoal font-black text-xs px-6 py-3.5 rounded-xl transition-all shadow-xs hover:shadow-md flex items-center gap-2 select-none cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Lock in & Publish Feedback</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {activeTab === 'board' && (
        <div className="space-y-6" id="feedback-board-section">
          
          {/* Controls bar: Search & Filters */}
          <div className="bg-cream/25 border border-outline-variant/60 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            
            {/* Text Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray/80 pointer-events-none" />
              <input
                id="board-search-input"
                type="text"
                placeholder="Search feedbacks by title, details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-outline-variant/80 focus:border-brainy-gold focus:ring-2 focus:ring-brainy-gold/15 rounded-xl text-xs pl-9 pr-4 py-2.5 outline-hidden font-medium placeholder-warm-gray transition-all"
              />
            </div>

            {/* Filter controls row */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
              
              {/* User Identity filtering */}
              <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                <span className="text-[10px] font-black text-gold-dark uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <User className="w-3 h-3" /> User:
                </span>
                <select
                  id="filter-usertype-select"
                  value={filterUserType}
                  onChange={(e) => setFilterUserType(e.target.value)}
                  className="bg-white border border-outline-variant/80 rounded-xl text-xs px-2.5 py-2 focus:border-brainy-gold focus:outline-hidden font-semibold text-charcoal cursor-pointer flex-1"
                >
                  <option value="All">All User Types</option>
                  <option value="Trainee">Trainee</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Classification category filtering */}
              <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                <span className="text-[10px] font-black text-gold-dark uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <Filter className="w-3 h-3" /> Class:
                </span>
                <select
                  id="filter-class-select"
                  value={filterClassification}
                  onChange={(e) => setFilterClassification(e.target.value)}
                  className="bg-white border border-outline-variant/80 rounded-xl text-xs px-2.5 py-2 focus:border-brainy-gold focus:outline-hidden font-semibold text-charcoal cursor-pointer flex-1"
                >
                  <option value="All">All Classifications</option>
                  <option value="Problem">Problem</option>
                  <option value="Suggestion">Suggestion</option>
                  <option value="User Experience">User Experience</option>
                </select>
              </div>

              {/* Severity category filtering */}
              <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                <span className="text-[10px] font-black text-gold-dark uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <ShieldAlert className="w-3 h-3" /> Sev:
                </span>
                <select
                  id="filter-severity-select"
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-white border border-outline-variant/80 rounded-xl text-xs px-2.5 py-2 focus:border-brainy-gold focus:outline-hidden font-semibold text-charcoal cursor-pointer flex-1"
                >
                  <option value="All">All Severity</option>
                  <option value="Critical">Critical</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Feedbacks display list (takes 8 cols if AI active, otherwise 12) */}
            <div className={isAiPanelOpen ? "lg:col-span-8 space-y-4" : "lg:col-span-12 space-y-4"}>
              
              <div className={`grid grid-cols-1 ${isAiPanelOpen ? 'md:grid-cols-1 xl:grid-cols-2' : 'md:grid-cols-2'} gap-6`} id="feedback-grid-items">
                {filteredFeedbacks.length === 0 ? (
                  <div className="col-span-full py-16 px-4 text-center bg-white border border-dashed border-outline-variant/60 rounded-2xl p-8 space-y-3">
                    <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center mx-auto text-warm-gray">
                      <Inbox className="w-6 h-6 text-gold-dark/70" />
                    </div>
                    <h3 className="text-sm font-black text-charcoal">No Feedbacks Registered</h3>
                    <p className="text-xs text-warm-gray max-w-sm mx-auto leading-relaxed">
                      No submissions fit your active criteria. Change the filters or head back to the submission form to write a new one.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterUserType('All');
                        setFilterClassification('All');
                        setFilterSeverity('All');
                      }}
                      className="mt-2 text-xs font-black text-gold-dark hover:text-charcoal transition-all uppercase tracking-wider underline cursor-pointer"
                    >
                      Reset active filters
                    </button>
                  </div>
                ) : (
                  filteredFeedbacks.map((item) => {
                    const styleMeta = getClassificationStyles(item.classification);
                    const sevStyles = getSeverityStyles(item.severity);
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-outline-variant/50 hover:border-brainy-gold/45 p-5 rounded-2xl transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between gap-4 group relative overflow-hidden"
                      >
                        
                        {/* Visual border indicators matching the classification */}
                        <div className={`absolute top-0 inset-x-0 h-1 ${
                          item.classification === 'Problem' 
                            ? 'bg-red-500' 
                            : item.classification === 'Suggestion' 
                              ? 'bg-amber-400' 
                              : 'bg-sky-400'
                        }`} />

                        <div className="space-y-3">
                          
                          {/* Top Badges */}
                          <div className="flex justify-between items-center">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-1 ${styleMeta.bg}`}>
                                {styleMeta.icon}
                                <span>{item.classification}</span>
                              </span>

                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border uppercase ${sevStyles.badge}`}>
                                {item.severity}
                              </span>

                              <span className="text-[9px] bg-slate-100 text-slate-700 font-extrabold border border-slate-200/60 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                                <User className="w-2.5 h-2.5 text-slate-500" />
                                {item.userType}
                              </span>
                            </div>
                            <span className="text-[10px] text-warm-gray font-mono font-medium">{item.date}</span>
                          </div>

                          {/* Header and Details */}
                          <div className="space-y-1 flex-1">
                            <h4 className="text-xs font-black text-charcoal tracking-tight leading-snug group-hover:text-gold-dark transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-warm-gray leading-normal font-sans font-medium">
                              {item.description}
                            </p>
                          </div>

                        </div>

                        {/* Bottom Votes control and actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/35 text-[11px] font-mono mt-2">
                          <span className="text-[10px] text-warm-gray font-medium font-sans">
                            Was this helpful or relevant?
                          </span>

                          <button
                            type="button"
                            onClick={() => handleUpvote(item.id)}
                            className="bg-cream hover:bg-light-gold border border-outline-variant/50 hover:border-brainy-gold text-gold-dark font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all select-none cursor-pointer hover:scale-105 active:scale-95"
                            title="Upvote item relevance on Board"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Upvote</span>
                            <span className="text-charcoal bg-white px-1.5 py-0.5 text-[9px] rounded-sm ml-1.5 border border-outline-variant/30">
                              {item.votes}
                            </span>
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Right Work Desk: AI Companion Sidebar */}
            {isAiPanelOpen && (
              <div className="lg:col-span-4 lg:sticky lg:top-24 w-full">
                {renderAiAssistantSidebar()}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
