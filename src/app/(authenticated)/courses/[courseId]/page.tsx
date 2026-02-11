"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

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
  course: { id: string; name: string; courseNumber: string };
}

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "TEXTBOOK", label: "Textbooks" },
  { value: "NOTES", label: "Notes" },
  { value: "LAB_EQUIPMENT", label: "Lab Equipment" },
  { value: "CALCULATOR", label: "Calculators" },
  { value: "STUDY_GUIDE", label: "Study Guides" },
  { value: "OTHER", label: "Other" },
];

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: "", category: "" });
  const [showNewForm, setShowNewForm] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    price: "",
    category: "TEXTBOOK",
    type: "SELLING" as "SELLING" | "LOOKING_FOR",
    condition: "",
  });

  useEffect(() => {
    fetchListings();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchListings() {
    const params = new URLSearchParams({ courseId });
    if (filter.type) params.set("type", filter.type);
    if (filter.category) params.set("category", filter.category);
    const res = await fetch(`/api/listings?${params}`);
    const data = await res.json();
    setListings(data.listings || []);
    setLoading(false);
  }

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newListing, courseId }),
    });
    if (res.ok) {
      setShowNewForm(false);
      setNewListing({ title: "", description: "", price: "", category: "TEXTBOOK", type: "SELLING", condition: "" });
      fetchListings();
    }
  }

  const courseName = listings[0]?.course?.name || "Course";
  const courseNumber = listings[0]?.course?.courseNumber || "";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/courses" className="text-sm text-indigo-600 hover:text-indigo-700 mb-1 inline-block">
            &larr; Back to courses
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {courseNumber ? `${courseNumber} - ${courseName}` : "Course Listings"}
          </h1>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showNewForm ? "Cancel" : "+ Post Item"}
        </button>
      </div>

      {/* New listing form */}
      {showNewForm && (
        <form onSubmit={handleCreateListing} className="bg-white rounded-xl border border-gray-100 p-5 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Post a new item</h3>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setNewListing({ ...newListing, type: "SELLING" })}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                newListing.type === "SELLING" ? "bg-green-100 text-green-800 border border-green-300" : "bg-gray-100 text-gray-600"
              }`}
            >
              I&apos;m selling
            </button>
            <button
              type="button"
              onClick={() => setNewListing({ ...newListing, type: "LOOKING_FOR" })}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                newListing.type === "LOOKING_FOR" ? "bg-blue-100 text-blue-800 border border-blue-300" : "bg-gray-100 text-gray-600"
              }`}
            >
              I&apos;m looking for
            </button>
          </div>

          <input
            type="text"
            required
            placeholder="Title (e.g. Calculus Textbook 4th Edition)"
            value={newListing.title}
            onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <textarea
            placeholder="Description (optional)"
            value={newListing.description}
            onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newListing.price}
                onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <select
                value={newListing.category}
                onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="TEXTBOOK">Textbook</option>
                <option value="NOTES">Notes</option>
                <option value="LAB_EQUIPMENT">Lab Equipment</option>
                <option value="CALCULATOR">Calculator</option>
                <option value="STUDY_GUIDE">Study Guide</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Condition</label>
              <select
                value={newListing.condition}
                onChange={(e) => setNewListing({ ...newListing, condition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Post listing
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter({ ...filter, type: "" })}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${!filter.type ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter({ ...filter, type: "SELLING" })}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${filter.type === "SELLING" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
        >
          For Sale
        </button>
        <button
          onClick={() => setFilter({ ...filter, type: "LOOKING_FOR" })}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${filter.type === "LOOKING_FOR" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
        >
          Looking For
        </button>
        <span className="border-l border-gray-200 mx-1" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter({ ...filter, category: cat.value })}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${filter.category === cat.value ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Listings */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 mb-2">No listings found for this course.</p>
          <p className="text-sm text-gray-400">Be the first to post something!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        listing.type === "SELLING"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {listing.type === "SELLING" ? "Selling" : "Looking for"}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {listing.category.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
                  {listing.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Posted by {listing.seller.name}
                    {listing.condition && ` · ${listing.condition}`}
                  </p>
                </div>
                {listing.price != null && (
                  <span className="text-lg font-bold text-green-700 ml-3">${listing.price}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
