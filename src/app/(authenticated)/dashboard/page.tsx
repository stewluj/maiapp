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

  const stats = [
    { value: takingCourses.length, label: "Current courses", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
    { value: myListings.length, label: "Active listings", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    { value: conversationCount, label: "Conversations", iconBg: "bg-green-100", iconColor: "text-green-600" },
    { value: tookCourses.length, label: "Past courses", iconBg: "bg-gray-100", iconColor: "text-gray-600" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, <span className="gradient-text">{user.name.split(" ")[0]}</span>
        </h1>
        <p className="text-gray-500 mt-1">{user.university.name}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`bg-white rounded-2xl p-5 border border-gray-100/80 card-hover animate-slide-up stagger-${i + 1}`}
          >
            <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <span className={`text-lg font-bold ${stat.iconColor}`}>{stat.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {enrollments.length === 0 && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-center mb-8 animate-scale-in shadow-xl shadow-indigo-200/30">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Get started by adding your courses</h2>
          <p className="text-indigo-100 mb-5">
            Add the courses you&apos;re taking or have taken to see relevant listings.
          </p>
          <Link
            href="/courses"
            className="inline-block px-7 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Add courses
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* My courses */}
        {takingCourses.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100/80 p-6 animate-slide-up stagger-3">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
                My Courses
              </h2>
              <Link href="/courses" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
            </div>
            <div className="space-y-2">
              {takingCourses.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/courses/${enrollment.courseId}`}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-indigo-50/50 transition-all group"
                >
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {enrollment.course.courseNumber}
                    </p>
                    <p className="text-sm text-gray-500">{enrollment.course.name}</p>
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                    {enrollment.course._count.listings} listings
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent listings */}
        <div className="bg-white rounded-2xl border border-gray-100/80 p-6 animate-slide-up stagger-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              Recent Listings
            </h2>
            <Link href="/marketplace" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Browse all</Link>
          </div>
          {recentListings.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No listings yet at your university.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-amber-50/50 transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate group-hover:text-amber-700 transition-colors">
                      {listing.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {listing.course?.courseNumber} &middot; {listing.seller.name}
                    </p>
                  </div>
                  {listing.price && (
                    <span className="text-sm font-bold text-green-600 ml-3 bg-green-50 px-2.5 py-1 rounded-lg">
                      ${listing.price}
                    </span>
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
