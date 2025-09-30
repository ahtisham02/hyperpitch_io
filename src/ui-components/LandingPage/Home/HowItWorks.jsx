import React from "react";
import AnimatedSection from "../Common/AnimatedSection";

const Step = ({ number, title, description }) => (
  <div className="relative flex-1 text-center px-4 z-10 flex flex-col">
    <div className="mx-auto w-12 h-12 mb-4 rounded-full border-2 border-[#10b981] flex items-center justify-center font-bold text-xl text-medium-text bg-white">
      {number}
    </div>
    <h3 className="text-lg font-bold mb-2 min-h-[48px] flex items-end justify-center">{title}</h3>
    <p className="text-medium-text max-w-xs mx-auto min-h-[48px]">{description}</p>
  </div>
);

const HowItWorks = () => {
  return (
    <AnimatedSection bg="bg-[#F9FAFB]" id="how-it-works">
      <p className="text-center font-semibold text-brand-green mb-2">
        How it works
      </p>
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16">
      From List to Landing Page in Minutes
      </h2>
      <div className="relative flex flex-col md:flex-row justify-between md:items-start space-y-12 md:space-y-0">
        <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 dotted-line"></div>
        <Step
          number="1"
          title="Upload your leads"
          description="Connect your CRM or drop in a CSV."
        />{" "}
        <Step
          number="2"
          title="AI generates outreach"
          description="Personalized emails + landing pages for each prospect."
        />
        <Step
          number="3"
          title="Send & track"
          description="Every click and visit is logged in your CRM instantly."
        />
      </div>
    </AnimatedSection>
  );
};

export default HowItWorks;
