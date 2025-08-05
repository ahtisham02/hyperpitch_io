import React from "react";
import AnimatedSection from "../Common/AnimatedSection";

const Step = ({ number, title, description }) => (
  <div className="relative flex-1 text-center px-4 z-10">
    <div className="mx-auto w-12 h-12 mb-4 rounded-full border-2 border-border-color flex items-center justify-center font-bold text-xl text-medium-text bg-white">
      {number}
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-medium-text max-w-xs mx-auto">{description}</p>
  </div>
);

const HowItWorks = () => {
  return (
    <AnimatedSection id="how-it-works">
      <p className="text-center font-semibold text-brand-green mb-2">
        How it works?
      </p>
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16">
        Get your business online today
      </h2>
      <div className="relative flex flex-col md:flex-row justify-between md:items-center space-y-12 md:space-y-0">
        <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 dotted-line"></div>
        <Step
          number="1"
          title="Describe your project"
          description="A few words about your business, what you do, what you sell, or your main goal... Anything, really!"
        />{" "}
        <Step
          number="2"
          title="Our AI builds your landing page"
          description="Artificial Intelligence generates copy that sells, unique logo and illustrations. Takes less than 1 minute!"
        />
        <Step
          number="3"
          title="Customize the content"
          description="Upload pictures of your business, change the copy, edit buttons. Then just share your site!"
        />
      </div>
    </AnimatedSection>
  );
};

export default HowItWorks;
