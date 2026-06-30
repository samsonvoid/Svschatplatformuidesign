import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/chat/Sidebar';
import { ChatWindow } from './components/chat/ChatWindow';
import { DashboardView } from './components/chat/DashboardView';
import { LandingPage } from './components/chat/LandingPage';
import { SignUpPage } from './components/chat/SignUpPage';
import { LoginPage } from './components/chat/LoginPage';
import { SettingsView } from './components/chat/SettingsView';
import { io } from 'socket.io-client';

export const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  bio?: string;
  theme?: string;
  accentColor?: string;
  fontSize?: string;
  newMessagesAlert?: boolean;
  mentionsOnlyAlert?: boolean;
  soundEffectsAlert?: boolean;
  role?: string;
  allowGroupCreation?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'sending';
  attachment?: {
    name: string;
    type: string;
    size: number;
    url: string;
  };
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

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getFullAvatarUrl = (avatarStr: string | null | undefined) => {
  if (!avatarStr) return null;
  if (avatarStr.startsWith('data:image/') || avatarStr.startsWith('http')) {
    return avatarStr;
  }
  if (avatarStr.startsWith('/uploads/')) {
    return `${SOCKET_URL}${avatarStr}`;
  }
  // Resolve seeded Google avatars (JM, NM, KW)
  switch (avatarStr) {
    case 'JM':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCPQQYKJpNA5jd1VjdBDcDwLhDNGA59CdxkjOyVhJvMpia9w59tOwSokbTb5SMUjo__jk2RrKpLF6shcM0R5MYEvARXJziz6-ByZTUKRm8snciuCODUq8Ytvez7uG5CRhrTHD1W-hHxId8xUK48HEx0LQ4ot-4z0WV07MGLCB4d1a3h_Jb33-GllgsNM1t2ACOV61IMzHOyLzkqNx1q1FEqa7alHPoPcCQv8DL7k5IlH97b6MYoyno3CBnSUeYJ4pSi-WLoneFGhAq';
    case 'NM':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-SnAPBXeqztqdjPSSZE7o0DRAydecmHb8ZdThdek0HnLH5AvvxB33qhlNcNivOjBl9H27Rao0E4go6OGdcdo5UGS3ge1NhuRhR3xe7aKwknkJCculUQH5-zBW8PMz-zEfmCtoCY7jJ4aSOmvxVnraip1ehItkQ3RgJxQilGuIK7mRpNsws2EktJLN6iB1l5OOuBLGjLqY75tOjTiMTbfDHPOPDpNN4dc4Z6suPPuwWcdyObz_R_hp82dVJJujkBGJ_8MH2nKMJ46i';
    case 'KW':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhGcX1X6J_eYc9wN2eoi0jQdf6JFbzbTJeSiQ78PkZg8tA5-aY-dpIDGRGs9OVs0_193zsWJsHTL55q7cJ1jQHrLj5FPcL8Pxeqyg23j9UuLxhE9otVEj5SPgJ6IODvHFpxyU02nlt9ywIWzAMg9hssZv3P3pMpSt6lEvxm4tvipwDIWk2WYj3gkuWJNkzayjcZq7CvKxtZOnaPS8yGVY30c23eR4EITJ1Hp2Fr27wxYkIs_MnBdsRW6yGTCJehKL8oNyJvpGsY78S';
    default:
      return null;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const saved = localStorage.getItem('collabhub_active_tab');
    return (saved as Tab) || 'dashboard'; // Default to dashboard
  });
  const handleSetActiveTab = (tab: Tab) => {
    setActiveTab(tab);
    localStorage.setItem('collabhub_active_tab', tab);
  };
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup' | 'app'>(() => {
    const saved = sessionStorage.getItem('collabhub_auth_view');
    return (saved as any) || 'landing';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = sessionStorage.getItem('collabhub_user');
    return saved ? JSON.parse(saved) : {
      id: 'current',
      name: 'Samson Admin',
      avatar: 'SA',
      status: 'online'
    };
  });

  // Listen for PWA installation prompt trigger
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('[PWA] beforeinstallprompt event fired and captured.');
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Inactivity Timeout (15 minutes)
  useEffect(() => {
    let timeoutId: any;

    const resetInactivityTimeout = () => {
      clearTimeout(timeoutId);
      // 15 minutes = 15 * 60 * 1000 ms
      timeoutId = setTimeout(() => {
        if (authView === 'app') {
          handleLogout();
          alert("Your session was closed due to 15 minutes of inactivity for your security.");
        }
      }, 15 * 60 * 1000);
    };

    if (authView === 'app') {
      window.addEventListener('mousemove', resetInactivityTimeout);
      window.addEventListener('keydown', resetInactivityTimeout);
      window.addEventListener('click', resetInactivityTimeout);
      window.addEventListener('scroll', resetInactivityTimeout);
      resetInactivityTimeout();
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetInactivityTimeout);
      window.removeEventListener('keydown', resetInactivityTimeout);
      window.removeEventListener('click', resetInactivityTimeout);
      window.removeEventListener('scroll', resetInactivityTimeout);
    };
  }, [authView]);

  const handleSetAuthView = (view: 'landing' | 'login' | 'signup' | 'app') => {
    setAuthView(view);
    sessionStorage.setItem('collabhub_auth_view', view);
  };

  const handleAuthSuccess = () => {
    const saved = sessionStorage.getItem('collabhub_user');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
    handleSetActiveTab('dashboard'); // Direct to dashboard upon login/signup
    handleSetAuthView('app');
  };

  const handleLogout = () => {
    const token = sessionStorage.getItem('collabhub_token');
    // Clear cookie on backend
    fetch(`${SOCKET_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include'
    }).catch(err => console.error('[Logout] Failed backend logout:', err));

    sessionStorage.removeItem('collabhub_token');
    sessionStorage.removeItem('collabhub_user');
    sessionStorage.removeItem('collabhub_auth_view');
    setCurrentUser({
      id: 'current',
      name: 'Samson Admin',
      avatar: 'SA',
      status: 'online'
    });
    handleSetAuthView('landing');
  };

  // Verify session integrity on mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem('collabhub_user');
    const token = sessionStorage.getItem('collabhub_token');
    if (savedUser) {
      fetch(`${SOCKET_URL}/api/auth/me`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include'
      })
        .then(res => {
          if (res.status === 401 || res.status === 403) {
            handleLogout();
            return;
          }
          if (!res.ok) {
            console.warn('[Session Check] Server returned error status:', res.status);
            return;
          }
          return res.json();
        })
        .then(data => {
          if (data && data.success && data.user) {
            setCurrentUser(data.user);
            sessionStorage.setItem('collabhub_user', JSON.stringify(data.user));
          }
        })
        .catch(err => {
          console.warn('[Session Check] Network failure or server offline:', err);
        });
    }
  }, []);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [inAppNotificationToast, setInAppNotificationToast] = useState<any | null>(null);
  const [mutedChats, setMutedChats] = useState<{[chatId: string]: string}>({});

  const [socketStatus, setSocketStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [socket, setSocket] = useState<any>(null);

  // 1. Establish Socket Connection when authenticated
  useEffect(() => {
    if (authView !== 'app') {
      setSocketStatus('disconnected');
      setSocket(null);
      return;
    }

    setSocketStatus('connecting');
    const token = sessionStorage.getItem('collabhub_token');
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to Express chat backend successfully.');
      setSocketStatus('connected');
    });

    newSocket.on('connect_error', (err: any) => {
      console.error('[Socket] Connection failed (verify backend server is running on port 5000):', err.message);
      setSocketStatus('disconnected');
    });

    newSocket.on('disconnect', () => {
      setSocketStatus('disconnected');
    });

    // Listen to real-time online/offline presence changes of other users
    newSocket.on('user-presence-changed', (data: { userId: string; status: 'online' | 'offline' | 'away' }) => {
      console.log('[Socket] User presence changed:', data);
      setChats(prevChats => prevChats.map(c => {
        // Update direct message partner presence
        if (c.user && c.user.id === data.userId) {
          return {
            ...c,
            user: {
              ...c.user,
              status: data.status
            }
          };
        }
        // Update group chat participants presence
        if (c.group && c.group.participants) {
          return {
            ...c,
            group: {
              ...c.group,
              participants: c.group.participants.map(p => {
                if (p.id === data.userId) {
                  return { ...p, status: data.status };
                }
                return p;
              })
            }
          };
        }
        return c;
      }));
    });

    // Listen to real-time message status updates (Delivered)
    newSocket.on('message-status-changed', (data: { messageId: string; conversationId: string; status: string }) => {
      setChats(prevChats => prevChats.map(c => {
        if (c.id === data.conversationId) {
          return {
            ...c,
            messages: c.messages.map(m => {
              if (m.id === data.messageId) {
                return { ...m, status: data.status as any };
              }
              return m;
            })
          };
        }
        return c;
      }));
    });

    // Listen to real-time message status updates (Read)
    newSocket.on('messages-read', (data: { conversationId: string; readerId: string }) => {
      setChats(prevChats => prevChats.map(c => {
        if (c.id === data.conversationId) {
          return {
            ...c,
            messages: c.messages.map(m => {
              // Mark all messages sent by OTHERS (meaning we are the sender of this message) as read
              if (m.senderId !== data.readerId) {
                return { ...m, status: 'read' as any };
              }
              return m;
            })
          };
        }
        return c;
      }));
    });

    // Listen to real-time message deletions
    newSocket.on('message-deleted', (data: { messageId: string; conversationId: string }) => {
      setChats(prevChats => prevChats.map(c => {
        if (c.id === data.conversationId) {
          const filteredMessages = c.messages.filter(m => m.id !== data.messageId);
          const lastMsg = filteredMessages[filteredMessages.length - 1];
          return {
            ...c,
            messages: filteredMessages,
            lastMessage: lastMsg 
              ? (c.type === 'group' ? `${lastMsg.senderName}: ${lastMsg.content}` : lastMsg.content) 
              : 'No messages yet',
            lastMessageTime: lastMsg ? lastMsg.timestamp : new Date(0)
          };
        }
        return c;
      }));
    });

    newSocket.on('notification-received', (data: any) => {
      console.log('[Socket] Notification received:', data);
      setNotifications(prev => [data, ...prev]);
      playChime();
      setInAppNotificationToast(data);
      setTimeout(() => setInAppNotificationToast(null), 5000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [authView]);

  // Synthetic Chime generator using Web Audio API (ensures sound chimes cleanly)
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1318.51, audioCtx.currentTime + 0.15); // E6
      
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (err) {
      console.warn('[Chime] Playback failed:', err);
    }
  };

  // Push notifications subscription config
  const setupPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      console.log('[PushManager] Not supported on this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('[PushManager] Permission was not granted.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const res = await fetch(`${SOCKET_URL}/api/notifications/vapid-public-key`);
      const keyData = await res.json();
      if (!keyData.publicKey) return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey)
      });

      const token = sessionStorage.getItem('collabhub_token');
      await fetch(`${SOCKET_URL}/api/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          token: subscription,
          deviceType: 'browser'
        })
      });
      console.log('✅ Web Push Registered Successfully!');
    } catch (err) {
      console.error('[PushSetup] Failed to register Web Push:', err);
    }
  };

  // 1.5. Fetch notification history on boot/login
  useEffect(() => {
    if (authView !== 'app') return;
    const token = sessionStorage.getItem('collabhub_token');
    
    fetch(`${SOCKET_URL}/api/notifications`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data) {
        setNotifications(data.data);
      }
    })
    .catch(err => console.error('Error loading notification history:', err));

    setupPushNotifications();
  }, [authView]);

  // Fetch muted chats list from PostgreSQL
  useEffect(() => {
    if (authView !== 'app') return;
    const token = sessionStorage.getItem('collabhub_token');
    fetch(`${SOCKET_URL}/api/notifications/muted`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data) {
        const mapping: {[chatId: string]: string} = {};
        for (const row of data.data) {
          mapping[row.conversation_id] = row.mute_until;
        }
        setMutedChats(mapping);
      }
    })
    .catch(err => console.error('Error fetching muted chats:', err));
  }, [authView]);

  // Toggle/submit mute status
  const handleMuteToggle = (chatId: string, duration: '8h' | '1w' | 'forever' | 'unmute') => {
    const token = sessionStorage.getItem('collabhub_token');
    const isUnmute = duration === 'unmute';
    const method = isUnmute ? 'DELETE' : 'POST';
    const url = `${SOCKET_URL}/api/notifications/mute/${chatId}`;

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: !isUnmute ? JSON.stringify({ duration }) : undefined
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setMutedChats(prev => {
          const next = { ...prev };
          if (isUnmute) {
            delete next[chatId];
          } else {
            next[chatId] = data.muteUntil;
          }
          return next;
        });
      }
    })
    .catch(err => console.error('Mute action failed:', err));
  };

  // 1.6. Listen to Service Worker message clicks
  useEffect(() => {
    const handleServiceWorkerMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'NAVIGATE_TO_CHAT') {
        const chatId = e.data.chatId;
        if (chatId) {
          handleSetActiveTab('chats');
          setSelectedChatId(chatId);
        }
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  // 1.7. Handle notification redirect query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('chatId');
    if (chatId) {
      handleSetActiveTab('chats');
      setSelectedChatId(chatId);
      window.history.replaceState({}, document.title, '/');
    }
  }, [authView]);

  // 1.8. Sync total unread counters to App Launcher Badge
  useEffect(() => {
    const totalUnreadChats = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
    const totalUnreadNotifs = notifications.filter(n => !n.is_read).length;
    const grandTotal = totalUnreadChats + totalUnreadNotifs;

    if ('setAppBadge' in navigator) {
      if (grandTotal > 0) {
        navigator.setAppBadge(grandTotal).catch(err => console.log('Badging error:', err));
      } else {
        navigator.clearAppBadge().catch(err => console.log('Badging error:', err));
      }
    }
  }, [chats, notifications]);

  const handleMarkAllNotificationsRead = () => {
    const token = sessionStorage.getItem('collabhub_token');
    fetch(`${SOCKET_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    })
    .catch(err => console.error(err));
  };

  const handleNotificationItemClick = (n: any) => {
    if (!n.is_read) {
      const token = sessionStorage.getItem('collabhub_token');
      fetch(`${SOCKET_URL}/api/notifications/${n.id}/read`, {
        method: 'PUT',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
        }
      })
      .catch(err => console.error(err));
    }

    if (n.chat_id) {
      setSelectedChatId(n.chat_id);
      handleSetActiveTab('chats');
    }
    setShowNotificationCenter(false);
  };

  const formatNotificationTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // 2. Fetch all user conversations from API
  const fetchChats = () => {
    const token = sessionStorage.getItem('collabhub_token');
    fetch(`${SOCKET_URL}/api/chats`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formattedChats = data.map((chat: any) => ({
            ...chat,
            lastMessageTime: new Date(chat.lastMessageTime),
            messages: [] // Will fetch messages on demand
          }));
          setChats(formattedChats);
        }
      })
      .catch(err => console.error('Error loading conversations:', err));
  };

  useEffect(() => {
    fetchChats();
  }, [currentUser.id]);

  // Debounced search query execution
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(() => {
      const token = sessionStorage.getItem('collabhub_token');
      fetch(`${SOCKET_URL}/api/chats/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSearchResults(data);
          } else {
            setSearchResults([]);
          }
        })
        .catch(err => {
          console.error('[Search] Failed search request:', err);
          setSearchResults([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Listen for escape key press to close search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch shared files from API when activeTab is 'files'
  useEffect(() => {
    if (activeTab === 'files' && authView === 'app') {
      const token = sessionStorage.getItem('collabhub_token');
      fetch(`${SOCKET_URL}/api/chats/shared-files`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.success && Array.isArray(data.files)) {
            setSharedFiles(data.files);
          }
        })
        .catch(err => console.error('Error fetching shared files:', err));
    }
  }, [activeTab, authView]);

  // 3. Join room and load message stream when conversation is selected
  useEffect(() => {
    if (!socket || !selectedChatId) return;

    // Join room
    socket.emit('join-chat', selectedChatId);

    // Notify server that messages in this room are now read by current user
    socket.emit('message-read', { conversationId: selectedChatId, userId: currentUser.id });

    // Fetch full messages from DB
    const token = sessionStorage.getItem('collabhub_token');
    fetch(`${SOCKET_URL}/api/chats/${selectedChatId}/messages`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include'
    })
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
      socket.emit('leave-chat', selectedChatId);
    };
  }, [socket, selectedChatId, currentUser.id]);

  // Synthesize a premium notification chime (two-tone bell sound)
  const playNotificationChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      // Tone 1: G5 (783.99 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      // Tone 2: C6 (1046.50 Hz) - slight offset
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.50, now + 0.08);
      gain2.gain.setValueAtTime(0.12, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc1.start(now);
      osc1.stop(now + 0.35);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.5);
    } catch (err) {
      console.warn('[Audio Alerts] Playback blocked or failed:', err);
    }
  };

  // 4. Listen to real-time incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message: any) => {
      // Play sound alert if enabled and not sent by self
      if (message.senderId !== currentUser.id && currentUser.soundEffectsAlert !== false) {
        playNotificationChime();
      }

      setChats(prevChats => prevChats.map(c => {
        if (c.id === message.conversationId) {
          const isSelected = selectedChatId === message.conversationId;
          
          // If this is an echo of our own optimistic message, replace it instead of duplicating
          const existingTempMsgIndex = c.messages.findIndex(m => m.id === message.tempId);
          let newMessages;

          const finalMessage = {
            id: message.id,
            senderId: message.senderId,
            senderName: message.senderName,
            senderAvatar: message.senderAvatar,
            content: message.content,
            timestamp: new Date(message.timestamp),
            status: message.status,
            attachment: message.attachment
          };

          if (existingTempMsgIndex !== -1) {
            newMessages = [...c.messages];
            newMessages[existingTempMsgIndex] = finalMessage;
          } else {
            newMessages = [...c.messages, finalMessage];
          }

          let lastMsgText = message.content;
          if (!lastMsgText && message.attachment) {
            lastMsgText = message.attachment.type.startsWith('image/') ? '📷 Image' : '📄 File';
          }

          return {
            ...c,
            messages: newMessages,
            lastMessage: c.type === 'group' ? `${message.senderName}: ${lastMsgText}` : lastMsgText,
            lastMessageTime: new Date(message.timestamp),
            unreadCount: isSelected || message.senderId === currentUser.id ? 0 : c.unreadCount + 1
          };
        }
        return c;
      }));

      // Emit delivery or read status to the server
      if (message.senderId !== currentUser.id) {
        if (selectedChatId === message.conversationId) {
          socket.emit('message-read', { conversationId: message.conversationId, userId: currentUser.id });
        } else {
          socket.emit('message-delivered', { messageId: message.id, conversationId: message.conversationId });
        }
      }
    };

    socket.on('message-received', handleIncomingMessage);

    return () => {
      socket.off('message-received', handleIncomingMessage);
    };
  }, [socket, selectedChatId, currentUser.id]);

  // 5. Send message via Socket connection
  const handleSendMessage = (content: string, attachment?: { name: string; type: string; size: number; data: string }) => {
    if (!selectedChatId) return;
    if (!content.trim() && !attachment) return;

    const contentTrimmed = content.trim();

    // 1. Optimistic UI Update: Instantly show the message on the frontend
    const temporaryMessageId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: temporaryMessageId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: contentTrimmed,
      timestamp: new Date(),
      status: 'sending' as const,
      attachment: attachment ? {
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        url: attachment.data // base64 string for local optimistic render
      } : undefined
    };

    let lastMsgText = contentTrimmed;
    if (!lastMsgText && attachment) {
      lastMsgText = attachment.type.startsWith('image/') ? '📷 Image' : '📄 File';
    }

    setChats(prevChats => prevChats.map(c => {
      if (c.id === selectedChatId) {
        return {
          ...c,
          messages: [...c.messages, optimisticMessage],
          lastMessage: lastMsgText,
          lastMessageTime: optimisticMessage.timestamp
        };
      }
      return c;
    }));

    // 2. Transmit to backend
    socket?.emit('send-message', {
      conversationId: selectedChatId,
      senderId: currentUser.id,
      content: contentTrimmed,
      tempId: temporaryMessageId, // Pass tempId so we can replace it later
      attachment: attachment ? {
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        data: attachment.data // base64 string
      } : undefined
    });
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  if (authView === 'landing') {
    return (
      <LandingPage 
        onLogin={() => handleSetAuthView('login')} 
        onSignUp={() => handleSetAuthView('signup')} 
      />
    );
  }

  if (authView === 'signup') {
    return (
      <SignUpPage 
        onLogin={() => handleSetAuthView('login')} 
        onSubmit={handleAuthSuccess} 
        onGoToLanding={() => handleSetAuthView('landing')}
      />
    );
  }

  if (authView === 'login') {
    return (
      <LoginPage 
        onSignUp={() => handleSetAuthView('signup')} 
        onSubmit={handleAuthSuccess} 
        onGoToLanding={() => handleSetAuthView('landing')}
      />
    );
  }

  return (
    <div className="size-full flex flex-col bg-surface overflow-hidden relative">
      {/* Dynamic In-App Neon Notification Banner Overlay */}
      {inAppNotificationToast && (
        <div 
          onClick={() => {
            if (inAppNotificationToast.chatId) {
              setSelectedChatId(inAppNotificationToast.chatId);
              handleSetActiveTab('chats');
            }
            setInAppNotificationToast(null);
          }}
          className="fixed top-6 right-6 w-[340px] p-md bg-slate-900/95 dark:bg-slate-950/95 border-l-4 border-primary text-white rounded-r-xl shadow-2xl flex items-start gap-md z-[100] cursor-pointer animate-slide-in hover:scale-105 active:scale-98 transition-all backdrop-blur-md"
        >
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0 uppercase select-none">
            {inAppNotificationToast.senderAvatar || 'CH'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label-md text-xs font-bold leading-tight truncate">{inAppNotificationToast.title}</p>
            <p className="font-body-md text-xs text-slate-300 leading-snug mt-xs truncate">{inAppNotificationToast.body}</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setInAppNotificationToast(null); }}
            className="material-symbols-outlined text-[18px] text-slate-400 hover:text-white cursor-pointer bg-transparent border-none"
          >
            close
          </button>
        </div>
      )}

      {/* TopNavBar */}
      <header className="h-[64px] w-full sticky top-0 z-40 bg-surface border-b border-outline-variant flex justify-between items-center px-lg flex-shrink-0">
        <div className="flex items-center gap-lg">
          <span className="font-headline-sm text-headline-sm font-black text-primary">CollabHub</span>
          <div className="hidden md:flex gap-md items-center">
            <button 
              onClick={() => handleSetActiveTab('chats')} 
              className={`hover:text-primary transition-colors font-label-md text-label-md cursor-pointer ${
                activeTab === 'chats' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant'
              }`}
            >
              Direct Messages
            </button>
            <button 
              onClick={() => handleSetActiveTab('chats')} 
              className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer"
            >
              Channels
            </button>
            <button 
              onClick={() => handleSetActiveTab('dashboard')} 
              className={`hover:text-primary transition-colors font-label-md text-label-md cursor-pointer ${
                activeTab === 'dashboard' ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
            >
              Archive
            </button>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button onClick={() => setShowSearchModal(true)} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">search</button>
          
          <div className="relative flex items-center">
            <button 
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="relative material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none focus:outline-none"
            >
              notifications
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-error text-white font-bold text-[9px] flex items-center justify-center animate-bounce">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>
            
            {showNotificationCenter && (
              <div className="absolute right-0 top-full mt-xs w-[320px] max-h-[400px] overflow-y-auto bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant dark:border-outline rounded-xl shadow-xl z-50 flex flex-col hide-scrollbar animate-fade-in">
                <div className="p-md border-b border-outline-variant/30 flex justify-between items-center bg-slate-50/55 dark:bg-slate-900/30 sticky top-0 backdrop-blur-sm z-10">
                  <span className="font-label-md text-label-md font-bold text-on-surface dark:text-white">Notifications</span>
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <button 
                      onClick={handleMarkAllNotificationsRead}
                      className="text-[11px] text-primary hover:underline font-bold bg-transparent border-none cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="divide-y divide-outline-variant/20">
                  {notifications.length === 0 ? (
                    <div className="p-xl text-center flex flex-col items-center gap-sm">
                      <span className="material-symbols-outlined text-[36px] text-outline-variant">notifications_off</span>
                      <p className="font-body-md text-xs text-on-surface-variant">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const timeStr = formatNotificationTime(n.created_at);
                      return (
                        <div 
                          key={n.id}
                          onClick={() => handleNotificationItemClick(n)}
                          className={`p-md flex gap-md items-start hover:bg-surface-container-low transition-colors cursor-pointer text-left ${!n.is_read ? 'bg-primary/5' : ''}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 select-none uppercase">
                            {n.sender_avatar && n.sender_avatar.length <= 2 ? n.sender_avatar : (n.sender_name || 'U').slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-label-md text-xs font-bold text-on-surface dark:text-white leading-tight truncate">{n.title}</p>
                            <p className="font-body-md text-xs text-on-surface-variant leading-snug mt-xs truncate">{n.body}</p>
                            <span className="text-[10px] text-on-surface-variant opacity-60 mt-xs block">{timeStr}</span>
                          </div>
                          {!n.is_read && (
                            <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

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
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center"
            >
              {getFullAvatarUrl(currentUser.avatar) ? (
                <img 
                  alt="My avatar" 
                  className="w-full h-full object-cover" 
                  src={getFullAvatarUrl(currentUser.avatar)!} 
                />
              ) : (
                <div className="w-full h-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center select-none uppercase">
                  {currentUser.avatar || 'CH'}
                </div>
              )}
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-outline-variant rounded-lg shadow-lg py-1 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-outline-variant/50">
                  <p className="text-sm font-bold text-on-surface truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-on-surface-variant truncate">{currentUser.email || currentUser.id}</p>
                </div>
                <button 
                  onClick={() => {
                    handleSetActiveTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-sm">settings</span>
                  Settings
                </button>
                <button 
                  onClick={() => {
                    handleLogout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-sm text-red-600">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* SideNavBar (Desktop sidebar navigation - hidden on chats view to increase screen workspace space!) */}
        {activeTab !== 'chats' && (
          <nav className="w-[280px] h-full hidden md:flex flex-col border-r border-outline-variant bg-surface py-lg flex-shrink-0 animate-fade-in">
            <div className="px-md mb-lg">
              <div className="flex items-center gap-md px-md mb-md">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold overflow-hidden">
                  {getFullAvatarUrl(currentUser.avatar) ? (
                    <img 
                      alt="My avatar" 
                      className="w-full h-full object-cover" 
                      src={getFullAvatarUrl(currentUser.avatar)!} 
                    />
                  ) : (
                    currentUser.avatar
                  )}
                </div>
                <div>
                  <p className="font-headline-sm text-headline-sm font-bold text-primary">{currentUser.name}</p>
                  <p className="font-body-md text-body-md text-outline opacity-70">Active now</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  handleSetActiveTab('chats');
                  setSelectedChatId(null);
                  setShowNewChatModal(true);
                }}
                className="w-full flex items-center justify-center gap-sm bg-primary hover:bg-primary/95 text-on-primary py-sm rounded-lg font-label-md text-label-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">add</span>
                new_message
              </button>
            </div>
            
            <div className="flex-1 space-y-unit px-sm">
              <button 
                onClick={() => handleSetActiveTab('chats')} 
                className={`w-full flex items-center gap-md px-md py-sm transition-colors rounded-lg font-label-md text-label-md cursor-pointer text-left ${
                  activeTab === 'chats' 
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined">chat</span> Chats
              </button>
              <button 
                onClick={() => handleSetActiveTab('dashboard')} 
                className={`w-full flex items-center gap-md px-md py-sm transition-colors rounded-lg font-label-md text-label-md cursor-pointer text-left ${
                  activeTab === 'dashboard' 
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined">dashboard</span> Dashboard
              </button>
              <button 
                onClick={() => handleSetActiveTab('files')} 
                className={`w-full flex items-center gap-md px-md py-sm transition-colors rounded-lg font-label-md text-label-md cursor-pointer text-left ${
                  activeTab === 'files' 
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined">folder_open</span> Files
              </button>
              <button 
                onClick={() => handleSetActiveTab('settings')} 
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
                onClick={handleLogout}
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
                setActiveTab={handleSetActiveTab}
                onRefreshChats={fetchChats}
                socket={socket}
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
                  onRefreshChats={fetchChats}
                  showNewChatModal={showNewChatModal}
                  setShowNewChatModal={setShowNewChatModal}
                  mutedChats={mutedChats}
                  onMuteToggle={handleMuteToggle}
                />
              </div>

              {/* Chat Window: Hidden on mobile until a chat is active */}
              <div className={`${selectedChatId ? 'flex' : 'hidden md:flex'} flex-1 h-full`}>
                <ChatWindow
                  chat={selectedChat}
                  currentUser={currentUser}
                  onSendMessage={handleSendMessage}
                  socket={socket}
                  onBack={() => setSelectedChatId(null)}
                />
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <main className="flex-1 overflow-y-auto p-lg bg-surface hide-scrollbar animate-fade-in">
              <header className="mb-xl">
                <h1 className="font-headline-lg text-headline-lg mb-xs font-black text-on-surface">Shared Files & Documents</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Access and manage all collaborative assets here.</p>
              </header>
              <div className="bg-white dark:bg-slate-900 border border-outline-variant rounded-xl p-lg shadow-sm space-y-md">
                {sharedFiles.length === 0 ? (
                  <div className="text-center py-xl">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-sm">folder_open</span>
                    <p className="font-body-md text-on-surface-variant">No shared files found in your conversations yet.</p>
                  </div>
                ) : (
                  sharedFiles.map((f) => {
                    const att = f.attachment;
                    if (!att) return null;
                    const isImg = att.type.startsWith('image/');
                    const iconName = isImg ? 'image' : 
                      att.type.includes('pdf') ? 'picture_as_pdf' :
                      att.type.includes('zip') || att.type.includes('rar') ? 'folder_zip' :
                      att.type.includes('spreadsheet') || att.type.includes('xlsx') || att.type.includes('csv') ? 'table_chart' :
                      'description';
                    
                    return (
                      <div key={f.id} className="flex items-start gap-md p-md border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                        <span className="material-symbols-outlined text-[32px] text-primary flex-shrink-0 mt-unit">{iconName}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-label-md text-label-md font-bold text-on-surface truncate">{att.name}</p>
                          <p className="text-xs text-on-surface-variant">
                            {isImg ? 'Image' : 'Document'} • {formatFileSize(att.size)} • Uploaded by {f.senderName} ({f.groupName || 'Direct Message'})
                          </p>
                          <div className="mt-sm flex gap-sm items-center">
                            <button 
                              onClick={() => window.open(`${SOCKET_URL}${att.url}`, '_blank')}
                              className="flex items-center gap-sm bg-primary/10 hover:bg-primary text-primary hover:text-white px-md py-1.5 rounded-full font-label-sm text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm border border-primary/20 w-fit border-none"
                            >
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                              Open File
                            </button>
                            <a 
                              href={`${SOCKET_URL}${att.url}`} 
                              download={att.name}
                              className="flex items-center gap-sm bg-primary/10 hover:bg-primary text-primary hover:text-white px-md py-1.5 rounded-full font-label-sm text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm border border-primary/20 w-fit no-underline"
                            >
                              <span className="material-symbols-outlined text-[14px]">download</span>
                              Download File
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </main>
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              currentUser={currentUser} 
              deferredPrompt={deferredPrompt}
              onClearPrompt={() => setDeferredPrompt(null)}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
                localStorage.setItem('collabhub_user', JSON.stringify(updated));

                // Persist changes to PostgreSQL database
                const token = sessionStorage.getItem('collabhub_token');
                fetch(`${SOCKET_URL}/api/auth/profile`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                  },
                  body: JSON.stringify({ 
                    name: updated.name,
                    username: updated.username,
                    bio: updated.bio,
                    theme: updated.theme,
                    accentColor: updated.accentColor,
                    fontSize: updated.fontSize,
                    newMessagesAlert: updated.newMessagesAlert,
                    mentionsOnlyAlert: updated.mentionsOnlyAlert,
                    soundEffectsAlert: updated.soundEffectsAlert,
                    avatar: updated.avatar
                  }),
                  credentials: 'include'
                })
                .then(res => {
                  if (!res.ok) throw new Error('Failed to update profile on server');
                  return res.json();
                })
                .then(data => {
                  if (data.success && data.user) {
                    setCurrentUser(data.user);
                    sessionStorage.setItem('collabhub_user', JSON.stringify(data.user));
                  }
                })
                .catch(err => console.error('[Profile Update] Error syncing to database:', err));
              }} 
              onLogout={handleLogout} 
            />
          )}
        </div>
      </div>

      {/* Contextual FAB (Only on Home/Dashboard/Chats view when no focused chat detail is active on mobile) */}
      {!selectedChatId && (
        <button 
          onClick={() => {
            handleSetActiveTab('chats');
            setSelectedChatId(null);
            setShowNewChatModal(true);
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
            onClick={() => handleSetActiveTab('chats')}
            className={`flex flex-col items-center justify-center tap-highlight-transparent cursor-pointer p-xs rounded-lg ${
              activeTab === 'chats' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'chats' ? "'FILL' 1" : "'FILL' 0" }}>chat</span>
            <span className="font-label-sm text-label-sm">Chat</span>
          </button>
          <button 
            onClick={() => handleSetActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center tap-highlight-transparent cursor-pointer p-xs rounded-lg ${
              activeTab === 'dashboard' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
            <span className="font-label-sm text-label-sm">Home</span>
          </button>
          <button 
            onClick={() => handleSetActiveTab('files')}
            className={`flex flex-col items-center justify-center tap-highlight-transparent cursor-pointer p-xs rounded-lg ${
              activeTab === 'files' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'files' ? "'FILL' 1" : "'FILL' 0" }}>folder</span>
            <span className="font-label-sm text-label-sm">Files</span>
          </button>
          <button 
            onClick={() => handleSetActiveTab('settings')}
            className={`flex flex-col items-center justify-center tap-highlight-transparent cursor-pointer p-xs rounded-lg ${
              activeTab === 'settings' ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
            <span className="font-label-sm text-label-sm">Profile</span>
          </button>
        </nav>
      )}

      {/* Premium Search Overlay Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-md">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSearchModal(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white/70 dark:bg-slate-900/75 backdrop-blur-xl border border-outline-variant/50 rounded-2xl shadow-2xl flex flex-col max-h-[75vh] overflow-hidden animate-fade-in text-on-surface">
            {/* Search Input Box */}
            <div className="p-lg border-b border-outline-variant/30 flex items-center gap-md">
              <span className="material-symbols-outlined text-on-surface-variant text-[24px]">search</span>
              <input
                type="text"
                placeholder="Search messages (e.g. from:Jamali has:file details)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-base outline-none text-on-surface placeholder:text-outline-variant"
                autoFocus
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-on-surface-variant hover:text-on-surface border-none bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
              <button 
                onClick={() => setShowSearchModal(false)}
                className="text-xs px-sm py-1 bg-surface-container hover:bg-surface-container-high rounded border border-outline-variant/20 font-bold transition-all text-on-surface-variant text-on-surface hover:text-on-surface cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Suggestion / Filter helpers */}
            <div className="px-lg py-sm bg-surface-container-lowest/50 border-b border-outline-variant/20 flex gap-sm items-center overflow-x-auto hide-scrollbar select-none">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant opacity-70 tracking-wider flex-shrink-0">Filters:</span>
              <button
                onClick={() => setSearchQuery(q => q.includes('has:file') ? q : `${q} has:file `.trimStart())}
                className="flex items-center gap-xs px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold transition-all border border-primary/20 cursor-pointer w-fit"
              >
                <span className="material-symbols-outlined text-[12px]">attachment</span>
                has:file
              </button>
              <button
                onClick={() => setSearchQuery(q => q.includes('from:') ? q : `${q} from: `.trimStart())}
                className="flex items-center gap-xs px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold transition-all border border-primary/20 cursor-pointer w-fit"
              >
                <span className="material-symbols-outlined text-[12px]">person</span>
                from:username
              </button>
            </div>

            {/* Results Stream */}
            <div className="flex-1 overflow-y-auto p-md space-y-sm max-h-[50vh]">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-xl gap-sm">
                  <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
                  <p className="text-sm text-on-surface-variant font-medium">Searching archive logs...</p>
                </div>
              ) : !searchQuery.trim() ? (
                <div className="text-center py-xl text-on-surface-variant space-y-md">
                  <span className="material-symbols-outlined text-[48px] opacity-40">find_in_page</span>
                  <div className="max-w-md mx-auto px-lg">
                    <p className="font-bold text-sm">Instant Log Search</p>
                    <p className="text-xs opacity-70 mt-xs">Search through all your chat history. Mix filters for targeted search results, like <code className="bg-surface-container px-1 py-0.5 rounded font-mono text-[11px]">from:Neema sprint</code> or <code className="bg-surface-container px-1 py-0.5 rounded font-mono text-[11px]">has:file presentation</code>.</p>
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-xl text-on-surface-variant space-y-md">
                  <span className="material-symbols-outlined text-[48px] opacity-40">search_off</span>
                  <div>
                    <p className="font-bold text-sm">No matching messages found</p>
                    <p className="text-xs opacity-70 mt-xs">Try adjusting your filters or search terms.</p>
                  </div>
                </div>
              ) : (
                searchResults.map(res => {
                  const formattedTime = new Date(res.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  });
                  const isGroup = res.chatType === 'group';
                  const chatName = isGroup ? res.groupName : res.senderName;
                  const avatarLetter = (res.senderAvatar || res.senderName || 'U').substring(0, 2).toUpperCase();
                  
                  // Helper to highlight matches
                  const highlightText = (text: string, search: string) => {
                    if (!search || !search.trim()) return text;
                    const highlightQuery = search
                      .replace(/from:(?:"[^"]+"|\S+)/gi, '')
                      .replace(/has:file/gi, '')
                      .trim();
                    
                    if (!highlightQuery) return text;
                    
                    const parts = text.split(new RegExp(`(${highlightQuery})`, 'gi'));
                    return (
                      <span>
                        {parts.map((part, i) => 
                          part.toLowerCase() === highlightQuery.toLowerCase() ? (
                            <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/60 text-on-surface font-semibold px-0.5 rounded">
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        )}
                      </span>
                    );
                  };

                  const handleSelectSearchResult = (conversationId: string) => {
                    setSelectedChatId(conversationId);
                    handleSetActiveTab('chats');
                    setShowSearchModal(false);
                    setSearchQuery('');
                  };

                  return (
                    <div
                      key={res.id}
                      onClick={() => handleSelectSearchResult(res.conversationId)}
                      className="flex gap-md items-start p-md rounded-xl hover:bg-surface-container-low transition-all border border-outline-variant/10 hover:border-outline-variant/50 cursor-pointer shadow-sm hover:shadow-md text-left"
                    >
                      {/* Sender Avatar */}
                      <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {avatarLetter}
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-sm">
                          <div className="flex items-center gap-xs min-w-0">
                            <span className="font-bold text-sm text-on-surface truncate">{res.senderName}</span>
                            <span className="text-[10px] text-on-surface-variant opacity-70">
                              {res.senderUsername ? `@${res.senderUsername}` : ''}
                            </span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant flex-shrink-0">{formattedTime}</span>
                        </div>

                        <p className="font-body-md text-sm text-on-surface-variant mt-xs line-clamp-2 break-words">
                          {highlightText(res.content, searchQuery)}
                        </p>

                        {/* Attachment badge */}
                        {res.attachment && (
                          <div className="mt-sm flex items-center gap-xs px-2.5 py-1 rounded bg-surface-container w-fit border border-outline-variant/20">
                            <span className="material-symbols-outlined text-[14px] text-primary">
                              {res.attachment.type.startsWith('image/') ? 'image' : 'description'}
                            </span>
                            <span className="text-[11px] text-on-surface-variant font-bold truncate max-w-xs font-mono">
                              {res.attachment.name}
                            </span>
                          </div>
                        )}

                        {/* Chat Context Badge */}
                        <div className="mt-sm flex items-center gap-xs text-[10px] font-bold text-primary">
                          <span className="material-symbols-outlined text-[12px]">{isGroup ? 'groups' : 'chat'}</span>
                          <span>{isGroup ? `#${chatName}` : `@${chatName}`}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}