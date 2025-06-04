import React from "react";
import { ArrowRight, Zap, Layers, Settings2, Server } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../../../assets/img/section/Asks-2.png.webp"

export default function UniqueHero() {

  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 py-20 md:py-28 overflow-hidden">
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-gray-200/30 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gray-200/40 rounded-full filter blur-3xl opacity-60 animate-pulse animation-delay-2000"></div>
      
      <div className="container relative mx-auto px-6 z-10">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-7 lg:col-span-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200/90 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 shadow-sm">
              <Zap size={16} className="text-gray-500" />
              Build. Manage. Grow.
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">
              The Ultimate Platform for <span className="text-gray-700">Your Website</span>.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed">
              HyperPitch delivers WordPress-like power with unparalleled ease of use. Create stunning, high-performance websites without the complexity.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4">
              <Link
                to="/dashboard"
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3.5 px-10 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 inline-flex items-center justify-center gap-2.5 w-full sm:w-auto"
              >
                Start Building
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/features"
                className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3.5 px-10 rounded-lg text-lg border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center justify-center gap-2.5 w-full sm:w-auto"
              >
                Explore Features
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Layers size={18} /> Robust Theme Engine</span>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5"><Settings2 size={18} /> Flexible Plugins</span>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5"><Server size={18} /> SEO Optimized</span>
            </div>
          </div>
          <div className="md:col-span-5 lg:col-span-6 hidden md:block">
            <img 
              src={heroImage} 
              alt="Modern website creation interface - abstract light pattern"
              className="rounded-xl shadow-2xl object-cover w-full h-auto max-h-[500px] border-2 border-white/50"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}