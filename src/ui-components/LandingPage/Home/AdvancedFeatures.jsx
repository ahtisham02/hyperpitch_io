import React from 'react';
import { FileText } from 'lucide-react';
import illustration from '../../../assets/key-features/4.png';
import AnimatedSection from '../Common/AnimatedSection';

const features = [
    {
        title: "Bulk Campaign Support",
        description: "Generate thousands of personalized pages and emails at once."
    },
    {
        title: "Custom Domains",
        description: "Host every page on your own branded domain."
    },
    {
        title: "API Access",
        description: "Advanced APIs, integrations, and support."
    },
    {
        title: "Real-Time Analytics",
        description: "Track clicks, visits, and replies inside your CRM."
    }
];

const FeatureItem = ({ title, description }) => (
    <div className="bg-white px-4 py-5 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-start space-x-4">
            {/* Using the Lucide React icon */}
            <FileText className="w-5 h-5 flex-shrink-0 text-green-500 mt-1" strokeWidth={2} />
            <div>
                <h3 className="font-bold text-dark-text text-lg">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
        </div>
    </div>
);

export default function AdvancedFeatures() {
    return (
        // Changed background color as requested
        <AnimatedSection id="advanced-features" bg="bg-gray-50"> 
            <p className="text-center font-semibold text-brand-green mb-2">ADVANCED</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-text text-center mb-12">Power For Teams That Need More</h2>
            
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start px-4">
                <div className="space-y-6 flex flex-col">
                    {features.map((feature, index) => (
                        <FeatureItem key={index} title={feature.title} description={feature.description} />
                    ))}
                    <div className="pt-4">
                        {/* Updated button to be full-width with your requested styles */}
                        <a 
                           href="#demo" 
                           className="block w-full text-center cursor-pointer px-5 py-3 rounded-lg font-semibold text-white bg-brand-gradient shadow-md shadow-brand-green/30 hover:opacity-90 transition-opacity"
                        >
                            Request A Demo
                        </a>
                    </div>
                </div>
                
                <div className="mt-10 lg:mt-0">
                     <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
                        <img 
                            src={illustration} 
                            alt="Advanced features illustration"
                            className="w-full h-auto rounded-xl"
                        />
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
}