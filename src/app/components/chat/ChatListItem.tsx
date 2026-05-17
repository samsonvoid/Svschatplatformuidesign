import { Users } from 'lucide-react';
import type { Chat } from '../../App';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
  timeAgo: string;
}

export function ChatListItem({
  chat,
  isSelected,
  onClick,
  timeAgo
}: ChatListItemProps) {
  const isGroup = chat.type === 'group';
  const displayName = isGroup ? chat.group!.name : chat.user!.name;
  const displayAvatar = isGroup ? chat.group!.avatar : chat.user!.avatar;

  const statusColor = !isGroup ? {
    online: 'bg-green-500',
    offline: 'bg-slate-300',
    away: 'bg-yellow-500'
  }[chat.user!.status] : '';

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 border-l-4 border-l-blue-600'
          : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with status or group icon */}
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-full ${
            isGroup ? 'bg-indigo-100' : 'bg-slate-200'
          } flex items-center justify-center ${
            isGroup ? 'text-indigo-700' : 'text-slate-700'
          } font-semibold`}>
            {isGroup ? (
              <Users size={20} />
            ) : (
              displayAvatar
            )}
          </div>
          {!isGroup && (
            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${statusColor} rounded-full border-2 border-white`}></div>
          )}
        </div>

        {/* Chat info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">
                {displayName}
              </h3>
              {isGroup && (
                <span className="text-xs text-slate-500 flex-shrink-0">
                  {chat.group!.participants.length + 1} members
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
              {timeAgo}
            </span>
          </div>
          <p className="text-sm text-slate-600 truncate">
            {chat.lastMessage}
          </p>
        </div>

        {/* Unread badge */}
        {chat.unreadCount > 0 && (
          <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {chat.unreadCount}
          </div>
        )}
      </div>
    </div>
  );
}
