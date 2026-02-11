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
  listing: { id: string; title: string; price: number | null; type: string; status: string } | null;
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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-gray-500">Conversation not found.</p>
      </div>
    );
  }

  const otherPerson = conversation.participants.find((p) => p.id !== currentUserId);
  const isDm = !conversation.listing;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-slide-up">
      {/* Header */}
      <div className="glass rounded-t-2xl border border-gray-100/80 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">{otherPerson?.name?.charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{otherPerson?.name}</p>
            {isDm ? (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                Direct message
              </p>
            ) : (
              <Link href={`/listings/${conversation.listing!.id}`} className="text-xs text-indigo-600 hover:text-indigo-700">
                {conversation.listing!.title}
                {conversation.listing!.price != null && ` - $${conversation.listing!.price}`}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-3 border-x border-gray-100/80">
        {conversation.messages.map((msg) => {
          const isMine = msg.sender.id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm"
                    : "bg-white text-gray-900 border border-gray-200 shadow-sm"
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
        className="glass rounded-b-2xl border border-gray-100/80 p-4 flex gap-3"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 hover:bg-white transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all disabled:opacity-50 shadow-sm text-sm"
        >
          {sending ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
}
