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
  imageUrl: string | null;
  status: string;
  createdAt: string;
  seller: { id: string; name: string; email: string };
  course: { id: string; name: string; courseNumber: string } | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { id: string; name: string };
  listing: { id: string; title: string } | null;
}

interface ReviewStats {
  count: number;
  averageRating: number;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses[size]} ${star <= rating ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function InteractiveStarRating({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(star)}
          className="transition-transform hover:scale-110"
        >
          <svg
            className={`w-8 h-8 transition-colors ${
              star <= (hovered || rating) ? "text-amber-400" : "text-gray-200"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function TrustBadge({ stats }: { stats: ReviewStats }) {
  if (stats.count === 0) return (
    <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">New seller</span>
  );

  let color = "bg-gray-100 text-gray-600";
  let label = "Seller";
  if (stats.averageRating >= 4.5 && stats.count >= 3) {
    color = "bg-emerald-50 text-emerald-700 border border-emerald-200";
    label = "Highly Trusted";
  } else if (stats.averageRating >= 3.5) {
    color = "bg-blue-50 text-blue-700 border border-blue-200";
    label = "Trusted";
  } else if (stats.averageRating >= 2.5) {
    color = "bg-amber-50 text-amber-700 border border-amber-200";
    label = "Average";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {stats.averageRating} {label}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ count: 0, averageRating: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/listings/${id}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([listingData, userData]) => {
      setListing(listingData.listing);
      setCurrentUserId(userData.user?.id || "");
      setLoading(false);

      if (listingData.listing?.seller?.id) {
        fetchReviews(listingData.listing.seller.id);
      }
    });
  }, [id]);

  async function fetchReviews(sellerId: string) {
    const res = await fetch(`/api/reviews?sellerId=${sellerId}`);
    const data = await res.json();
    setReviews(data.reviews || []);
    setReviewStats(data.stats || { count: 0, averageRating: 0 });
  }

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

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!listing || reviewRating === 0) return;
    setSubmittingReview(true);
    setReviewError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sellerId: listing.seller.id,
        rating: reviewRating,
        comment: reviewComment || null,
        listingId: listing.id,
      }),
    });

    if (res.ok) {
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment("");
      fetchReviews(listing.seller.id);
    } else {
      const data = await res.json();
      setReviewError(data.error || "Failed to submit review");
    }
    setSubmittingReview(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20 animate-scale-in">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Listing not found</p>
        <Link href="/marketplace" className="text-indigo-600 text-sm mt-2 inline-block hover:text-indigo-700">
          Back to marketplace
        </Link>
      </div>
    );
  }

  const isOwner = currentUserId === listing.seller.id;
  const hasReviewed = reviews.some((r) => r.reviewer.id === currentUserId);
  const createdDate = new Date(listing.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const categoryIcons: Record<string, string> = {
    TEXTBOOK: "📚", NOTES: "📝", LAB_EQUIPMENT: "🔬", CALCULATOR: "🔢",
    STUDY_GUIDE: "📖", TICKETS: "🎫", CLOTHING: "👕", ELECTRONICS: "💻",
    FURNITURE: "🪑", OTHER: "📦",
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      {/* Breadcrumb */}
      <Link
        href={listing.course ? `/courses/${listing.course.id}` : "/marketplace"}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 group transition-colors"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to {listing.course ? listing.course.courseNumber : "marketplace"}
      </Link>

      <div className="grid gap-6 md:grid-cols-[1fr,280px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Listing card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Category banner */}
            <div className={`h-1.5 ${
              listing.type === "SELLING"
                ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                : "bg-gradient-to-r from-blue-400 to-indigo-500"
            }`} />

            {listing.imageUrl && (
              <img src={listing.imageUrl} alt={listing.title} className="w-full h-64 object-cover" />
            )}

            <div className="p-6 md:p-8">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  listing.type === "SELLING"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                }`}>
                  {listing.type === "SELLING" ? "For Sale" : "Looking For"}
                </span>
                <span className="text-xs font-medium bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full ring-1 ring-gray-100">
                  {categoryIcons[listing.category] || "📦"} {listing.category.replace(/_/g, " ")}
                </span>
                {listing.condition && (
                  <span className="text-xs font-medium bg-violet-50 text-violet-600 px-3 py-1.5 rounded-full ring-1 ring-violet-100">
                    {listing.condition}
                  </span>
                )}
                {listing.status !== "ACTIVE" && (
                  <span className="text-xs font-semibold bg-red-50 text-red-600 px-3 py-1.5 rounded-full ring-1 ring-red-200">
                    {listing.status}
                  </span>
                )}
              </div>

              {/* Title & price */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{listing.title}</h1>
                {listing.price != null && (
                  <div className="shrink-0 text-right">
                    <div className="text-3xl font-bold text-emerald-600">${listing.price}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              {listing.description && (
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                {listing.course && (
                  <Link
                    href={`/courses/${listing.course.id}`}
                    className="bg-indigo-50/50 rounded-xl p-3.5 hover:bg-indigo-50 transition-colors group/detail"
                  >
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Course</span>
                    <p className="font-bold text-indigo-600 group-hover/detail:text-indigo-700 mt-0.5 text-sm">
                      {listing.course.courseNumber}
                    </p>
                  </Link>
                )}
                <div className="bg-gray-50/80 rounded-xl p-3.5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Posted</span>
                  <p className="font-semibold text-gray-900 mt-0.5 text-sm">{createdDate}</p>
                </div>
                {listing.condition && (
                  <div className="bg-gray-50/80 rounded-xl p-3.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Condition</span>
                    <p className="font-semibold text-gray-900 mt-0.5 text-sm">{listing.condition}</p>
                  </div>
                )}
              </div>

              {/* Owner controls */}
              {isOwner && listing.status === "ACTIVE" && (
                <div className="border-t border-gray-100 pt-6 mt-6 flex gap-3">
                  <button
                    onClick={() => handleStatusChange("SOLD")}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md text-sm"
                  >
                    Mark as Sold
                  </button>
                  <button
                    onClick={() => handleStatusChange("CLOSED")}
                    className="px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-all text-sm"
                  >
                    Close Listing
                  </button>
                </div>
              )}

              {/* Contact seller */}
              {!isOwner && listing.status === "ACTIVE" && (
                <form onSubmit={handleContact} className="border-t border-gray-100 pt-6 mt-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 hover:bg-white transition-colors mb-3 text-sm"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all disabled:opacity-50 shadow-sm hover:shadow-md text-sm"
                  >
                    {sending ? (
                      <span className="flex items-center justify-center gap-2">
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
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Seller card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-4">Seller</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                <span className="text-white font-bold text-lg">
                  {listing.seller.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900">{listing.seller.name}</p>
                <TrustBadge stats={reviewStats} />
              </div>
            </div>

            {/* Rating summary */}
            {reviewStats.count > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-bold text-gray-900">{reviewStats.averageRating}</span>
                  <StarRating rating={Math.round(reviewStats.averageRating)} size="md" />
                </div>
                <p className="text-xs text-gray-500">{reviewStats.count} review{reviewStats.count !== 1 ? "s" : ""}</p>
              </div>
            )}

            {/* Review button */}
            {!isOwner && !hasReviewed && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className={`w-full py-2.5 text-sm font-medium rounded-xl transition-all ${
                  showReviewForm
                    ? "bg-gray-100 text-gray-600"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100 ring-1 ring-amber-200"
                }`}
              >
                {showReviewForm ? "Cancel" : "Leave a review"}
              </button>
            )}
            {hasReviewed && (
              <p className="text-xs text-center text-gray-400 mt-2">You&apos;ve reviewed this seller</p>
            )}
          </div>

          {/* Review form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-scale-in">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Rate this seller</h3>

              {reviewError && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs mb-3 border border-red-100">
                  {reviewError}
                </div>
              )}

              <div className="flex justify-center mb-4">
                <InteractiveStarRating rating={reviewRating} onRate={setReviewRating} />
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience (optional)"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50/50 hover:bg-white transition-colors mb-3 text-sm"
                rows={3}
              />

              <button
                type="submit"
                disabled={submittingReview || reviewRating === 0}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 shadow-sm text-sm"
              >
                {submittingReview ? "Submitting..." : "Submit review"}
              </button>
            </form>
          )}

          {/* Reviews list */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-4">Reviews</h3>
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-[10px]">
                            {review.reviewer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{review.reviewer.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{timeAgo(review.createdAt)}</span>
                    </div>
                    <StarRating rating={review.rating} />
                    {review.comment && (
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
