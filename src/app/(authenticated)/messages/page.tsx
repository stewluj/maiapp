"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  listing: { id: string; title: string; price: number | null; type: string };
  participants: { id: string; name: string; email: string }[];
  messages: { id: string; content: string; createdAt: string }[];
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/messages").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([convData, userData]) => {
      setConversations(convData.conversations || []);
      setCurrentUserId(userData.user?.id || "");
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">Your conversations with other students</p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center animate-scale-in">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1">No conversations yet.</p>
          <p className="text-sm text-gray-400">
            Start a conversation by messaging a seller on a listing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv, i) => {
            const otherPerson = conv.participants.find((p) => p.id !== currentUserId);
            const lastMessage = conv.messages[0];
            const timeAgo = lastMessage
              ? formatTimeAgo(new Date(lastMessage.createdAt))
              : "";

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className={`block bg-white rounded-2xl border border-gray-100/80 p-5 card-hover group animate-slide-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">
                          {otherPerson?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                          {otherPerson?.name}
                        </p>
                        <p className="text-xs text-gray-500">{conv.listing.title}</p>
                      </div>
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-gray-500 mt-2 truncate ml-13">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-xs text-gray-400">{timeAgo}</p>
                    {conv.listing.price != null && (
                      <p className="text-sm font-bold text-green-600 mt-1 bg-green-50 px-2 py-0.5 rounded-lg">
                        ${conv.listing.price}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
