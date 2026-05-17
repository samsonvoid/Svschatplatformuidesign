import { useState } from 'react';
import { ChatListItem } from './ChatListItem';
import type { User, Chat } from '../../App';

interface SidebarProps {
  currentUser: User;
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export function Sidebar({
  currentUser,
  chats,
  selectedChatId,
  onSelectChat
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

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

  const getAvatarUrl = (avatar: string) => {
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
          <button className="bg-primary hover:bg-primary/95 text-on-primary px-md py-sm rounded-lg flex items-center gap-xs shadow-sm active:scale-95 transition-transform cursor-pointer">
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
            <div className="w-14 h-14 rounded-full border-2 border-primary p-0.5">
              <div className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center relative font-bold text-sm text-primary">
                {currentUser.avatar}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
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
    </div>
  );
}
