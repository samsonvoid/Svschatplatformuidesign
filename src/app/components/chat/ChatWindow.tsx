import { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Chat, User } from '../../App';
import { formatFileSize, SOCKET_URL } from '../../App';

const EMOJI_CATEGORIES = {
  smileys: { icon: '😀', label: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '🥱', '😴', '😷', '🤔'] },
  gestures: { icon: '👍', label: 'Gestures', emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤝', '🙌', '👏', '🙏', '👋', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '💪', '🧠', '👀'] },
  hearts: { icon: '❤️', label: 'Symbols', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🌟', '⭐', '✨', '⚡', '🔥'] },
  activities: { icon: '🎉', label: 'Activities', emojis: ['🎉', '🎊', '🎈', '🎂', '🎄', '🎆', '🎇', '🧨', '🎀', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '🎾', '🎮', '🕹️', '🎲', '🧩'] },
  objects: { icon: '💡', label: 'Objects', emojis: ['💡', '💻', '📱', '⌨️', '🖥️', '📷', '📹', '📞', '🎧', '📁', '📂', '📅', '📊', '📌', '📍', '📎', '🔒', '🔓', '🔑', '🔨', '🔧'] }
};

interface ChatWindowProps {
  chat: Chat | undefined;
  currentUser: User;
  onSendMessage: (content: string, attachment?: { name: string; type: string; size: number; data: string }, replyTo?: { id: string; senderName: string; content: string }) => void;
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
  const [typingUserAvatar, setTypingUserAvatar] = useState<string>('');
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; size: number; data: string } | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Refs for tracking local client typing debouncing
  const localTypingRef = useRef(false);
  const typingTimeoutRef = useRef<any>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isScrolledUp = target.scrollHeight - target.scrollTop - target.clientHeight > 300;
    setShowScrollBottom(isScrolledUp);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [chat?.messages]);

  // Listen to typing status from socket
  useEffect(() => {
    if (!socket || !chat) return;

    const handleTypingStatus = (data: any) => {
      if (data.conversationId === chat.id) {
        setIsTyping(data.isTyping);
        setTypingUser(data.name);
        setTypingUserAvatar(data.avatar || '');
      }
    };

    socket.on('typing-status', handleTypingStatus);

    // Reset local and remote typing states on chat switch
    setIsTyping(false);
    setTypingUser('');
    setTypingUserAvatar('');
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    localTypingRef.current = false;

    return () => {
      socket.off('typing-status', handleTypingStatus);
    };
  }, [socket, chat?.id]);

  const handleSend = () => {
    if (messageInput.trim() || selectedFile) {
      onSendMessage(
        messageInput, 
        selectedFile || undefined,
        replyToMessage ? { id: replyToMessage.id, senderName: replyToMessage.senderName || 'User', content: replyToMessage.content } : undefined
      );
      setMessageInput('');
      setSelectedFile(null);
      setReplyToMessage(null);
      
      // Clear typing status immediately on send
      if (socket && chat) {
        localTypingRef.current = false;
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        socket.emit('typing', {
          conversationId: chat.id,
          userId: currentUser.id,
          name: currentUser.name,
          isTyping: false
        });
      }
    }
  };

  const compressImage = (file: File, callback: (dataUrl: string, size: number) => void) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => callback(reader.result as string, file.size);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1024; // Resize high-res images to a max width/height of 1024px

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Compress as JPEG at 70% quality
          const stringLength = dataUrl.length - 'data:image/jpeg;base64,'.length;
          const sizeInBytes = Math.ceil(stringLength * 0.75);
          callback(dataUrl, sizeInBytes);
        } else {
          callback(e.target?.result as string, file.size);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB limit
    if (file.size > MAX_FILE_SIZE) {
      alert("The selected file is too large. Attachments are limited to a maximum of 25 MB.");
      e.target.value = '';
      return;
    }

    compressImage(file, (data, size) => {
      setSelectedFile({
        name: file.name,
        type: file.type.startsWith('image/') ? 'image/jpeg' : file.type,
        size: size,
        data: data
      });
    });
    e.target.value = '';
  };

  const handlePasteData = (clipboardData: DataTransfer | null, preventDefault: () => void) => {
    if (!clipboardData) return;
    const items = clipboardData.items;
    const files = clipboardData.files;

    // A. Check files list first (modern standard for pasted screen snapshots)
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          preventDefault();
          const MAX_FILE_SIZE = 25 * 1024 * 1024;
          if (file.size > MAX_FILE_SIZE) {
            alert("The pasted image is too large. Attachments are limited to a maximum of 25 MB.");
            return;
          }
          compressImage(file, (data, size) => {
            setSelectedFile({
              name: `pasted_image_${Date.now()}.jpg`,
              type: 'image/jpeg',
              size: size,
              data: data
            });
          });
          inputRef.current?.focus();
          return;
        }
      }
    }

    // B. Check items list (fallback / backup)
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (!file) continue;

          preventDefault();
          const MAX_FILE_SIZE = 25 * 1024 * 1024;
          if (file.size > MAX_FILE_SIZE) {
            alert("The pasted image is too large. Attachments are limited to a maximum of 25 MB.");
            return;
          }
          compressImage(file, (data, size) => {
            setSelectedFile({
              name: `pasted_image_${Date.now()}.jpg`,
              type: 'image/jpeg',
              size: size,
              data: data
            });
          });
          inputRef.current?.focus();
          break;
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    handlePasteData(e.clipboardData, () => e.preventDefault());
  };

  const handleEmojiClick = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      handlePasteData(e.clipboardData, () => e.preventDefault());
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [chat?.id]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageInput(val);
    
    if (socket && chat) {
      // 1. If text is cleared, stop typing indicator immediately
      if (val.trim().length === 0 && localTypingRef.current) {
        localTypingRef.current = false;
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        socket.emit('typing', {
          conversationId: chat.id,
          userId: currentUser.id,
          name: currentUser.name,
          isTyping: false
        });
      }
      // 2. If we weren't flagged as typing, notify server that we started typing
      else if (!localTypingRef.current && val.trim().length > 0) {
        localTypingRef.current = true;
        socket.emit('typing', {
          conversationId: chat.id,
          userId: currentUser.id,
          name: currentUser.name,
          isTyping: true
        });
      }

      // 3. Reset debouncing timeout to trigger isTyping: false after 2.5s of no key strokes
      if (val.trim().length > 0) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          if (localTypingRef.current) {
            localTypingRef.current = false;
            socket.emit('typing', {
              conversationId: chat.id,
              userId: currentUser.id,
              name: currentUser.name,
              isTyping: false
            });
          }
        }, 2500);
      }
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
                  onDeleteMessage={(messageId) => {
                    if (socket && chat) {
                      socket.emit('delete-message', { messageId, conversationId: chat.id });
                    }
                  }}
                  onReply={(msg) => setReplyToMessage(msg)}
                />
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex flex-col gap-xs max-w-[85%] self-start items-start animate-fade-in">
                <div className="flex items-center gap-sm mb-1 px-1">
                  <div className={`w-6 h-6 rounded-full ${
                    typingUser === 'Jamali' ? 'bg-outline-variant text-on-surface' :
                    typingUser === 'Neema' ? 'bg-secondary text-white' :
                    typingUser === 'Fatuma' ? 'bg-tertiary-container text-on-tertiary' :
                    'bg-primary-fixed-dim text-on-primary-fixed'
                  } flex items-center justify-center overflow-hidden`}>
                    <span className="font-label-sm text-[10px] font-bold">
                      {typingUserAvatar || typingUser.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
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
        <footer className="p-lg bg-surface border-t border-outline-variant flex-shrink-0 relative">
          
          {/* Replying to Message Preview Bar */}
          {replyToMessage && (
            <div className="mb-md p-sm bg-primary/5 dark:bg-primary/10 border-l-4 border-primary rounded-r-xl flex items-center justify-between animate-fade-in">
              <div className="min-w-0 flex-1">
                <p className="font-label-sm text-[10px] text-primary font-bold">Replying to {replyToMessage.senderName}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-300 truncate pr-md">
                  {replyToMessage.content || (replyToMessage.attachment ? '📷 Attachment' : '')}
                </p>
              </div>
              <button 
                onClick={() => setReplyToMessage(null)}
                className="p-xs hover:bg-surface-container rounded-full text-on-surface-variant hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {/* File Attachment Preview Bar */}
          {selectedFile && (
            <div className="mb-md p-sm bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-md min-w-0">
                {selectedFile.type.startsWith('image/') ? (
                  <div className="w-12 h-12 rounded bg-surface-container-high border border-outline-variant overflow-hidden flex-shrink-0">
                    <img src={selectedFile.data} className="w-full h-full object-cover" alt="Selected thumbnail" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-label-md text-label-md font-bold text-on-surface truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-on-surface-variant opacity-70">{formatFileSize(selectedFile.size)} • Ready to send</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-sm hover:bg-surface-container rounded-full text-on-surface-variant hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-20 right-lg z-50 w-[320px] h-[340px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-outline-variant rounded-xl shadow-xl flex flex-col overflow-hidden animate-scale-up">
              {/* Category tabs */}
              <div className="flex justify-between border-b border-outline-variant/30 p-xs bg-surface-container-low">
                {Object.entries(EMOJI_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setEmojiCategory(key as any)}
                    className={`flex-1 py-1.5 rounded-lg text-lg transition-all cursor-pointer border-none bg-transparent ${
                      emojiCategory === key ? 'bg-primary/10 border-b-2 border-primary scale-105' : 'hover:bg-surface-container opacity-60'
                    }`}
                    title={cat.label}
                  >
                    {cat.icon}
                  </button>
                ))}
              </div>
              {/* Emojis grid */}
              <div className="flex-1 grid grid-cols-6 gap-xs p-sm overflow-y-auto hide-scrollbar">
                {EMOJI_CATEGORIES[emojiCategory].emojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-10 h-10 text-2xl flex items-center justify-center rounded-lg hover:bg-primary/10 active:scale-90 transition-all cursor-pointer border-none bg-transparent"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-md bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-sm hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors cursor-pointer flex-shrink-0"
              title="Attach File"
            >
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="text"
              ref={inputRef}
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline-variant"
              style={{ border: 'none', outline: 'none' }}
            />
            <div className="flex items-center gap-sm flex-shrink-0">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-sm hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors cursor-pointer ${
                  showEmojiPicker ? 'bg-primary-container/20 text-primary font-bold' : ''
                }`}
                title="Choose Emoji"
              >
                <span className="material-symbols-outlined">sentiment_satisfied</span>
              </button>
              <button
                onClick={handleSend}
                disabled={!messageInput.trim() && !selectedFile}
                className="w-10 h-10 bg-primary text-on-primary disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 rounded-lg flex items-center justify-center hover:opacity-90 active:scale-90 transition-all cursor-pointer shadow-sm border-none"
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
              {(() => {
                const sharedConversationFiles = (chat?.messages || []).filter(m => m.attachment).map(m => m.attachment!);
                if (sharedConversationFiles.length === 0) {
                  return <p className="text-xs text-on-surface-variant italic py-sm text-center">No shared files in this chat.</p>;
                }
                return sharedConversationFiles.map((att, idx) => {
                  const isImg = att.type.startsWith('image/');
                  const iconName = isImg ? 'image' : 
                    att.type.includes('pdf') ? 'picture_as_pdf' :
                    att.type.includes('zip') || att.type.includes('rar') ? 'folder_zip' :
                    att.type.includes('spreadsheet') || att.type.includes('xlsx') || att.type.includes('csv') ? 'table_chart' :
                    'description';
                  const bgClass = isImg ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600';
                  
                  return (
                    <div key={idx} className="flex items-start gap-sm p-sm bg-surface-container-low border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                      <div className={`w-10 h-10 rounded ${bgClass} flex items-center justify-center flex-shrink-0 mt-unit`}>
                        <span className="material-symbols-outlined">{iconName}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-label-md text-label-md text-on-surface truncate font-semibold">{att.name}</p>
                        <p className="text-[10px] text-on-surface-variant opacity-60 uppercase">{formatFileSize(att.size)} • {isImg ? 'IMAGE' : 'FILE'}</p>
                        <div className="mt-xs flex gap-xs items-center">
                          <button 
                            onClick={() => window.open(att.url.startsWith('data:') ? att.url : `${SOCKET_URL}${att.url}`, '_blank')}
                            className="flex items-center gap-xs bg-primary/10 hover:bg-primary text-primary hover:text-white px-md py-1 rounded-full font-label-sm text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm border border-primary/20 w-fit border-none"
                          >
                            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                            Open
                          </button>
                          <a 
                            href={att.url.startsWith('data:') ? att.url : `${SOCKET_URL}${att.url}`} 
                            download={att.name}
                            className="flex items-center gap-xs bg-primary/10 hover:bg-primary text-primary hover:text-white px-md py-1 rounded-full font-label-sm text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm border border-primary/20 w-fit no-underline"
                          >
                            <span className="material-symbols-outlined text-[12px]">download</span>
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
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
