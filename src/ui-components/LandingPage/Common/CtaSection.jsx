import React from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function UniqueCTA() {
  const features = [
    "Full-fledged Content Management System",
    "Intuitive No-Code Page Building",
    "Scalable and Secure Cloud Hosting",
    "Dedicated Expert Support Team",
    "Extensive Theme & Plugin Options",
  ];

  const ctaImage = "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHdlYiUyMGRlc2lnbiUyMGNsZWFuJTIwbGlnaHR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1000&q=80";

  return (
    <section className="bg-gray-100 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="relative bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-8 md:p-12 lg:p-16 text-white">
           <div className="absolute -top-16 -right-16 w-72 h-72 bg-gray-700/20 rounded-full filter blur-2xl opacity-50 animate-pulse"></div>
           <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-gray-600/30 rounded-full filter blur-3xl opacity-60 animate-pulse animation-delay-2000"></div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="md:pr-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 tracking-tight">
                Ready to Build Your <span className="text-gray-300">Exceptional Website</span>?
              </h2>
              <p className="text-lg text-gray-300/90 mb-8 max-w-xl leading-relaxed">
                HyperPitch provides the perfect balance of power, simplicity, and scalability. 
                Start creating your professional online presence today.
              </p>
              <ul className="space-y-3.5 mb-10">
                {features.slice(0,4).map((feature, index) => (
                   <li key={index} className="flex items-center gap-3 text-gray-200">
                     <CheckCircle size={20} className="text-gray-400 flex-shrink-0" />
                     <span>{feature}</span>
                   </li>
                ))}
              </ul>
              <Link
                to="/dashboard"
                className="bg-white hover:bg-gray-200 text-gray-800 font-semibold py-3.5 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2.5"
              >
                Start with HyperPitch
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="flex justify-center items-center mt-8 md:mt-0 group">
              <img
                src={ctaImage}
                alt="Clean web design interface"
                className="w-full max-w-lg object-cover rounded-xl shadow-xl border-2 border-gray-700/40 transform transition-all duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}