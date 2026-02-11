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
  createdAt: string;
  seller: { id: string; name: string };
  course?: { courseNumber: string; name: string } | null;
}

const GENERAL_CATEGORIES = [
  { value: "", label: "All" },
  { value: "TICKETS", label: "Tickets" },
  { value: "CLOTHING", label: "Clothing" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "OTHER", label: "Other" },
];

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

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newListing),
    });
    if (res.ok) {
      setShowNewForm(false);
      setNewListing({ title: "", description: "", price: "", category: "TICKETS", condition: "" });
      fetchGeneralListings();
    }
  }

  const listings = tab === "courses" ? courseListings : generalListings;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-500 mt-1">Browse items from your campus community</p>
        </div>
        {tab === "general" && (
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              showNewForm
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            {showNewForm ? "Cancel" : "+ Post Item"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl w-fit mb-6 animate-slide-up stagger-1">
        <button
          onClick={() => { setTab("courses"); setCategory(""); }}
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
          onClick={() => { setTab("general"); setCategory(""); }}
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
        <form onSubmit={handleCreateListing} className="bg-white rounded-2xl border border-gray-100/80 p-6 mb-6 space-y-4 animate-scale-in">
          <h3 className="font-bold text-gray-900">Post an item for sale</h3>

          <input
            type="text"
            required
            placeholder="Title (e.g. 2 concert tickets, Winter jacket size M)"
            value={newListing.title}
            onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 hover:bg-white transition-colors"
          />

          <textarea
            placeholder="Description (optional)"
            value={newListing.description}
            onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 hover:bg-white transition-colors"
            rows={3}
          />

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5 font-medium">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newListing.price}
                onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 hover:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5 font-medium">Category</label>
              <select
                value={newListing.category}
                onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
              >
                <option value="TICKETS">Tickets</option>
                <option value="CLOTHING">Clothing</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="FURNITURE">Furniture</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5 font-medium">Condition</label>
              <select
                value={newListing.condition}
                onChange={(e) => setNewListing({ ...newListing, condition: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50"
              >
                <option value="">Select</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm hover:shadow-md"
          >
            Post listing
          </button>
        </form>
      )}

      {/* Search for general marketplace */}
      {tab === "general" && (
        <div className="relative mb-5 animate-slide-up stagger-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 hover:bg-white transition-colors text-sm"
          />
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 mb-5 flex-wrap animate-slide-up stagger-2">
        {(tab === "general" ? GENERAL_CATEGORIES : [
          { value: "", label: "All" },
          { value: "TEXTBOOK", label: "Textbooks" },
          { value: "NOTES", label: "Notes" },
          { value: "LAB_EQUIPMENT", label: "Lab Equipment" },
          { value: "CALCULATOR", label: "Calculators" },
          { value: "STUDY_GUIDE", label: "Study Guides" },
        ]).map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === cat.value ? "bg-indigo-100 text-indigo-700 shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Listings grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100/80 p-5">
              <div className="flex gap-2 mb-3">
                <div className="skeleton h-5 w-16" />
                <div className="skeleton h-5 w-20" />
              </div>
              <div className="skeleton h-5 w-3/4 mb-2" />
              <div className="skeleton h-4 w-full mb-1" />
              <div className="skeleton h-4 w-1/2 mb-3" />
              <div className="flex justify-between">
                <div className="skeleton h-3 w-1/4" />
                <div className="skeleton h-5 w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center animate-scale-in">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.997 2.997 0 00.177-1.003L3.75 3h16.5l.573 5.347A3.001 3.001 0 0021 9.348" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1">No items found.</p>
          <p className="text-sm text-gray-400">
            {tab === "general"
              ? "Be the first to post something in the general marketplace!"
              : "Check back later for new course materials."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, i) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className={`bg-white rounded-2xl border border-gray-100/80 p-5 card-hover group animate-slide-up stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    listing.type === "SELLING"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {listing.type === "SELLING" ? "Selling" : "Looking for"}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                  {listing.category.replace(/_/g, " ")}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                {listing.title}
              </h3>
              {listing.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.description}</p>
              )}
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-400">
                  {listing.seller.name}
                  {listing.course && ` · ${listing.course.courseNumber}`}
                </span>
                {listing.price != null && (
                  <span className="font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg text-sm">
                    ${listing.price}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
