import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const Messages = () => {
  const [user] = useAuthState(auth);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!user || !recipientEmail) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.email),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => doc.data());
      setMessages(fetchedMessages);
    });

    return unsubscribe;
  }, [user, recipientEmail]);

  const sendMessage = async () => {
    if (!message.trim() || !recipientEmail.trim()) {
      alert('Please enter a message and recipient email.');
      return;
    }

    try {
      await addDoc(collection(db, 'messages'), {
        senderEmail: user.email,
        receiverEmail: recipientEmail.trim(),
        content: message.trim(),
        timestamp: new Date(),
        participants: [user.email, recipientEmail.trim()],
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Messaging</h1>

      {/* Recipient Email Input */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Recipient Email</label>
        <input
          type="email"
          className="w-full p-2 border rounded-lg"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
      </div>

      {/* Message Input */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Message</label>
        <textarea
          className="w-full p-2 border rounded-lg"
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {/* Send Button */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        onClick={sendMessage}
      >
        Send Message
      </button>

      {/* Messages Display */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Messages</h2>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                msg.senderEmail === user.email
                  ? 'bg-blue-200 text-right'
                  : 'bg-gray-200 text-left'
              }`}
            >
              <p className="text-sm text-gray-600">
                From: {msg.senderEmail} | To: {msg.receiverEmail}
              </p>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;
