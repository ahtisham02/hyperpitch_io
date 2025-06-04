import React from "react";
import { Zap } from "lucide-react";
import FeatureHeaderImage from "../../../assets/img/feature/4800214.jpg"; // Assuming this path is correct

export default function FeaturesPageHeader() {
  return (
    <header className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 py-20 md:py-28 overflow-hidden border-b border-gray-200/70">
      <div className="absolute -top-10 -left-10 w-80 h-80 bg-gray-200/20 rounded-full filter blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-gray-200/30 rounded-full filter blur-3xl opacity-70 animate-pulse animation-delay-1500"></div>
      
      <div className="container relative mx-auto px-6 z-10">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-7 lg:col-span-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200/90 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 shadow-sm">
              <Zap size={16} className="text-gray-500" />
              HyperPitch Capabilities
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">
              Unlock the Full Power of <span className="text-gray-700">HyperPitch</span>.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed">
              Discover the comprehensive suite of features designed to help you build, manage, and scale stunning, high-performance websites with unparalleled ease.
            </p>
          </div>
          <div className="md:col-span-5 lg:col-span-6 hidden md:flex justify-center items-center">
            <img 
              src={FeatureHeaderImage} 
              alt="HyperPitch platform features illustration"
              className="rounded-xl shadow-2xl object-contain w-full h-auto max-h-[400px] lg:max-h-[450px]"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </header>
  );
}