// src/ui-components/LandingPage/Home/Capabilities.js

import React from 'react';
import AnimatedSection from '../Common/AnimatedSection';
import { FileStack, Mail, RefreshCw, Paintbrush, Users } from 'lucide-react';

// Import images
import img1 from '../../../assets/capabilities/1l.png';
import img2 from '../../../assets/capabilities/2l.png';
import img3 from '../../../assets/capabilities/3l.png';
import img4 from '../../../assets/capabilities/4l.png';
import img5 from '../../../assets/capabilities/5l.png';

const capabilitiesData = [
  {
    icon: FileStack,
    title: "Give Every Click Its Own Page",
    description: "Every click opens a landing page built specifically for that prospect. Context from their company, role, and industry is woven in so the page feels one-to-one instead of generic.",
    image: img1,
  },
  {
    icon: Mail,
    title: "Generate Context-Rich Emails",
    description: "Generate cold emails specific to each prospect's role, industry, and pain points so every message feels researched and relevant.",
    image: img2,
  },
  {
    icon: RefreshCw,
    title: "Sync Data Directly to Your CRM",
    description: "Opens, clicks, and visits are tied to each prospect and synced into your CRM.",
    image: img3,
  },
  {
    icon: Paintbrush,
    title: "Pull Prospect Branding",
    description: "Logos, LinkedIn posts, and industry details are added automatically so every page feels relevant.",
    image: img4,
  },
  {
    icon: Users,
    title: "Personalize Outreach at Any Scale",
    description: "Generate hundreds or thousands of individualized emails and pages with zero extra work.",
    image: img5,
  },
];

const CapabilityCard = ({ icon: Icon, title, description, image }) => (
    // Card with gradient and h-full to ensure equal height in grid rows
    <div className="bg-gradient-to-t from-emerald-50 to-white rounded-2xl p-6 sm:p-8 flex flex-col h-full">
        {/* Image container with shadow and rounding removed */}
        <div className="mb-6">
            <img 
                src={image} 
                alt={title} 
                // Image is set to cover the container space
                className="w-full h-56 object-contain rounded-lg" 
            />
        </div>
        <div className="flex flex-col flex-grow">
            <div className="flex items-start space-x-3 mb-2">
                <Icon className="w-5 h-5 text-brand-green flex-shrink-0 mt-1" strokeWidth={2.5}/>
                <h3 className="text-lg font-bold text-dark-text">{title}</h3>
            </div>
            <p className="text-gray-600 text-sm flex-grow">{description}</p>
        </div>
    </div>
);


export default function Capabilities() {
    // Destructure data for clarity
    const [first, second, third, fourth, fifth] = capabilitiesData;

    return (
        <AnimatedSection id="capabilities" bg="bg-white">
            <p className="text-center font-semibold text-brand-green mb-2">CAPABILITIES</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark-text text-center mb-12">Pages Written For Every Prospect</h2>

            <div className="max-w-7xl mx-auto px-4 space-y-8">
                {/* --- First Grid Section: Asymmetrical Layout --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                    {/* Wider first card spanning 2 columns */}
                    <div className="lg:col-span-2">
                        <CapabilityCard 
                            icon={first.icon}
                            title={first.title}
                            description={first.description}
                            image={first.image}
                        />
                    </div>
                    {/* Second card spanning 1 column */}
                    <div>
                        <CapabilityCard 
                            icon={second.icon}
                            title={second.title}
                            description={second.description}
                            image={second.image}
                        />
                    </div>
                </div>

                {/* --- Second Grid Section: 3 Columns --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    <CapabilityCard 
                        icon={third.icon}
                        title={third.title}
                        description={third.description}
                        image={third.image}
                    />
                    <CapabilityCard 
                        icon={fourth.icon}
                        title={fourth.title}
                        description={fourth.description}
                        image={fourth.image}
                    />
                     <CapabilityCard 
                        icon={fifth.icon}
                        title={fifth.title}
                        description={fifth.description}
                        image={fifth.image}
                    />
                </div>
            </div>
        </AnimatedSection>
    );
}