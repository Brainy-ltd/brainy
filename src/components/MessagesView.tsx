import React, { useState, useRef, useEffect } from 'react';
import { Chat, Message } from '../types';
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  User, 
  FileText, 
  Download, 
  Info,
  MoreVertical,
  CheckCircle,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface MessagesViewProps {
  chats: Chat[];
  onSendMessage: (chatId: string, text: string, isFile?: boolean, fileName?: string, fileSize?: string) => void;
  onSimulateReply: (chatId: string, text: string) => void;
}

export function MessagesView({
  chats,
  onSendMessage,
  onSimulateReply
}: MessagesViewProps) {
  const [selectedChatId, setSelectedChatId] = useState<string>('ch1');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'instructors' | 'groups'>('all');
  const [inputText, setInputText] = useState('');
  
  // Right sidebar details expanded
  const [showRightDetails, setShowRightDetails] = useState(true);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Find active chat
  const activeChat = chats.find(c => c.id === selectedChatId) || chats[0];

  // Scroll to bottom on message updates
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat.messages]);

  // Handle Send Message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(activeChat.id, inputText.trim());
    const sentText = inputText.trim();
    setInputText('');

    // Trigger an educational auto reply after a brief timeout to simulate a real connection
    setTimeout(() => {
      let reply = "Thanks for the update! I will review this during my next virtual office hour session.";
      if (activeChat.id === 'ch1') {
        if (sentText.toLowerCase().includes('thesis') || sentText.toLowerCase().includes('proposal')) {
          reply = "Perfect. The thesis submission link on Brainy is fully configured. Verify you import page diagrams!";
        } else if (sentText.toLowerCase().includes('syllabus') || sentText.toLowerCase().includes('pdf')) {
          reply = "Indeed. The PDF details the specific grading rubrics. Let me know if you run into any ambiguities.";
        }
      } else if (activeChat.id === 'ch2') {
        reply = "Agreed! Let's arrange a Discord check-in for the team workspace tomorrow evening.";
      }
      onSimulateReply(activeChat.id, reply);
    }, 1500);
  };

  // Mock File Upload Simulator
  const handleMockAttachment = () => {
    const fileNames = ['Assignment2_Draft.pdf', 'LabResult_Diagram.png', 'AlgorithmRef_CS402.zip'];
    const randomFileName = fileNames[Math.floor(Math.random() * fileNames.length)];
    onSendMessage(activeChat.id, randomFileName, true, randomFileName, '1.4 MB');
  };

  // Chat filter logic
  const filteredChats = chats.filter((chat) => {
    // Search query matching
    const matchesSearch = chat.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          chat.contactTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterType === 'unread') {
      return chat.unreadCount > 0;
    }
    if (filterType === 'groups') {
      return chat.id === 'ch2'; // group
    }
    if (filterType === 'instructors') {
      return chat.id === 'ch1' || chat.id === 'ch3'; // teachers/TAs
    }

    return true; // "all"
  });

  return (
    <div className="bg-white border border-outline-variant rounded-xl overflow-hidden h-[calc(100vh-160px)] min-h-[500px] flex shadow-xs animate-fade-in text-on-surface">
      
      {/* 1. Left Grid Pane (Contacts List) */}
      <aside className="w-full md:w-80 border-r border-outline-variant/60 flex flex-col shrink-0">
        
        {/* Search header area */}
        <div className="p-4 border-b border-outline-variant/50 space-y-3">
          <h2 className="text-lg font-bold">Inbox Messages</h2>
          
          <div className="relative">
            <input 
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant focus:ring-2 focus:ring-primary/20 rounded-lg text-xs pl-8 pr-3 py-2 outline-hidden text-on-surface font-medium"
            />
            <Search className="w-3.5 h-3.5 text-outline absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Categories toggler */}
        <div className="px-4 py-2 border-b border-outline-variant/40 flex gap-1 overflow-x-auto scrollbar-none shrink-0">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterType === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterType === 'unread' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
          >
            Unread
          </button>
          <button 
            onClick={() => setFilterType('instructors')}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterType === 'instructors' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
          >
            Faculty
          </button>
          <button 
            onClick={() => setFilterType('groups')}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterType === 'groups' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
          >
            Groups
          </button>
        </div>

        {/* Chats Contacts Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/30">
          {filteredChats.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-xs font-bold text-outline">No matches found</p>
              <p className="text-[10px] text-outline mt-1">Try adapting your visual searching term.</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const worksAsSelected = chat.id === selectedChatId;
              const lastMessage = chat.messages[chat.messages.length - 1];

              return (
                <div 
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-4 cursor-pointer flex gap-3 transition-colors text-left relative
                    ${worksAsSelected ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-surface-container-low'}
                  `}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={chat.contactAvatar} 
                      alt={chat.contactName}
                      className="w-10 h-10 rounded-full object-cover border border-outline-variant/60"
                    />
                    {chat.activeNow && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-secondary ring-2 ring-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="text-xs font-extrabold text-on-surface truncate">{chat.contactName}</h4>
                      <span className="text-[9px] text-outline shrink-0 font-mono">
                        {lastMessage ? lastMessage.timestamp : ''}
                      </span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant truncate font-semibold">{chat.contactTitle}</p>
                    <p className={`text-xs mt-1 truncate ${chat.unreadCount > 0 ? 'text-primary font-bold' : 'text-outline italic'}`}>
                      {lastMessage ? lastMessage.text : ''}
                    </p>
                  </div>

                  {chat.unreadCount > 0 && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 min-w-4 h-4 rounded-full bg-primary text-on-primary text-[9px] font-extrabold flex items-center justify-center px-1">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. Chat Conversation Canvas (Middle) */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface-low justify-between h-full">
        {/* Chat Canvas Header */}
        <section className="bg-white border-b border-outline-variant/50 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <img 
                src={activeChat.contactAvatar} 
                alt={activeChat.contactName}
                className="w-10 h-10 rounded-full object-cover border border-outline-variant/60"
              />
              {activeChat.activeNow && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-secondary ring-2 ring-white rounded-full"></span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-on-surface truncate pr-2">{activeChat.contactName}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-on-surface-variant truncate font-semibold">
                  {activeChat.contactTitle}
                </span>
                <span className="text-outline text-[10px] shrink-0">•</span>
                <span className={`text-[10px] font-bold shrink-0 ${activeChat.activeNow ? 'text-secondary' : 'text-outline'}`}>
                  {activeChat.activeNow ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-xs text-on-surface-variant shrink-0">
            <button 
              onClick={() => alert(`Simulating video conference dial to: ${activeChat.contactName}`)}
              className="p-2 hover:bg-surface-container rounded-lg text-primary transition-colors"
              title="Initiate Vidyo Call"
            >
              <Video className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowRightDetails(!showRightDetails)}
              className={`p-2 rounded-lg transition-colors ${showRightDetails ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container'}`}
              title="Toggle Right Info Rail"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Chat Stream History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Encryption status indicator info */}
          <div className="flex justify-center my-2">
            <span className="bg-white border border-outline-variant text-[10px] text-outline font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-secondary" />
              Syllabus matching synced. Conversations are secured.
            </span>
          </div>

          {activeChat.messages.map((msg) => {
            const isUser = msg.senderId === 'user';
            
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[70%] flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                  
                  {!isUser && (
                    <img 
                      src={activeChat.contactAvatar} 
                      alt={activeChat.contactName}
                      className="w-8 h-8 rounded-full object-cover border border-outline-variant/60 shrink-0 mt-1"
                    />
                  )}

                  <div className="space-y-1">
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed
                      ${isUser ? 'bg-primary text-on-primary rounded-tr-xs' : 'bg-white border border-outline-variant text-on-surface rounded-tl-xs'}
                    `}>
                      {/* Standard Text or File bubble attachment */}
                      {msg.isFile ? (
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 
                            ${isUser ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}
                          `}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold font-mono truncate text-[11px]">{msg.fileName}</p>
                            <p className="text-[9px] opacity-80">{msg.fileSize}</p>
                          </div>
                          <button 
                            onClick={() => alert(`Initiating mock download: ${msg.fileName}`)}
                            className={`p-1.5 rounded-full shrink-0 transition-all ${isUser ? 'hover:bg-white/15' : 'hover:bg-surface-container-high'}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>

                    <div className={`flex items-center gap-1 text-[9px] text-outline ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span>{msg.timestamp}</span>
                      {isUser && <CheckCircle className="w-2.5 h-2.5 text-secondary" />}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

          <div ref={messageEndRef}></div>
        </div>

        {/* Chat Input form drawer */}
        <form onSubmit={handleSend} className="bg-white border-t border-outline-variant/50 p-4 flex gap-2 shrink-0 items-center">
          <button 
            type="button"
            onClick={handleMockAttachment}
            className="p-2 hover:bg-surface-container rounded-lg text-outline transition-colors shrink-0"
            title="Attach System Document"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          <input 
            type="text"
            required
            placeholder={`Type a private message to ${activeChat.contactName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-surface-container-low border border-outline-variant focus:ring-2 focus:ring-primary/20 rounded-lg text-xs px-4 py-2.5 outline-hidden text-on-surface"
          />

          <button 
            type="button" 
            onClick={() => setInputText(prev => prev + ' 🎓')}
            className="p-2 hover:bg-surface-container rounded-lg text-outline transition-colors shrink-0 hidden sm:block"
          >
            <Smile className="w-4 h-4" />
          </button>

          <button 
            type="submit"
            className="bg-primary hover:bg-primary-container text-on-primary p-2.5 rounded-lg shrink-0 transition-colors shadow-xs hover:shadow-md"
            title="Submit response"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </main>

      {/* 3. Instructor Metadata Sidebar Panel (Right) */}
      {showRightDetails && (
        <aside className="w-64 border-l border-outline-variant/60 hidden lg:flex flex-col shrink-0 p-5 bg-white overflow-y-auto">
          <div className="text-center pb-5 border-b border-outline-variant/60">
            <img 
              src={activeChat.contactAvatar} 
              alt={activeChat.contactName}
              className="w-16 h-16 rounded-full mx-auto object-cover border border-outline-variant/80 shadow-xs mb-3"
            />
            <h3 className="text-sm font-bold text-on-surface">{activeChat.contactName}</h3>
            <p className="text-[10px] text-outline mt-0.5 uppercase tracking-wider font-extrabold">{activeChat.dept}</p>
          </div>

          <div className="space-y-5 pt-5 flex-1">
            {/* Contact details */}
            <div>
              <h5 className="text-[10px] text-outline font-bold uppercase tracking-widest font-mono">Contact</h5>
              <p className="text-xs text-on-surface-variant font-medium mt-1 truncate">{activeChat.email}</p>
              <p className="text-xs text-on-surface-variant mt-1">Virtual Office Slots: M/W 2-4 PM</p>
            </div>

            {/* Shared Files list logs */}
            <div>
              <h5 className="text-[10px] text-outline font-bold uppercase tracking-widest font-mono mb-2">SHARED DOCUMENTS ({activeChat.id === 'ch1' ? '2' : '1'})</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-surface-container-low border border-outline-variant rounded-lg group hover:border-primary/40 transition-all cursor-pointer">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-[10px] text-on-surface font-semibold truncate">Syllabus_Update.pdf</span>
                  </div>
                  <Download className="w-3.5 h-3.5 text-outline group-hover:text-primary transition-colors shrink-0" />
                </div>
                
                {activeChat.id === 'ch1' && (
                  <div className="flex items-center justify-between p-2 bg-surface-container-low border border-outline-variant rounded-lg group hover:border-primary/40 transition-all cursor-pointer">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-[10px] text-on-surface font-semibold truncate">Thesis_Overview.docx</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-outline group-hover:text-primary transition-colors shrink-0" />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions checklist */}
            <div className="border-t border-outline-variant/40 pt-4">
              <h5 className="text-[10px] text-outline font-bold uppercase tracking-widest font-mono mb-2">Office Directory</h5>
              <p className="text-xs text-on-surface-variant italic">
                Office: Tech Annex 405C. Please check the Academic Calendar to verify dynamic scheduler appointments.
              </p>
            </div>
          </div>
        </aside>
      )}

    </div>
  );
}
