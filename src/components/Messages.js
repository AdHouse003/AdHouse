import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { IoSend, IoNotifications } from 'react-icons/io5';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

const Chatbox = () => {
  const [user] = useAuthState(auth);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [recipientProfile, setRecipientProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [searchEmail, setSearchEmail] = useState('');
  const location = useLocation();
  const { recipientEmail: locationRecipientEmail, initialMessage } = location.state || {};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Add authentication check at the start
  useEffect(() => {
    if (!user) {
      // Clear all states when user is not authenticated
      setMessages([]);
      setRecipientEmail('');
      setRecipientProfile(null);
      setNotifications([]);
      setUnreadMessages([]);
      setRecentChats([]);
      return;
    }
  }, [user]);

  // Fetch recipient profile
  useEffect(() => {
    if (!recipientEmail) return;

    const fetchRecipientProfile = async () => {
      const q = query(collection(db, 'users'), where('email', '==', recipientEmail));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setRecipientProfile(querySnapshot.docs[0].data());
      }
    };

    fetchRecipientProfile();
  }, [recipientEmail]);

  // Update the messages useEffect
  useEffect(() => {
    let unsubscribeSent = () => {};
    let unsubscribeReceived = () => {};

    const setupMessageListeners = async () => {
      if (!user || !recipientEmail) return;

      try {
        const sentMessagesQuery = query(
          collection(db, 'messages'),
          where('senderEmail', '==', user.email),
          where('receiverEmail', '==', recipientEmail),
          orderBy('timestamp', 'asc')
        );

        const receivedMessagesQuery = query(
          collection(db, 'messages'),
          where('senderEmail', '==', recipientEmail),
          where('receiverEmail', '==', user.email),
          orderBy('timestamp', 'asc')
        );

        unsubscribeSent = onSnapshot(sentMessagesQuery, (snapshot) => {
          if (!user) return; // Additional check to prevent updates after logout
          const sentMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(current => {
            const newMessages = [...current];
            sentMessages.forEach(msg => {
              if (!newMessages.find(m => m.id === msg.id)) {
                newMessages.push(msg);
              }
            });
            return newMessages.sort((a, b) => a.timestamp - b.timestamp);
          });
        });

        unsubscribeReceived = onSnapshot(receivedMessagesQuery, (snapshot) => {
          if (!user) return; // Additional check to prevent updates after logout
          const receivedMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(current => {
            const newMessages = [...current];
            receivedMessages.forEach(msg => {
              if (!newMessages.find(m => m.id === msg.id)) {
                newMessages.push(msg);
              }
            });
            return newMessages.sort((a, b) => a.timestamp - b.timestamp);
          });
        });
      } catch (error) {
        console.error('Error setting up message listeners:', error);
      }
    };

    setupMessageListeners();

    return () => {
      unsubscribeSent();
      unsubscribeReceived();
      setMessages([]); // Clear messages on cleanup
    };
  }, [user, recipientEmail]);

  // Update the notifications useEffect
  useEffect(() => {
    let unsubscribeUnread = () => {};
    let unsubscribeRecent = () => {};

    const setupNotificationListeners = async () => {
      if (!user) return;

      try {
        const unreadMessagesQuery = query(
          collection(db, 'messages'),
          where('receiverEmail', '==', user.email),
          where('read', '==', false),
          orderBy('timestamp', 'desc')
        );

        unsubscribeUnread = onSnapshot(unreadMessagesQuery, (snapshot) => {
          if (!user) return; // Additional check to prevent updates after logout
          const unreadMsgs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUnreadMessages(unreadMsgs);
          
          const groupedNotifications = unreadMsgs.reduce((acc, msg) => {
            if (!acc[msg.senderEmail]) {
              acc[msg.senderEmail] = [];
            }
            acc[msg.senderEmail].push(msg);
            return acc;
          }, {});
          
          setNotifications(Object.entries(groupedNotifications).map(([sender, messages]) => ({
            sender,
            messages,
            latestMessage: messages[0],
          })));
        });

        const recentChatsQuery = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', user.email),
          orderBy('timestamp', 'desc')
        );

        unsubscribeRecent = onSnapshot(recentChatsQuery, (snapshot) => {
          if (!user) return; // Additional check to prevent updates after logout
          const chats = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          const groupedChats = chats.reduce((acc, msg) => {
            const chatPartner = msg.senderEmail === user.email ? msg.receiverEmail : msg.senderEmail;
            if (!acc[chatPartner] || acc[chatPartner].timestamp < msg.timestamp) {
              acc[chatPartner] = msg;
            }
            return acc;
          }, {});
          
          setRecentChats(Object.values(groupedChats));
        });
      } catch (error) {
        console.error('Error setting up notification listeners:', error);
      }
    };

    setupNotificationListeners();

    return () => {
      unsubscribeUnread();
      unsubscribeRecent();
      setNotifications([]);
      setUnreadMessages([]);
      setRecentChats([]);
    };
  }, [user]);

  useEffect(() => {
    if (locationRecipientEmail) {
      setRecipientEmail(locationRecipientEmail);
      // If there's an initial message, set it in the input
      if (initialMessage) {
        setMessage(initialMessage);
      }
    }
  }, [locationRecipientEmail, initialMessage]);

  const handleSearchInputChange = (e) => {
    setSearchEmail(e.target.value);
    setError(''); // Clear any existing errors
  };

  const handleSearch = async (e) => {
    e?.preventDefault(); // Handle both button click and form submit
    
    if (!user) return;
    if (!searchEmail.trim()) {
      setError('Please enter an email to search');
      return;
    }

    try {
      setIsLoading(true);
      const recipientQuery = query(
        collection(db, 'users'),
        where('email', '==', searchEmail.trim())
      );
      
      const recipientSnapshot = await getDocs(recipientQuery);
      
      if (recipientSnapshot.empty) {
        setError('Recipient email does not exist.');
        setRecipientProfile(null);
        setRecipientEmail('');
      } else {
        setError('');
        setRecipientEmail(searchEmail.trim());
        setRecipientProfile(recipientSnapshot.docs[0].data());
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setError('Error checking email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || !recipientEmail.trim()) {
      alert('Please enter a message and recipient email.');
      return;
    }

    setIsSending(true);
    try {
      const recipientQuery = query(
        collection(db, 'users'),
        where('email', '==', recipientEmail.trim())
      );
      const recipientSnapshot = await getDocs(recipientQuery);

      if (recipientSnapshot.empty) {
        setError('Recipient email does not exist.');
        setIsSending(false);
        return;
      }

      setError('');

      await addDoc(collection(db, 'messages'), {
        senderEmail: user.email,
        receiverEmail: recipientEmail.trim(),
        content: message.trim(),
        timestamp: new Date(),
        participants: [user.email, recipientEmail.trim()],
        read: false,
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const markAsRead = async (senderEmail) => {
    try {
      const unreadQuery = query(
        collection(db, 'messages'),
        where('senderEmail', '==', senderEmail),
        where('receiverEmail', '==', user.email),
        where('read', '==', false)
      );

      const unreadSnapshot = await getDocs(unreadQuery);
      
      const updatePromises = unreadSnapshot.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
      );
      
      await Promise.all(updatePromises);
      setRecipientEmail(senderEmail);

      const recipientQuery = query(
        collection(db, 'users'),
        where('email', '==', senderEmail)
      );
      
      const recipientSnapshot = await getDocs(recipientQuery);
      if (!recipientSnapshot.empty) {
        setRecipientProfile(recipientSnapshot.docs[0].data());
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return format(timestamp.toDate(), 'h:mm a');
  };

  const renderSidebar = () => (
    <div className="w-1/4 bg-white border-r border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Messages</h2>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 rounded-full relative"
          >
            <IoNotifications size={24} />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          
          {showNotifications && notifications.length > 0 && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-10 border">
              <div className="p-2">
                <h3 className="text-sm font-semibold mb-2">New Messages</h3>
                {notifications.map(({ sender, latestMessage }) => (
                  <div
                    key={latestMessage.id}
                    className="p-2 hover:bg-gray-50 cursor-pointer rounded"
                    onClick={() => {
                      markAsRead(sender);
                      setShowNotifications(false);
                    }}
                  >
                    <p className="font-semibold text-sm">{sender}</p>
                    <p className="text-sm text-gray-600 truncate">{latestMessage.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="email"
            className="flex-1 p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by email..."
            value={searchEmail}
            onChange={handleSearchInputChange}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>

      <div className="space-y-2">
        {recentChats.map((chat) => {
          const chatPartner = chat.senderEmail === user.email ? chat.receiverEmail : chat.senderEmail;
          const unreadCount = unreadMessages.filter(msg => msg.senderEmail === chatPartner).length;
          
          return (
            <div
              key={chat.id}
              onClick={() => markAsRead(chatPartner)}
              className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{chatPartner}</p>
                <p className="text-sm text-gray-600 truncate">{chat.content}</p>
              </div>
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {renderSidebar()}
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 shadow-sm border-b">
          {recipientEmail ? (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {recipientProfile?.name ? recipientProfile.name[0].toUpperCase() : recipientEmail[0].toUpperCase()}
              </div>
              <div className="ml-3">
                <h3 className="font-semibold">{recipientProfile?.name || recipientEmail}</h3>
                <p className="text-sm text-gray-500">
                  {recipientProfile?.isOnline ? 'Active Now' : 'Offline'}
                </p>
              </div>
            </div>
          ) : (
            <h3 className="font-semibold">New Conversation</h3>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.senderEmail === user.email ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.senderEmail === user.email
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.senderEmail === user.email ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={sendMessage} className="bg-white p-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              className={`bg-blue-500 text-white p-3 rounded-lg transition-colors duration-200 flex items-center justify-center
                ${!message.trim() || isSending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              disabled={!message.trim() || isSending}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <IoSend size={20} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbox;