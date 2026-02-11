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
    // Filter out already enrolled courses
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
        <div className="text-gray-500">Loading courses...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h1>

      {/* Search to add courses */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Add a course</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by course name or number (e.g. CS50, Chemistry)"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        {searching && <p className="text-sm text-gray-500 mt-2">Searching...</p>}

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {course.courseNumber} - {course.name}
                  </p>
                  <p className="text-sm text-gray-500">{course.department}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addCourse(course.id, "TAKING")}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Taking
                  </button>
                  <button
                    onClick={() => addCourse(course.id, "TOOK")}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Took before
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {search.length >= 2 && searchResults.length === 0 && !searching && (
          <p className="text-sm text-gray-500 mt-2">No matching courses found.</p>
        )}
      </div>

      {/* Currently taking */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">
          Currently Taking ({takingCourses.length})
        </h2>
        {takingCourses.length === 0 ? (
          <p className="text-gray-500 text-sm">No current courses. Search above to add courses.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {takingCourses.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
              >
                <Link href={`/courses/${enrollment.courseId}`} className="flex-1">
                  <p className="font-medium text-gray-900">
                    {enrollment.course.courseNumber}
                  </p>
                  <p className="text-sm text-gray-600">{enrollment.course.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {enrollment.course._count.listings} listings available
                  </p>
                </Link>
                <button
                  onClick={() => removeCourse(enrollment.courseId)}
                  className="text-gray-400 hover:text-red-500 ml-2 p-1"
                  title="Remove course"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previously took */}
      {tookCourses.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">
            Previously Took ({tookCourses.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {tookCourses.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between opacity-75"
              >
                <Link href={`/courses/${enrollment.courseId}`} className="flex-1">
                  <p className="font-medium text-gray-900">
                    {enrollment.course.courseNumber}
                  </p>
                  <p className="text-sm text-gray-600">{enrollment.course.name}</p>
                </Link>
                <button
                  onClick={() => removeCourse(enrollment.courseId)}
                  className="text-gray-400 hover:text-red-500 ml-2 p-1"
                  title="Remove course"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
