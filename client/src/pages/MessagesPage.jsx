import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCheck,
  BookOpen,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const prefillUserId = searchParams.get('user');
  const prefillBookId = searchParams.get('book');

  const { user } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'Is this book still available?',
    'Can we meet at the campus library?',
    'What days and times work best for you?',
    'Sounds great, see you then!'
  ];

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations/all');
      if (res.data.success) {
        setConversations(res.data.conversations);

        // If prefill userId is given from a book details page
        if (prefillUserId && !activeConversation) {
          const existing = res.data.conversations.find((c) => {
            const otherId = c.otherUser?._id || c.otherUser;
            return otherId?.toString() === prefillUserId;
          });

          if (existing) {
            setActiveConversation(existing);
          } else {
            // Virtual temporary conversation
            setActiveConversation({
              conversationId: [user._id, prefillUserId].sort().join('_') + (prefillBookId ? `_${prefillBookId}` : ''),
              otherUser: { _id: prefillUserId, name: 'Book Seller' },
              book: prefillBookId ? { _id: prefillBookId } : null,
              isNew: true
            });
          }
        } else if (res.data.conversations.length > 0 && !activeConversation) {
          setActiveConversation(res.data.conversations[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [prefillUserId]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation || activeConversation.isNew) {
      if (activeConversation?.isNew) setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${activeConversation.conversationId}`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
    // Auto-refresh interval (polling for real-time responsiveness)
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConversation]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessageText.trim() || !activeConversation) return;

    const receiverId = activeConversation.otherUser?._id || activeConversation.otherUser;
    const bookId = activeConversation.book?._id || activeConversation.book;
    const textToSend = newMessageText.trim();
    setNewMessageText('');
    setSending(true);

    try {
      const res = await api.post('/messages', {
        receiverId,
        message: textToSend,
        bookId
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        if (activeConversation.isNew) {
          fetchConversations();
        }
      }
    } catch (err) {
      showToast('Could not send message', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[75vh]">
        {/* Left Column: Conversations List */}
        <div className="md:col-span-4 lg:col-span-4 border-r border-slate-100 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-black text-lg text-primary tracking-tight">Messages & Swaps</h2>
            <p className="text-xs text-slate-400">Campus buyer-seller discussions</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const isSelected = activeConversation?.conversationId === conv.conversationId;
                return (
                  <button
                    key={conv._id || conv.conversationId}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                      isSelected ? 'bg-primary-50/70 border-l-4 border-primary' : 'hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={
                        conv.otherUser?.profileImage ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                      }
                      alt=""
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {conv.otherUser?.name || 'Student'}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {conv.lastMessage || 'Start conversation...'}
                      </p>
                      {conv.book && (
                        <span className="inline-block mt-1 text-[10px] text-accent font-semibold truncate max-w-[180px]">
                          📖 {conv.book.title}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700">No messages yet</p>
                <p className="text-[11px] text-slate-500">
                  Tip: Start a conversation by visiting any book listing and tapping "Chat with Seller" or "Contact Seller".
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Area */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col justify-between bg-slate-50/50">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      activeConversation.otherUser?.profileImage ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                    }
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {activeConversation.otherUser?.name || 'Student'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {activeConversation.otherUser?.college || 'Campus Peer'}
                    </p>
                  </div>
                </div>

                {activeConversation.book && (
                  <div className="hidden sm:flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="font-bold text-slate-800 truncate max-w-[150px]">
                      {activeConversation.book.title || 'Referenced Book'}
                    </span>
                  </div>
                )}
              </div>

              {/* Message History List */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3">
                {messages.length > 0 ? (
                  messages.map((msg, i) => {
                    const isMine =
                      (msg.sender?._id || msg.sender).toString() === user._id.toString();
                    return (
                      <div
                        key={msg._id || i}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isMine
                              ? 'bg-primary text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                          }`}
                        >
                          <p>{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-xs text-slate-400">
                    <Sparkles className="w-8 h-8 text-accent/60 mb-2" />
                    <p className="font-semibold text-slate-600">Start the conversation</p>
                    <p className="text-[11px] max-w-xs mt-1">
                      Propose a meetup location at the library or inquire about the book's condition.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Bar */}
              <div className="px-4 py-2 bg-white/80 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewMessageText(prompt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-[11px] font-medium text-slate-600 whitespace-nowrap transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Send Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type a message to coordinate meetup..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessageText.trim()}
                  className="p-2.5 rounded-xl bg-primary hover:bg-primary-light disabled:opacity-40 text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-1" />
              <h3 className="font-bold text-slate-700 text-base">No messages yet</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Start a conversation by selecting a student on the left or contacting a seller from Explore Books.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
