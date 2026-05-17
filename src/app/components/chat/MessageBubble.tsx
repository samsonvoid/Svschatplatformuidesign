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

  if (isOwn) {
    return (
      <div className="flex flex-col items-end gap-xs ml-auto max-w-[85%]">
        {/* Outgoing Bubble */}
        <div className="bg-primary p-md rounded-xl rounded-tr-none shadow-sm text-on-primary">
          <p className="font-body-md whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        
        {/* Status Line */}
        <div className="flex items-center gap-xs mt-1 px-1">
          <span className="font-label-sm text-outline">{formatTime(message.timestamp)}</span>
          <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            {message.status === 'read' ? 'done_all' : message.status === 'delivered' ? 'done_all' : 'done'}
          </span>
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
      <div className="bg-surface-container-highest p-md rounded-xl rounded-tl-none border border-outline-variant/30 text-on-surface">
        <p className="font-body-md whitespace-pre-wrap break-words">{message.content}</p>
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
