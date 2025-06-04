import React from "react";
import UniqueHero from "../../../ui-components/LandingPage/Home/UniqueHero";
import UniqueFeaturesHighlight from "../../../ui-components/LandingPage/Home//UniqueFeaturesHighlight";
import UniqueHowItWorks from "../../../ui-components/LandingPage/Home/UniqueHowItWorks";
import UniqueTestimonials from "../../../ui-components/LandingPage/Home/UniqueTestimonials";

export default function HomePage() {
  return (
    <div className="flex-grow overflow-hidden">
      <UniqueHero />
      <UniqueFeaturesHighlight />
      <UniqueHowItWorks />
      <UniqueTestimonials />
    </div>
  );
}