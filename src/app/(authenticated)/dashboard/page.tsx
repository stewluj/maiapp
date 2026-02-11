"use client";

import { useState, useEffect, useRef } from "react";
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
  course?: { id: string; courseNumber: string; name: string } | null;
}

interface Enrollment {
  id: string;
  status: "TAKING" | "TOOK";
  courseId: string;
  course: {
    id: string;
    name: string;
    courseNumber: string;
    department: string | null;
    _count: { listings: number; enrollments: number };
  };
}

interface CourseResult {
  id: string;
  name: string;
  courseNumber: string;
  department: string | null;
  _count: { listings: number; enrollments: number };
}

const CAMPUS_CATEGORIES = [
  { value: "", label: "All" },
  { value: "TICKETS", label: "Tickets" },
  { value: "CLOTHING", label: "Clothing" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "OTHER", label: "Other" },
];

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const [tab, setTab] = useState<"courses" | "campus">("courses");
  const [listings, setListings] = useState<Listing[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseResults, setCourseResults] = useState<CourseResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [campusCategory, setCampusCategory] = useState("");
  const [campusSearch, setCampusSearch] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [tab, selectedCourseId, campusCategory, campusSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchEnrollments() {
    const res = await fetch("/api/courses/my");
    const data = await res.json();
    setEnrollments(data.enrollments || []);
  }

  async function fetchFeed() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (tab === "courses" && selectedCourseId) {
      params.set("courseId", selectedCourseId);
    }
    if (tab === "campus") {
      if (campusCategory) params.set("category", campusCategory);
      if (campusSearch) params.set("search", campusSearch);
    }
    const res = await fetch(`/api/feed?${params}`);
    const data = await res.json();
    setListings(data.listings || []);
    setLoading(false);
  }

  async function handleCourseSearch(query: string) {
    setCourseSearch(query);
    if (query.length < 2) {
      setCourseResults([]);
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/courses?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    setCourseResults(data.courses || []);
    setSearching(false);
  }

  function selectCourseFilter(courseId: string) {
    setSelectedCourseId(courseId);
    setShowSearch(false);
    setCourseSearch("");
    setCourseResults([]);
  }

  function switchTab(newTab: "courses" | "campus") {
    setTab(newTab);
    setSelectedCourseId(null);
    setCampusCategory("");
    setCampusSearch("");
    setCourseSearch("");
    setCourseResults([]);
    setShowSearch(false);
  }

  const selectedCourse = selectedCourseId
    ? enrollments.find((e) => e.courseId === selectedCourseId)?.course
    : null;
  const selectedCourseName = selectedCourse
    ? selectedCourse.courseNumber
    : courseResults.find((c) => c.id === selectedCourseId)?.courseNumber;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
        <p className="text-gray-500 text-sm mt-0.5">Latest offerings from your campus</p>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl w-fit mb-5 animate-slide-up stagger-1">
        <button
          onClick={() => switchTab("courses")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "courses" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          My Courses
        </button>
        <button
          onClick={() => switchTab("campus")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === "campus" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.997 2.997 0 00.177-1.003L3.75 3h16.5l.573 5.347A3.001 3.001 0 0021 9.348" />
          </svg>
          Campus
        </button>
      </div>

      {/* === COURSES TAB CONTROLS === */}
      {tab === "courses" && (
        <>
          {/* Course search bar */}
          <div ref={searchRef} className="relative mb-5 animate-slide-up stagger-2">
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => {
                  handleCourseSearch(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                placeholder="Search by course (e.g. CS 101, Organic Chemistry)..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:bg-gray-50/50 transition-colors text-sm shadow-sm"
              />
            </div>

            {/* Course search dropdown */}
            {showSearch && (courseSearch.length >= 2 || searching) && (
              <div className="absolute z-20 top-full mt-2 w-full bg-white rounded-2xl border border-gray-100 shadow-xl max-h-72 overflow-y-auto animate-slide-down">
                {searching && (
                  <div className="flex items-center gap-2 p-4 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                    Searching courses...
                  </div>
                )}
                {!searching && courseResults.length === 0 && courseSearch.length >= 2 && (
                  <div className="p-4 text-sm text-gray-500 text-center">No courses found.</div>
                )}
                {courseResults.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => selectCourseFilter(course.id)}
                    className="w-full text-left px-4 py-3.5 hover:bg-indigo-50/50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{course.courseNumber}</p>
                      <p className="text-xs text-gray-500">{course.name}</p>
                    </div>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium shrink-0 ml-3">
                      {course._count.listings} posts
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Course chip filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide animate-slide-up stagger-3">
            <button
              onClick={() => setSelectedCourseId(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCourseId
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {enrollments
              .filter((e) => e.status === "TAKING")
              .map((enrollment) => (
                <button
                  key={enrollment.id}
                  onClick={() =>
                    setSelectedCourseId(
                      selectedCourseId === enrollment.courseId ? null : enrollment.courseId
                    )
                  }
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCourseId === enrollment.courseId
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {enrollment.course.courseNumber}
                </button>
              ))}
            <Link
              href="/courses"
              className="shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-white text-indigo-600 border border-dashed border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Course
            </Link>
          </div>

          {/* Active course filter indicator */}
          {selectedCourseId && (
            <div className="flex items-center gap-2 mb-5 animate-scale-in">
              <span className="text-sm text-gray-500">Showing posts from</span>
              <span className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                {selectedCourseName || "course"}
              </span>
              <button
                onClick={() => setSelectedCourseId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* No courses prompt */}
          {enrollments.length === 0 && !loading && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-center mb-6 animate-scale-in shadow-xl shadow-indigo-200/30">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Add your courses to personalize your feed</h2>
              <p className="text-indigo-100 mb-5">
                See what students in your classes are selling, looking for, and sharing.
              </p>
              <Link
                href="/courses"
                className="inline-block px-7 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Add courses
              </Link>
            </div>
          )}
        </>
      )}

      {/* === CAMPUS TAB CONTROLS === */}
      {tab === "campus" && (
        <>
          {/* Search bar */}
          <div className="relative mb-5 animate-slide-up stagger-2">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              value={campusSearch}
              onChange={(e) => setCampusSearch(e.target.value)}
              placeholder="Search items (e.g. concert tickets, winter jacket)..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:bg-gray-50/50 transition-colors text-sm shadow-sm"
            />
          </div>

          {/* Category chips */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide animate-slide-up stagger-3">
            {CAMPUS_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCampusCategory(cat.value)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  campusCategory === cat.value
                    ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* === FEED === */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100/80 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeleton w-11 h-11 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-28 mb-1.5" />
                  <div className="skeleton h-3 w-20" />
                </div>
                <div className="skeleton h-8 w-16 rounded-xl" />
              </div>
              <div className="skeleton h-5 w-4/5 mb-2.5" />
              <div className="skeleton h-4 w-full mb-1.5" />
              <div className="skeleton h-4 w-3/5 mb-4" />
              <div className="flex gap-2">
                <div className="skeleton h-6 w-16 rounded-full" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center animate-scale-in">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {tab === "courses" ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.997 2.997 0 00.177-1.003L3.75 3h16.5l.573 5.347A3.001 3.001 0 0021 9.348" />
              )}
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">Nothing here yet</p>
          <p className="text-sm text-gray-400">
            {tab === "courses"
              ? selectedCourseId
                ? "No offerings for this course yet. Be the first to post!"
                : "No course materials posted yet. Check back soon!"
              : "No campus listings yet. Be the first to post something!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing, i) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className={`block bg-white rounded-2xl border border-gray-100/80 overflow-hidden card-hover group animate-slide-up stagger-${Math.min(i + 1, 6)}`}
            >
              {/* Post header */}
              <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white ${
                  tab === "courses"
                    ? "bg-gradient-to-br from-indigo-400 to-purple-500"
                    : "bg-gradient-to-br from-amber-400 to-orange-500"
                }`}>
                  <span className="text-white font-bold text-sm">
                    {listing.seller.name.charAt(0).toUpperCase()}
                  </span>
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
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">${listing.price}</span>
                  </div>
                )}
              </div>

              {/* Post body */}
              <div className="px-5 pb-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors text-[17px] leading-snug">
                  {listing.title}
                </h3>
                {listing.description && (
                  <p className="text-gray-500 mt-1.5 leading-relaxed text-sm line-clamp-3">
                    {listing.description}
                  </p>
                )}

                {/* Tags */}
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      listing.type === "SELLING"
                        ? "bg-green-50 text-green-700"
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

              {/* Post footer */}
              <div className="border-t border-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                {listing.course && !selectedCourseId && (
                  <span className="text-xs text-gray-400">
                    {listing.course.name}
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
