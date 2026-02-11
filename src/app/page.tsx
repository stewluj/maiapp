import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blob" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-pink-200/30 rounded-full blob" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-green-200/30 to-cyan-200/30 rounded-full blob" style={{ animationDelay: "4s" }} />
      </div>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto animate-fade-in">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 animated-gradient rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">MAI</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-white/60"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-sm text-indigo-700 font-medium mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft" />
              Now available at 4+ universities
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 animate-slide-up stagger-1">
            Your campus marketplace for
            <span className="gradient-text"> everything academic</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-slide-up stagger-2">
            Buy and sell textbooks, lab equipment, notes, and more with students at your university.
            Add your courses and instantly find what you need.
          </p>
          <div className="flex gap-4 justify-center animate-slide-up stagger-3">
            <Link
              href="/signup"
              className="group px-8 py-3.5 text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-200/50 hover:shadow-2xl hover:shadow-indigo-300/50 hover:-translate-y-0.5"
            >
              Get started with your .edu email
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-5 animate-fade-in stagger-4">
            Available at Harvard, MIT, BU, Stanford, and more
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-28">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-7 shadow-sm border border-gray-100/80 card-hover animate-slide-up stagger-2">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center mb-5 shadow-sm">
              <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course-Aware</h3>
            <p className="text-gray-600 leading-relaxed">
              Add your courses and see exactly what materials are available. Textbooks, notes, lab equipment - all organized by class.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-7 shadow-sm border border-gray-100/80 card-hover animate-slide-up stagger-3">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center mb-5 shadow-sm">
              <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Local & Instant</h3>
            <p className="text-gray-600 leading-relaxed">
              Everything is from students at your campus. Chat directly, pick a meeting spot, and get your materials today.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-7 shadow-sm border border-gray-100/80 card-hover animate-slide-up stagger-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center mb-5 shadow-sm">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Students</h3>
            <p className="text-gray-600 leading-relaxed">
              .edu email required. Only verified students from your university can access your campus marketplace.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-28 text-center animate-slide-up stagger-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">What you can find</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { name: "Textbooks", icon: "📚" },
              { name: "Lab Equipment", icon: "🔬" },
              { name: "Calculators", icon: "🔢" },
              { name: "Notes & Study Guides", icon: "📝" },
              { name: "Tickets", icon: "🎫" },
              { name: "Clothing", icon: "👕" },
              { name: "Electronics", icon: "💻" },
              { name: "Furniture", icon: "🪑" },
            ].map((item) => (
              <span
                key={item.name}
                className="px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-gray-200/50 shadow-sm card-hover cursor-default"
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400">
          MAI - The campus marketplace for academic materials
        </div>
      </footer>
    </div>
  );
}
