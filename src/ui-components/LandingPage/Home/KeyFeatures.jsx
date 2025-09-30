import React from 'react';
import AnimatedSection from '../Common/AnimatedSection';
import img1 from '../../../assets/key-features/1.png';
import img2 from '../../../assets/key-features/2.png';
import img3 from '../../../assets/key-features/3.png';
import img4 from '../../../assets/key-features/4.png';

const FeatureCard = ({ image, title, description }) => (
    <div className="flex flex-col max-w-[260px] mx-auto">
        <div className="rounded-xl overflow-hidden bg-white image-glow">
            <img src={image} alt={title} className="w-full h-60 object-contain p-4" />
        </div>
        <h3 className="mt-4 text-sm sm:text-base font-bold text-dark-text">{title}</h3>
        <p className="mt-2 text-sm text-medium-text">{description}</p>
    </div>
);

export default function KeyFeatures() {
    return (
        <AnimatedSection id="features" bg="bg-white">
            <p className="text-center font-semibold text-brand-green mb-2">Key Features</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-text text-center mb-12">Features That Make Outbound Work</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard
                    image={img1}
                    title="AI–Generated Landing Pages"
                    description="Each prospect gets a page tailored to their role, industry, and pain points."
                />
                <FeatureCard
                    image={img2}
                    title="AI Cold Email Generation"
                    description="Smart copywriting tuned to prospect data and pain points."
                />
                <FeatureCard
                    image={img3}
                    title="Unique Tracking Links"
                    description="Every click logged at the individual prospect level."
                />
                <FeatureCard
                    image={img4}
                    title="CRM Integration"
                    description="Sync engagement automatically to Salesforce, HubSpot, and more."
                />
            </div>
        </AnimatedSection>
    );
}


