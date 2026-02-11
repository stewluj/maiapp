"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Course {
  id: string;
  name: string;
  courseNumber: string;
  department: string | null;
  _count: { listings: number; enrollments: number };
}

interface Enrollment {
  id: string;
  status: "TAKING" | "TOOK";
  courseId: string;
  course: Course;
}

export default function CoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function fetchEnrollments() {
    const res = await fetch("/api/courses/my");
    const data = await res.json();
    setEnrollments(data.enrollments || []);
    setLoading(false);
  }

  async function handleSearch(query: string) {
    setSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/courses?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    const enrolledIds = new Set(enrollments.map((e) => e.courseId));
    setSearchResults((data.courses || []).filter((c: Course) => !enrolledIds.has(c.id)));
    setSearching(false);
  }

  async function addCourse(courseId: string, status: "TAKING" | "TOOK") {
    const res = await fetch("/api/courses/my", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, status }),
    });
    if (res.ok) {
      await fetchEnrollments();
      setSearch("");
      setSearchResults([]);
    }
  }

  async function removeCourse(courseId: string) {
    await fetch("/api/courses/my", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    await fetchEnrollments();
  }

  const takingCourses = enrollments.filter((e) => e.status === "TAKING");
  const tookCourses = enrollments.filter((e) => e.status === "TOOK");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-500 mt-1">Search for courses to add, or click a course to view its listings</p>
      </div>

      {/* Search to add courses */}
      <div className="bg-white rounded-2xl border border-gray-100/80 p-6 mb-8 animate-slide-up stagger-1">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Add a course
        </h2>
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by course name or number (e.g. CS50, Chemistry)"
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 transition-colors hover:bg-white text-sm"
          />
        </div>

        {searching && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
            Searching...
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 max-h-80 overflow-y-auto animate-slide-down">
            {searchResults.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
              >
                <Link href={`/courses/${course.id}`} className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                    {course.courseNumber} - {course.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{course.department}</span>
                    <span className="text-xs text-gray-400">
                      {course._count.listings} listings &middot; {course._count.enrollments} students
                    </span>
                  </div>
                </Link>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button
                    onClick={(e) => { e.preventDefault(); addCourse(course.id, "TAKING"); }}
                    className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Add to My Courses
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); addCourse(course.id, "TOOK"); }}
                    className="px-3.5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Took Before
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {search.length >= 2 && searchResults.length === 0 && !searching && (
          <div className="mt-4 text-center py-4">
            <p className="text-sm text-gray-500">No matching courses found.</p>
          </div>
        )}
      </div>

      {/* Currently taking */}
      <div className="mb-8 animate-slide-up stagger-2">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          Currently Taking ({takingCourses.length})
        </h2>
        {takingCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No current courses. Search above to add courses.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {takingCourses.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white rounded-2xl border border-gray-100/80 p-5 flex items-center justify-between card-hover group"
              >
                <Link href={`/courses/${enrollment.courseId}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-xs">{enrollment.course.courseNumber.slice(0, 3)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                        {enrollment.course.courseNumber}
                      </p>
                      <p className="text-sm text-gray-500">{enrollment.course.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 ml-13">
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
                      {enrollment.course._count.listings} listings
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => removeCourse(enrollment.courseId)}
                  className="text-gray-300 hover:text-red-500 ml-3 p-2 rounded-lg hover:bg-red-50 transition-all"
                  title="Remove course"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previously took */}
      {tookCourses.length > 0 && (
        <div className="animate-slide-up stagger-3">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            Previously Took ({tookCourses.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {tookCourses.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white rounded-2xl border border-gray-100/80 p-5 flex items-center justify-between card-hover group"
              >
                <Link href={`/courses/${enrollment.courseId}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-xs">{enrollment.course.courseNumber.slice(0, 3)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                        {enrollment.course.courseNumber}
                      </p>
                      <p className="text-sm text-gray-500">{enrollment.course.name}</p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => removeCourse(enrollment.courseId)}
                  className="text-gray-300 hover:text-red-500 ml-3 p-2 rounded-lg hover:bg-red-50 transition-all"
                  title="Remove course"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
