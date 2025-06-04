import React from "react";
import { CheckCircle } from "lucide-react";

export default function FeatureSectionItem({ icon, title, description, details, image, imageAlt, reverseOrder = false }) {
  return (
    <section className={`py-16 md:py-24 ${reverseOrder ? 'bg-gray-50/80' : 'bg-white'}`}>
      <div className="container mx-auto px-6">
        <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center`}>
          <div className={`${reverseOrder ? 'md:order-2' : ''} text-center md:text-left`}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-gray-200/80 rounded-full mb-6 shadow-md">
              {icon}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-5 tracking-tight">
              {title}
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {description}
            </p>
            <ul className="space-y-3 text-left">
              {details.map((detail, detailIndex) => (
                <li key={detailIndex} className="flex items-start">
                  <CheckCircle size={20} className="text-gray-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${reverseOrder ? 'md:order-1' : ''} mt-10 md:mt-0`}>
            <img 
              src={image} 
              alt={imageAlt} 
              className="rounded-xl shadow-2xl object-cover w-full h-auto max-h-[450px] border-2 border-white/50 mx-auto" 
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}