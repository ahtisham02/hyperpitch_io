import React from "react";
import { Element } from "react-scroll";
import Navbar from "../../ui-components/LandingPage/Common/Navbar";
import Hero from "../../ui-components/LandingPage/Home/Hero";
import SocialProof from "../../ui-components/LandingPage/Home/SocialProof";
import HowItWorks from "../../ui-components/LandingPage/Home/HowItWorks";
import KeyFeatures from "../../ui-components/LandingPage/Home/KeyFeatures";
import Pricing from "../../ui-components/LandingPage/Home/Pricing";
import FAQ from "../../ui-components/LandingPage/Home/FAQ";
import CTA from "../../ui-components/LandingPage/Common/CtaSection";
import Footer from "../../ui-components/LandingPage/Common/Footer";
import Overview from "../../ui-components/LandingPage/Home/Overview";
import AdvancedFeatures from "../../ui-components/LandingPage/Home/AdvancedFeatures";
import Capabilities from "../../ui-components/LandingPage/Home/Capabilities";

function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <main>
        <Element name="home">
          <Hero />
        </Element>
        <SocialProof />
        <Overview />
        <Element name="features">
          <KeyFeatures />
        </Element>
        <Element name="how-it-works">
          <HowItWorks />
        </Element>
        <Element name="capabilities">
          <Capabilities />
        </Element>
        <Element name="advanced-features">
          <AdvancedFeatures />
        </Element>
        <Element name="pricing">
          <Pricing />
        </Element>
        <Element name="faq">
          <FAQ />
        </Element>
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;