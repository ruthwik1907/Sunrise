import React, { useState } from 'react';
import { useAppContext, Message } from '../../context/AppContext';
import { MessageSquare, Search, Send, User, Clock, Check, CheckCheck, MoreVertical, Paperclip, Image as ImageIcon } from 'lucide-react';

export default function Messages() {
  const { currentUser, messages, users } = useAppContext();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!currentUser) return null;

  // Group messages by conversation partner
  const conversations = messages.reduce((acc, msg) => {
    const isSender = msg.senderId === currentUser.id;
    const isReceiver = msg.receiverId === currentUser.id;
    
    if (!isSender && !isReceiver) return acc;

    const partnerId = isSender ? msg.receiverId : msg.senderId;
    
    if (!acc[partnerId]) {
      acc[partnerId] = [];
    }
    acc[partnerId].push(msg);
    return acc;
  }, {} as Record<string, typeof messages>);

  // Sort conversations by latest message
  const sortedConversations = Object.entries(conversations)
    .map(([partnerId, msgs]: [string, Message[]]) => {
      const sortedMsgs = msgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return {
        partnerId,
        partner: users.find(u => u.id === partnerId),
        messages: sortedMsgs,
        latestMessage: sortedMsgs[0],
        unreadCount: sortedMsgs.filter(m => m.receiverId === currentUser.id && !m.read).length
      };
    })
    .filter(conv => {
      if (!searchTerm) return true;
      return (conv.partner?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(b.latestMessage.timestamp).getTime() - new Date(a.latestMessage.timestamp).getTime());

  const activeConversation = sortedConversations.find(c => c.partnerId === activeChat);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    // In a real app, this would call a function from context to add the message
    console.log('Sending message to', activeChat, ':', newMessage);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 text-sm mt-1">Communicate directly with your healthcare providers.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {sortedConversations.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {sortedConversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setActiveChat(conv.partnerId)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                      activeChat === conv.partnerId ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {conv.partner?.avatar ? (
                        <img src={conv.partner.avatar} alt={conv.partner.name} className="h-12 w-12 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-sm font-semibold text-slate-900 truncate pr-2">
                          {conv.partner?.role === 'doctor' ? 'Dr. ' : ''}{conv.partner?.name}
                        </h3>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {new Date(conv.latestMessage.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-medium text-slate-900' : 'text-slate-500'}`}>
                        {conv.latestMessage.senderId === currentUser.id ? 'You: ' : ''}
                        {conv.latestMessage.content}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No conversations found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {activeConversation.partner?.avatar ? (
                    <img src={activeConversation.partner.avatar} alt={activeConversation.partner.name} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      {activeConversation.partner?.role === 'doctor' ? 'Dr. ' : ''}{activeConversation.partner?.name}
                    </h2>
                    <p className="text-xs text-slate-500 capitalize">{activeConversation.partner?.specialty || activeConversation.partner?.role}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col-reverse">
                {activeConversation.messages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUser.id;
                  const showAvatar = idx === activeConversation.messages.length - 1 || 
                                     activeConversation.messages[idx + 1].senderId !== msg.senderId;
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-3`}>
                      {!isMe && showAvatar && (
                        <div className="flex-shrink-0 mt-auto">
                          {activeConversation.partner?.avatar ? (
                            <img src={activeConversation.partner.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-indigo-600" />
                            </div>
                          )}
                        </div>
                      )}
                      {!isMe && !showAvatar && <div className="w-8" />}
                      
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-br-sm' 
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm shadow-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <div className="flex items-center mt-1 space-x-1">
                          <span className="text-[11px] text-slate-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            msg.read ? <CheckCheck className="h-3.5 w-3.5 text-indigo-500" /> : <Check className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <div className="flex gap-1 mb-1">
                    <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:block">
                      <ImageIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-[52px] min-h-[52px] max-h-32 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Your Messages</h3>
              <p className="text-slate-500 max-w-sm">
                Select a conversation from the sidebar to view messages or start a new conversation with your healthcare providers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
