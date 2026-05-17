import { useState } from 'react';
import { Sidebar } from './components/chat/Sidebar';
import { ChatWindow } from './components/chat/ChatWindow';

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  user?: User;
  group?: {
    name: string;
    avatar: string;
    participants: User[];
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

export default function App() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const allUsers: User[] = [
    { id: 'u1', name: 'Jamali', avatar: 'JM', status: 'online' },
    { id: 'u2', name: 'Neema', avatar: 'NM', status: 'online' },
    { id: 'u3', name: 'Baraka', avatar: 'BK', status: 'away' },
    { id: 'u4', name: 'Amina', avatar: 'AM', status: 'offline' },
    { id: 'u5', name: 'Hassan', avatar: 'HS', status: 'online' },
    { id: 'u6', name: 'Fatuma', avatar: 'FT', status: 'online' }
  ];

  const [chats, setChats] = useState<Chat[]>([
    // Group: SVS Info
    {
      id: 'g1',
      type: 'group',
      group: {
        name: 'SVS Info',
        avatar: 'SI',
        participants: [allUsers[0], allUsers[1], allUsers[4], allUsers[5]]
      },
      lastMessage: 'Hassan: Server deployment completed successfully!',
      lastMessageTime: new Date(Date.now() - 300000),
      unreadCount: 5,
      messages: [
        {
          id: 'gm1',
          senderId: 'u2',
          senderName: 'Neema',
          content: 'Hey team, reminder that we have the sprint planning meeting at 2 PM today.',
          timestamp: new Date(Date.now() - 1800000),
          status: 'read'
        },
        {
          id: 'gm2',
          senderId: 'current',
          senderName: 'Kulwa',
          content: 'Thanks for the reminder! I\'ll prepare the backlog items.',
          timestamp: new Date(Date.now() - 1700000),
          status: 'read'
        },
        {
          id: 'gm3',
          senderId: 'u5',
          senderName: 'Hassan',
          content: 'Also, the staging environment is ready for testing the new features.',
          timestamp: new Date(Date.now() - 900000),
          status: 'read'
        },
        {
          id: 'gm4',
          senderId: 'u6',
          senderName: 'Fatuma',
          content: 'Perfect timing! I\'ll start the QA tests this afternoon.',
          timestamp: new Date(Date.now() - 600000),
          status: 'read'
        },
        {
          id: 'gm5',
          senderId: 'u5',
          senderName: 'Hassan',
          content: 'Server deployment completed successfully!',
          timestamp: new Date(Date.now() - 300000),
          status: 'sent'
        }
      ]
    },
    // Group: Frontend Team
    {
      id: 'g2',
      type: 'group',
      group: {
        name: 'Frontend Team',
        avatar: 'FE',
        participants: [allUsers[1], allUsers[5]]
      },
      lastMessage: 'Fatuma: The new component library looks amazing!',
      lastMessageTime: new Date(Date.now() - 7200000),
      unreadCount: 0,
      messages: [
        {
          id: 'gm6',
          senderId: 'current',
          senderName: 'Kulwa',
          content: 'I\'ve updated the design system documentation. Check it out when you have time.',
          timestamp: new Date(Date.now() - 10800000),
          status: 'read'
        },
        {
          id: 'gm7',
          senderId: 'u2',
          senderName: 'Neema',
          content: 'Great work! The Tailwind config looks clean.',
          timestamp: new Date(Date.now() - 9000000),
          status: 'read'
        },
        {
          id: 'gm8',
          senderId: 'u6',
          senderName: 'Fatuma',
          content: 'The new component library looks amazing!',
          timestamp: new Date(Date.now() - 7200000),
          status: 'read'
        }
      ]
    },
    // Group: Backend Devs
    {
      id: 'g3',
      type: 'group',
      group: {
        name: 'Backend Devs',
        avatar: 'BE',
        participants: [allUsers[0], allUsers[2], allUsers[4]]
      },
      lastMessage: 'Baraka: Redis caching is working perfectly now.',
      lastMessageTime: new Date(Date.now() - 14400000),
      unreadCount: 0,
      messages: [
        {
          id: 'gm9',
          senderId: 'u1',
          senderName: 'Jamali',
          content: 'We need to optimize the database queries for the user dashboard.',
          timestamp: new Date(Date.now() - 21600000),
          status: 'read'
        },
        {
          id: 'gm10',
          senderId: 'u5',
          senderName: 'Hassan',
          content: 'I can add some indexes to improve performance. Let me check the slow query log.',
          timestamp: new Date(Date.now() - 18000000),
          status: 'read'
        },
        {
          id: 'gm11',
          senderId: 'u3',
          senderName: 'Baraka',
          content: 'Redis caching is working perfectly now.',
          timestamp: new Date(Date.now() - 14400000),
          status: 'read'
        }
      ]
    },
    // Direct Message: Jamali
    {
      id: '1',
      type: 'direct',
      user: {
        id: 'u1',
        name: 'Jamali',
        avatar: 'JM',
        status: 'online'
      },
      lastMessage: 'Sounds good! Let me know when you are ready.',
      lastMessageTime: new Date(Date.now() - 19000),
      unreadCount: 2,
      messages: [
        {
          id: 'm1',
          senderId: 'u1',
          content: 'Hey Kulwa, how is the project coming along?',
          timestamp: new Date(Date.now() - 3600000),
          status: 'read'
        },
        {
          id: 'm2',
          senderId: 'current',
          content: 'Going well! Just finishing up the authentication module.',
          timestamp: new Date(Date.now() - 3500000),
          status: 'read'
        },
        {
          id: 'm3',
          senderId: 'u1',
          content: 'Great! Do you need any help with the Socket.io integration?',
          timestamp: new Date(Date.now() - 3400000),
          status: 'read'
        },
        {
          id: 'm4',
          senderId: 'current',
          content: 'Actually yes, I could use some guidance on the Redis pub/sub setup.',
          timestamp: new Date(Date.now() - 120000),
          status: 'delivered'
        },
        {
          id: 'm5',
          senderId: 'u1',
          content: 'Sounds good! Let me know when you are ready.',
          timestamp: new Date(Date.now() - 19000),
          status: 'sent'
        }
      ]
    },
    // Direct Message: Neema
    {
      id: '2',
      type: 'direct',
      user: {
        id: 'u2',
        name: 'Neema',
        avatar: 'NM',
        status: 'online'
      },
      lastMessage: 'Perfect! See you at the standup.',
      lastMessageTime: new Date(Date.now() - 3600000 * 2),
      unreadCount: 0,
      messages: [
        {
          id: 'm6',
          senderId: 'u2',
          content: 'Morning! Did you push the latest changes?',
          timestamp: new Date(Date.now() - 7200000),
          status: 'read'
        },
        {
          id: 'm7',
          senderId: 'current',
          content: 'Yes, just pushed to the dev branch.',
          timestamp: new Date(Date.now() - 7100000),
          status: 'read'
        },
        {
          id: 'm8',
          senderId: 'u2',
          content: 'Perfect! See you at the standup.',
          timestamp: new Date(Date.now() - 7000000),
          status: 'read'
        }
      ]
    },
    // Direct Message: Baraka
    {
      id: '3',
      type: 'direct',
      user: {
        id: 'u3',
        name: 'Baraka',
        avatar: 'BK',
        status: 'away'
      },
      lastMessage: 'Let me check and get back to you.',
      lastMessageTime: new Date(Date.now() - 3600000 * 5),
      unreadCount: 0,
      messages: [
        {
          id: 'm9',
          senderId: 'current',
          content: 'Hey, can you review my PR when you get a chance?',
          timestamp: new Date(Date.now() - 18000000),
          status: 'read'
        },
        {
          id: 'm10',
          senderId: 'u3',
          content: 'Let me check and get back to you.',
          timestamp: new Date(Date.now() - 17900000),
          status: 'read'
        }
      ]
    },
    // Direct Message: Amina
    {
      id: '4',
      type: 'direct',
      user: {
        id: 'u4',
        name: 'Amina',
        avatar: 'AM',
        status: 'offline'
      },
      lastMessage: 'Thanks for the update!',
      lastMessageTime: new Date(Date.now() - 3600000 * 24),
      unreadCount: 0,
      messages: [
        {
          id: 'm11',
          senderId: 'current',
          content: 'I updated the database schema as we discussed.',
          timestamp: new Date(Date.now() - 86400000),
          status: 'read'
        },
        {
          id: 'm12',
          senderId: 'u4',
          content: 'Thanks for the update!',
          timestamp: new Date(Date.now() - 86300000),
          status: 'read'
        }
      ]
    }
  ]);

  const currentUser: User = {
    id: 'current',
    name: 'Kulwa',
    avatar: 'KW',
    status: 'online'
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  const handleSendMessage = (content: string) => {
    if (!selectedChatId || !content.trim()) return;

    const chat = chats.find(c => c.id === selectedChatId);
    const isGroup = chat?.type === 'group';

    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: 'current',
      senderName: isGroup ? currentUser.name : undefined,
      content: content.trim(),
      timestamp: new Date(),
      status: 'sent'
    };

    setChats(chats.map(chat => {
      if (chat.id === selectedChatId) {
        const lastMsg = isGroup
          ? `${currentUser.name}: ${content.trim()}`
          : content.trim();

        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: lastMsg,
          lastMessageTime: new Date()
        };
      }
      return chat;
    }));
  };

  return (
    <div className="size-full flex bg-slate-50">
      <Sidebar
        currentUser={currentUser}
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
      />
      <ChatWindow
        chat={selectedChat}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}