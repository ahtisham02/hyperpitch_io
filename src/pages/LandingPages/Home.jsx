import React from "react";
import { Element } from "react-scroll";
import Navbar from "../../ui-components/LandingPage/Common/Navbar";
import Hero from "../../ui-components/LandingPage/Home/Hero";
import SocialProof from "../../ui-components/LandingPage/Home/SocialProof";
import HowItWorks from "../../ui-components/LandingPage/Home/HowItWorks";
import Examples from "../../ui-components/LandingPage/Home/Examples";
import Features from "../../ui-components/LandingPage/Home/Features";
import Reviews from "../../ui-components/LandingPage/Home/Reviews";
import Pricing from "../../ui-components/LandingPage/Home/Pricing";
import FAQ from "../../ui-components/LandingPage/Home/FAQ";
import CTA from "../../ui-components/LandingPage/Common/CtaSection";
import Footer from "../../ui-components/LandingPage/Common/Footer";

function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <main>
        <Element name="home">
          <Hero />
        </Element>
        <SocialProof />
        <Element name="how-it-works">
          <HowItWorks />
        </Element>
        <Element name="examples">
          <Examples />
        </Element>
        <Element name="features">
          <Features />
        </Element>
        <Element name="reviews">
          <Reviews />
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
