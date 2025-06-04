import React from "react";
import { Edit3, LayoutGrid, Puzzle, FileText, Search, Users } from "lucide-react";

const features = [
  {
    icon: <Edit3 size={28} className="text-gray-600" />,
    title: "Intuitive Visual Builder",
    description: "Design visually with our drag & drop editor. No code needed.",
  },
  {
    icon: <LayoutGrid size={28} className="text-gray-600" />,
    title: "Professional Themes",
    description: "Choose from diverse, responsive templates to match your brand.",
  },
  {
    icon: <Puzzle size={28} className="text-gray-600" />,
    title: "Powerful Plugins",
    description: "Extend functionality with a growing ecosystem of add-ons.",
  },
  {
    icon: <FileText size={28} className="text-gray-600" />,
    title: "Effortless CMS",
    description: "Easily create, organize, and manage all your site content.",
  },
  {
    icon: <Search size={28} className="text-gray-600" />,
    title: "SEO Tools Built-in",
    description: "Optimize your site for search engines and attract more traffic.",
  },
  {
    icon: <Users size={28} className="text-gray-600" />,
    title: "User Management",
    description: "Collaborate with team members using granular role permissions.",
  },
];

export default function UniqueFeaturesHighlight() {
  return (
    <section className="bg-white text-gray-800 py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            The Complete Toolkit for Your Website
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            HyperPitch provides everything you need to build, manage, and grow your online presence efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50/90 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/70 transform hover:-translate-y-1 hover:border-gray-300/80"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 shadow-md mx-auto border border-gray-200">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}