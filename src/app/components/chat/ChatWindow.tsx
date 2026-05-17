import { useState, useEffect, useRef } from 'react';
import { Phone, Video, Info, Paperclip, Send, Users } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { Chat, User } from '../../App';

interface ChatWindowProps {
  chat: Chat | undefined;
  currentUser: User;
  onSendMessage: (content: string) => void;
}

export function ChatWindow({
  chat,
  currentUser,
  onSendMessage
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (chat && Math.random() > 0.7) {
      const timeout = setTimeout(() => {
        setIsTyping(true);
        if (chat.type === 'group' && chat.group) {
          const randomParticipant = chat.group.participants[
            Math.floor(Math.random() * chat.group.participants.length)
          ];
          setTypingUser(randomParticipant.name);
        } else if (chat.user) {
          setTypingUser(chat.user.name);
        }
        setTimeout(() => setIsTyping(false), 3000);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [chat?.id]);

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send size={40} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            SVS Chat Platform
          </h2>
          <p className="text-slate-500">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  const isGroup = chat.type === 'group';
  const chatName = isGroup ? chat.group!.name : chat.user!.name;
  const chatAvatar = isGroup ? chat.group!.avatar : chat.user!.avatar;

  const statusColor = !isGroup ? {
    online: 'text-green-600',
    offline: 'text-slate-400',
    away: 'text-yellow-600'
  }[chat.user!.status] : 'text-slate-500';

  const statusText = isGroup
    ? `${chat.group!.participants.length + 1} members`
    : {
      online: 'Online',
      offline: 'Offline',
      away: 'Away'
    }[chat.user!.status];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-11 h-11 rounded-full ${
                isGroup ? 'bg-indigo-100' : 'bg-slate-200'
              } flex items-center justify-center ${
                isGroup ? 'text-indigo-700' : 'text-slate-700'
              } font-semibold`}>
                {isGroup ? <Users size={22} /> : chatAvatar}
              </div>
              {!isGroup && (
                <div className={`absolute bottom-0 right-0 w-3 h-3 ${
                  chat.user!.status === 'online' ? 'bg-green-500' :
                  chat.user!.status === 'away' ? 'bg-yellow-500' : 'bg-slate-300'
                } rounded-full border-2 border-white`}></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                {chatName}
              </h2>
              <p className={`text-sm ${statusColor}`}>
                {isTyping ? (
                  <span className="italic">{typingUser} is typing...</span>
                ) : (
                  statusText
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isGroup && (
              <>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Phone size={20} className="text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Video size={20} className="text-slate-600" />
                </button>
              </>
            )}
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Info size={20} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-4">
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
          {isTyping && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                {typingUser.substring(0, 2).toUpperCase()}
              </div>
              <div className="bg-slate-200 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
            <Paperclip size={22} className="text-slate-600" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!messageInput.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-full transition-colors flex-shrink-0"
          >
            <Send size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
