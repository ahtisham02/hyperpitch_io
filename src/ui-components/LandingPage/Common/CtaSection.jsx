import React from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const placeholderImg = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2ViJTIwZGVzaWduJTIwdGVhbXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60";

export default function UniqueCTA() {
  const features = [
    "Intuitive Drag & Drop Editor",
    "Real-time Live Preview",
    "Component-based Architecture",
    "Customizable Elements & Styles",
    "Responsive Design Out-of-the-Box",
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-tr from-indigo-600 to-purple-700 rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12 lg:p-16 text-white">
          <div className="grid md:grid-cols-5 gap-10 lg:gap-16 items-center">
            <div className="md:col-span-3 md:pr-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 tracking-tight">
                Transform Your Ideas into Reality.
              </h2>
              <p className="text-lg text-indigo-100/90 mb-8 max-w-xl leading-relaxed">
                Our Page Builder is more than just a tool; it's your creative partner. 
                Build with speed, flexibility, and confidence.
              </p>
              <ul className="space-y-3 mb-10">
                {features.slice(0,3).map((feature, index) => (
                   <li key={index} className="flex items-center gap-3 text-indigo-50">
                     <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                     <span>{feature}</span>
                   </li>
                ))}
              </ul>
              <Link
                to="/dashboard" // Navigate to dashboard
                className="bg-white hover:bg-gray-100 text-indigo-700 font-semibold py-3.5 px-8 rounded-xl text-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2.5"
              >
                Try the Page Builder
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="md:col-span-2 flex justify-center items-center mt-8 md:mt-0 group">
              <img
                src={placeholderImg}
                alt="Team collaborating on web design"
                className="w-full max-w-md lg:max-w-lg object-cover rounded-2xl shadow-xl transform transition-all duration-500 group-hover:scale-105 group-hover:rotate-1"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}