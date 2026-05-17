import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '../../App';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName: string;
  isGroup?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  senderName,
  isGroup = false
}: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-start gap-2`}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
          {senderName.substring(0, 2).toUpperCase()}
        </div>
      )}

      <div className={`max-w-md ${isOwn ? 'order-first' : ''}`}>
        {isGroup && !isOwn && (
          <p className="text-xs font-semibold text-slate-600 mb-1 px-1">
            {senderName}
          </p>
        )}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-slate-100 text-slate-900 rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-slate-500">
            {formatTime(message.timestamp)}
          </span>
          {isOwn && (
            <span className="text-slate-500">
              {message.status === 'read' ? (
                <CheckCheck size={14} className="text-blue-600" />
              ) : message.status === 'delivered' ? (
                <CheckCheck size={14} />
              ) : (
                <Check size={14} />
              )}
            </span>
          )}
        </div>
      </div>

      {isOwn && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
          {senderName.substring(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
