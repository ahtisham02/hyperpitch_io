import React from "react";
import { Palette, Edit, Puzzle, Send } from "lucide-react";

const steps = [
  {
    icon: <Palette size={32} className="text-gray-700" />,
    title: "1. Pick Your Style & Foundation",
    description: "Browse our extensive library of professionally designed themes tailored for various industries, or choose a clean, blank canvas to unleash your unique vision. Each theme is fully responsive and optimized for modern web standards, giving you a perfect starting point.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxpZ2h0JTIwb2ZmaWNlJTIwY29sbGFib3JhdGlvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
  },
  {
    icon: <Edit size={32} className="text-gray-700" />,
    title: "2. Build & Visually Customize",
    description: "Utilize our intuitive drag-and-drop editor to bring your pages to life. Add and arrange content blocks, upload your media, tweak colors, fonts, and layouts in real-time. No coding is required, empowering you to see your changes instantly and craft a pixel-perfect design.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2Vic2l0ZSUyMGxhdW5jaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
  },
  {
    icon: <Puzzle size={32} className="text-gray-700" />,
    title: "3. Extend with Powerful Functionality",
    description: "Supercharge your website with our rich ecosystem of plugins. Seamlessly integrate features like e-commerce storefronts, advanced contact forms, SEO optimization tools, social media feeds, analytics tracking, and much more to meet your specific needs.",
    image: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVjb21tZXJjZSUyMHNldHVwfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60" // Image for plugins/e-commerce
  },
  {
    icon: <Send size={32} className="text-gray-700" />,
    title: "4. Launch, Analyze & Grow",
    description: "When you're ready, publish your masterpiece to the world with a single click. Our platform ensures optimal performance and reliability. Monitor your site's traffic, engage with your audience, and continuously iterate to grow your online presence effectively.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y29kZSUyMGRlcGxveW1lbnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60" // Image for launching/analytics
  },
];

export default function UniqueHowItWorks() {
  return (
    <section className="bg-gradient-to-b from-gray-100 via-white to-gray-50 text-gray-800 py-20 md:py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <pattern id="subtleLines" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="30" strokeWidth="0.3" stroke="rgba(156, 163, 175, 0.3)"/>
          </pattern>
          <rect width="100" height="100" fill="url(#subtleLines)"/>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Get Online in <span className="text-gray-700">Four Simple Steps</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Building your professional website with HyperPitch is straightforward and efficient.
          </p>
        </div>

        <div className="space-y-16 md:space-y-24">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className="md:w-1/2 relative">
                <img 
                  src={step.image} 
                  alt={step.title} 
                  className="rounded-xl shadow-2xl object-cover w-full h-64 md:h-80 border-4 border-white/60"
                  loading="lazy"
                />
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gray-800 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg z-10">
                  {index + 1}
                </div>
              </div>
              <div className="md:w-1/2 text-center md:text-left">
                <div className="inline-block p-3 bg-white border border-gray-200/80 rounded-full mb-4 shadow-md">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}