import { useState } from 'react';
import { Search, MessageSquarePlus } from 'lucide-react';
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

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
      {/* Header with current user */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {currentUser.avatar}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">{currentUser.name}</h2>
              <p className="text-xs text-slate-500">Active now</p>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <MessageSquarePlus size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            No conversations found
          </div>
        ) : (
          <div>
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
