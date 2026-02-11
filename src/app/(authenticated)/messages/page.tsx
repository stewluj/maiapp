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
    return <div className="flex items-center justify-center py-20 text-gray-500">Loading messages...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 mb-2">No conversations yet.</p>
          <p className="text-sm text-gray-400">
            Start a conversation by messaging a seller on a listing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const otherPerson = conv.participants.find((p) => p.id !== currentUserId);
            const lastMessage = conv.messages[0];
            const timeAgo = lastMessage
              ? formatTimeAgo(new Date(lastMessage.createdAt))
              : "";

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {otherPerson?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{otherPerson?.name}</p>
                        <p className="text-xs text-gray-500">{conv.listing.title}</p>
                      </div>
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-gray-600 mt-2 truncate ml-10">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-xs text-gray-400">{timeAgo}</p>
                    {conv.listing.price != null && (
                      <p className="text-sm font-medium text-green-700 mt-1">
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
