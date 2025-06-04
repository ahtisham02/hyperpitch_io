import React from "react";
import { Star, UserCircle } from "lucide-react";

const testimonials = [
  {
    quote: "As a small business owner with no coding skills, HyperPitch was a revelation. I built my entire professional website in a weekend. The interface is so intuitive!",
    name: "Maria Rodriguez",
    title: "Owner, The Cozy Corner Cafe",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg", 
    rating: 5,
  },
  {
    quote: "Our agency switched to HyperPitch for client projects. The theme flexibility and plugin architecture give us the power we need, while the managed hosting saves us headaches. Client feedback has been phenomenal.",
    name: "David Chen",
    title: "Lead Developer, PixelPerfect Digital",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    rating: 5,
  },
  {
    quote: "I needed a platform that could scale with my growing blog and e-commerce store. HyperPitch has handled traffic spikes flawlessly, and the SEO tools helped me rank faster. It’s robust and reliable.",
    name: "Aisha Khan",
    title: "Blogger & E-commerce Entrepreneur",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    rating: 4,
  },
];

export default function UniqueTestimonials() {
  return (
    <section className="bg-gray-50 text-gray-800 py-20 md:py-28 relative">
        <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/otis-redding.png')", 
          mixBlendMode: 'multiply'
        }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Loved by <span className="text-gray-700">Entrepreneurs & Developers</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from real users who are building amazing things with HyperPitch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-xl border border-gray-200/80 flex flex-col hover:border-gray-300/90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <blockquote className="text-gray-700 italic leading-relaxed mb-6 flex-grow text-lg">
                “{testimonial.quote}”
              </blockquote>
              <div className="flex items-center mt-auto pt-6 border-t border-gray-200/90">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-gray-200"
                  />
                ) : (
                  <UserCircle size={48} className="text-gray-400 mr-4" />
                )}
                <div>
                  <p className="font-semibold text-gray-800 text-md">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}