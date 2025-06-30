import React from "react";
import AnimatedSection from "../Common/AnimatedSection";
import {
  Coins,
  Wand2,
  Megaphone,
  LayoutGrid,
  PenSquare,
  BarChart2,
} from "lucide-react";

const FeatureCard = ({ icon, title, description, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full bg-section-glow">
    <div
      className={`w-12 h-12 mb-4 rounded-full flex items-center justify-center ${color}`}
    >
      {icon}
    </div>
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-medium-text">{description}</p>
  </div>
);

const Features = () => {
  return (
    <AnimatedSection id="features">
      <p className="text-center font-semibold text-brand-green mb-2">
        Features
      </p>
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
        The fastest way to build a landing page
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Coins size={24} className="text-yellow-500" />}
          title="Copy that sells"
          description="Our AI uses millions of converting headlines to write yours. It speaks 50+ languages!"
          color="bg-yellow-100"
        />
        <FeatureCard
          icon={<Wand2 size={24} className="text-purple-500" />}
          title="Stunning illustrations"
          description="Choose amongst 6 art styles and 12 color themes to generate pixel-perfect images."
          color="bg-purple-100"
        />
        <FeatureCard
          icon={<Megaphone size={24} className="text-brand-green-dark" />}
          title="Promote your business"
          description="Apple Store link, crowdfunding campaign, a charity, your course on Gumroad..."
          color="bg-brand-green/20"
        />
        <FeatureCard
          icon={<LayoutGrid size={24} className="text-indigo-500" />}
          title="Beautiful templates"
          description="Use our pre-made components for your portfolio, mobile app, SaaS, community, course..."
          color="bg-indigo-100"
        />
        <FeatureCard
          icon={<PenSquare size={24} className="text-sky-500" />}
          title="Easy page editor"
          description="A simple, intuitive editor that requires no coding knowledge."
          color="bg-sky-100"
        />
        <FeatureCard
          icon={<BarChart2 size={24} className="text-brand-lime-dark" />}
          title="Simple analytics"
          description="Track your page views and conversion rates with our built-in analytics."
          color="bg-brand-lime/20"
        />
      </div>
    </AnimatedSection>
  );
};

export default Features;
