"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  category: string;
  type: string;
  condition: string | null;
  imageUrl: string | null;
  createdAt: string;
  seller: { id: string; name: string };
  course?: { courseNumber: string; name: string } | null;
}

const GENERAL_CATEGORIES = [
  { value: "", label: "All", icon: "🏪" },
  { value: "TICKETS", label: "Tickets", icon: "🎫" },
  { value: "CLOTHING", label: "Clothing", icon: "👕" },
  { value: "ELECTRONICS", label: "Electronics", icon: "💻" },
  { value: "FURNITURE", label: "Furniture", icon: "🪑" },
  { value: "OTHER", label: "Other", icon: "📦" },
];

const COURSE_CATEGORIES = [
  { value: "", label: "All", icon: "📚" },
  { value: "TEXTBOOK", label: "Textbooks", icon: "📖" },
  { value: "NOTES", label: "Notes", icon: "📝" },
  { value: "LAB_EQUIPMENT", label: "Lab Equipment", icon: "🔬" },
  { value: "CALCULATOR", label: "Calculators", icon: "🔢" },
  { value: "STUDY_GUIDE", label: "Study Guides", icon: "📋" },
];

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

export default function MarketplacePage() {
  const [tab, setTab] = useState<"courses" | "general">("courses");
  const [courseListings, setCourseListings] = useState<Listing[]>([]);
  const [generalListings, setGeneralListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    price: "",
    category: "TICKETS",
    condition: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (tab === "courses") {
      fetchCourseListings();
    } else {
      fetchGeneralListings();
    }
  }, [tab, category, search]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchCourseListings() {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const res = await fetch(`/api/listings?${params}`);
    const data = await res.json();
    setCourseListings(data.listings || []);
    setLoading(false);
  }

  async function fetchGeneralListings() {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const res = await fetch(`/api/marketplace?${params}`);
    const data = await res.json();
    setGeneralListings(data.listings || []);
    setLoading(false);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();

    let imageUrl: string | null = null;
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }
    }

    const res = await fetch("/api/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newListing, imageUrl }),
    });
    if (res.ok) {
      setShowNewForm(false);
      setNewListing({ title: "", description: "", price: "", category: "TICKETS", condition: "" });
      setImageFile(null);
      setImagePreview(null);
      fetchGeneralListings();
    }
  }

  const listings = tab === "courses" ? courseListings : generalListings;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-500 mt-1">Buy &amp; sell anything with students on your campus</p>
        </div>
        {tab === "general" && (
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              showNewForm
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            {showNewForm ? "Cancel" : "+ Post Item"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl w-fit mb-6 animate-slide-up stagger-1">
        <button
          onClick={() => { setTab("courses"); setCategory(""); setSearch(""); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "courses" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Course Materials
        </button>
        <button
          onClick={() => { setTab("general"); setCategory(""); setSearch(""); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "general" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.997 2.997 0 00.177-1.003L3.75 3h16.5l.573 5.347A3.001 3.001 0 0021 9.348" />
          </svg>
          General Marketplace
        </button>
      </div>

      {/* General marketplace post form */}
      {showNewForm && tab === "general" && (
        <form onSubmit={handleCreateListing} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 animate-scale-in">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            Post an item for sale
          </h3>

          <div className="space-y-3">
            <input
              type="text"
              required
              placeholder="What are you selling? (e.g. 2 concert tickets, Winter jacket size M)"
              value={newListing.title}
              onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 hover:bg-white transition-colors text-sm"
            />

            <textarea
              placeholder="Add a description (optional)"
              value={newListing.description}
              onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 hover:bg-white transition-colors text-sm"
              rows={3}
            />

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newListing.price}
                  onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Category</label>
                <select
                  value={newListing.category}
                  onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 text-sm"
                >
                  <option value="TICKETS">Tickets</option>
                  <option value="CLOTHING">Clothing</option>
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="FURNITURE">Furniture</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Condition</label>
                <select
                  value={newListing.condition}
                  onChange={(e) => setNewListing({ ...newListing, condition: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 text-sm"
                >
                  <option value="">Select</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Photo (optional)</label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5a1.5 1.5 0 001.5 1.5zM12.75 8.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                <span className="text-xs text-gray-400">Click to add a photo</span>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            )}
          </div>

          <button
            type="submit"
            className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md text-sm"
          >
            Post listing
          </button>
        </form>
      )}

      {/* Search */}
      <div className="relative mb-5 animate-slide-up stagger-1">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === "courses" ? "Search course materials (e.g. bio, CS50, calculus)..." : "Search items..."}
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:bg-gray-50/50 transition-colors text-sm shadow-sm"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-5 flex-wrap animate-slide-up stagger-2">
        {(tab === "general" ? GENERAL_CATEGORIES : COURSE_CATEGORIES).map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
              category === cat.value
                ? tab === "general"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                  : "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Listings feed */}
      {loading ? (
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100/80 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div>
                  <div className="skeleton h-4 w-24 mb-1" />
                  <div className="skeleton h-3 w-16" />
                </div>
              </div>
              <div className="skeleton h-5 w-3/4 mb-2" />
              <div className="skeleton h-4 w-full mb-1" />
              <div className="skeleton h-4 w-2/3 mb-4" />
              <div className="flex gap-2">
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center animate-scale-in">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.997 2.997 0 00.177-1.003L3.75 3h16.5l.573 5.347A3.001 3.001 0 0021 9.348" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">No items found</p>
          <p className="text-sm text-gray-400">
            {tab === "general"
              ? "Be the first to post something in the general marketplace!"
              : "Check back later for new course materials."}
          </p>
          {tab === "general" && (
            <button
              onClick={() => setShowNewForm(true)}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
            >
              + Post an item
            </button>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {listings.map((listing, i) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className={`block bg-white rounded-2xl border border-gray-100/80 overflow-hidden card-hover group animate-slide-up stagger-${Math.min(i + 1, 6)}`}
            >
              {/* Seller row */}
              <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white ${
                  listing.course
                    ? "bg-gradient-to-br from-indigo-400 to-purple-500"
                    : "bg-gradient-to-br from-amber-400 to-orange-500"
                }`}>
                  <span className="text-white font-bold text-xs">{listing.seller.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{listing.seller.name}</p>
                    {listing.course && (
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                        {listing.course.courseNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{timeAgo(listing.createdAt)}</p>
                </div>
                {listing.price != null && (
                  <span className="text-lg font-bold text-emerald-600">
                    ${listing.price}
                  </span>
                )}
              </div>

              {listing.imageUrl && (
                <div className="px-5">
                  <img src={listing.imageUrl} alt={listing.title} className="w-full h-48 object-cover rounded-xl" />
                </div>
              )}

              {/* Content */}
              <div className="px-5 pb-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors text-[17px] leading-snug">
                  {listing.title}
                </h3>
                {listing.description && (
                  <p className="text-gray-500 mt-1.5 leading-relaxed text-sm line-clamp-3">{listing.description}</p>
                )}

                {/* Tags */}
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      listing.type === "SELLING"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {listing.type === "SELLING" ? "For Sale" : "Looking For"}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                    {listing.category.replace(/_/g, " ")}
                  </span>
                  {listing.condition && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                      {listing.condition}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-50 px-5 py-3 flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-gray-400 group-hover:text-indigo-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                  Message
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-400 group-hover:text-indigo-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  Share
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
