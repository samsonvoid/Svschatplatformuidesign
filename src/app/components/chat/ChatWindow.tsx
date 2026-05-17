import { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Chat, User } from '../../App';

interface ChatWindowProps {
  chat: Chat | undefined;
  currentUser: User;
  onSendMessage: (content: string) => void;
  socket?: any;
  onBack?: () => void;
}

export function ChatWindow({
  chat,
  currentUser,
  onSendMessage,
  socket,
  onBack
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string>('');
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isScrolledUp = target.scrollHeight - target.scrollTop - target.clientHeight > 300;
    setShowScrollBottom(isScrolledUp);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // Listen to typing status from socket
  useEffect(() => {
    if (!socket || !chat) return;

    const handleTypingStatus = (data: any) => {
      if (data.conversationId === chat.id) {
        setIsTyping(data.isTyping);
        setTypingUser(data.name);
      }
    };

    socket.on('typing-status', handleTypingStatus);

    // Reset typing on chat switch
    setIsTyping(false);
    setTypingUser('');

    return () => {
      socket.off('typing-status', handleTypingStatus);
    };
  }, [socket, chat?.id]);

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
      
      // Clear typing status immediately on send
      if (socket && chat) {
        socket.emit('typing', {
          conversationId: chat.id,
          userId: currentUser.id,
          name: currentUser.name,
          isTyping: false
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (socket && chat) {
      socket.emit('typing', {
        conversationId: chat.id,
        userId: currentUser.id,
        name: currentUser.name,
        isTyping: e.target.value.trim().length > 0
      });
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-container-low">
        <div className="text-center p-md">
          <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2 font-headline-sm">
            CollabHub Messaging
          </h2>
          <p className="text-on-surface-variant text-body-sm">
            Select a conversation to start collaborating with the team.
          </p>
        </div>
      </div>
    );
  }

  const isGroup = chat.type === 'group';
  const chatName = isGroup ? chat.group!.name : chat.user!.name;
  const chatAvatar = isGroup ? chat.group!.avatar : chat.user!.avatar;

  const statusText = isGroup
    ? `${chat.group!.participants.length + 1} members • 2 online`
    : {
        online: 'Online',
        offline: 'Offline',
        away: 'Away'
      }[chat.user!.status];

  // Match CollabHub's professional close-up headshot photo assets
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

  const imgUrl = !isGroup ? getAvatarUrl(chatAvatar) : null;

  return (
    <div className="flex-1 flex bg-surface-container-lowest overflow-hidden h-full">
      {/* Middle Chat Canvas Pane */}
      <div className="flex-1 flex flex-col overflow-hidden h-full border-r border-outline-variant">
        {/* Chat Header */}
        <header className="h-16 px-lg flex items-center justify-between border-b border-outline-variant bg-surface flex-shrink-0">
          <div className="flex items-center gap-md min-w-0">
            {onBack && (
              <button 
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container active:scale-95 transition-transform cursor-pointer md:hidden flex-shrink-0"
              >
                <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
              </button>
            )}
            <div className="flex items-center gap-md min-w-0">
              <div className={`w-10 h-10 rounded-full ${
                isGroup ? 'bg-surface-container-high text-primary' : 'bg-surface-variant text-on-surface-variant'
              } flex items-center justify-center overflow-hidden relative flex-shrink-0 border border-outline-variant/30`}>
                {isGroup ? (
                  <span className="material-symbols-outlined text-[20px]">groups</span>
                ) : imgUrl ? (
                  <img src={imgUrl} className="w-full h-full object-cover" alt={chatName} />
                ) : (
                  <span className="font-bold text-sm">{chatAvatar}</span>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">{chatName}</h2>
                <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70 truncate">
                  {isTyping ? (
                    <span className="italic text-primary font-bold">{typingUser} is typing...</span>
                  ) : (
                    statusText
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-sm flex-shrink-0">
            <button className="p-sm hover:bg-surface-container rounded-full text-on-surface-variant transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">call</span>
            </button>
            <button className="p-sm hover:bg-surface-container rounded-full text-on-surface-variant transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">videocam</span>
            </button>
            <button 
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className={`p-sm hover:bg-surface-container rounded-full text-on-surface-variant transition-colors cursor-pointer ${
                isInfoOpen ? 'bg-primary-container/10 text-primary font-bold animate-pulse' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <main 
          ref={mainScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-lg flex flex-col gap-lg hide-scrollbar bg-surface-container-low relative"
        >
          {/* Date Separator */}
          <div className="flex items-center justify-center py-md flex-shrink-0">
            <div className="h-px bg-outline-variant flex-1 opacity-50"></div>
            <span className="px-md font-label-sm text-label-sm text-on-surface-variant opacity-50 font-bold">Today, October 24</span>
            <div className="h-px bg-outline-variant flex-1 opacity-50"></div>
          </div>

          <div className="space-y-lg flex-1">
            {chat.messages.map((message) => {
              const senderName = message.senderId === currentUser.id
                ? currentUser.name
                : (message.senderName || (isGroup ? 'Unknown' : chatName));

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === currentUser.id}
                  senderName={senderName}
                  isGroup={isGroup}
                />
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex flex-col gap-xs max-w-[85%] self-start items-start">
                <div className="flex items-center gap-sm mb-1 px-1">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                    <span className="font-label-sm text-white text-[10px] font-bold">{typingUser.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="font-label-md text-on-surface-variant font-semibold">{typingUser}</span>
                  <span className="font-label-sm text-outline italic text-[11px]">typing...</span>
                </div>
                <div className="bg-surface-container-highest p-md rounded-xl rounded-tl-none border border-outline-variant/30 w-16 flex items-center justify-center">
                  <div className="flex gap-1 py-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Scroll to Bottom Indicator */}
          {showScrollBottom && (
            <button 
              onClick={() => mainScrollRef.current?.scrollTo({ top: mainScrollRef.current.scrollHeight, behavior: 'smooth' })}
              className="absolute bottom-6 right-6 bg-primary hover:bg-primary/95 text-on-primary w-11 h-11 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer z-30 animate-bounce"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_downward</span>
            </button>
          )}
        </main>

        {/* Message Input Area */}
        <footer className="p-lg bg-surface border-t border-outline-variant flex-shrink-0">
          <div className="flex items-center gap-md bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <button className="p-sm hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors cursor-pointer flex-shrink-0">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline-variant"
              style={{ border: 'none', outline: 'none' }}
            />
            <div className="flex items-center gap-sm flex-shrink-0">
              <button className="p-sm hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors cursor-pointer">
                <span className="material-symbols-outlined">sentiment_satisfied</span>
              </button>
              <button
                onClick={handleSend}
                disabled={!messageInput.trim()}
                className="w-10 h-10 bg-primary text-on-primary disabled:bg-slate-200 disabled:text-slate-400 rounded-lg flex items-center justify-center hover:opacity-90 active:scale-90 transition-all cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Right Side Info Sidebar (Desktop Large screens Only) */}
      {isInfoOpen && (
        <aside className="hidden xl:flex w-[280px] h-full flex-col border-l border-outline-variant bg-surface p-lg gap-lg flex-shrink-0 overflow-y-auto hide-scrollbar">
          <div className="text-center">
            <div className="w-24 h-24 rounded-2xl bg-surface-container-high mx-auto flex items-center justify-center text-primary mb-md shadow-sm border border-outline-variant overflow-hidden">
              {isGroup ? (
                <span className="material-symbols-outlined text-[48px]">groups</span>
              ) : imgUrl ? (
                <img src={imgUrl} className="w-full h-full object-cover" alt={chatName} />
              ) : (
                <span className="font-bold text-[32px]">{chatAvatar}</span>
              )}
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{chatName}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {isGroup ? 'Core UI/UX Development Group' : 'Team Collaboration Partner'}
            </p>
          </div>

          <div className="flex flex-col gap-md">
            <h4 className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-widest text-[11px] opacity-70">Shared Files</h4>
            <div className="grid grid-cols-1 gap-sm">
              {isGroup ? (
                <>
                  <div className="flex items-start gap-sm p-sm bg-surface-container-low border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                    <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 mt-unit">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-label-md text-on-surface truncate font-semibold">design_specs.pdf</p>
                      <p className="text-[10px] text-on-surface-variant opacity-60 uppercase">2.4 MB • PDF</p>
                      <button className="mt-xs flex items-center gap-xs bg-primary/10 hover:bg-primary text-primary hover:text-white px-md py-1 rounded-full font-label-sm text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm border border-primary/20 w-fit">
                        <span className="material-symbols-outlined text-[12px]">download</span>
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-sm p-sm bg-surface-container-low border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                    <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-unit">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-label-md text-on-surface truncate font-semibold">hero_banner_v2.png</p>
                      <p className="text-[10px] text-on-surface-variant opacity-60 uppercase">1.1 MB • PNG</p>
                      <button className="mt-xs flex items-center gap-xs bg-primary/10 hover:bg-primary text-primary hover:text-white px-md py-1 rounded-full font-label-sm text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm border border-primary/20 w-fit">
                        <span className="material-symbols-outlined text-[12px]">download</span>
                        Download
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-sm p-sm bg-surface-container-low border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                    <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 mt-unit">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-label-md text-on-surface truncate font-semibold">project_brief.pdf</p>
                      <p className="text-[10px] text-on-surface-variant opacity-60 uppercase">1.4 MB • PDF</p>
                      <button className="mt-xs flex items-center gap-xs bg-primary/10 hover:bg-primary text-primary hover:text-white px-md py-1 rounded-full font-label-sm text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm border border-primary/20 w-fit">
                        <span className="material-symbols-outlined text-[12px]">download</span>
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-sm p-sm bg-surface-container-low border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                    <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-unit">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-label-md text-on-surface truncate font-semibold">workspace_draft.png</p>
                      <p className="text-[10px] text-on-surface-variant opacity-60 uppercase">800 KB • PNG</p>
                      <button className="mt-xs flex items-center gap-xs bg-primary/10 hover:bg-primary text-primary hover:text-white px-md py-1 rounded-full font-label-sm text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm border border-primary/20 w-fit">
                        <span className="material-symbols-outlined text-[12px]">download</span>
                        Download
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-outline-variant/30">
            <button className="w-full flex items-center justify-center gap-sm py-sm text-error font-label-md text-label-md hover:bg-error-container/10 rounded-lg transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {isGroup ? 'Leave Channel' : 'Block Contact'}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
