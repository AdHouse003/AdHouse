import React, { useState, useEffect } from 'react';
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
} from 'firebase/firestore';

const Chatbox = () => {
  const [user] = useAuthState(auth);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  // Fetch messages between the logged-in user and the recipient
  useEffect(() => {
    if (!user || !recipientEmail) return;

    console.log('Setting up message listener for:', {
      currentUser: user.email,
      recipient: recipientEmail
    });

    // Create two queries - one for sent messages and one for received messages
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

    // Set up listeners for both queries
    const unsubscribeSent = onSnapshot(sentMessagesQuery, (snapshot) => {
      const sentMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Sent messages:', sentMessages);
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

    const unsubscribeReceived = onSnapshot(receivedMessagesQuery, (snapshot) => {
      const receivedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Received messages:', receivedMessages);
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

    // Clean up both listeners
    return () => {
      unsubscribeSent();
      unsubscribeReceived();
    };
  }, [user, recipientEmail]);

  const sendMessage = async () => {
    if (!message.trim() || !recipientEmail.trim()) {
      alert('Please enter a message and recipient email.');
      return;
    }

    try {
      // Verify if the recipient exists
      const recipientQuery = query(
        collection(db, 'users'),
        where('email', '==', recipientEmail.trim())
      );
      const recipientSnapshot = await getDocs(recipientQuery);

      if (recipientSnapshot.empty) {
        setError('Recipient does not exist.');
        return;
      }

      setError(''); // Clear error message if recipient exists

      // Add the message to Firestore
      await addDoc(collection(db, 'messages'), {
        senderEmail: user.email,
        receiverEmail: recipientEmail.trim(),
        content: message.trim(),
        timestamp: new Date(),
        participants: [user.email, recipientEmail.trim()],
      });

      setMessage(''); // Clear the input after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Chatbox</h1>

      {/* Recipient Selection */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Recipient Email</label>
        <input
          type="email"
          className="w-full p-2 border rounded-lg"
          placeholder="Enter recipient email..."
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Chat Messages */}
      <div className="h-80 overflow-y-scroll border p-4 rounded-lg bg-gray-100 mb-4">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 mb-2 rounded-lg ${
                msg.senderEmail === user.email
                  ? 'bg-blue-200 text-right self-end'
                  : 'bg-gray-200 text-left self-start'
              }`}
            >
              <p className="text-sm text-gray-600">
                {msg.senderEmail === user.email ? 'You' : msg.senderEmail}
              </p>
              <p>{msg.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet. Start a conversation!</p>
        )}
      </div>

      {/* Message Input */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded-lg"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbox;

