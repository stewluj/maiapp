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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        {tab === "general" && (
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {showNewForm ? "Cancel" : "+ Post Item"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => { setTab("courses"); setCategory(""); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "courses" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Course Materials
        </button>
        <button
          onClick={() => { setTab("general"); setCategory(""); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "general" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          General Marketplace
        </button>
      </div>

      {/* General marketplace post form */}
      {showNewForm && tab === "general" && (
        <form onSubmit={handleCreateListing} className="bg-white rounded-xl border border-gray-100 p-5 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Post an item for sale</h3>

          <input
            type="text"
            required
            placeholder="Title (e.g. 2 concert tickets, Winter jacket size M)"
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
                <option value="TICKETS">Tickets</option>
                <option value="CLOTHING">Clothing</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="FURNITURE">Furniture</option>
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

      {/* Search for general marketplace */}
      {tab === "general" && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
        />
      )}

      {/* Category filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
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
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              category === cat.value ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Listings grid */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 mb-2">No items found.</p>
          <p className="text-sm text-gray-400">
            {tab === "general"
              ? "Be the first to post something in the general marketplace!"
              : "Check back later for new course materials."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
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
                  {listing.category.replace(/_/g, " ")}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
              {listing.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.description}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">
                  {listing.seller.name}
                  {listing.course && ` · ${listing.course.courseNumber}`}
                </span>
                {listing.price != null && (
                  <span className="font-semibold text-green-700">${listing.price}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
