import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { IoSend } from 'react-icons/io5';

const Messages = () => {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [message, setMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Handle navigation state
  useEffect(() => {
    if (location.state?.recipientEmail) {
      setRecipientEmail(location.state.recipientEmail);
      if (location.state?.initialMessage) {
        setMessage(location.state.initialMessage);
      }
    }
  }, [location.state]);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const q = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', user.email),
          orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const conversationMap = new Map();
          
          snapshot.docs.forEach(doc => {
            const message = { id: doc.id, ...doc.data() };
            const otherParticipant = message.participants.find(p => p !== user.email);
            
            if (!conversationMap.has(otherParticipant)) {
              conversationMap.set(otherParticipant, {
                email: otherParticipant,
                lastMessage: message.content,
                timestamp: message.timestamp,
              });
            }
          });

          setConversations(Array.from(conversationMap.values()));
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Error loading conversations');
      }
    };

    fetchConversations();
  }, [user]);

  // Set up message listeners
  useEffect(() => {
    if (!user || !recipientEmail) return;

    setLoading(true);

    try {
      const q = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', user.email),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messageList = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(msg => 
            (msg.senderEmail === user.email && msg.receiverEmail === recipientEmail) ||
            (msg.senderEmail === recipientEmail && msg.receiverEmail === user.email)
          )
          .reverse();

        setMessages(messageList);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up message listeners:', error);
      toast.error('Error loading messages');
      setLoading(false);
    }
  }, [user, recipientEmail]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user || !recipientEmail) return;

    try {
      await addDoc(collection(db, 'messages'), {
        content: message.trim(),
        senderEmail: user.email,
        receiverEmail: recipientEmail,
        participants: [user.email, recipientEmail],
        timestamp: serverTimestamp(),
        read: false
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-73px)]">
          {conversations.map((conversation) => (
            <div
              key={conversation.email}
              onClick={() => setRecipientEmail(conversation.email)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                recipientEmail === conversation.email ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <p className="font-medium">{conversation.email}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.timestamp && (
                  <span className="text-xs text-gray-500">
                    {conversation.timestamp.toDate().toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {recipientEmail ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 shadow-sm">
              <h3 className="font-semibold">{recipientEmail}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderEmail === user.email ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.senderEmail === user.email
                            ? 'bg-blue-500 text-white'
                            : 'bg-white shadow-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderEmail === user.email ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {msg.timestamp?.toDate?.() ? msg.timestamp.toDate().toLocaleTimeString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="bg-white p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IoSend size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;