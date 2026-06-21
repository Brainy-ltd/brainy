import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResourceItem, 
  ResourceStatus, 
  ResourceFormat, 
  ChatMessage 
} from '../types';
import { 
  initialResources, 
  initialActivityLog, 
  recommendedResources 
} from '../data';
import { 
  BookOpen, 
  Search, 
  Plus, 
  X, 
  Sparkles, 
  ArrowUpRight, 
  FileText, 
  MessageSquare, 
  History, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  Send, 
  Loader2, 
  Bookmark, 
  Filter,
  AlertCircle,
  ThumbsUp,
  Share2,
  Trash2,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Storage keys + file signatures. When src/data/library.json is edited the
// signature changes, which re-seeds from the file (so your edits always show).
// While the file is unchanged, in-app changes persist across reloads.
const RES_KEY = 'digital_resources';
const RES_SIG_KEY = 'digital_resources_sig';
const RES_SIG = JSON.stringify(initialResources);
const LOG_KEY = 'library_activity_logs';
const LOG_SIG_KEY = 'library_activity_logs_sig';
const LOG_SIG = JSON.stringify(initialActivityLog);

function loadStored<T>(key: string, sigKey: string, sig: string, fallback: T): T {
  try {
    if (localStorage.getItem(sigKey) === sig) {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    }
  } catch (e) {
    /* fall through to file seed */
  }
  return fallback;
}

export function LibraryView() {
  // Core catalog states
  const [resources, setResources] = useState<ResourceItem[]>(() =>
    loadStored(RES_KEY, RES_SIG_KEY, RES_SIG, initialResources)
  );

  // Navigation and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [activeFormat, setActiveFormat] = useState<string>('All');

  // Pagination
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Selected Resource Detail Drawer / Pane State
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'feedback' | 'versions'>('overview');

  // AI Assistant Right Drawer State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your Brainy AI Resource Assistant. Choose a resource to summarize, ask for custom learning recommendations, or ask general questions about our library shelf.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecTopic, setAiRecTopic] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // New Resource Upload form State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAuthor, setUploadAuthor] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Software Development');
  const [uploadFormat, setUploadFormat] = useState<ResourceFormat>('PDF');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadSize, setUploadSize] = useState('2.4 MB');

  // Peer review Feedback submission State
  const [newComment, setNewComment] = useState('');
  const [newSuggestion, setNewSuggestion] = useState('');
  const [newRating, setNewRating] = useState(5);

  // Version Upload State
  const [newVersionNum, setNewVersionNum] = useState('');
  const [newChangelog, setNewChangelog] = useState('');

  // Activity Log
  const [activityLogs, setActivityLogs] = useState(() =>
    loadStored(LOG_KEY, LOG_SIG_KEY, LOG_SIG, initialActivityLog)
  );

  // Auto-scroller ref for AI Chat
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync state to local storage (tagged with the file signature so edits to
  // library.json always re-seed instead of showing stale stored data).
  useEffect(() => {
    localStorage.setItem(RES_KEY, JSON.stringify(resources));
    localStorage.setItem(RES_SIG_KEY, RES_SIG);
  }, [resources]);

  useEffect(() => {
    localStorage.setItem(LOG_KEY, JSON.stringify(activityLogs));
    localStorage.setItem(LOG_SIG_KEY, LOG_SIG);
  }, [activityLogs]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiLoading]);

  // Categories derived from the library data so RTB trades from library.json
  // automatically appear as filters.
  const categoriesList = ['All', ...Array.from(new Set(resources.map((r) => r.category)))];
  const statusList = ['All', 'Draft', 'Under Review', 'Feedback Stage', 'Approved', 'Published'];
  const formatList = ['All', 'PDF', 'Video', 'Link', 'Document', 'Dataset', 'Slide'];

  // File size presets based on format for mock upload
  const handleFormatChange = (fmt: ResourceFormat) => {
    setUploadFormat(fmt);
    if (fmt === 'PDF') setUploadSize('4.5 MB');
    else if (fmt === 'Video') setUploadSize('112 MB');
    else if (fmt === 'Link') setUploadSize('Web Link');
    else if (fmt === 'Document') setUploadSize('1.2 MB');
    else if (fmt === 'Dataset') setUploadSize('42.8 MB');
    else if (fmt === 'Slide') setUploadSize('8.1 MB');
  };

  // 1. UPLOAD WORKFLOW (starts as Draft to fulfill: "must never publish immediately")
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadAuthor.trim()) return;

    const newResource: ResourceItem = {
      id: `res-${Date.now()}`,
      title: uploadTitle.trim(),
      author: uploadAuthor.trim(),
      category: uploadCategory,
      status: 'Draft', // Strictly Draft initially as per: "never publish immediately"
      format: uploadFormat,
      thumbnailUrl: getPlaceholderThumbnail(uploadCategory),
      description: uploadDescription.trim() || 'No description provided.',
      size: uploadSize,
      views: 0,
      downloads: 0,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      versions: [
        {
          version: 'v0.1-Draft',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          author: uploadAuthor.trim(),
          changelog: 'Initial catalog upload. Auto-set as Draft state.'
        }
      ],
      feedbacks: []
    };

    setResources([newResource, ...resources]);
    
    // Add activity log
    const newLog = {
      id: `act-${Date.now()}`,
      text: `${uploadAuthor.trim()} uploaded a new Draft resource: "${uploadTitle.trim()}"`,
      time: 'Just now',
      resourceTitle: uploadTitle.trim(),
      type: 'upload'
    };
    setActivityLogs([newLog, ...activityLogs]);

    // Reset Form
    setUploadTitle('');
    setUploadAuthor('');
    setUploadDescription('');
    setIsUploadOpen(false);
  };

  // Helper for mock thumbnails mapping category keywords to beautiful Unsplash prints
  const getPlaceholderThumbnail = (cat: string) => {
    // Stable per-category placeholder cover that always renders.
    const slug = (cat || 'resource').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `https://picsum.photos/seed/rtb-${slug}/240/320`;
  };

  // 2. SUBMIT FEEDBACK WORKFLOW (changes status to Feedback Stage or gathers feedback)
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource || !newComment.trim()) return;

    const feedbackItem = {
      id: `feed-${Date.now()}`,
      author: 'Academic Assessor',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=80',
      comment: newComment.trim(),
      suggestion: newSuggestion.trim() || undefined,
      rating: newRating,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    // Update the resource. When feedback is provided, transition status to 'Feedback Stage' if Draft/Under Review
    const updated = resources.map(res => {
      if (res.id === selectedResource.id) {
        let newStatus = res.status;
        if (res.status === 'Draft' || res.status === 'Under Review') {
          newStatus = 'Feedback Stage';
        }
        const updatedRes = {
          ...res,
          feedbacks: [feedbackItem, ...res.feedbacks],
          status: newStatus as ResourceStatus
        };
        setSelectedResource(updatedRes);
        return updatedRes;
      }
      return res;
    });

    setResources(updated);

    // Add activity log
    const newLog = {
      id: `act-${Date.now()}`,
      text: `Assessor submitted peermark feedback on: "${selectedResource.title}"`,
      time: 'Just now',
      resourceTitle: selectedResource.title,
      type: 'feedback'
    };
    setActivityLogs([newLog, ...activityLogs]);

    // reset feedback state
    setNewComment('');
    setNewSuggestion('');
    setNewRating(5);
  };

  // 3. REVISION UPDATE / NEW VERSION WORKFLOW
  const handleVersionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource || !newVersionNum.trim() || !newChangelog.trim()) return;

    const newVersion = {
      version: newVersionNum.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      author: 'Resource Author',
      changelog: newChangelog.trim()
    };

    const updated = resources.map(res => {
      if (res.id === selectedResource.id) {
        // Upon revision update, change status to 'Under Review' so peers examine again
        const updatedRes = {
          ...res,
          versions: [newVersion, ...res.versions],
          status: 'Under Review' as ResourceStatus
        };
        setSelectedResource(updatedRes);
        return updatedRes;
      }
      return res;
    });

    setResources(updated);

    // Add activity log
    const newLog = {
      id: `act-${Date.now()}`,
      text: `Resource updated to ${newVersionNum.trim()}: "${selectedResource.title}"`,
      time: 'Just now',
      resourceTitle: selectedResource.title,
      type: 'version'
    };
    setActivityLogs([newLog, ...activityLogs]);

    // Reset
    setNewVersionNum('');
    setNewChangelog('');
  };

  // 4. APPROVAL WORKFLOW
  const handleApprove = (resId: string) => {
    const updated = resources.map(res => {
      if (res.id === resId) {
        const updatedRes = { ...res, status: 'Approved' as ResourceStatus };
        if (selectedResource && selectedResource.id === resId) {
          setSelectedResource(updatedRes);
        }
        return updatedRes;
      }
      return res;
    });
    setResources(updated);

    const match = resources.find(r => r.id === resId);
    if (match) {
      setActivityLogs([{
        id: `act-${Date.now()}`,
        text: `Peer committee approved resource: "${match.title}"`,
        time: 'Just now',
        resourceTitle: match.title,
        type: 'status'
      }, ...activityLogs]);
    }
  };

  // 5. PUBLISH WORKFLOW
  const handlePublish = (resId: string) => {
    const updated = resources.map(res => {
      if (res.id === resId) {
        const updatedRes = { ...res, status: 'Published' as ResourceStatus };
        if (selectedResource && selectedResource.id === resId) {
          setSelectedResource(updatedRes);
        }
        return updatedRes;
      }
      return res;
    });
    setResources(updated);

    const match = resources.find(r => r.id === resId);
    if (match) {
      setActivityLogs([{
        id: `act-${Date.now()}`,
        text: `Resource officially PUBLISHED to public shelves: "${match.title}"`,
        time: 'Just now',
        resourceTitle: match.title,
        type: 'status'
      }, ...activityLogs]);
    }
  };

  // 6. DELETE RESOURCE
  const handleDeleteResource = (resId: string) => {
    if (confirm('Are you sure you want to delete this resource from catalog?')) {
      setResources(resources.filter(r => r.id !== resId));
      setSelectedResource(null);
    }
  };

  // Mock download & views count tracker
  const handleTrackDownload = (resId: string) => {
    setResources(resources.map(res => {
      if (res.id === resId) {
        const updated = { ...res, downloads: res.downloads + 1 };
        if (selectedResource && selectedResource.id === resId) {
          setSelectedResource(updated);
        }
        return updated;
      }
      return res;
    }));
  };

  // 7. AI ASSISTANT CHAT CALLS
  const handleAiSend = async (textToSend?: string) => {
    const query = textToSend || aiInput;
    if (!query.trim()) return;

    if (!textToSend) {
      setAiInput('');
    }

    // append user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAiMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          history: aiMessages,
          catalog: resources
        })
      });

      if (!response.ok) throw new Error('AI Server error');
      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      console.error(e);
      const errMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "I experienced an error connecting to the Brainy AI service. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, errMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 8. AI TASK: SUMMARIZE SELECTED RESOURCE DETAILS
  const handleAiSummarize = async (res: ResourceItem) => {
    setIsAiOpen(true);
    setIsAiLoading(true);

    // Pre-insert user action visualization
    const userMsg: ChatMessage = {
      id: `user-sum-${Date.now()}`,
      sender: 'user',
      text: `Summarize the resource: "${res.title}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAiMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: res })
      });

      if (!response.ok) throw new Error('AI Summarize failed');
      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-sum-${Date.now()}`,
        sender: 'ai',
        text: `**Here is the expert academic compilation for [${res.title}]:**\n\n${data.summary}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      console.error(e);
      const errMsg: ChatMessage = {
        id: `ai-sum-err-${Date.now()}`,
        sender: 'ai',
        text: "Could not generate summary right now. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, errMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 9. AI TASK: SPECIALIZED COURSE PATH RECS FROM LOWER PANEL
  const handleGetAiRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiRecTopic.trim()) return;

    setIsAiLoading(true);
    setAiRecommendations([]);
    setAiAdvice(null);
    setIsAiOpen(true); // show the drawer for output visualization

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiRecTopic, existingCatalog: resources })
      });

      if (!response.ok) throw new Error('AI recommendation failed');
      const data = await response.json();

      setAiRecommendations(data.recommendations || []);
      setAiAdvice(data.advice || '');

      // Also append to chat history
      const promptSummary: ChatMessage = {
        id: `ai-rec-sum-${Date.now()}`,
        sender: 'ai',
        text: `**Dynamic Curated Recommendations for Topic: "${aiRecTopic}"**\n\n*Advisor Roadmap Advice:* ${data.advice || ''}\n\nWe populated your interactive recommendation shelf at the bottom of the AI drawer panel! Check it out below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, {
        id: `user-rec-${Date.now()}`,
        sender: 'user',
        text: `Find dynamic recommendations for topic: "${aiRecTopic}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, promptSummary]);

    } catch (e) {
      console.error(e);
      setAiAdvice("Failed to fetch recommendation response. Verify credentials.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Incorporate recommended item into draft catalog simulation
  const handleAdoptRecommendedItem = (rec: any) => {
    const newItem: ResourceItem = {
      id: `res-rec-${Date.now()}`,
      title: rec.title,
      author: rec.author,
      category: rec.category,
      status: 'Draft', // Strict: starts as Draft
      format: (rec.format || 'PDF') as ResourceFormat,
      thumbnailUrl: getPlaceholderThumbnail(rec.category),
      description: rec.description || 'AI Recommended material.',
      size: rec.size || '1.5 MB',
      views: 0,
      downloads: 0,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      versions: [
        {
          version: 'v1.0-Adopted',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          author: rec.author,
          changelog: 'Adopted from Brainy AI Advisor syllabus suggestions.'
        }
      ],
      feedbacks: []
    };

    setResources([newItem, ...resources]);
    setActivityLogs([{
      id: `act-${Date.now()}`,
      text: `Adopted AI suggested book "${rec.title}" as Draft`,
      time: 'Just now',
      resourceTitle: rec.title,
      type: 'upload'
    }, ...activityLogs]);

    alert(`Saved "${rec.title}" into your Library catalog as a Draft! You can now send it to review or publish it.`);
  };

  // Filter Catalog items matching active parameters and query keywords
  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.author.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || res.category === activeCategory;
    const matchesStatus = activeStatus === 'All' || res.status === activeStatus;
    const matchesFormat = activeFormat === 'All' || res.format === activeFormat;

    return matchesSearch && matchesCategory && matchesStatus && matchesFormat;
  });

  // Pagination math (clamped so we never land on an empty page)
  const totalPages = Math.max(1, Math.ceil(filteredResources.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const paginatedResources = filteredResources.slice(pageStart, pageStart + PAGE_SIZE);

  // Reset to the first page whenever the filters or search change.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, activeStatus, activeFormat]);

  const goToPage = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setCurrentPage(next);
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Build compact page-number list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 12
  const pageItems: (number | 'ellipsis')[] = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items: (number | 'ellipsis')[] = [1];
    const left = Math.max(2, safePage - 1);
    const right = Math.min(totalPages - 1, safePage + 1);
    if (left > 2) items.push('ellipsis');
    for (let i = left; i <= right; i++) items.push(i);
    if (right < totalPages - 1) items.push('ellipsis');
    items.push(totalPages);
    return items;
  })();

  // Calculate status counts
  const getCountByStatus = (status: string) => {
    if (status === 'All') return resources.length;
    return resources.filter(r => r.status === status).length;
  };

  return (
    <div className="min-h-screen bg-white text-brand-text font-sans antialiased relative overflow-x-hidden">
      
      {/* 1. HEADER HUD BAR - Crisp, spacious, typography focusing purely on resources library title */}
      <header className="bg-white border-b border-brand-border py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-xs">
            <BookOpen className="w-5.5 h-5.5 text-brand-text" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-brand-text">Brainy</h1>
              <span className="text-[10px] uppercase font-bold text-brand-secondary bg-brand-highlight px-2 py-0.5 rounded">Digital Workspace</span>
            </div>
            <p className="text-[11px] text-brand-muted font-medium">Educational Resource Lifecycle System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-primary/40 bg-brand-highlight text-brand-secondary font-bold text-xs hover:bg-brand-primary/10 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand-primary" />
            <span>AI Assistant</span>
          </button>

          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-secondary text-brand-text font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Resource</span>
          </button>
        </div>
      </header>

      {/* Hero Header block inside main boundary */}
      <section className="bg-brand-light-gray py-6 px-6 md:px-12 border-b border-brand-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wide">Workspace</span>
            <h2 className="text-2xl font-bold tracking-tight text-brand-text mt-0.5 font-display flex items-center gap-2">
              Digital Resource Library
            </h2>
            <p className="small-body text-brand-muted mt-1 max-w-2xl leading-relaxed">
              Accelerate, curate, and peer-review academic files across the student campus. Maintain version control history, secure inline reviews, and generate instantly summarized study roadmaps via Brainy AI integration.
            </p>
          </div>
          
          {/* Quick status progress visualization indicator bar */}
          <div className="bg-white border border-brand-border p-3.5 rounded-xl shrink-0 flex items-center gap-4">
            <div className="text-center">
              <span className="text-[10px] font-bold text-brand-muted uppercase block">Total Shelf</span>
              <span className="text-lg font-bold text-brand-text">{resources.length}</span>
            </div>
            <div className="w-[1px] h-8 bg-brand-border"></div>
            <div className="text-center">
              <span className="text-[10px] font-bold text-emerald-600 uppercase block">Published</span>
              <span className="text-lg font-bold text-emerald-600">{resources.filter(r => r.status === 'Published').length}</span>
            </div>
            <div className="w-[1px] h-8 bg-brand-border"></div>
            <div className="text-center">
              <span className="text-[10px] font-bold text-amber-500 uppercase block">In Review/Draft</span>
              <span className="text-lg font-bold text-amber-500">
                {resources.filter(r => r.status === 'Draft' || r.status === 'Under Review' || r.status === 'Feedback Stage').length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN 3-COLUMN WORKSPACE GRID (Left Narrow, Center Dominant, Right Narrow) */}
      <main className="max-w-7xl mx-auto px-6 py-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================== LEFT SIDEBAR: NARROW (Col Span 3) ================== */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* STAGE CATEGORIES FILTER BOX */}
            <div className="bg-white border border-brand-border rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-brand-primary rounded-xs"></span>
                Categories
              </h3>
              <div className="space-y-1">
                {categoriesList.map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between
                        ${isActive 
                          ? 'bg-brand-highlight text-brand-secondary font-bold' 
                          : 'text-brand-muted hover:bg-brand-light-gray hover:text-brand-text'
                        }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold
                          ${isActive ? 'bg-brand-primary text-brand-text' : 'bg-brand-light-gray text-brand-muted'}`}>
                        {cat === 'All' ? resources.length : resources.filter(r => r.category === cat).length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RESOURCE WORKFLOW STATUS FILTER CHECKBOXES */}
            <div className="bg-white border border-brand-border rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-emerald-500 rounded-xs"></span>
                Resource Status
              </h3>
              <div className="space-y-1">
                {statusList.map(stat => {
                  const isActive = activeStatus === stat;
                  return (
                    <button
                      key={stat}
                      onClick={() => setActiveStatus(stat)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between
                        ${isActive 
                          ? 'bg-amber-100 text-amber-800 font-bold' 
                          : 'text-brand-muted hover:bg-brand-light-gray'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full 
                          ${stat === 'Draft' ? 'bg-gray-400' : ''}
                          ${stat === 'Under Review' ? 'bg-blue-400' : ''}
                          ${stat === 'Feedback Stage' ? 'bg-amber-400' : ''}
                          ${stat === 'Approved' ? 'bg-rose-400' : ''}
                          ${stat === 'Published' ? 'bg-emerald-500' : ''}
                          ${stat === 'All' ? 'bg-brand-primary' : ''}
                        `}></span>
                        <span>{stat}</span>
                      </div>
                      <span className="text-[10px] font-mono text-brand-muted">
                        {getCountByStatus(stat)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FORMAT FILTERS BOX */}
            <div className="bg-white border border-brand-border rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-purple-500 rounded-xs"></span>
                Format Filters
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {formatList.map(fmt => {
                  const isActive = activeFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      onClick={() => setActiveFormat(fmt)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all cursor-pointer
                        ${isActive 
                          ? 'bg-purple-100 text-purple-800 border-purple-200 font-bold' 
                          : 'bg-white text-brand-muted border-brand-border hover:bg-brand-light-gray hover:text-brand-text'
                        }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* ================== CENTER COLUMN: DOMINATING (Col Span 6 / 9 depending on screen) ================== */}
          <section className="lg:col-span-6 space-y-6">
            
            {/* TOP: Search, Clear Filters indicator inside Workspace Panel */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Query by document title, author, or research keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-lg text-xs pl-9 pr-4 py-2.5 outline-hidden text-brand-text placeholder-brand-muted focus:border-brand-primary transition-all"
                />
              </div>

              {(activeCategory !== 'All' || activeStatus !== 'All' || activeFormat !== 'All' || searchQuery !== '') && (
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setActiveStatus('All');
                    setActiveFormat('All');
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 rounded-lg border border-brand-border text-xs text-brand-muted hover:bg-brand-light-gray font-medium transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Catalog list header */}
            <div ref={listTopRef} className="flex justify-between items-center py-1 scroll-mt-4">
              <div>
                <h3 className="text-sm font-bold text-brand-text uppercase tracking-tight">Active Academic Slates</h3>
                <p className="text-[11px] text-brand-muted">
                  {filteredResources.length === 0
                    ? 'No items on current workspace review'
                    : `Showing ${pageStart + 1}–${pageStart + paginatedResources.length} of ${filteredResources.length} items`}
                </p>
              </div>
              {totalPages > 1 && (
                <span className="text-[11px] font-bold text-brand-muted">
                  Page {safePage} / {totalPages}
                </span>
              )}
            </div>

            {/* RESOURCE LIST GRID - Card fields: Thumbnail, Title, Category, Status, Feedback count */}
            {filteredResources.length === 0 ? (
              <div className="bg-brand-light-gray border border-dashed border-brand-border rounded-xl p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-brand-muted mx-auto" />
                <h4 className="text-xs font-bold text-brand-text">No Matching Resources Found</h4>
                <p className="text-[11px] text-brand-muted max-w-md mx-auto">
                  No resources matched your current category, formatting, or keyword searches. Broaden your selectors or choose "All" in the sidebar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedResources.map(res => {
                  return (
                    <motion.div
                      layout
                      key={res.id}
                      onClick={() => {
                        setSelectedResource(res);
                        setActiveDetailTab('overview');
                      }}
                      className="bg-white border border-brand-border rounded-xl p-4 hover:border-brand-primary hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group"
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail View */}
                        <img 
                          src={res.thumbnailUrl} 
                          alt={res.title}
                          className="w-14 h-18 object-cover rounded-lg bg-brand-light-gray border border-brand-border shrink-0 grayscale-15 group-hover:grayscale-0 transition-all"
                          referrerPolicy="no-referrer"
                        />

                        {/* Card Details */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] bg-brand-light-gray text-brand-muted font-bold px-1.5 py-0.2 rounded">
                              {res.category}
                            </span>
                            <span className="text-[9px] text-purple-700 bg-purple-50 font-bold px-1.5 py-0.2 rounded">
                              {res.format}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-brand-text line-clamp-1 group-hover:text-brand-secondary transition-colors" title={res.title}>
                            {res.title}
                          </h4>
                          <p className="text-[10px] text-brand-muted">by {res.author}</p>
                          <p className="text-[10px] text-brand-muted font-mono mt-0.5">{res.size}</p>
                        </div>
                      </div>

                      {/* Footer Actions / Status Indicators */}
                      <div className="pt-2 border-t border-brand-border flex items-center justify-between text-[11px]">
                        {/* Workflow Status Badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                          ${res.status === 'Draft' ? 'bg-gray-100 text-gray-700' : ''}
                          ${res.status === 'Under Review' ? 'bg-blue-50 text-blue-700' : ''}
                          ${res.status === 'Feedback Stage' ? 'bg-amber-50 text-amber-700' : ''}
                          ${res.status === 'Approved' ? 'bg-rose-50 text-rose-700' : ''}
                          ${res.status === 'Published' ? 'bg-emerald-50 text-emerald-800' : ''}
                        `}>
                          <span className={`w-1 h-1 rounded-full 
                            ${res.status === 'Draft' ? 'bg-gray-500' : ''}
                            ${res.status === 'Under Review' ? 'bg-blue-500' : ''}
                            ${res.status === 'Feedback Stage' ? 'bg-amber-500' : ''}
                            ${res.status === 'Approved' ? 'bg-rose-500' : ''}
                            ${res.status === 'Published' ? 'bg-emerald-500' : ''}
                          `}></span>
                          {res.status}
                        </span>

                        {/* Feedback count */}
                        <span className="text-brand-muted text-[10px] font-medium flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                          <span>{res.feedbacks.length} peer reviews</span>
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* PAGINATION BAR */}
            {totalPages > 1 && (
              <nav className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1" aria-label="Library pagination">
                <p className="text-[11px] text-brand-muted font-medium order-2 sm:order-1">
                  Showing <span className="font-bold text-brand-text">{pageStart + 1}–{pageStart + paginatedResources.length}</span> of <span className="font-bold text-brand-text">{filteredResources.length}</span>
                </p>

                <div className="flex items-center gap-1 order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1}
                    className="flex items-center gap-1 h-8 px-2.5 rounded-lg border border-brand-border bg-white text-[11px] font-bold text-brand-text hover:border-brand-primary hover:bg-brand-highlight/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-brand-border transition-all"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {pageItems.map((item, i) =>
                    item === 'ellipsis' ? (
                      <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-brand-muted text-xs select-none">…</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => goToPage(item)}
                        aria-current={item === safePage ? 'page' : undefined}
                        className={`min-w-8 h-8 px-1 rounded-lg border text-[11px] font-bold transition-all
                          ${item === safePage
                            ? 'bg-brand-primary border-brand-primary text-brand-text shadow-2xs'
                            : 'bg-white border-brand-border text-brand-text hover:border-brand-primary hover:bg-brand-highlight/40'}`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage === totalPages}
                    className="flex items-center gap-1 h-8 px-2.5 rounded-lg border border-brand-border bg-white text-[11px] font-bold text-brand-text hover:border-brand-primary hover:bg-brand-highlight/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-brand-border transition-all"
                    aria-label="Next page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </nav>
            )}

            {/* CURIOUS STUDY TRACK QUERY BOX: Fast Recommended Shelf Query Input */}
            <div className="bg-brand-highlight/40 border border-brand-primary/20 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-secondary animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text">Dynamic Syllabus AI Advisor</h4>
              </div>
              <p className="small-body text-brand-muted leading-relaxed">
                Enter an educational module, career pathway, or resource keyword to query Brainy AI for customized book shelves and learning tip paths instantly!
              </p>
              
              <form onSubmit={handleGetAiRecommendations} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 'Advanced Cyber security ciphers' or 'Intro to Organic Chemistry'"
                  value={aiRecTopic}
                  onChange={(e) => setAiRecTopic(e.target.value)}
                  className="flex-1 bg-white border border-brand-border rounded-lg text-xs px-3 py-2 text-brand-text"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiRecTopic.trim()}
                  className="bg-brand-primary hover:bg-brand-secondary text-brand-text font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1 select-none"
                >
                  {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Advise Me</span>
                </button>
              </form>
            </div>

          </section>

          {/* ================== RIGHT SIDEBAR: NARROW (Col Span 3) ================== */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* RECOMMENDED RESOURCES */}
            <div className="bg-white border border-brand-border rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-indigo-500 rounded-xs"></span>
                Staff Recommendations
              </h3>
              
              <div className="space-y-3">
                {recommendedResources.map(rec => (
                  <div 
                    key={rec.id} 
                    className="p-2.5 rounded-lg border border-transparent hover:border-brand-primary hover:bg-brand-light-gray/40 transition-all cursor-pointer group"
                    onClick={() => {
                      // search or trigger recommendation path action in AI drawer
                      setAiRecTopic(rec.title);
                      handleGetAiRecommendations({ preventDefault: () => {} } as any);
                    }}
                  >
                    <span className="text-[8px] bg-brand-highlight text-brand-secondary font-bold px-1.5 py-0.2 rounded-xs uppercase">
                      {rec.category}
                    </span>
                    <h4 className="text-xs font-bold text-brand-text mt-1 line-clamp-1 group-hover:text-brand-secondary transition-colors">
                      {rec.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-brand-muted mt-0.5">
                      <span>by {rec.author}</span>
                      <span className="font-mono">{rec.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RECENT REVISION ACTIVITY LOGS (STRICT Layout mandate) */}
            <div className="bg-white border border-brand-border rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-brand-primary rounded-xs"></span>
                Activity Logs
              </h3>
              
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {activityLogs.map((log: any) => (
                  <div key={log.id} className="text-[11px] leading-relaxed space-y-0.5 border-l-2 border-brand-highlight pl-2.5">
                    <p className="text-brand-text font-medium">{log.text}</p>
                    <div className="flex items-center justify-between text-[9px] text-brand-muted font-mono">
                      <span>{log.time}</span>
                      {log.resourceTitle && <span className="text-brand-secondary truncate max-w-[80px]">File change</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </main>

      {/* ================== DETAILED RESOURCE WORKFLOW POPUP PANEL ================== */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 bg-black/45 z-40 flex items-center justify-center p-4 backdrop-blur-xs">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-brand-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden text-brand-text relative"
            >
              
              {/* Top Details Panel: Close button */}
              <button
                onClick={() => {
                  setSelectedResource(null);
                  setActiveDetailTab('overview');
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-brand-light-gray text-brand-muted hover:text-brand-text transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Top: Resource preview & inline Actions */}
              <div className="bg-brand-light-gray p-6 border-b border-brand-border flex flex-col md:flex-row gap-5 items-start">
                <img 
                  src={selectedResource.thumbnailUrl} 
                  alt={selectedResource.title}
                  className="w-20 h-28 object-cover rounded-lg border border-brand-border shadow-2xs shrink-0 bg-white"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 space-y-2.5 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-brand-secondary bg-brand-highlight px-2 py-0.5 rounded">
                      {selectedResource.category}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      {selectedResource.format}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border
                      ${selectedResource.status === 'Draft' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
                      ${selectedResource.status === 'Under Review' ? 'bg-blue-50 text-blue-700 border-blue-150' : ''}
                      ${selectedResource.status === 'Feedback Stage' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                      ${selectedResource.status === 'Approved' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                      ${selectedResource.status === 'Published' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : ''}
                    `}>
                      {selectedResource.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-brand-text leading-snug tracking-tight">
                    {selectedResource.title}
                  </h3>
                  <p className="text-xs text-brand-muted">Lead Author: <span className="font-semibold text-brand-text">{selectedResource.author}</span></p>

                  {/* Actions area inside summary */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    
                    {/* Summarize via Brainy AI */}
                    <button
                      onClick={() => handleAiSummarize(selectedResource)}
                      className="bg-brand-highlight py-1.5 px-3 rounded-md text-brand-secondary font-bold text-xs hover:bg-brand-primary hover:text-brand-text transition-all flex items-center gap-1 border border-brand-primary/25 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
                      <span>AI Review Summary</span>
                    </button>

                    {/* Simulation: Download File */}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTrackDownload(selectedResource.id);
                        alert(`Downloading resource: [${selectedResource.format}] ${selectedResource.title} (${selectedResource.size})`);
                      }}
                      className="bg-white border border-brand-border hover:border-brand-primary py-1.5 px-3 rounded-md text-brand-text font-bold text-xs transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-brand-muted" />
                      <span>Get ({selectedResource.downloads} dl)</span>
                    </a>

                    {/* Simulation: Approve stage */}
                    {(selectedResource.status === 'Under Review' || selectedResource.status === 'Feedback Stage') && (
                      <button
                        onClick={() => handleApprove(selectedResource.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-md font-bold text-xs transition-all animate-none"
                      >
                        Approve Material
                      </button>
                    )}

                    {/* Simulation: Publish Approved stage */}
                    {selectedResource.status === 'Approved' && (
                      <button
                        onClick={() => handlePublish(selectedResource.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white py-1.5 px-3 rounded-md font-bold text-xs transition-all animate-pulse"
                      >
                        Publish Approved File
                      </button>
                    )}

                    {/* Delete Resource option */}
                    <button
                      onClick={() => handleDeleteResource(selectedResource.id)}
                      className="text-brand-muted hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-all ml-auto"
                      title="Remove from Catalog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>

              </div>

              {/* Below: Tabs only layout as strictly mandated (Overview, Feedback, Versions) */}
              <div className="flex border-b border-brand-border px-6">
                {(['overview', 'feedback', 'versions'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveDetailTab(tab)}
                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all
                      ${activeDetailTab === tab 
                        ? 'border-brand-primary text-brand-text font-bold' 
                        : 'border-transparent text-brand-muted hover:text-brand-text'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content Box */}
              <div className="p-6 max-h-[350px] overflow-y-auto">

                {/* OVERVIEW TAB */}
                {activeDetailTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">Document Abstract</h4>
                      <p className="small-body text-brand-text leading-relaxed">
                        {selectedResource.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-brand-border">
                      <div className="bg-brand-light-gray p-3 rounded-lg">
                        <span className="text-[10px] text-brand-muted block font-mono">CREATED AT</span>
                        <span className="text-xs font-bold text-brand-text">{selectedResource.createdAt}</span>
                      </div>
                      <div className="bg-brand-light-gray p-3 rounded-lg">
                        <span className="text-[10px] text-brand-muted block font-mono">FILE CONTEXT</span>
                        <span className="text-xs font-bold text-brand-text">{selectedResource.size} ({selectedResource.format})</span>
                      </div>
                      <div className="bg-brand-light-gray p-3 rounded-lg">
                        <span className="text-[10px] text-brand-muted block font-mono">POPULARITY</span>
                        <span className="text-xs font-bold text-brand-text flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-brand-primary" />
                          <span>{selectedResource.views + 120} views</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* FEEDBACK TAB: Comments, structural suggestions, and version peer comments. No nested panels limit. */}
                {activeDetailTab === 'feedback' && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center bg-brand-light-gray/40 p-3 rounded-lg border border-brand-border">
                      <span className="text-xs font-bold text-brand-text">Constructive Peer Assessments</span>
                      <span className="text-[10px] bg-brand-primary/10 text-brand-secondary px-2 py-0.5 rounded font-mono font-bold">
                        {selectedResource.feedbacks.length} submissions
                      </span>
                    </div>

                    {/* Feedback checklist iteration */}
                    {selectedResource.feedbacks.length === 0 ? (
                      <div className="text-center py-4 bg-brand-light-gray/25 rounded-lg border border-dashed border-brand-border">
                        <p className="text-[11px] text-brand-muted italic">No peer reviews logged. Submit the active assessor form below to log feedback.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedResource.feedbacks.map(f => (
                          <div key={f.id} className="bg-white border border-brand-border p-3.5 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <img src={f.avatar} alt={f.author} className="w-6 h-6 rounded-full object-cover border border-brand-border" referrerPolicy="no-referrer" />
                                <div>
                                  <span className="font-bold text-brand-text">{f.author}</span>
                                  <span className="text-[9px] text-brand-muted block font-mono">{f.timestamp}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <span key={idx} className={`text-sm ${idx < f.rating ? 'text-brand-primary' : 'text-gray-200'}`}>★</span>
                                ))}
                              </div>
                            </div>
                            
                            <p className="text-brand-text leading-relaxed font-sans">{f.comment}</p>
                            
                            {f.suggestion && (
                              <div className="bg-brand-highlight/30 border-l-2 border-brand-primary px-3 py-1.5 mt-2 rounded">
                                <span className="text-[9px] uppercase font-bold text-brand-secondary tracking-wide block">Assessor Suggestion</span>
                                <p className="text-[11px] text-brand-text leading-normal mt-0.5 italic">"{f.suggestion}"</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Peer reviewer add feedback tool form */}
                    <form onSubmit={handleFeedbackSubmit} className="border-t border-brand-border pt-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text">Assess Current Asset</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-brand-muted">Comment *</label>
                          <textarea
                            required
                            placeholder="Write constructive analytical critiques of this draft document..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-white border border-brand-border rounded-lg text-xs p-2 h-14"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-brand-muted">Actionable Suggestion</label>
                            <input
                              type="text"
                              placeholder="e.g. Include EC curve references on page 12"
                              value={newSuggestion}
                              onChange={(e) => setNewSuggestion(e.target.value)}
                              className="w-full bg-white border border-brand-border rounded-lg text-xs p-2 h-8"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase font-bold text-brand-muted">Rating Assessment</label>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setNewRating(star)}
                                  className={`text-base font-bold transition-all cursor-pointer ${star <= newRating ? 'text-brand-primary scale-110' : 'text-gray-200 hover:text-brand-highlight'}`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-1.5 bg-brand-text text-white text-xs font-bold rounded-lg hover:bg-brand-secondary hover:text-brand-text transition-all cursor-pointer"
                      >
                        Submit Peer Assessment (Sets Status to 'Feedback Stage')
                      </button>
                    </form>
                  </div>
                )}

                {/* VERSIONS TAB: revision history changelog listing */}
                {activeDetailTab === 'versions' && (
                  <div className="space-y-5">
                    <div className="bg-amber-50 border border-amber-200 text-amber-950 p-3 rounded-lg text-xs leading-relaxed flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-secondary shrink-0" />
                      <p>
                        Uploading a newer edited file revision automatically shifts the workspace back into the <strong>Under Review</strong> stage for peer assessments.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {selectedResource.versions.map((ver, idx) => (
                        <div key={idx} className="bg-brand-light-gray/40 border border-brand-border p-3.5 rounded-xl text-xs space-y-1.5 relative">
                          <span className="absolute top-3.5 right-3.5 font-mono text-[10px] bg-brand-primary text-brand-text font-bold px-2 py-0.2 rounded">
                            {ver.version}
                          </span>
                          <h4 className="font-bold text-brand-text">Revision by {ver.author}</h4>
                          <p className="text-[9px] text-brand-muted font-mono">{ver.date}</p>
                          <p className="small-body text-brand-text font-medium leading-relaxed mt-1">
                            {ver.changelog}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Simulate Submitting revision update */}
                    <form onSubmit={handleVersionSubmit} className="border-t border-brand-border pt-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text">Submit Edited Revision vUpdate</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-brand-muted">Version number *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. v1.1-RC2"
                            value={newVersionNum}
                            onChange={(e) => setNewVersionNum(e.target.value)}
                            className="w-full bg-white border border-brand-border rounded-lg text-xs p-2 h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-brand-muted">Revision changelog *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Integrated cryptography suggestions from peer review"
                            value={newChangelog}
                            onChange={(e) => setNewChangelog(e.target.value)}
                            className="w-full bg-white border border-brand-border rounded-lg text-xs p-2 h-8"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-brand-text text-white text-xs font-bold rounded-lg hover:bg-brand-secondary hover:text-brand-text transition-all cursor-pointer"
                      >
                        Push Revision Update (Pushes status to 'Under Review')
                      </button>
                    </form>
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================== 3. RIGHT DRAWER: AI ASSISTANT (Not a full page!) ================== */}
      <AnimatePresence>
        {isAiOpen && (
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white border-l border-brand-border shadow-2xl flex flex-col justify-between overflow-hidden">
            
            {/* AI Advisor Panel Header */}
            <div className="p-4 bg-brand-light-gray border-b border-brand-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-brand-primary animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text font-display">
                    Brainy AI Resource Assistant
                  </h3>
                  <span className="text-[9px] text-emerald-600 font-bold block">● BRAINY AI ONLINE</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsAiOpen(false);
                  setAiRecommendations([]);
                  setAiAdvice(null);
                }}
                className="p-1.5 rounded-full hover:bg-brand-border text-brand-muted hover:text-brand-text transition-all cursor-pointer"
                title="Collapse Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Body layout messages log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              
              {aiMessages.map(msg => {
                const isAi = msg.sender === 'ai';
                return (
                  <div key={msg.id} className={`flex flex-col space-y-1 ${isAi ? 'items-start' : 'items-end'}`}>
                    <div className="text-[9px] text-brand-muted font-mono">{isAi ? 'Advisor System' : 'Assessor User'}</div>
                    <div 
                      className={`p-3 max-w-[85%] rounded-2xl whitespace-pre-wrap leading-relaxed font-sans
                        ${isAi 
                          ? 'bg-brand-light-gray text-brand-text rounded-tl-none border border-brand-border' 
                          : 'bg-brand-primary text-brand-text rounded-tr-none font-medium'
                        }`}
                    >
                      {/* Simple markdown bold renderer to display tidy reviews */}
                      {msg.text.split('**').map((chunk, i) => i % 2 !== 0 ? <strong key={i} className="font-bold">{chunk}</strong> : chunk)}
                    </div>
                  </div>
                );
              })}

              {/* Loader */}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-brand-muted py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                  <span className="font-mono text-[10px]">Brainy AI is analyzing academic shelves...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
              
              {/* SPECIALIZED RECOMMENDED ADVICE RESULTS SHELF INSIDE AI ACCORDION PANEL */}
              {aiRecommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-brand-border space-y-3">
                  <div className="flex items-center gap-1.5 text-brand-secondary font-bold text-[10px] uppercase">
                    <Bookmark className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Advisor Library Recommendations:</span>
                  </div>

                  <div className="space-y-3">
                    {aiRecommendations.map((rec, k) => (
                      <div key={k} className="p-3 bg-brand-highlight/20 border border-brand-primary/15 rounded-xl space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[9px] bg-brand-primary/10 text-brand-secondary font-black px-1.5 py-0.2 rounded-xs">
                              {rec.category}
                            </span>
                            <h4 className="text-xs font-bold text-brand-text mt-1 leading-snug">{rec.title}</h4>
                            <p className="text-[10px] text-brand-muted font-medium">by {rec.author} ({rec.size})</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-brand-text leading-relaxed font-medium italic">"{rec.description}"</p>
                        
                        <button
                          onClick={() => handleAdoptRecommendedItem(rec)}
                          className="w-full py-1 text-[10px] bg-brand-text text-white font-bold rounded-md hover:bg-brand-primary hover:text-brand-text transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adopt Suggestion as Draft</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {aiAdvice && (
                    <div className="bg-brand-light-gray p-3 rounded-lg text-[10px] text-brand-muted leading-relaxed font-medium">
                      <strong>Curricular Advice:</strong> {aiAdvice}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* AI Footer prompt triggers */}
            <div className="p-4 bg-brand-light-gray border-t border-brand-border space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or specify syllabus guidelines..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                  className="flex-1 bg-white border border-brand-border rounded-lg text-xs px-3 py-2 text-brand-text focus:outline-hidden focus:border-brand-primary"
                />
                <button
                  onClick={() => handleAiSend()}
                  disabled={!aiInput.trim()}
                  className="bg-brand-primary hover:bg-brand-secondary p-2 rounded-lg text-brand-text transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Sample quick question buttons to avoid useless navigation delay */}
              <div className="flex gap-1 overflow-x-auto py-1">
                {[
                  "Draft a 3-step syllabus about Cryptography",
                  "Which files need peer comments?",
                  "Recommend Quantum physics documents"
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleAiSend(s)}
                    className="shrink-0 bg-white border border-brand-border text-[9px] hover:border-brand-primary font-bold px-2 py-1 rounded text-brand-muted cursor-pointer transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* ================== UPLOAD DIALOG OVERLAY POPUP FORM ================== */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 bg-black/45 z-40 flex items-center justify-center p-4 backdrop-blur-xs">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-brand-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden text-brand-text relative p-6 space-y-4"
            >
              
              <button
                onClick={() => setIsUploadOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-brand-light-gray text-brand-muted hover:text-brand-text transition-all cursor-pointer"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-brand-text uppercase tracking-tight">Upload New Academic Material</h3>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  Your resource will start as a <strong>Draft</strong> and cannot publish immediately, allowing time for evaluation and peer feedback.
                </p>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-muted">Document Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Statistical Machine Learning Algorithms"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-muted">Lead Author *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Doe"
                    value={uploadAuthor}
                    onChange={(e) => setUploadAuthor(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-brand-muted">Subject Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full bg-white border border-brand-border rounded-lg p-2 text-xs focus:outline-hidden"
                    >
                      {categoriesList.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-brand-muted">File Format</label>
                    <select
                      value={uploadFormat}
                      onChange={(e) => handleFormatChange(e.target.value as ResourceFormat)}
                      className="w-full bg-white border border-brand-border rounded-lg p-2 text-xs focus:outline-hidden"
                    >
                      {formatList.filter(f => f !== 'All').map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-muted">Description & Syllabus</label>
                  <textarea
                    placeholder="Provide a description of coverage, experiments, or syllabus abstracts..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-lg p-2 text-xs h-18 focus:outline-hidden focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div className="bg-brand-highlight/25 p-3 rounded-lg flex items-center justify-between text-[11px] text-brand-secondary font-mono">
                  <span>Simulated File Payload Size:</span>
                  <span className="font-bold">{uploadSize}</span>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="flex-1 py-2 rounded-lg border border-brand-border text-xs text-brand-muted hover:bg-brand-light-gray font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-secondary text-brand-text text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    Commit as Draft
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. FOOTER */}
      <footer className="bg-brand-light-gray border-t border-brand-border py-8 mt-12 text-center text-xs text-brand-muted">
        <p className="font-semibold text-brand-text flex items-center justify-center gap-1">
          <span>Brainy Resource Hub Applet</span>
          <span>•</span>
          <span className="font-mono text-[10px] text-brand-secondary bg-brand-highlight px-1.5 py-0.2 rounded font-bold">CALIBRI PREMIUM UI DEMO</span>
        </p>
        <p className="mt-1">Crafted with modern React, Tailwind, and server-side @google/genai API</p>
      </footer>

    </div>
  );
}
