/*
  src/components/Messages.js
  --------------------------
  This component handles the messaging feature between users.
  - Displays a list of conversations
  - Allows users to send and receive messages
  - Integrates with Firestore for real-time updates
  - Handles loading state and error messages
  
  This is used in App.js for the /messages route and is protected (only accessible when logged in).
*/

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

const getUserByUsernameOrEmail = async (identifier) => {
  try {
    // First try exact email match
    if (identifier.includes('@')) {
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', identifier.toLowerCase())
      );
      const userSnap = await getDocs(userQuery);
      if (!userSnap.empty) {
        return userSnap.docs[0].data();
      }
    }

    // Then try username match
    const userQuery = query(
      collection(db, 'users'),
      where('username', '==', identifier.toLowerCase())
    );
    const userSnap = await getDocs(userQuery);
    if (!userSnap.empty) {
      return userSnap.docs[0].data();
    }

    return null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
};

const Messages = () => {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [message, setMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');

  // Add this at the start of the component
  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth', { 
        state: { from: '/messages' },
        replace: true 
      });
    }
  }, [user, loading, navigate]);

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
        setLoading(true);
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
        setError(error.message);
        console.error('Error fetching conversations:', error);
        toast.error('Error loading conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  // Set up message listeners
  useEffect(() => {
    if (!user || !recipientEmail) return;

    let unsubscribe;
    const setupMessageListener = async () => {
      try {
        const q = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', user.email),
          orderBy('timestamp', 'desc')
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
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
      } catch (error) {
        setError(error.message);
        toast.error('Error loading messages');
      }
    };

    setupMessageListener();
    return () => unsubscribe && unsubscribe();
  }, [user, recipientEmail]);

  // Add this useEffect for auto-scrolling
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) {
      toast.error('Please enter a message');
      return;
    }
  
    if (!user) {
      toast.error('You must be logged in to send messages');
      navigate('/auth');
      return;
    }
  
    if (!recipientEmail) {
      toast.error('Please select a recipient');
      return;
    }
  
    try {
      setLoading(true);
      await addDoc(collection(db, 'messages'), {
        content: trimmedMessage,
        senderEmail: user.email,
        receiverEmail: recipientEmail,
        participants: [user.email, recipientEmail],
        timestamp: serverTimestamp(),
        read: false
      });
  
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = async (e) => {
    e.preventDefault();
    
    if (!newRecipientEmail.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
  
    try {
      setLoading(true);
      
      // Find user by username or email
      const recipientUser = await getUserByUsernameOrEmail(newRecipientEmail.trim());
      
      if (!recipientUser) {
        toast.error('User not found. Please check the username or email');
        return;
      }
  
      if (recipientUser.email === user.email) {
        toast.error("You can't send messages to yourself");
        return;
      }
  
      // Send the message
      await addDoc(collection(db, 'messages'), {
        content: message.trim(),
        senderEmail: user.email,
        receiverEmail: recipientUser.email,
        senderUsername: user.displayName || user.email,
        receiverUsername: recipientUser.username || recipientUser.email,
        participants: [user.email, recipientUser.email],
        timestamp: serverTimestamp(),
        read: false
      });
  
      // Close modal and reset form
      setShowNewMessageModal(false);
      setNewRecipientEmail('');
      setMessage('');
      setRecipientEmail(recipientUser.email);
      
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
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
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Messages</h2>
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            New Message
          </button>
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
                  <p className="font-medium">
                    {conversation.username || conversation.email}
                  </p>
                  <p className="text-xs text-gray-500">{conversation.email}</p>
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
                  <div ref={messagesEndRef} />
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

      {/* Add the New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">New Message</h3>
            <form onSubmit={handleNewMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Username or Email
                </label>
                <input
                  type="text"
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  placeholder="Enter username or email"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can enter either a username or email address
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  required
                />
              </div>
              <div className="flex space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewMessageModal(false);
                    setNewRecipientEmail('');
                    setMessage('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;