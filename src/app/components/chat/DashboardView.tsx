import { useState, useEffect } from 'react';
import type { User, Chat } from '../../App';
import { SOCKET_URL } from '../../App';

interface DashboardViewProps {
  currentUser: User;
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
  setActiveTab: (tab: 'chats' | 'dashboard' | 'files' | 'settings') => void;
  onRefreshChats?: () => void;
  socket?: any;
}

export function DashboardView({
  currentUser,
  chats,
  onSelectChat,
  setActiveTab,
  onRefreshChats,
  socket
}: DashboardViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredActivity = recentActivity.filter(act => 
    act.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (act.groupName && act.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to resolve high-res premium avatars
  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return null;
    if (avatar.startsWith('data:image/') || avatar.startsWith('http')) {
      return avatar;
    }
    if (avatar.startsWith('/uploads/')) {
      return `${SOCKET_URL}${avatar}`;
    }
    switch (avatar) {
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

  // 1. Fetch directory users on mount
  useEffect(() => {
    setIsLoadingUsers(true);
    const token = sessionStorage.getItem('collabhub_token');
    fetch(`${SOCKET_URL}/api/auth/users`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      })
      .catch(err => console.error('[Dashboard] Error loading active directory:', err))
      .finally(() => setIsLoadingUsers(false));
  }, []);

  // 2. Fetch recent activities
  const fetchRecentActivity = () => {
    setIsLoadingActivity(true);
    const token = sessionStorage.getItem('collabhub_token');
    fetch(`${SOCKET_URL}/api/chats/recent-activity`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.activity)) {
          setRecentActivity(data.activity);
        }
      })
      .catch(err => console.error('[Dashboard] Error loading activity feed:', err))
      .finally(() => setIsLoadingActivity(false));
  };

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  // 3. Listen to Socket events (Presence + Real-Time Activity triggers)
  useEffect(() => {
    if (!socket) return;

    const handlePresenceChange = (data: { userId: string; status: 'online' | 'offline' | 'away' }) => {
      setUsers(prev => prev.map(u => {
        if (u.id === data.userId) {
          return { ...u, status: data.status };
        }
        return u;
      }));
    };

    const handleMessageReceived = () => {
      fetchRecentActivity(); // Automatically refresh activity feed on new message
    };

    socket.on('user-presence-changed', handlePresenceChange);
    socket.on('message-received', handleMessageReceived);

    return () => {
      socket.off('user-presence-changed', handlePresenceChange);
      socket.off('message-received', handleMessageReceived);
    };
  }, [socket]);

  const handleQuickChat = async (targetUserId: string) => {
    // First, check if the target is already a conversation ID (like 'g2' for a group)
    let existingChat = chats.find(c => c.id === targetUserId);
    
    // Otherwise, check if we already have an existing direct conversation with this user ID
    if (!existingChat) {
      existingChat = chats.find(c => c.type === 'direct' && c.user?.id === targetUserId);
    }
    
    if (existingChat) {
      onSelectChat(existingChat.id);
      setActiveTab('chats');
    } else {
      if (targetUserId.startsWith('g')) {
        alert("You are not a member of this group channel.");
        return;
      }
      // Create a new direct message channel
      try {
        const token = sessionStorage.getItem('collabhub_token');
        const res = await fetch(`${SOCKET_URL}/api/chats`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          credentials: 'include',
          body: JSON.stringify({
            type: 'direct',
            members: [targetUserId]
          })
        });
        const data = await res.json();
        if (data.success) {
          if (onRefreshChats) onRefreshChats();
          onSelectChat(data.conversationId);
          setActiveTab('chats');
        }
      } catch (err) {
        console.error('Failed to start quick chat:', err);
      }
    }
  };

  // Calculate dynamic Sprint Progress metrics
  // Total chats out of a target goal of 10 chats started
  const targetChats = 10;
  const progressPercent = Math.min(100, Math.round((chats.length / targetChats) * 100));
  const chatsRemaining = Math.max(0, targetChats - chats.length);

  return (
    <main className="flex-1 overflow-y-auto p-lg bg-surface hide-scrollbar h-full">
      <header className="mb-xl flex flex-col md:flex-row md:items-center md:justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg mb-xs font-black text-on-surface">Welcome back, {currentUser.name}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Here is a snapshot of your team's activity today.</p>
        </div>
        {/* Dynamic Search Bento Controller */}
        <div className="relative w-full md:w-80 flex-shrink-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search members, messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline-variant text-on-surface"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-lg pb-24 md:pb-6">
        
        {/* Active Team Members Bento (Dynamic) */}
        <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Active Team Members</h2>
            <button className="text-primary font-label-md text-label-md hover:underline cursor-pointer" onClick={() => setActiveTab('chats')}>View Directory</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
            {isLoadingUsers ? (
              <div className="col-span-4 flex justify-center py-lg">
                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="col-span-4 text-center text-sm text-on-surface-variant py-md">No matching team members found.</p>
            ) : (
              filteredUsers.slice(0, 8).map(user => {
                const isOnline = user.status === 'online';
                const isAway = user.status === 'away';
                const statusDotColor = isOnline ? 'bg-green-500' : isAway ? 'bg-orange-400' : 'bg-slate-400';
                const img = getAvatarUrl(user.avatar);

                return (
                  <div 
                    key={user.id}
                    onClick={() => handleQuickChat(user.id)}
                    className="p-md bg-surface-container-low rounded-lg border border-outline-variant flex flex-col items-center text-center transition-all hover:border-primary cursor-pointer hover:scale-[1.03]"
                  >
                    <div className="relative mb-sm">
                      {img ? (
                        <img alt={`${user.name} profile`} className="w-16 h-16 rounded-full object-cover" src={img} />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg select-none">
                          {user.avatar}
                        </div>
                      )}
                      <span className={`absolute bottom-0 right-0 w-4 h-4 ${statusDotColor} border-2 border-surface-container-low rounded-full`}></span>
                    </div>
                    <h3 className="font-label-md text-label-md font-bold text-on-surface truncate w-full">{user.name}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate w-full">{user.bio || 'Team Member'}</p>
                    <span className={`mt-sm px-sm py-[2px] rounded-full text-[10px] font-bold uppercase ${
                      isOnline ? 'bg-green-100 text-green-700' : isAway ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Shared Files (Dynamic Links Tab) */}
        <section className="col-span-12 lg:col-span-4 bg-primary text-on-primary rounded-xl p-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold mb-lg">Shared Files</h2>
            <div className="space-y-md">
              <div className="flex items-center gap-md bg-white/10 p-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer" onClick={() => setActiveTab('files')}>
                <span className="material-symbols-outlined text-white">description</span>
                <div className="overflow-hidden">
                  <p className="font-label-md text-label-md truncate">Project_Brief_v2.pdf</p>
                  <p className="text-[10px] opacity-70">Uploaded by Fatuma • 2h ago</p>
                </div>
              </div>
              <div className="flex items-center gap-md bg-white/10 p-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer" onClick={() => setActiveTab('files')}>
                <span className="material-symbols-outlined text-white">image</span>
                <div className="overflow-hidden">
                  <p className="font-label-md text-label-md truncate">landing_page_wireframe.png</p>
                  <p className="text-[10px] opacity-70">Uploaded by Neema • 5h ago</p>
                </div>
              </div>
              <div className="flex items-center gap-md bg-white/10 p-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer" onClick={() => setActiveTab('files')}>
                <span className="material-symbols-outlined text-white">table_chart</span>
                <div className="overflow-hidden">
                  <p className="font-label-md text-label-md truncate">budget_planning_Q4.xlsx</p>
                  <p className="text-[10px] opacity-70">Uploaded by Jamali • Yesterday</p>
                </div>
              </div>
            </div>
          </div>
          <button className="mt-lg w-full bg-white text-primary py-sm rounded-lg font-label-md text-label-md hover:bg-white/90 transition-colors cursor-pointer" onClick={() => setActiveTab('files')}>View All Files</button>
        </section>

        {/* Recent Message Activity Bento (Dynamic DB Query) */}
        <section className="col-span-12 bg-white dark:bg-card border border-outline-variant dark:border-border rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Recent Message Activity</h2>
            <button 
              onClick={fetchRecentActivity}
              className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-all active:rotate-180 duration-300"
              title="Refresh Activity"
            >
              refresh
            </button>
          </div>
          <div className="space-y-md">
            {isLoadingActivity ? (
              <div className="flex justify-center py-lg">
                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              </div>
            ) : filteredActivity.length === 0 ? (
              <p className="text-center text-sm text-on-surface-variant py-md">No matching message activity found.</p>
            ) : (
              filteredActivity.map(act => {
                const img = getAvatarUrl(act.senderAvatar);
                const isGroup = act.chatType === 'group';
                const formattedTime = new Date(act.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });

                return (
                  <div 
                    key={act.id}
                    onClick={() => handleQuickChat(isGroup ? act.conversationId : act.senderId)}
                    className="flex gap-md items-start p-md rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30"
                  >
                    {img ? (
                      <img alt={act.senderName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" src={img} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {act.senderAvatar}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-label-md text-label-md font-bold text-on-surface">{act.senderName}</h4>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">{formattedTime}</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-xs line-clamp-2">{act.content}</p>
                      <div className="mt-sm flex gap-sm">
                        <span className="px-sm py-1 bg-surface-container rounded-full text-[11px] text-primary font-medium">
                          {isGroup ? `#${act.groupName.toLowerCase().replace(/\s+/g, '-')}` : `@${act.senderName.toLowerCase()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Dynamic Sprint Progress Card */}
        <section className="col-span-12 md:col-span-6 bg-surface-container-high rounded-xl p-lg border border-outline-variant shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <h3 className="font-label-md text-label-md font-bold mb-md uppercase tracking-wider opacity-60 text-on-surface">Sprint Progress</h3>
          <div className="flex items-end gap-lg">
            <div className="flex-1">
              <p className="font-headline-lg text-headline-lg font-black text-on-surface">{progressPercent}%</p>
              <div className="w-full bg-surface-container-lowest h-2 rounded-full mt-sm overflow-hidden">
                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {chatsRemaining > 0 ? `${chatsRemaining} chats left to open` : "All chats started!"}
              </p>
            </div>
          </div>
        </section>

        {/* Decorative Bento */}
        <div className="col-span-12 md:col-span-6 h-[180px] rounded-xl overflow-hidden border border-outline-variant relative group shadow-sm">
          <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-Hi-WDxbuMaoovsTfYeHmBBMrHnOVlZ8RJeF5oWhFofpV8NPhS708ze5g5bL1raFmZ5OxEZ-7F1t-1rif5ahZbogVp36LZTH5sVXLbKbQInl1KKBuQaOGEyFtM0i4uLGA4qA7W1xTvmMEnZJ6ChFCJ9Yxvf1tpGlQJQip2q9EnrLVszUSgfJFzxU_VGoBNuLaR6oVtGZn3ligk8vL3FaOwffQqDrO_Jomvnv_xXbOhbue6iwHCIv_WVC62mErm-dhZJ_F0QTW_yhC" alt="Workspace design" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-md">
            <p className="text-white font-label-md text-label-md">Main Office - Building A</p>
          </div>
        </div>
      </div>
    </main>
  );
}
