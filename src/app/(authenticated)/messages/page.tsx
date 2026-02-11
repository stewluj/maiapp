"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  listing: { id: string; title: string; price: number | null; type: string } | null;
  participants: { id: string; name: string; email: string }[];
  messages: { id: string; content: string; createdAt: string }[];
}

interface UserResult {
  id: string;
  name: string;
  email: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [showNewDm, setShowNewDm] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [dmMessage, setDmMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [sending, setSending] = useState(false);

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

  async function searchUsers(query: string) {
    setUserSearch(query);
    if (query.length < 2) {
      setUserResults([]);
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/users?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    setUserResults(data.users || []);
    setSearching(false);
  }

  async function sendDm(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !dmMessage.trim()) return;
    setSending(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId: selectedUser.id,
        content: dmMessage,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const convId = data.conversation?.id || data.conversationId;
      router.push(`/messages/${convId}`);
    }
    setSending(false);
  }

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
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">Your conversations with other students</p>
        </div>
        <button
          onClick={() => { setShowNewDm(!showNewDm); setSelectedUser(null); setUserSearch(""); setUserResults([]); setDmMessage(""); }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            showNewDm
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          }`}
        >
          {showNewDm ? "Cancel" : "+ New Message"}
        </button>
      </div>

      {/* New DM composer */}
      {showNewDm && (
        <div className="bg-white rounded-2xl border border-gray-100/80 p-6 mb-6 animate-scale-in">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            Send a direct message
          </h3>

          {!selectedUser ? (
            <>
              <div className="relative mb-3">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder="Search for a student by name or email..."
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 hover:bg-white transition-colors text-sm"
                  autoFocus
                />
              </div>

              {searching && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                  Searching...
                </div>
              )}

              {userResults.length > 0 && (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {userResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50/50 transition-all text-left group"
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">{u.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors text-sm">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {userSearch.length >= 2 && userResults.length === 0 && !searching && (
                <p className="text-sm text-gray-500 text-center py-3">No students found.</p>
              )}
            </>
          ) : (
            <form onSubmit={sendDm}>
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">{selectedUser.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <textarea
                required
                value={dmMessage}
                onChange={(e) => setDmMessage(e.target.value)}
                placeholder={`Write a message to ${selectedUser.name.split(" ")[0]}...`}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 hover:bg-white transition-colors mb-3 text-sm"
                rows={3}
                autoFocus
              />
              <button
                type="submit"
                disabled={sending || !dmMessage.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all disabled:opacity-50 shadow-sm hover:shadow-md text-sm"
              >
                {sending ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send message"
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center animate-scale-in">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1">No conversations yet.</p>
          <p className="text-sm text-gray-400">
            Click &quot;+ New Message&quot; to start a conversation with someone.
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
            const isDm = !conv.listing;

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
                        <p className="text-xs text-gray-500">
                          {isDm ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                              Direct message
                            </span>
                          ) : (
                            conv.listing?.title
                          )}
                        </p>
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
                    {conv.listing?.price != null && (
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
