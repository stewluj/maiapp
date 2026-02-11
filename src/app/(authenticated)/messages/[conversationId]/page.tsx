"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
}

interface Conversation {
  id: string;
  listing: { id: string; title: string; price: number | null; type: string; status: string };
  participants: { id: string; name: string; email: string }[];
  messages: Message[];
}

export default function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversation, 5000);
    return () => clearInterval(interval);
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  async function fetchData() {
    const [convData, userData] = await Promise.all([
      fetch(`/api/messages/${conversationId}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    setConversation(convData.conversation);
    setCurrentUserId(userData.user?.id || "");
    setLoading(false);
  }

  async function fetchConversation() {
    const res = await fetch(`/api/messages/${conversationId}`);
    const data = await res.json();
    if (data.conversation) {
      setConversation(data.conversation);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content: newMessage }),
    });

    setNewMessage("");
    await fetchConversation();
    setSending(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-500">Loading...</div>;
  }

  if (!conversation) {
    return <div className="text-center py-20 text-gray-500">Conversation not found.</div>;
  }

  const otherPerson = conversation.participants.find((p) => p.id !== currentUserId);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white rounded-t-xl border border-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-medium text-sm">{otherPerson?.name?.charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{otherPerson?.name}</p>
            <Link href={`/listings/${conversation.listing.id}`} className="text-xs text-indigo-600 hover:text-indigo-700">
              {conversation.listing.title}
              {conversation.listing.price != null && ` - $${conversation.listing.price}`}
            </Link>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3 border-x border-gray-100">
        {conversation.messages.map((msg) => {
          const isMine = msg.sender.id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? "text-indigo-200" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="bg-white rounded-b-xl border border-gray-100 p-4 flex gap-3"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
