import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChatListItem } from './ChatListItem';
import type { User, Chat } from '../../App';
import { SOCKET_URL } from '../../App';


interface SidebarProps {
  currentUser: User;
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onRefreshChats: () => void;
  showNewChatModal: boolean;
  setShowNewChatModal: (show: boolean) => void;
}

export function Sidebar({
  currentUser,
  chats,
  selectedChatId,
  onSelectChat,
  onRefreshChats,
  showNewChatModal,
  setShowNewChatModal
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryUsers, setDirectoryUsers] = useState<User[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);

  // Group creation state variables
  const [modalTab, setModalTab] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [isPrivateGroup, setIsPrivateGroup] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<Set<string>>(new Set());
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  // DM filtering/sorting/searching state variables
  const [dmSearchQuery, setDmSearchQuery] = useState('');
  const [dmSortOrder, setDmSortOrder] = useState<'name-asc' | 'name-desc' | 'status'>('status');
  const [dmFilterRole, setDmFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [dmFilterStatus, setDmFilterStatus] = useState<'all' | 'online' | 'offline' | 'away'>('all');

  // Fetch company directory when modal opens
  useEffect(() => {
    if (showNewChatModal) {
      setIsLoadingDirectory(true);
      const token = sessionStorage.getItem('collabhub_token');
      fetch(`${SOCKET_URL}/api/auth/users`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setDirectoryUsers(data.users);
          }
        })
        .catch(err => console.error('Failed to load directory:', err))
        .finally(() => setIsLoadingDirectory(false));
    }
  }, [showNewChatModal]);

  const handleStartDirectMessage = async (userId: string) => {
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
          members: [userId]
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowNewChatModal(false);
        onRefreshChats(); // Ask App.tsx to reload the chats
        setTimeout(() => {
          onSelectChat(data.conversationId);
        }, 500); // Give the refresh a split second
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

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
          type: 'group',
          groupName: groupName.trim(),
          groupAvatar: groupAvatar.trim() || undefined,
          isPrivate: isPrivateGroup,
          members: Array.from(selectedGroupMembers)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowNewChatModal(false);
        setGroupName('');
        setGroupAvatar('');
        setIsPrivateGroup(false);
        setSelectedGroupMembers(new Set());
        setModalTab('direct');
        onRefreshChats(); // Ask App.tsx to reload the chats
        setTimeout(() => {
          onSelectChat(data.conversationId);
        }, 500); // Give the refresh a split second
      } else {
        alert(data.message || 'Failed to create group channel.');
      }
    } catch (err) {
      console.error('Failed to create group:', err);
      alert('Connection error occurred.');
    }
  };

  const filteredChats = chats.filter(chat => {
    const name = chat.type === 'group' ? chat.group!.name : chat.user!.name;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return hours > 0 ? `${hours}h ago` : `${minutes}m ago`;
    }

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

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

  // Find unique other users to show in the active status list
  const activeContacts = chats
    .map(c => c.user)
    .filter((u): u is User => !!u);

  return (
    <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header and Quick Stories */}
      <div className="px-md pt-lg pb-md border-b border-slate-200">
        <div className="flex justify-between items-end mb-md">
          <h2 className="font-headline-md text-headline-md text-on-surface">Messages</h2>
          <button 
            onClick={() => setShowNewChatModal(true)}
            className="bg-primary hover:bg-primary/95 text-on-primary px-md py-sm rounded-lg flex items-center gap-xs shadow-sm active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span className="font-label-md text-label-md">New</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative mb-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Story Style active status */}
        <div className="flex gap-md overflow-x-auto hide-scrollbar py-sm">
          {/* Current User status story */}
          <div className="flex flex-col items-center gap-xs flex-shrink-0">
            <div className="w-14 h-14 rounded-full border-2 border-primary p-0.5 overflow-hidden">
              {getAvatarUrl(currentUser.avatar) ? (
                <div className="w-full h-full rounded-full overflow-hidden relative">
                   <img className="w-full h-full object-cover" src={getAvatarUrl(currentUser.avatar)!} alt={currentUser.name} />
                   <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center relative font-bold text-sm text-primary">
                  {currentUser.avatar}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              )}
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Your status</span>
          </div>

          {/* Active Contacts Stories */}
          {activeContacts.map(contact => {
            const contactChat = chats.find(c => c.user?.id === contact.id);
            const isOnline = contact.status === 'online' || contact.status === 'away';
            const statusDotColor = contact.status === 'online' ? 'bg-green-500' : 'bg-orange-400';
            const img = getAvatarUrl(contact.avatar);
            
            return (
              <div 
                key={contact.id} 
                onClick={() => contactChat && onSelectChat(contactChat.id)}
                className="flex flex-col items-center gap-xs flex-shrink-0 cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-full border-2 ${isOnline ? 'border-primary' : 'border-outline-variant'} p-0.5 group-hover:scale-105 transition-transform`}>
                  {img ? (
                    <img className="w-full h-full rounded-full object-cover" src={img} alt={contact.name} />
                  ) : (
                    <div className="w-full h-full rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">
                      {contact.avatar}
                    </div>
                  )}
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{contact.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-md space-y-sm bg-slate-50/30 hide-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            No conversations found
          </div>
        ) : (
          <div className="space-y-sm">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={chat.id === selectedChatId}
                onClick={() => onSelectChat(chat.id)}
                timeAgo={getTimeAgo(chat.lastMessageTime)}
              />
            ))}
          </div>
        )}
      </div>

      {/* NEW CHAT MODAL */}
      {showNewChatModal && createPortal(
        (() => {
          const canCreateGroup = currentUser.role === 'admin';
          const availableUsers = directoryUsers.filter(u => u.id !== currentUser.id);

          // Apply search, filters, and sort to availableUsers for the DM tab
          const filteredDMs = availableUsers
            .filter(u => {
              // Search Query
              const query = dmSearchQuery.toLowerCase();
              const matchesQuery = u.name.toLowerCase().includes(query) || (u.email && u.email.toLowerCase().includes(query));
              
              // Role Filter
              const matchesRole = dmFilterRole === 'all' || u.role === dmFilterRole;
              
              // Status Filter
              const matchesStatus = dmFilterStatus === 'all' || u.status === dmFilterStatus;
              
              return matchesQuery && matchesRole && matchesStatus;
            })
            .sort((a, b) => {
              if (dmSortOrder === 'name-asc') {
                return a.name.localeCompare(b.name);
              }
              if (dmSortOrder === 'name-desc') {
                return b.name.localeCompare(a.name);
              }
              if (dmSortOrder === 'status') {
                // Online first, then away, then offline
                const statusWeight = { online: 3, away: 2, offline: 1 };
                const weightA = statusWeight[a.status] || 1;
                const weightB = statusWeight[b.status] || 1;
                if (weightA !== weightB) return weightB - weightA;
                return a.name.localeCompare(b.name);
              }
              return 0;
            });
          const filteredDirectoryUsers = availableUsers.filter(u => 
            u.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) || 
            (u.email && u.email.toLowerCase().includes(groupSearchQuery.toLowerCase()))
          );

          return (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                zIndex: 9999
              }}
            >
              {/* Backdrop */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowNewChatModal(false);
                  setModalTab('direct');
                  setGroupName('');
                  setGroupAvatar('');
                  setIsPrivateGroup(false);
                  setSelectedGroupMembers(new Set());
                  setGroupSearchQuery('');
                }}
              ></div>

              {/* Modal Container */}
              <div 
                style={{
                  position: 'relative',
                  zIndex: 10,
                  width: '100%',
                  maxWidth: '448px',
                  maxHeight: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #c3c5d9'
                }}
                className="bg-surface border-outline-variant"
              >
                <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low flex-shrink-0">
                  <h3 className="font-headline-sm text-headline-sm font-bold">Start a New Chat</h3>
                  <button 
                    onClick={() => {
                      setShowNewChatModal(false);
                      setModalTab('direct');
                      setGroupName('');
                      setGroupAvatar('');
                      setIsPrivateGroup(false);
                      setSelectedGroupMembers(new Set());
                      setGroupSearchQuery('');
                    }}
                    className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                {canCreateGroup && (
                  <div className="flex border-b border-outline-variant bg-surface-container-lowest flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setModalTab('direct')}
                      className={`flex-1 py-2.5 text-center text-xs font-bold transition-all cursor-pointer ${
                        modalTab === 'direct' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant opacity-60 hover:opacity-100'
                      }`}
                    >
                      Direct Message
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalTab('group')}
                      className={`flex-1 py-2.5 text-center text-xs font-bold transition-all cursor-pointer ${
                        modalTab === 'group' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant opacity-60 hover:opacity-100'
                      }`}
                    >
                      Group Channel
                    </button>
                  </div>
                )}
                
                <div className="p-md overflow-y-auto flex-1 hide-scrollbar flex flex-col">
                  {isLoadingDirectory ? (
                    <div className="flex justify-center p-xl">
                      <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
                    </div>
                  ) : modalTab === 'group' && canCreateGroup ? (
                    <form onSubmit={handleCreateGroup} className="space-y-md flex-1">
                      <div className="space-y-xs">
                        <label htmlFor="group-name" className="block text-xs font-bold text-on-surface-variant">Group Name</label>
                        <input
                          type="text"
                          id="group-name"
                          required
                          placeholder="e.g. Frontend Devs"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none text-on-surface"
                        />
                      </div>
                      <div className="space-y-xs">
                        <label htmlFor="group-avatar" className="block text-xs font-bold text-on-surface-variant">Group Avatar Initials (e.g. FD)</label>
                        <input
                          type="text"
                          id="group-avatar"
                          placeholder="e.g. FD"
                          maxLength={3}
                          value={groupAvatar}
                          onChange={(e) => setGroupAvatar(e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none text-on-surface"
                        />
                      </div>
                      <div className="flex items-center gap-sm py-xs">
                        <input
                          type="checkbox"
                          id="group-is-private"
                          checked={isPrivateGroup}
                          onChange={(e) => setIsPrivateGroup(e.target.checked)}
                          className="rounded text-primary focus:ring-primary h-4 w-4 bg-surface border-outline-variant cursor-pointer"
                        />
                        <label htmlFor="group-is-private" className="text-xs font-bold text-on-surface-variant cursor-pointer select-none">Private Channel (invitation only)</label>
                      </div>

                      <div className="space-y-xs border-t border-outline-variant pt-sm flex-1 flex flex-col min-h-0">
                        <label className="block text-xs font-bold text-on-surface-variant mb-xs">Select Channel Members</label>
                        
                        {/* Mini Search */}
                        <div className="relative mb-xs">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[16px]">search</span>
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={groupSearchQuery}
                            onChange={(e) => setGroupSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none text-on-surface"
                          />
                        </div>

                        <div className="border border-outline-variant rounded-lg bg-surface max-h-[140px] overflow-y-auto p-sm space-y-sm">
                          {filteredDirectoryUsers.length === 0 ? (
                            <p className="text-center text-xs text-outline py-sm">No members found.</p>
                          ) : (
                            filteredDirectoryUsers.map(user => {
                              const isChecked = selectedGroupMembers.has(user.id);
                              return (
                                <div key={user.id} className="flex items-center justify-between p-xs hover:bg-slate-50 rounded transition-all">
                                  <div className="flex items-center gap-sm">
                                    <input
                                      type="checkbox"
                                      id={`chk-grp-${user.id}`}
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const next = new Set(selectedGroupMembers);
                                        if (e.target.checked) {
                                          next.add(user.id);
                                        } else {
                                          next.delete(user.id);
                                        }
                                        setSelectedGroupMembers(next);
                                      }}
                                      className="rounded text-primary focus:ring-primary h-4 w-4 bg-surface border-outline-variant cursor-pointer"
                                    />
                                    <label htmlFor={`chk-grp-${user.id}`} className="text-xs text-on-surface cursor-pointer select-none flex items-center gap-xs">
                                      <span className="font-bold">{user.name}</span>
                                      <span className="text-outline text-[9px]">({user.email})</span>
                                    </label>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-md pt-md border-t border-outline-variant flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewChatModal(false);
                            setModalTab('direct');
                            setGroupName('');
                            setGroupAvatar('');
                            setIsPrivateGroup(false);
                            setSelectedGroupMembers(new Set());
                            setGroupSearchQuery('');
                          }}
                          className="px-md py-1.5 text-xs hover:bg-surface-container rounded-lg cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-lg py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/95 font-bold cursor-pointer transition-all"
                        >
                          Create Channel
                        </button>
                      </div>
                    </form>
                  ) : availableUsers.length === 0 ? (
                    <div className="text-center p-xl text-on-surface-variant">
                      No other users found in the directory.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-sm flex-1 min-h-0">
                      {/* Search, Filter & Sort Toolbar */}
                      <div className="space-y-xs pb-sm border-b border-outline-variant/30 flex-shrink-0">
                        {/* Search Input */}
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[16px]">search</span>
                          <input
                            type="text"
                            placeholder="Search directory by name/email..."
                            value={dmSearchQuery}
                            onChange={(e) => setDmSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none text-on-surface"
                          />
                        </div>
                        {/* Dropdowns */}
                        <div className="flex gap-xs mt-xs">
                          <select
                            value={dmFilterRole}
                            onChange={(e: any) => setDmFilterRole(e.target.value)}
                            className="flex-1 px-1.5 py-1 bg-surface border border-outline-variant rounded-lg text-[10px] text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="all">All Roles</option>
                            <option value="admin">Admins Only</option>
                            <option value="user">Users Only</option>
                          </select>
                          <select
                            value={dmFilterStatus}
                            onChange={(e: any) => setDmFilterStatus(e.target.value)}
                            className="flex-1 px-1.5 py-1 bg-surface border border-outline-variant rounded-lg text-[10px] text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="all">All Statuses</option>
                            <option value="online">Online</option>
                            <option value="away">Away</option>
                            <option value="offline">Offline</option>
                          </select>
                          <select
                            value={dmSortOrder}
                            onChange={(e: any) => setDmSortOrder(e.target.value)}
                            className="flex-1 px-1.5 py-1 bg-surface border border-outline-variant rounded-lg text-[10px] text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="status">Status First</option>
                            <option value="name-asc">Name A-Z</option>
                            <option value="name-desc">Name Z-A</option>
                          </select>
                        </div>
                      </div>

                      {/* Scrollable List */}
                      <div className="flex-1 overflow-y-auto space-y-sm max-h-[160px] pr-xs mt-sm hide-scrollbar">
                        {filteredDMs.length === 0 ? (
                          <div className="text-center py-lg text-xs text-on-surface-variant/60">
                            No matching contacts found.
                          </div>
                        ) : (
                          filteredDMs.map(user => (
                            <div 
                              key={user.id}
                              onClick={() => handleStartDirectMessage(user.id)}
                              className="flex items-center gap-md p-md bg-surface-container-lowest hover:bg-surface-container-low rounded-xl cursor-pointer border border-transparent hover:border-outline-variant transition-colors"
                            >
                              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg flex-shrink-0">
                                {user.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-label-lg text-label-lg font-bold text-on-surface truncate">{user.name}</h4>
                                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{user.email}</p>
                              </div>
                              <span className="material-symbols-outlined text-on-surface-variant opacity-50">chat</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}
    </div>
  );
}
