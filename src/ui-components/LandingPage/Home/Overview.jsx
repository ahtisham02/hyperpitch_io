import React from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ highlight, description }) => (
    <div className="rounded-xl bg-[#F0FDF4] px-5 py-4">
        <p className="text-gray-600 font-extrabold tracking-tight">
            {highlight}
        </p>
        <p className="text-sm text-gray-600 mt-1">
            {description}
        </p>
    </div>
);

export default function Overview() {
    const navigate = useNavigate();
    return (
        <section className="p-8 sm:p-12 mx-auto bg-[#F9FAFB]">
            <div className="grid lg:grid-cols-12 gap-10 items-start">
                {/* Left column */}
                <div className="lg:col-span-6">
                    <p className="text-left font-semibold text-brand-green mb-2">Overview</p>
                    <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-dark-text">
                        From Cold Emails
                        <br />
                        To Personalized Experiences
                    </h2>
                    <p className="mt-6 text-sm sm:text-base text-medium-text max-w-xl">
                        Automatically create landing pages with prospect context that speak
                        their language and build stronger connections.
                    </p>
                    <p className="mt-4 text-sm sm:text-base text-medium-text max-w-xl">
                        Stop sending static links. Give every prospect a page that speaks to
                        their role, industry, and needs.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base font-semibold text-white bg-brand-gradient shadow hover:opacity-90 transition-opacity"
                    >
                        See How It Works
                        <Menu size={16} />
                    </button>
                </div>

                {/* Right column */}
                <div className="lg:col-span-6 space-y-4">
                    <StatCard
                        highlight={<><span className="font-extrabold text-[#22C55E]">3–5×</span> higher click–through rates</>}
                        description="from AI-powered landing pages"
                    />
                    <StatCard
                        highlight={<><span className="font-extrabold text-[#22C55E]">2–3×</span> higher response rates</>}
                        description="from personalized cold email campaigns"
                    />
                    <StatCard
                        highlight={<><span className="font-extrabold text-[#22C55E]">One–to–one</span> engagement</>}
                        description="at scale for SDRs, ABM teams, and agencies"
                    />
                </div>
            </div>
        </section>
    );
}


