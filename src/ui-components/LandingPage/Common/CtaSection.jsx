import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import bgCta from '../../../assets/cta/bgcta.jpg';
import laptop from '../../../assets/cta/laptop.png';
import { useNavigate } from 'react-router-dom';

const commands = [
    "Create a sleek landing page for a new SaaS product...",
    "Design a modern portfolio for a freelance photographer...",
    "Build a vibrant e-commerce site for handmade jewelry...",
    "Generate a minimalist blog about travel and adventure...",
    "Draft a coming-soon page for a mobile app launch..."
];

const CTA = () => {
    const [commandIndex, setCommandIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const navigate = useNavigate();

    // No changes needed for the typing animation logic
    useEffect(() => {
        const currentCommand = commands[commandIndex];
        let timeoutId;

        if (isDeleting) {
            if (displayedText.length > 0) {
                const typingSpeed = 40 + Math.random() * 40;
                timeoutId = setTimeout(() => {
                    setDisplayedText(currentCommand.substring(0, displayedText.length - 1));
                }, typingSpeed);
            } else {
                setIsDeleting(false);
                setCommandIndex((prevIndex) => (prevIndex + 1) % commands.length);
            }
        } else {
            if (displayedText.length < currentCommand.length) {
                const typingSpeed = 80 + Math.random() * 50;
                timeoutId = setTimeout(() => {
                    setDisplayedText(currentCommand.substring(0, displayedText.length + 1));
                }, typingSpeed);
            } else {
                timeoutId = setTimeout(() => setIsDeleting(true), 5000);
            }
        }
        return () => clearTimeout(timeoutId);
    }, [displayedText, isDeleting, commandIndex]);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);

    const placeholderText = `${displayedText}${showCursor ? '│' : ''}`; // Using a more solid cursor for visibility

    return (
            <div className="relative overflow-hidden">
                <img src={bgCta} alt="CTA background" className="absolute inset-0 w-full h-full object-cover" />
                <div className="relative container mx-auto px-6 py-10 md:py-14">
                    <div className="relative max-w-6xl mx-auto rounded-2xl p-6 md:p-10 lg:p-12 text-white" style={{ backgroundColor: '#00442EBF', backdropFilter: 'blur(2px)' }}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 md:gap-8">
                            <div className="lg:col-span-7 pr-0 lg:pr-10">
                                <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Show Prospects You Actually See Them</h2>
                                <p className="text-sm sm:text-base text-white/90 mb-6 max-w-md">Send emails with landing pages automatically made for each lead.</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-brand-gradient hover:opacity-90 transition-opacity"
                                >
                                    Get A Demo <Plus size={16} />
                                </button>
                            </div>
                            <div className="lg:col-span-5 relative h-[180px] sm:h-[220px] lg:h-[220px]">
                                <img src={laptop} alt="Laptop preview" className="absolute right-[-24px] lg:right-[-0px] -top-6 sm:-top-8 lg:-top-40 w-[340px] sm:w-[390px] lg:w-[440px] max-w-none pointer-events-none select-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default CTA;