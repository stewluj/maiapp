import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const enrollments = await prisma.userCourse.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: { _count: { select: { listings: { where: { status: "ACTIVE" } } } } },
      },
    },
  });

  const myListings = await prisma.listing.findMany({
    where: { sellerId: user.id, status: "ACTIVE" },
    include: { course: { select: { courseNumber: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentListings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      course: { universityId: user.universityId },
      NOT: { sellerId: user.id },
    },
    include: {
      course: { select: { courseNumber: true, name: true } },
      seller: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const conversationCount = await prisma.conversation.count({
    where: { participants: { some: { id: user.id } } },
  });

  const takingCourses = enrollments.filter((e) => e.status === "TAKING");
  const tookCourses = enrollments.filter((e) => e.status === "TOOK");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-gray-600">{user.university.name}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-indigo-600">{takingCourses.length}</p>
          <p className="text-sm text-gray-600">Current courses</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-amber-600">{myListings.length}</p>
          <p className="text-sm text-gray-600">Active listings</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-green-600">{conversationCount}</p>
          <p className="text-sm text-gray-600">Conversations</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-gray-600">{tookCourses.length}</p>
          <p className="text-sm text-gray-600">Past courses</p>
        </div>
      </div>

      {enrollments.length === 0 && (
        <div className="bg-indigo-50 rounded-2xl p-8 text-center mb-8">
          <h2 className="text-lg font-semibold text-indigo-900 mb-2">Get started by adding your courses</h2>
          <p className="text-indigo-700 mb-4">
            Add the courses you&apos;re taking or have taken to see relevant listings.
          </p>
          <Link
            href="/courses"
            className="inline-block px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add courses
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* My courses */}
        {takingCourses.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">My Courses</h2>
              <Link href="/courses" className="text-sm text-indigo-600 hover:text-indigo-700">View all</Link>
            </div>
            <div className="space-y-3">
              {takingCourses.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/courses/${enrollment.courseId}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{enrollment.course.courseNumber}</p>
                    <p className="text-sm text-gray-600">{enrollment.course.name}</p>
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    {enrollment.course._count.listings} listings
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent listings */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Listings</h2>
            <Link href="/marketplace" className="text-sm text-indigo-600 hover:text-indigo-700">Browse all</Link>
          </div>
          {recentListings.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No listings yet at your university.</p>
          ) : (
            <div className="space-y-3">
              {recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                    <p className="text-sm text-gray-500">
                      {listing.course?.courseNumber} &middot; {listing.seller.name}
                    </p>
                  </div>
                  {listing.price && (
                    <span className="text-sm font-semibold text-green-700 ml-2">${listing.price}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
