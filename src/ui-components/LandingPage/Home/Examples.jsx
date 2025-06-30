import React from 'react';
import AnimatedSection from '../Common/AnimatedSection';

import incubixLogo from '../../../assets/img/slider/incubix.webp';
import hubspotLogo from '../../../assets/img/slider/hubspot.jpg';
import madscienceImage from '../../../assets/img/slider/madscience-earth.png';
import healthImage from '../../../assets/img/slider/health-options.png';
import h2Image from '../../../assets/img/slider/download1-removebg-preview.png';
import jsbLogo from '../../../assets/img/slider/jsb.png';

// The card component now accepts an optional 'imageClassName' for custom image styling
const ExampleCard = ({ imageSrc, title, description, bubbleText, contentBg, textColor, imageClassName }) => (
    <div className="relative group">
        <div className="absolute -top-4 left-6 text-sm bg-white px-3 py-1 rounded-full shadow-lg z-10 font-semibold text-slate-700">{bubbleText}</div>
        <div className={`rounded-2xl overflow-hidden shadow-lg flex ${contentBg} transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1`}>
            
            <div className="w-1/3 shrink-0 flex items-center justify-center p-4 bg-white/40 border-r border-black/5">
                {/* We use imageClassName if it exists, otherwise we fall back to the default max-h-16 */}
                <img src={imageSrc} alt={`${title} logo`} className={`max-w-full object-contain ${imageClassName || 'max-h-16'}`} />
            </div>
            
            <div className={`p-6 w-2/3 ${textColor}`}>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm opacity-90 leading-relaxed">{description}</p>
            </div>
        </div>
    </div>
);

// Updated cardData with your specific changes
const cardData = [
    {
        imageSrc: madscienceImage,
        title: "Madscience Blog",
        description: "A fun and engaging landing page for a popular science blog.",
        bubbleText: "build a blog 📝",
        contentBg: "bg-green-50",
        textColor: "text-green-900",
    },
    {
        imageSrc: hubspotLogo,
        title: "HubSpot Funnels",
        description: "Effective sales funnels that integrate directly with your CRM.",
        bubbleText: "generate sales funnels 🚀",
        contentBg: "bg-orange-50",
        textColor: "text-orange-900",
    },
    {
        imageSrc: healthImage,
        title: "Health Options",
        // 2. Expanded description for this card
        description: "A welcoming and professional page for a local healthcare provider, helping patients easily.",
        bubbleText: "for your practice 🧑‍⚕️",
        contentBg: "bg-sky-50",
        textColor: "text-sky-900",
    },
    {
        imageSrc: incubixLogo,
        title: "Incubix Startups",
        description: "Attract the next generation of founders for your incubator.",
        bubbleText: "promote your startup ✨",
        contentBg: "bg-rose-50",
        textColor: "text-rose-900",
    },
    {
        imageSrc: h2Image,
        title: "Korean Express Course",
        description: "A high-conversion page to sell your online language course.",
        bubbleText: "sell a course 🧑‍🏫",
        contentBg: "bg-indigo-50",
        textColor: "text-indigo-900",
        // 1. Added a custom class to make this specific image larger
        imageClassName: 'max-h-24',
    },
    {
        imageSrc: jsbLogo,
        title: "JSB Consulting",
        description: "A sharp, professional page to land high-value B2B clients.",
        bubbleText: "for consulting 💼",
        contentBg: "bg-slate-100",
        textColor: "text-slate-800",
    },
];

const Examples = () => {
    return (
        <AnimatedSection id="examples" bg="bg-slate-50">
            <p className="text-center font-semibold text-brand-green mb-2">Examples</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-slate-800 mb-12">Built with HyperPitch.io</h2>
            
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
                {cardData.map((card, index) => (
                    <ExampleCard key={index} {...card} />
                ))}
            </div>
        </AnimatedSection>
    );
};

export default Examples;