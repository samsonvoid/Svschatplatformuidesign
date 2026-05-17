import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/chat/Sidebar';
import { ChatWindow } from './components/chat/ChatWindow';
import { DashboardView } from './components/chat/DashboardView';
import { LandingPage } from './components/chat/LandingPage';
import { SignUpPage } from './components/chat/SignUpPage';
import { LoginPage } from './components/chat/LoginPage';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  user?: User;
  group?: {
    name: string;
    avatar: string;
    participants: User[];
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

type Tab = 'chats' | 'dashboard' | 'files' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chats'); // Starts on chats so they see the full roomy inbox!
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup' | 'app'>('landing');
  const [socketStatus, setSocketStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const socketRef = useRef<any>(null);

  const currentUser: User = {
    id: 'current',
    name: 'Kulwa',
    avatar: 'KW',
    status: 'online'
  };

  // 1. Establish Socket Connection on mount
  useEffect(() => {
    setSocketStatus('connecting');
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected to Express chat backend successfully.');
      setSocketStatus('connected');
    });

    socketRef.current.on('disconnect', () => {
      setSocketStatus('disconnected');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // 2. Fetch all user conversations from API
  useEffect(() => {
    fetch(`${SOCKET_URL}/api/chats?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        const formattedChats = data.map((chat: any) => ({
          ...chat,
          lastMessageTime: new Date(chat.lastMessageTime),
          messages: [] // Will fetch messages on demand
        }));
        setChats(formattedChats);
      })
      .catch(err => console.error('Error loading conversations:', err));
  }, []);

  // 3. Join room and load message stream when conversation is selected
  useEffect(() => {
    if (!selectedChatId) return;

    // Join room
    socketRef.current?.emit('join-chat', selectedChatId);

    // Fetch full messages from DB
    fetch(`${SOCKET_URL}/api/chats/${selectedChatId}/messages`)
      .then(res => res.json())
      .then(msgs => {
        setChats(prevChats => prevChats.map(c => {
          if (c.id === selectedChatId) {
            return {
              ...c,
              unreadCount: 0,
              messages: msgs.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
              }))
            };
          }
          return c;
        }));
      })
      .catch(err => console.error('Error loading messages:', err));

    return () => {
      socketRef.current?.emit('leave-chat', selectedChatId);
    };
  }, [selectedChatId]);

  // 4. Listen to real-time incoming messages
  useEffect(() => {
    if (!socketRef.current) return;

    const handleIncomingMessage = (message: any) => {
      setChats(prevChats => prevChats.map(c => {
        if (c.id === message.conversationId) {
          const isSelected = selectedChatId === message.conversationId;
          return {
            ...c,
            messages: [...c.messages, {
              id: message.id,
              senderId: message.senderId,
              senderName: message.senderName,
              content: message.content,
              timestamp: new Date(message.timestamp),
              status: message.status
            }],
            lastMessage: c.type === 'group' ? `${message.senderName}: ${message.content}` : message.content,
            lastMessageTime: new Date(message.timestamp),
            unreadCount: isSelected ? 0 : c.unreadCount + 1
          };
        }
        return c;
      }));
    };

    socketRef.current.on('message-received', handleIncomingMessage);

    return () => {
      socketRef.current.off('message-received', handleIncomingMessage);
    };
  }, [selectedChatId]);

  // 5. Send message via Socket connection
  const handleSendMessage = (content: string) => {
    if (!selectedChatId || !content.trim()) return;

    socketRef.current?.emit('send-message', {
      conversationId: selectedChatId,
      senderId: currentUser.id,
      content: content.trim()
    });
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  if (authView === 'landing') {
    return (
      <LandingPage 
        onLogin={() => setAuthView('login')} 
      />
    );
  }

  if (authView === 'signup') {
    return (
      <SignUpPage 
        onLogin={() => setAuthView('login')} 
        onSubmit={() => setAuthView('app')} 
        onGoToLanding={() => setAuthView('landing')}
      />
    );
  }

  if (authView === 'login') {
    return (
      <LoginPage 
        onSignUp={() => setAuthView('signup')} 
        onSubmit={() => setAuthView('app')} 
        onGoToLanding={() => setAuthView('landing')}
      />
    );
  }

  return (
    <div className="size-full flex flex-col bg-surface overflow-hidden">
      {/* TopNavBar */}
      <header className="h-[64px] w-full sticky top-0 z-40 bg-surface border-b border-outline-variant flex justify-between items-center px-lg flex-shrink-0">
        <div className="flex items-center gap-lg">
          <span className="font-headline-sm text-headline-sm font-black text-primary">CollabHub</span>
          <div className="hidden md:flex gap-md items-center">
            <button 
              onClick={() => setActiveTab('chats')} 
              className={`hover:text-primary transition-colors font-label-md text-label-md cursor-pointer ${
                activeTab === 'chats' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant'
              }`}
            >
              Direct Messages
            </button>
            <button 
              onClick={() => setActiveTab('chats')} 
              className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer"
            >
              Channels
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`hover:text-primary transition-colors font-label-md text-label-md cursor-pointer ${
                activeTab === 'dashboard' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
            >
              Archive
            </button>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">search</button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">notifications</button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">info</button>
          <div className="flex items-center gap-xs bg-slate-100 dark:bg-slate-800 px-sm py-unit rounded-full border border-outline-variant/30 flex-shrink-0 select-none">
            <span className={`w-2 h-2 rounded-full ${
              socketStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              socketStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
            }`}></span>
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider hidden sm:inline">
              {socketStatus}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant flex-shrink-0">
            <img 
              alt="User profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhXk8-KqmFiWrlgpDdMktDSyjWTGHGW1jOU2XaDvd-aXiUQRS-Z3tgW_hp69ELjKeQWUAc1XsWWeYcnXg9EueKmvPjWz07IFSDqitt4imkuSqj-N-vWn4F7wHfgpZ8kKoLV-W1ae76JPJlyEvFweMcW7mLAdpZaZdDp9-R-3V7CXWIPHMySP79TWw0npw55mlVgRatxsyY_5gOTcCJiE0Mt-HR6OzJIHm2SxsKdRx_5jLuCvz8dtjr7IL37LVUjeVv86-rERBlVV-U"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* SideNavBar (Desktop sidebar navigation - hidden on chats view to increase screen workspace space!) */}
        {activeTab !== 'chats' && (
          <nav className="w-[280px] h-full hidden md:flex flex-col border-r border-outline-variant bg-surface py-lg flex-shrink-0 animate-fade-in">
            <div className="px-md mb-lg">
              <div className="flex items-center gap-md px-md mb-md">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                  {currentUser.avatar}
                </div>
                <div>
                  <p className="font-headline-sm text-headline-sm font-bold text-primary">{currentUser.name}</p>
                  <p className="font-body-md text-body-md text-outline opacity-70">Active now</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setActiveTab('chats');
                  setSelectedChatId(null);
                }}
                className="w-full flex items-center justify-center gap-sm bg-primary hover:bg-primary/95 text-on-primary py-sm rounded-lg font-label-md text-label-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">add</span>
                new_message
              </button>
            </div>
            
            <div className="flex-1 space-y-unit px-sm">
              <button 
                onClick={() => setActiveTab('chats')} 
                className={`w-full flex items-center gap-md px-md py-sm transition-colors rounded-lg font-label-md text-label-md cursor-pointer text-left ${
                  activeTab === 'chats' 
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined">chat</span> Chats
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`w-full flex items-center gap-md px-md py-sm transition-colors rounded-lg font-label-md text-label-md cursor-pointer text-left ${
                  activeTab === 'dashboard' 
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined">dashboard</span> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('files')} 
                className={`w-full flex items-center gap-md px-md py-sm transition-colors rounded-lg font-label-md text-label-md cursor-pointer text-left ${
                  activeTab === 'files' 
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined">folder_open</span> Files
              </button>
              <button 
                onClick={() => setActiveTab('settings')} 
                className={`w-full flex items-center gap-md px-md py-sm transition-colors rounded-lg font-label-md text-label-md cursor-pointer text-left ${
                  activeTab === 'settings' 
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined">settings</span> Settings
              </button>
            </div>
            
            <div className="mt-auto px-sm border-t border-outline-variant pt-lg">
              <button className="w-full flex items-center gap-md text-on-surface-variant px-md py-sm hover:bg-surface-container transition-colors rounded-lg font-label-md text-label-md text-left cursor-pointer">
                <span className="material-symbols-outlined">help</span> Help
              </button>
              <button 
                onClick={() => setAuthView('landing')}
                className="w-full flex items-center gap-md text-on-surface-variant px-md py-sm hover:bg-surface-container transition-colors rounded-lg font-label-md text-label-md text-left cursor-pointer"
              >
                <span className="material-symbols-outlined">logout</span> Logout
              </button>
            </div>
          </nav>
        )}

        {/* Dynamic Inner Tab Router */}
        <div className="flex-1 flex overflow-hidden h-full">
          {activeTab === 'dashboard' && (
            <DashboardView 
              currentUser={currentUser} 
              chats={chats} 
              onSelectChat={setSelectedChatId} 
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'chats' && (
            <div className="flex-1 flex overflow-hidden h-full">
              {/* Sidebar: Full width on mobile, hidden when a chat is active */}
              <div className={`${selectedChatId ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] h-full flex-shrink-0`}>
                <Sidebar
                  currentUser={currentUser}
                  chats={chats}
                  selectedChatId={selectedChatId}
                  onSelectChat={setSelectedChatId}
                />
              </div>

              {/* Chat Window: Hidden on mobile until a chat is active */}
              <div className={`${selectedChatId ? 'flex' : 'hidden md:flex'} flex-1 h-full`}>
                <ChatWindow
                  chat={selectedChat}
                  currentUser={currentUser}
                  onSendMessage={handleSendMessage}
                  socket={socketRef.current}
                  onBack={() => setSelectedChatId(null)}
                />
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <main className="flex-1 overflow-y-auto p-lg bg-surface hide-scrollbar">
              <header className="mb-xl">
                <h1 className="font-headline-lg text-headline-lg mb-xs font-black text-on-surface">Shared Files & Documents</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Access and manage all collaborative assets here.</p>
              </header>
              <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm space-y-md">
                <div className="flex items-start gap-md p-md border-b border-slate-100">
                  <span className="material-symbols-outlined text-[32px] text-primary flex-shrink-0 mt-unit">description</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md text-label-md font-bold text-on-surface">Project_Brief_v2.pdf</p>
                    <p className="text-xs text-on-surface-variant">PDF Document • 4.2 MB • Uploaded by Fatuma</p>
                    <button className="mt-sm flex items-center gap-sm bg-primary/10 hover:bg-primary text-primary hover:text-white px-md py-1.5 rounded-full font-label-sm text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm border border-primary/20 w-fit">
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      Download File
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-md p-md border-b border-slate-100">
                  <span className="material-symbols-outlined text-[32px] text-primary flex-shrink-0 mt-unit">image</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md text-label-md font-bold text-on-surface">landing_page_wireframe.png</p>
                    <p className="text-xs text-on-surface-variant">PNG Image • 1.8 MB • Uploaded by Neema</p>
                    <button className="mt-sm flex items-center gap-sm bg-primary/10 hover:bg-primary text-primary hover:text-white px-md py-1.5 rounded-full font-label-sm text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm border border-primary/20 w-fit">
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      Download File
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-md p-md">
                  <span className="material-symbols-outlined text-[32px] text-primary flex-shrink-0 mt-unit">table_chart</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md text-label-md font-bold text-on-surface">budget_planning_Q4.xlsx</p>
                    <p className="text-xs text-on-surface-variant">Excel Spreadsheet • 980 KB • Uploaded by Jamali</p>
                    <button className="mt-sm flex items-center gap-sm bg-primary/10 hover:bg-primary text-primary hover:text-white px-md py-1.5 rounded-full font-label-sm text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm border border-primary/20 w-fit">
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      Download File
                    </button>
                  </div>
                </div>
              </div>
            </main>
          )}

          {activeTab === 'settings' && (
            <main className="flex-1 overflow-y-auto p-lg bg-surface hide-scrollbar">
              <header className="mb-xl">
                <h1 className="font-headline-lg text-headline-lg mb-xs font-black text-on-surface">Settings & Preferences</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Configure your user identity, notifications, and profile details.</p>
              </header>
              <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm space-y-lg max-w-2xl">
                <div className="flex items-center gap-md pb-lg border-b border-slate-100">
                  <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[24px]">
                    {currentUser.avatar}
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{currentUser.name}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">System Administrator</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-on-surface mb-md">Presence Status</h4>
                  <div className="flex gap-md">
                    <span className="px-md py-sm bg-green-100 text-green-700 font-bold rounded-lg text-xs cursor-pointer">ONLINE</span>
                    <span className="px-md py-sm bg-slate-100 text-slate-600 font-bold rounded-lg text-xs cursor-pointer">AWAY</span>
                    <span className="px-md py-sm bg-red-100 text-red-600 font-bold rounded-lg text-xs cursor-pointer">DO NOT DISTURB</span>
                  </div>
                </div>
              </div>
            </main>
          )}
        </div>
      </div>

      {/* Contextual FAB (Only on Home/Dashboard/Chats view when no focused chat detail is active on mobile) */}
      {!selectedChatId && (
        <button 
          onClick={() => {
            setActiveTab('chats');
            setSelectedChatId(null);
          }}
          className="fixed bottom-24 right-md bg-primary hover:bg-primary/95 text-on-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all md:hidden z-[60] cursor-pointer"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      )}

      {/* BottomNavBar (Mobile Only: Hidden when a chat details window is open) */}
      {!selectedChatId && (
        <nav className="fixed bottom-0 w-full md:hidden z-50 bg-surface border-t border-outline-variant shadow-md flex justify-around items-center h-16 pb-safe px-md flex-shrink-0">
          <button 
            onClick={() => setActiveTab('chats')}
            className={`flex flex-col items-center justify-center tap-highlight-transparent cursor-pointer p-xs rounded-lg ${
              activeTab === 'chats' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'chats' ? "'FILL' 1" : "'FILL' 0" }}>chat</span>
            <span className="font-label-sm text-label-sm">Chat</span>
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center tap-highlight-transparent cursor-pointer p-xs rounded-lg ${
              activeTab === 'dashboard' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
            <span className="font-label-sm text-label-sm">Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('files')}
            className={`flex flex-col items-center justify-center tap-highlight-transparent cursor-pointer p-xs rounded-lg ${
              activeTab === 'files' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'files' ? "'FILL' 1" : "'FILL' 0" }}>folder</span>
            <span className="font-label-sm text-label-sm">Files</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center tap-highlight-transparent cursor-pointer p-xs rounded-lg ${
              activeTab === 'settings' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
            <span className="font-label-sm text-label-sm">Profile</span>
          </button>
        </nav>
      )}
    </div>
  );
}