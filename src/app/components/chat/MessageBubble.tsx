import type { Message } from '../../App';
import { formatFileSize, SOCKET_URL } from '../../App';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName: string;
  isGroup?: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

const renderAttachment = (attachment: NonNullable<Message['attachment']>, isOwnMsg: boolean) => {
  const isImg = attachment.type.startsWith('image/');
  const downloadUrl = attachment.url.startsWith('data:') ? attachment.url : `${SOCKET_URL}${attachment.url}`;
  
  if (isImg) {
    return (
      <div className="mb-xs w-[320px] max-w-full rounded-lg overflow-hidden border border-outline-variant/30 shadow-sm relative group/att flex-shrink-0 bg-slate-50 dark:bg-slate-900/40">
        <img 
          src={downloadUrl} 
          className="max-h-60 w-full object-contain cursor-pointer hover:opacity-95 transition-opacity block" 
          alt={attachment.name}
          onClick={() => window.open(downloadUrl, '_blank')}
        />
        <div className="absolute bottom-2 right-2 flex gap-xs opacity-0 group-hover/att:opacity-100 transition-all">
          <button 
            onClick={() => window.open(downloadUrl, '_blank')}
            className="bg-slate-900/60 hover:bg-slate-900/80 text-white p-sm rounded-full flex items-center justify-center shadow-md border-none cursor-pointer"
            title="Open in New Tab"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </button>
          {!isOwnMsg && (
            <a 
              href={downloadUrl} 
              download={attachment.name}
              className="bg-slate-900/60 hover:bg-slate-900/80 text-white p-sm rounded-full flex items-center justify-center shadow-md no-underline"
              title="Download Image"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </a>
          )}
        </div>
      </div>
    );
  }
  
  const iconName = attachment.type.includes('pdf') ? 'picture_as_pdf' :
    attachment.type.includes('zip') || attachment.type.includes('rar') ? 'folder_zip' :
    attachment.type.includes('spreadsheet') || attachment.type.includes('xlsx') || attachment.type.includes('csv') ? 'table_chart' :
    'description';
    
  const cardBg = isOwnMsg 
    ? 'bg-primary border-primary/20 text-on-primary shadow-md' 
    : 'bg-white dark:bg-slate-900 border-outline-variant text-on-surface';

  const textMuted = isOwnMsg ? 'text-white/70' : 'text-on-surface-variant';
  const btnBg = isOwnMsg 
    ? 'bg-white/20 hover:bg-white/30 text-white' 
    : 'bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20';

  const iconBg = isOwnMsg
    ? 'bg-white/20 text-white'
    : 'bg-primary/10 text-primary';

  return (
    <div className={`flex items-start gap-md p-md rounded-xl border ${cardBg} w-[320px] max-w-full shadow-sm mb-xs flex-shrink-0`}>
      <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <span className="material-symbols-outlined text-[24px]">{iconName}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-label-md text-label-md font-bold truncate mb-[2px]">{attachment.name}</p>
        <p className={`text-[10px] ${textMuted} uppercase tracking-wider font-semibold mb-sm`}>
          {formatFileSize(attachment.size)} • FILE
        </p>
        <div className="flex gap-sm items-center">
          <button 
            onClick={() => window.open(downloadUrl, '_blank')}
            className={`flex items-center gap-xs px-md py-1.5 rounded-full font-label-sm text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm w-fit border-none ${btnBg}`}
          >
            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            Open
          </button>
          {!isOwnMsg && (
            <a 
              href={downloadUrl} 
              download={attachment.name}
              className={`flex items-center gap-xs px-md py-1.5 rounded-full font-label-sm text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm w-fit no-underline ${btnBg}`}
            >
              <span className="material-symbols-outlined text-[12px]">download</span>
              Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export function MessageBubble({
  message,
  isOwn,
  senderName,
  isGroup = false,
  onDeleteMessage
}: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSenderInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Assign background colors to different participants matching the visual template
  const getAvatarBg = (name: string) => {
    switch (name) {
      case 'Jamali': return 'bg-outline-variant text-on-surface';
      case 'Neema': return 'bg-secondary text-white';
      case 'Fatuma': return 'bg-tertiary-container text-on-tertiary';
      default: return 'bg-primary-fixed-dim text-on-primary-fixed';
    }
  };

  const hasLink = message.content.toLowerCase().includes('docs.') || message.content.toLowerCase().includes('http');

  const renderNodeLink = (status: 'sending' | 'sent' | 'delivered' | 'read' | string) => {
    if (status === 'sending') {
      return (
        <span className="w-2.5 h-2.5 rounded-full border border-dashed border-white/70 animate-spin" />
      );
    }

    const isDelivered = status === 'delivered' || status === 'read';
    const isRead = status === 'read';

    return (
      <div className="flex items-center gap-[1px] select-none h-4 ml-1">
        {/* Link line */}
        <span 
          className={`h-[1.5px] w-2 transition-all duration-300 ${
            isDelivered 
              ? isRead ? 'bg-green-300' : 'bg-white/90' 
              : 'w-0 opacity-0'
          }`} 
        />
        {/* Node dot */}
        <span 
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            isRead 
              ? 'bg-green-300 border-green-300 shadow-[0_0_6px_rgba(74,222,128,0.7)]' 
              : isDelivered 
                ? 'border border-white/90' 
                : 'border border-white/50'
          }`} 
        />
      </div>
    );
  };

  if (isOwn) {
    return (
      <div className="flex flex-col items-end gap-xs ml-auto max-w-[85%] group/msg">
        <div className="flex items-center gap-sm max-w-full">
          {/* Delete Button (Only visible on hover) */}
          <button 
            onClick={() => onDeleteMessage && onDeleteMessage(message.id)}
            className="opacity-0 group-hover/msg:opacity-100 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all cursor-pointer flex-shrink-0"
            title="Delete Message"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
          
          {/* Outgoing Bubble */}
          <div className="flex flex-col items-end gap-xs max-w-full">
            {message.attachment && renderAttachment(message.attachment, true)}
            {message.content && (
              <div className="bg-primary p-md rounded-xl rounded-tr-none shadow-sm text-on-primary min-w-0">
                <p className="font-body-md whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Status Line */}
        <div className="flex items-center gap-xs mt-1 px-1">
          <span className="font-label-sm text-outline">{formatTime(message.timestamp)}</span>
          {renderNodeLink(message.status)}
        </div>
      </div>
    );
  }

  // Recipient Bubble (Jamali, Neema, Fatuma, etc.)
  return (
    <div className="flex flex-col gap-xs max-w-[85%] items-start self-start">
      {/* Participant Header Info */}
      <div className="flex items-center gap-sm mb-1 px-1">
        <div className={`w-6 h-6 rounded-full ${getAvatarBg(senderName)} flex items-center justify-center overflow-hidden`}>
          <span className="font-label-sm text-[10px] font-bold">{getSenderInitials(senderName)}</span>
        </div>
        <span className="font-label-md text-on-surface-variant font-semibold">{senderName}</span>
        <span className="font-label-sm text-outline">{formatTime(message.timestamp)}</span>
      </div>

      {/* Bubble Container */}
      <div className="flex flex-col items-start gap-xs max-w-full">
        {message.attachment && renderAttachment(message.attachment, false)}
        {message.content && (
          <div className="bg-surface-container-highest p-md rounded-xl rounded-tl-none border border-outline-variant/30 text-on-surface">
            <p className="font-body-md whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        )}
      </div>

      {/* Premium Rich Link Card Preview (If content has a URL) */}
      {hasLink && (
        <div className="flex flex-col gap-xs mt-2 max-w-full">
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="h-32 bg-secondary-fixed-dim relative">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAt5FsTcR3XnHU94ydnrez8-FDMkeWCB8QQrzWISAVyzEnW_KMQ1aGy3oio_P_rR6gJpL_cDBElqEF1R6uLFELCr5vR31DUKt-xunfLfbrZHJo_X38NXs0qxLxvjAS9ONq6wQ4bJdCju8FkAi3GnXjQkcHED2YYQFw3npsnn9uALnTmH_xCKRnYYZDx_xB6zhZBUzd6bwyldK6xxWmYlSFgPBrEoKuQfM2coxTuOyqxVWqXzspU4dNmcMnBarRnF4nUCo7qHW7WfGYS" 
                alt="Digital layout preview" 
              />
            </div>
            <div className="p-md">
              <p className="font-label-md text-primary mb-1">DOCS.COLLABHUB.APP</p>
              <h4 className="font-headline-sm text-on-surface mb-2 text-sm font-bold">v2.0 Documentation: Layout &amp; Grids</h4>
              <p className="font-body-sm text-on-surface-variant text-xs">Comprehensive guide to our new mathematical 8px spacing rhythm...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
