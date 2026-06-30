import { useState } from 'react';
import type { Chat } from '../../App';
import { SOCKET_URL } from '../../App';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
  timeAgo: string;
  isMuted?: boolean;
  onMuteToggle?: (duration: '8h' | '1w' | 'forever' | 'unmute') => void;
}

export function ChatListItem({
  chat,
  isSelected,
  onClick,
  timeAgo,
  isMuted = false,
  onMuteToggle
}: ChatListItemProps) {
  const isGroup = chat.type === 'group';
  const displayName = isGroup ? chat.group!.name : chat.user!.name;
  const displayAvatar = isGroup ? chat.group!.avatar : chat.user!.avatar;

  const statusColor = !isGroup ? {
    online: 'bg-green-500',
    offline: 'bg-slate-300',
    away: 'bg-orange-400'
  }[chat.user!.status] : '';

  // Match CollabHub's premium close-up headshot photo assets
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

  const imgUrl = !isGroup ? getAvatarUrl(displayAvatar) : null;
  const [showMuteMenu, setShowMuteMenu] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-md gap-md tap-highlight-transparent cursor-pointer transition-all duration-200 rounded-xl relative ${
        isSelected
          ? 'bg-surface-container-low border-l-4 border-primary shadow-sm active:bg-surface-container-high'
          : 'bg-white dark:bg-card border border-outline-variant/30 dark:border-border/30 active:bg-slate-50 dark:active:bg-muted hover:bg-slate-50/50 dark:hover:bg-muted/40 text-on-surface dark:text-white'
      }`}
    >
      {/* Avatar / Group Symbol */}
      <div className="relative flex-shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden relative ${
          isSelected 
            ? 'bg-secondary-container text-on-secondary-container' 
            : 'bg-surface-container-highest text-on-surface-variant'
        } font-bold text-sm`}>
          {isGroup ? (
            <span className="material-symbols-outlined text-[24px]">groups</span>
          ) : imgUrl ? (
            <img src={imgUrl} className="w-full h-full object-cover" alt={displayName} />
          ) : (
            displayAvatar
          )}
        </div>
        {!isGroup && (
          <div className={`absolute bottom-0 right-0 w-3 h-3 ${statusColor} border-2 border-white rounded-full`}></div>
        )}
      </div>

      {/* Info Column */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className={`text-body-md font-bold truncate ${
            isSelected ? 'text-primary font-black' : 'text-on-surface'
          }`}>
            {displayName}
          </h3>
          <div className="flex items-center gap-xs flex-shrink-0">
            {isMuted && (
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant/60">volume_off</span>
            )}
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {timeAgo}
            </span>
          </div>
        </div>
        <p className={`font-body-sm text-body-sm truncate ${
          chat.unreadCount > 0 || isSelected
            ? 'text-on-surface font-semibold'
            : 'text-on-surface-variant'
        }`}>
          {chat.lastMessage}
        </p>
      </div>

      {/* Unread badge */}
      {chat.unreadCount > 0 && !isSelected && (
        <div className="flex-shrink-0 min-w-5 h-5 px-1 bg-primary text-on-primary rounded-full flex items-center justify-center text-[10px] font-bold">
          {chat.unreadCount}
        </div>
      )}

      {/* Options Menu Button (Dots) */}
      <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={() => setShowMuteMenu(!showMuteMenu)}
          className="material-symbols-outlined text-[18px] text-on-surface-variant/40 hover:text-primary transition-colors cursor-pointer select-none focus:outline-none p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          more_vert
        </button>
        
        {showMuteMenu && (
          <div className="absolute right-0 top-full mt-xs w-[140px] bg-white dark:bg-slate-900 border border-outline-variant dark:border-outline rounded-lg shadow-lg z-[60] py-1 font-label-md text-[11px] animate-fade-in text-left">
            {!isMuted ? (
              <>
                <button onClick={() => { onMuteToggle?.('8h'); setShowMuteMenu(false); }} className="w-full px-md py-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface dark:text-white cursor-pointer block border-none bg-transparent text-left">Mute for 8h</button>
                <button onClick={() => { onMuteToggle?.('1w'); setShowMuteMenu(false); }} className="w-full px-md py-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface dark:text-white cursor-pointer block border-none bg-transparent text-left">Mute for 1w</button>
                <button onClick={() => { onMuteToggle?.('forever'); setShowMuteMenu(false); }} className="w-full px-md py-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface dark:text-white cursor-pointer block border-none bg-transparent text-left">Mute Forever</button>
              </>
            ) : (
              <button onClick={() => { onMuteToggle?.('unmute'); setShowMuteMenu(false); }} className="w-full px-md py-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-primary cursor-pointer block border-none bg-transparent font-bold text-left">Unmute</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
