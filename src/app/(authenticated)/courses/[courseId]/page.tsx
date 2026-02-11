"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface CourseInfo {
  id: string;
  name: string;
  courseNumber: string;
  department: string | null;
  _count: { listings: number; enrollments: number };
}

interface EnrollmentInfo {
  id: string;
  status: "TAKING" | "TOOK";
}

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
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentInfo | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: "", category: "" });
  const [showNewForm, setShowNewForm] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    price: "",
    category: "TEXTBOOK",
    type: "SELLING" as "SELLING" | "LOOKING_FOR",
    condition: "",
  });

  useEffect(() => {
    fetchCourseInfo();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchListings();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchCourseInfo() {
    const res = await fetch(`/api/courses/${courseId}`);
    const data = await res.json();
    setCourseInfo(data.course);
    setEnrollment(data.enrollment);
  }

  async function fetchListings() {
    const params = new URLSearchParams({ courseId });
    if (filter.type) params.set("type", filter.type);
    if (filter.category) params.set("category", filter.category);
    const res = await fetch(`/api/listings?${params}`);
    const data = await res.json();
    setListings(data.listings || []);
    setLoading(false);
  }

  async function handleEnroll(status: "TAKING" | "TOOK") {
    setEnrolling(true);
    const res = await fetch("/api/courses/my", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, status }),
    });
    if (res.ok) {
      await fetchCourseInfo();
    }
    setEnrolling(false);
  }

  async function handleUnenroll() {
    await fetch("/api/courses/my", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    await fetchCourseInfo();
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
      fetchCourseInfo();
    }
  }

  if (loading && !courseInfo) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Course header */}
      <div className="mb-8 animate-slide-up">
        <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mb-4 group">
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to courses
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100/80 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
                <span className="text-white font-bold text-lg">
                  {courseInfo?.courseNumber?.slice(0, 2) || "?"}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {courseInfo ? `${courseInfo.courseNumber} - ${courseInfo.name}` : "Course"}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  {courseInfo?.department && (
                    <span className="text-sm text-gray-500">{courseInfo.department}</span>
                  )}
                  <span className="text-sm text-gray-400">
                    {courseInfo?._count.enrollments || 0} students &middot; {courseInfo?._count.listings || 0} active listings
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {enrollment ? (
                <>
                  <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                    enrollment.status === "TAKING"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}>
                    {enrollment.status === "TAKING" ? "Currently Taking" : "Took Before"}
                  </span>
                  <button
                    onClick={handleUnenroll}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                    title="Remove from my courses"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEnroll("TAKING")}
                    disabled={enrolling}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    Add to My Courses
                  </button>
                  <button
                    onClick={() => handleEnroll("TOOK")}
                    disabled={enrolling}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    Took Before
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between mb-6 animate-slide-up stagger-1">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          Listings
        </h2>
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
      </div>

      {/* New listing form */}
      {showNewForm && (
        <form onSubmit={handleCreateListing} className="bg-white rounded-2xl border border-gray-100/80 p-6 mb-6 space-y-4 animate-scale-in">
          <h3 className="font-bold text-gray-900">Post a new item</h3>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setNewListing({ ...newListing, type: "SELLING" })}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                newListing.type === "SELLING"
                  ? "bg-green-100 text-green-800 border-2 border-green-300 shadow-sm"
                  : "bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100"
              }`}
            >
              I&apos;m selling
            </button>
            <button
              type="button"
              onClick={() => setNewListing({ ...newListing, type: "LOOKING_FOR" })}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                newListing.type === "LOOKING_FOR"
                  ? "bg-blue-100 text-blue-800 border-2 border-blue-300 shadow-sm"
                  : "bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100"
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
                <option value="TEXTBOOK">Textbook</option>
                <option value="NOTES">Notes</option>
                <option value="LAB_EQUIPMENT">Lab Equipment</option>
                <option value="CALCULATOR">Calculator</option>
                <option value="STUDY_GUIDE">Study Guide</option>
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

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap animate-slide-up stagger-2">
        <button
          onClick={() => setFilter({ ...filter, type: "" })}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${!filter.type ? "bg-indigo-100 text-indigo-700 shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter({ ...filter, type: "SELLING" })}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${filter.type === "SELLING" ? "bg-green-100 text-green-700 shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          For Sale
        </button>
        <button
          onClick={() => setFilter({ ...filter, type: "LOOKING_FOR" })}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${filter.type === "LOOKING_FOR" ? "bg-blue-100 text-blue-700 shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Looking For
        </button>
        <span className="border-l border-gray-200 mx-1" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter({ ...filter, category: cat.value })}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${filter.category === cat.value ? "bg-amber-100 text-amber-700 shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Listings */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100/80 p-5">
              <div className="flex gap-2 mb-3">
                <div className="skeleton h-5 w-16" />
                <div className="skeleton h-5 w-20" />
              </div>
              <div className="skeleton h-5 w-3/4 mb-2" />
              <div className="skeleton h-4 w-full mb-1" />
              <div className="skeleton h-4 w-2/3 mb-3" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center animate-scale-in">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1">No listings found for this course.</p>
          <p className="text-sm text-gray-400">Be the first to post something!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {listings.map((listing, i) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className={`bg-white rounded-2xl border border-gray-100/80 p-5 card-hover group animate-slide-up stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
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
                  <p className="text-xs text-gray-400 mt-3">
                    Posted by {listing.seller.name}
                    {listing.condition && ` · ${listing.condition}`}
                  </p>
                </div>
                {listing.price != null && (
                  <span className="text-lg font-bold text-green-600 ml-4 bg-green-50 px-3 py-1 rounded-lg">
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
