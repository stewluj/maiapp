"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  category: string;
  type: "SELLING" | "LOOKING_FOR";
  condition: string | null;
  status: string;
  createdAt: string;
  seller: { id: string; name: string; email: string };
  course: { id: string; name: string; courseNumber: string } | null;
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/listings/${id}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([listingData, userData]) => {
      setListing(listingData.listing);
      setCurrentUserId(userData.user?.id || "");
      setLoading(false);
    });
  }, [id]);

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    if (!listing || !message.trim()) return;
    setSending(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: listing.id,
        receiverId: listing.seller.id,
        content: message,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/messages/${data.conversation?.id || data.conversationId}`);
    }
    setSending(false);
  }

  async function handleStatusChange(status: string) {
    await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const res = await fetch(`/api/listings/${id}`);
    const data = await res.json();
    setListing(data.listing);
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

  if (!listing) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-gray-500">Listing not found.</p>
      </div>
    );
  }

  const isOwner = currentUserId === listing.seller.id;
  const createdDate = new Date(listing.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <Link
        href={listing.course ? `/courses/${listing.course.id}` : "/marketplace"}
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mb-4 group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100/80 p-7 shadow-sm">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  listing.type === "SELLING"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {listing.type === "SELLING" ? "For Sale" : "Looking For"}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                {listing.category.replace(/_/g, " ")}
              </span>
              {listing.status !== "ACTIVE" && (
                <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">
                  {listing.status}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
          </div>
          {listing.price != null && (
            <span className="text-3xl font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl">
              ${listing.price}
            </span>
          )}
        </div>

        {listing.description && (
          <p className="text-gray-600 mb-6 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {listing.condition && (
            <div className="bg-gray-50 rounded-xl p-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Condition</span>
              <p className="font-semibold text-gray-900 mt-0.5">{listing.condition}</p>
            </div>
          )}
          {listing.course && (
            <div className="bg-gray-50 rounded-xl p-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Course</span>
              <Link href={`/courses/${listing.course.id}`} className="block font-semibold text-indigo-600 hover:text-indigo-700 mt-0.5">
                {listing.course.courseNumber}
              </Link>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Posted</span>
            <p className="font-semibold text-gray-900 mt-0.5">{createdDate}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Seller</span>
            <p className="font-semibold text-gray-900 mt-0.5">{listing.seller.name}</p>
          </div>
        </div>

        {/* Owner controls */}
        {isOwner && listing.status === "ACTIVE" && (
          <div className="border-t border-gray-100 pt-5 flex gap-3">
            <button
              onClick={() => handleStatusChange("SOLD")}
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-medium rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-sm"
            >
              Mark as Sold
            </button>
            <button
              onClick={() => handleStatusChange("CLOSED")}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all"
            >
              Close Listing
            </button>
          </div>
        )}

        {/* Contact seller */}
        {!isOwner && listing.status === "ACTIVE" && (
          <form onSubmit={handleContact} className="border-t border-gray-100 pt-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              {listing.type === "SELLING" ? "Message the seller" : "Respond to this request"}
            </h3>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${listing.seller.name.split(" ")[0]}, I'm interested in "${listing.title}"...`}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 hover:bg-white transition-colors mb-3"
              rows={3}
            />
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
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
    </div>
  );
}
