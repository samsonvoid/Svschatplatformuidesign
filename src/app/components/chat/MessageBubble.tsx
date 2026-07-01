import type { Message } from '../../App';
import { formatFileSize, SOCKET_URL } from '../../App';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName: string;
  isGroup?: boolean;
  isAdmin?: boolean;
  onDeleteMessage?: (messageId: string, isLocal: boolean) => void;
  onReply?: (message: Message) => void;
}

const renderAttachment = (attachment: NonNullable<Message['attachment']>, isOwnMsg: boolean) => {
  if (attachment.url === 'expired') {
    return (
      <div className="mb-xs w-[280px] max-w-full rounded-xl p-md border border-dashed border-outline-variant/60 flex items-center gap-md bg-surface-container-low text-on-surface-variant flex-shrink-0 select-none">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[20px] text-slate-400">hourglass_empty</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label-md text-xs font-bold truncate">{attachment.name}</p>
          <p className="font-label-sm text-[10px] text-red-500 font-medium">File expired to save server storage</p>
        </div>
      </div>
    );
  }

  const isImg = attachment.type.startsWith('image/');
  const downloadUrl = attachment.url.startsWith('data:') ? attachment.url : `${SOCKET_URL}${attachment.url}`;
  
  const handleOpenImage = () => {
    if (downloadUrl.startsWith('data:')) {
      const w = window.open();
      if (w) {
        w.document.write(`<title>${attachment.name}</title><body style="margin:0; background:#0e0e12; display:flex; align-items:center; justify-content:center; min-height:100vh;"><img src="${downloadUrl}" style="max-width:100%; max-height:100vh; object-fit:contain;" /></body>`);
        w.document.close();
      }
    } else {
      window.open(downloadUrl, '_blank');
    }
  };

  if (isImg) {
    return (
      <div className="mb-xs w-[320px] max-w-full rounded-lg overflow-hidden border border-outline-variant/30 shadow-sm relative group/att flex-shrink-0 bg-slate-50 dark:bg-slate-900/40">
        <img 
          src={downloadUrl} 
          className="max-h-60 w-full object-contain cursor-pointer hover:opacity-95 transition-opacity block" 
          alt={attachment.name}
          onClick={handleOpenImage}
        />
        <div className="absolute bottom-2 right-2 flex gap-xs opacity-0 group-hover/att:opacity-100 transition-all">
          <button 
            onClick={handleOpenImage}
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

export function MessageBubble({
  message,
  isOwn,
  senderName,
  isGroup = false,
  isAdmin = false,
  onDeleteMessage,
  onReply
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
      <div className="flex flex-col items-end gap-xs ml-auto max-w-[85%] group/msg" id={`message-${message.id}`}>
        <div className="flex items-center gap-sm max-w-full">
          {/* Delete Button (Only visible on hover) */}
          <button 
            onClick={() => onDeleteMessage && onDeleteMessage(message.id, false)}
            className="opacity-0 group-hover/msg:opacity-100 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all cursor-pointer flex-shrink-0"
            title="Delete Message"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>

          {/* Reply Button (Only visible on hover) */}
          <button 
            onClick={() => onReply && onReply(message)}
            className="opacity-0 group-hover/msg:opacity-100 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-all cursor-pointer flex-shrink-0"
            title="Reply to Message"
          >
            <span className="material-symbols-outlined text-[16px]">reply</span>
          </button>
          
          {/* Outgoing Bubble */}
          <div className="flex flex-col items-end gap-xs max-w-full">
            {message.metadata?.replyTo && (
              <div 
                onClick={() => {
                  const el = document.getElementById(`message-${message.metadata?.replyTo?.id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="bg-primary-container/20 hover:bg-primary-container/30 text-white/90 p-xs px-sm rounded-lg text-left border-l-2 border-white/60 mb-1 font-label-sm text-[10px] max-w-[280px] cursor-pointer transition-all truncate"
                title="Jump to message"
              >
                <p className="font-bold text-[8px] opacity-75">Replying to {message.metadata.replyTo.senderName}</p>
                <p className="truncate opacity-90">{message.metadata.replyTo.content || 'Attachment'}</p>
              </div>
            )}
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
  const recipientAvatarUrl = getAvatarUrl(message.senderAvatar);

  return (
    <div className="flex flex-col gap-xs max-w-[85%] items-start self-start group/msg" id={`message-${message.id}`}>
      {/* Participant Header Info */}
      <div className="flex items-center gap-sm mb-1 px-1">
        <div className={`w-6 h-6 rounded-full ${recipientAvatarUrl ? '' : getAvatarBg(senderName)} flex items-center justify-center overflow-hidden`}>
          {recipientAvatarUrl ? (
            <img className="w-full h-full object-cover" src={recipientAvatarUrl} alt={senderName} />
          ) : (
            <span className="font-label-sm text-[10px] font-bold">{getSenderInitials(senderName)}</span>
          )}
        </div>
        <span className="font-label-md text-on-surface-variant font-semibold">{senderName}</span>
        <span className="font-label-sm text-outline">{formatTime(message.timestamp)}</span>
      </div>

      {/* Bubble Container */}
      <div className="flex items-center gap-sm max-w-full">
        <div className="flex flex-col items-start gap-xs max-w-full">
          {message.metadata?.replyTo && (
            <div 
              onClick={() => {
                const el = document.getElementById(`message-${message.metadata?.replyTo?.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="bg-slate-100 dark:bg-slate-800/80 text-on-surface-variant p-xs px-sm rounded-lg text-left border-l-2 border-primary mb-1 font-label-sm text-[10px] max-w-[280px] cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all truncate"
              title="Jump to message"
            >
              <p className="font-bold text-[8px] text-primary">Replying to {message.metadata.replyTo.senderName}</p>
              <p className="truncate dark:text-slate-300">{message.metadata.replyTo.content || 'Attachment'}</p>
            </div>
          )}
          {message.attachment && renderAttachment(message.attachment, false)}
          {message.content && (
            <div className="bg-surface-container-highest p-md rounded-xl rounded-tl-none border border-outline-variant/30 text-on-surface">
              <p className="font-body-md whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          )}
        </div>

        {/* Reply Button (Only visible on hover) */}
        <button 
          onClick={() => onReply && onReply(message)}
          className="opacity-0 group-hover/msg:opacity-100 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-all cursor-pointer flex-shrink-0"
          title="Reply to Message"
        >
          <span className="material-symbols-outlined text-[16px]">reply</span>
        </button>

        {/* Delete Button (Only visible on hover) */}
        <button 
          onClick={() => onDeleteMessage && onDeleteMessage(message.id, !isAdmin)}
          className="opacity-0 group-hover/msg:opacity-100 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all cursor-pointer flex-shrink-0"
          title={isAdmin ? "Delete Message (Global)" : "Hide Message (Local)"}
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
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
