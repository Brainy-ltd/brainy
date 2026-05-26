import React, { useState } from 'react';
import { UserProfile, Book } from '../types';
import { 
  User, 
  Settings, 
  BookOpen, 
  Plus, 
  Save, 
  Bell, 
  Sparkles, 
  CloudLightning,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface SettingsViewProps {
  userProfile: UserProfile;
  books: Book[];
  onSaveProfile: (profile: UserProfile) => void;
  onAddBook: (title: string, author: string, coverType: 'math' | 'science' | 'art' | 'code' | 'general') => void;
  feedbackSubmissions: { id: string; subject: string; date: string; status: 'Resolved' | 'Pending' | 'In Progress' }[];
  onAddFeedback: (subject: string) => void;
  isGoogleDriveConnected: boolean;
  onToggleGoogleDrive: () => void;
}

export function SettingsView({
  userProfile,
  books,
  onSaveProfile,
  onAddBook,
  feedbackSubmissions,
  onAddFeedback,
  isGoogleDriveConnected,
  onToggleGoogleDrive
}: SettingsViewProps) {
  // Local Profile fields
  const [profileName, setProfileName] = useState(userProfile.name);
  const [profileEmail, setProfileEmail] = useState(userProfile.email);
  const [profileYear, setProfileYear] = useState(userProfile.academicYear);
  const [profileMajor, setProfileMajor] = useState(userProfile.major);
  const [profileStatus, setProfileStatus] = useState(userProfile.status);
  
  // Custom states
  const [saveToast, setSaveToast] = useState(false);

  // Book Add fields
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookType, setNewBookType] = useState<'math' | 'science' | 'art' | 'code' | 'general'>('code');

  // Feedback fields
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackToast, setFeedbackToast] = useState(false);

  // Handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: profileName,
      email: profileEmail,
      academicYear: profileYear,
      major: profileMajor,
      avatarUrl: userProfile.avatarUrl,
      status: profileStatus
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleAddNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim() || !newBookAuthor.trim()) return;

    onAddBook(newBookTitle.trim(), newBookAuthor.trim(), newBookType);
    
    // reset
    setNewBookTitle('');
    setNewBookAuthor('');
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackSubject.trim()) return;

    onAddFeedback(feedbackSubject.trim());
    setFeedbackSubject('');

    setFeedbackToast(true);
    setTimeout(() => setFeedbackToast(false), 3000);
  };

  return (
    <div className="space-y-10 animate-fade-in text-on-surface">
      
      {/* Page Header */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Portal Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Adjust your personal identity profile data, manage your virtual bookshelf, and link cloud backups.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: General Profiles and Settings Forms (7 columns) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Profile Preferences Form */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-6 border-b border-outline-variant/60">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold">Profile Identity Details</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Profile Photo Display */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-surface-container-low p-4 rounded-xl">
                <img 
                  src={userProfile.avatarUrl} 
                  alt={userProfile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow-xs"
                />
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold">{userProfile.name}</h4>
                  <p className="text-xs text-outline font-medium">Avatar updated via secure academic directory.</p>
                  
                  {/* Status pills selector */}
                  <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                    {(['Learning Now', 'Away', 'On Break'] as const).map((st) => (
                      <button 
                        key={st}
                        type="button"
                        onClick={() => setProfileStatus(st)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all
                          ${profileStatus === st ? 'bg-secondary text-white border-secondary' : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container'}
                        `}
                      >
                        {st === 'Learning Now' ? '● Learning' : st === 'Away' ? '○ Away' : '■ On Break'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Standard Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1">Student Full Name</label>
                  <input 
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary/25 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1">Academic Email</label>
                  <input 
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary/25 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1">Academic Year</label>
                  <select 
                    value={profileYear}
                    onChange={(e) => setProfileYear(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary/25 outline-hidden"
                  >
                    <option value="Freshman">Freshman Year (First-year)</option>
                    <option value="Sophomore">Sophomore Year (Second-year)</option>
                    <option value="Junior">Junior Year (Third-year)</option>
                    <option value="Senior">Senior Year (Fourth-year/Graduating)</option>
                    <option value="Graduate">Graduate / Doctoral Candidate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1">Major Specialization</label>
                  <input 
                    type="text"
                    required
                    value={profileMajor}
                    onChange={(e) => setProfileMajor(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary/25 outline-hidden"
                  />
                </div>
              </div>

              {/* Save Trigger Buttons and Toasts status */}
              <div className="flex items-center gap-4 pt-3 border-t border-outline-variant/60">
                <button 
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-primary-container transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Student Profile
                </button>
                {saveToast && (
                  <span className="text-xs text-secondary font-bold flex items-center gap-1.5 animate-slide-in">
                    <CheckCircle className="w-4 h-4 animate-bounce" />
                    Identity records synced with Registrar database!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* 2. Feedback Hub Redirection Callout */}
          <div className="bg-linear-to-b from-cream/20 to-transparent border border-outline-variant/60 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-dark" />
              <h3 className="text-base font-bold">Student Feedback Hub</h3>
            </div>
            <p className="text-xs text-warm-gray leading-relaxed">
              We have migrated course surveys, tutor requests, and educational feedback tickets into a single, high-contrast **Academic Feedback Hub**. 
            </p>
            <p className="text-xs text-warm-gray leading-relaxed">
              Students can easily evaluate active courses, rate teachers, post academic reviews, and adjust anonymity options from the sidebar link anytime.
            </p>
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-gold-dark bg-light-gold/40 border border-brainy-gold/25 p-3 rounded-lg flex items-center justify-between">
                <span>Total evaluations: {feedbackSubmissions.length} logged items</span>
                <span className="font-extrabold uppercase text-[9px] tracking-wider">Active in Sidebar</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Virtual Bookshelf management / APIs linking (5 columns) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Bookshelves visual shelf */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-outline-variant/60">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold">Personal Shelf Shelf</h3>
              </div>
              <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                {books.length} Books
              </span>
            </div>

            {/* Miniature horizontal shelf display */}
            <div className="grid grid-cols-3 gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/50 mb-6">
              {books.map((book) => (
                <div key={book.id} className="text-center group cursor-pointer">
                  <div className="aspect-[3/4] bg-surface-container-highest rounded border border-outline-variant overflow-hidden relative shadow-xs group-hover:shadow-md transition-all">
                    <img 
                      src={book.coverUrl} 
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-primary"></div>
                  </div>
                  <p className="text-[10px] font-bold text-on-surface truncate mt-1">{book.title}</p>
                  <p className="text-[8px] text-outline truncate">{book.author}</p>
                </div>
              ))}
            </div>

            {/* Add to Shelf Form */}
            <form onSubmit={handleAddNewBook} className="space-y-4 border-t border-outline-variant/40 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Add Dynamic E-Book to My Shelf</h4>
              
              <div className="space-y-3">
                <input 
                  type="text"
                  required
                  placeholder="E-Book Document Title"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary/25 outline-hidden"
                />
                
                <input 
                  type="text"
                  required
                  placeholder="Author / Department"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary/25 outline-hidden"
                />

                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-on-surface-variant font-semibold self-center">Design Style Theme:</label>
                  <select
                    value={newBookType}
                    onChange={(e) => setNewBookType(e.target.value as any)}
                    className="bg-white border border-outline-variant rounded-lg p-2 text-xs focus:ring-2 focus:ring-primary/25 outline-hidden"
                  >
                    <option value="math">Quantum / Math</option>
                    <option value="science">Lock / Security</option>
                    <option value="art">Brain / Intellect</option>
                    <option value="code">Syllabus / Tech</option>
                    <option value="general">Standard Volume</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-secondary text-white rounded-lg font-bold text-xs hover:bg-secondary/95 transition-all text-sm"
                >
                  + Add Book Volume
                </button>
              </div>
            </form>
          </div>

          {/* Connected applications Google Workspace Backup flow */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-outline-variant/60">
              <CloudLightning className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold">Cloud Service Integrations</h3>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Sync your Brainy academic grades, research journals, and exam schedules automatically to Google Workspace.
            </p>

            <button 
              type="button"
              onClick={onToggleGoogleDrive}
              className={`w-full py-3 px-4 rounded-xl border font-bold text-xs transition-all flex items-center justify-between
                ${isGoogleDriveConnected ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-white border-outline-variant hover:bg-surface-container-low text-on-surface-variant'}
              `}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-3.5 h-3.5 rounded-full inline-block ${isGoogleDriveConnected ? 'bg-secondary' : 'bg-outline-variant'}`}></span>
                <span>Google Drive Cloud Authorization</span>
              </div>
              
              <span className="font-extrabold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-sm bg-surface-container-high text-on-surface-variant">
                {isGoogleDriveConnected ? 'Linked' : 'Not Connected'}
              </span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
