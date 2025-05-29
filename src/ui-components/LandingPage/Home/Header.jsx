import React from "react";
import { ArrowRight, Zap, Palette, MousePointerClick } from "lucide-react";
import { Link } from "react-router-dom";

export default function UniqueHero() {
  return (
    <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-800 py-20 md:py-32">
      <div className="container relative mx-auto px-6 text-center">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-200/50 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-200/50 rounded-full filter blur-3xl opacity-70 animate-pulse animation-delay-2000"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-200/70 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 shadow-sm">
            <Zap size={16} className="text-amber-500" />
            Unleash Your Creativity
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-gray-900 leading-tight">
            Craft Stunning <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Landing Pages</span> in Minutes.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Experience the power of intuitive drag & drop, real-time previews, and endless customization. No code, no limits—just beautiful results.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
            <Link
              to="/dashboard" // Navigate to dashboard
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 px-10 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-flex items-center justify-center gap-2.5"
            >
              Start Building Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/dashboard" // Navigate to dashboard
              className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3.5 px-10 rounded-xl text-lg border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center justify-center gap-2.5"
            >
              <MousePointerClick size={20} className="text-indigo-500" />
              Explore Features
            </Link>
          </div>
          <div className="mt-16 flex justify-center items-center gap-3 text-sm text-gray-500">
            <Palette size={18} /> Fully Customizable <span className="text-gray-300">|</span> Drag & Drop Simplicity <span className="text-gray-300">|</span> Instant Previews
          </div>
        </div>
      </div>
    </section>
  );
}