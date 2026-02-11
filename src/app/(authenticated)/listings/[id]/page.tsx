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
    return <div className="flex items-center justify-center py-20 text-gray-500">Loading...</div>;
  }

  if (!listing) {
    return <div className="text-center py-20 text-gray-500">Listing not found.</div>;
  }

  const isOwner = currentUserId === listing.seller.id;
  const createdDate = new Date(listing.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={listing.course ? `/courses/${listing.course.id}` : "/marketplace"} className="text-sm text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
        &larr; Back
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  listing.type === "SELLING"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {listing.type === "SELLING" ? "For Sale" : "Looking For"}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {listing.category.replace(/_/g, " ")}
              </span>
              {listing.status !== "ACTIVE" && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {listing.status}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
          </div>
          {listing.price != null && (
            <span className="text-2xl font-bold text-green-700">${listing.price}</span>
          )}
        </div>

        {listing.description && (
          <p className="text-gray-600 mb-4 whitespace-pre-wrap">{listing.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          {listing.condition && (
            <div>
              <span className="text-gray-500">Condition:</span>
              <span className="ml-1 font-medium text-gray-900">{listing.condition}</span>
            </div>
          )}
          {listing.course && (
            <div>
              <span className="text-gray-500">Course:</span>
              <Link href={`/courses/${listing.course.id}`} className="ml-1 font-medium text-indigo-600 hover:text-indigo-700">
                {listing.course.courseNumber}
              </Link>
            </div>
          )}
          <div>
            <span className="text-gray-500">Posted:</span>
            <span className="ml-1 font-medium text-gray-900">{createdDate}</span>
          </div>
          <div>
            <span className="text-gray-500">Seller:</span>
            <span className="ml-1 font-medium text-gray-900">{listing.seller.name}</span>
          </div>
        </div>

        {/* Owner controls */}
        {isOwner && listing.status === "ACTIVE" && (
          <div className="border-t border-gray-100 pt-4 flex gap-3">
            <button
              onClick={() => handleStatusChange("SOLD")}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
            >
              Mark as Sold
            </button>
            <button
              onClick={() => handleStatusChange("CLOSED")}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
            >
              Close Listing
            </button>
          </div>
        )}

        {/* Contact seller */}
        {!isOwner && listing.status === "ACTIVE" && (
          <form onSubmit={handleContact} className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {listing.type === "SELLING" ? "Message the seller" : "Respond to this request"}
            </h3>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${listing.seller.name.split(" ")[0]}, I'm interested in "${listing.title}"...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
              rows={3}
            />
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
