import React, { useState, useEffect } from 'react';
import { Star, StarHalf } from 'lucide-react';
import AnimatedSection from '../Common/AnimatedSection';
import img from "../../../assets/img/section/Merge-Community-and-Ad-1.png.webp";
import { useNavigate } from 'react-router-dom';

const commands = [
    "Create a landing page for my new mobile app...",
    "Design a website for a local coffee shop...",
    "Build a portfolio for a digital artist...",
    "Generate a coming-soon page for a SaaS product...",
    "Draft a webpage for a real estate agency..."
];

const Hero = () => {
    const [commandIndex, setCommandIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const navigate = useNavigate();

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

    const placeholderText = `${displayedText}${showCursor ? '|' : ''}`;

    return (
        <div className="relative bg-section-glow min-h-screen flex items-center py-16 sm:p-12">
            <AnimatedSection id="home">
                <div className="grid lg:grid-cols-12 gap-y-12 md:gap-16 items-center">
                    <div className="text-center lg:text-left lg:col-span-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-dark-text leading-tight">Make a beautiful<br />page <span className="text-brand-green">in seconds</span></h1>
                        <p className="mt-4 inline-block bg-light-bg px-3 py-1 rounded-md font-semibold text-sm">The #1 AI Landing Page Generator</p>
                        <p className="mt-6 text-base md:text-lg text-medium-text max-w-md mx-auto lg:mx-0">Our Artificial Intelligence creates your perfect landing page. No designer or developer needed!</p>
                        
                        <div className="mt-10 relative max-w-lg mx-auto lg:mx-0 p-1 sm:p-1.5 rounded-full bg-white shadow-xl border border-gray-200">
                            <input
                                type="text"
                                placeholder={placeholderText}
                                className="w-full pl-5 pr-28 text-sm sm:text-base sm:pl-6 sm:pr-36 py-3 rounded-full outline-none text-medium-text bg-transparent 
                                           placeholder:text-gray-400 
                                           transition-shadow duration-300
                                           hover:shadow-lg hover:shadow-green-400/40
                                           focus:shadow-lg focus:shadow-green-400/40"
                            />
                            <button onClick={() => navigate('/login')} className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-2 text-sm sm:right-2 sm:px-6 sm:py-2.5 sm:text-base rounded-full font-semibold text-white bg-gradient-primary hover:opacity-90 transition-opacity">Get Started</button>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                            <div className="flex items-center gap-0.5">
                                <Star size={20} className="fill-yellow-400 text-yellow-500" />
                                <Star size={20} className="fill-yellow-400 text-yellow-500" />
                                <Star size={20} className="fill-yellow-400 text-yellow-500" />
                                <Star size={20} className="fill-yellow-400 text-yellow-500" />
                                <div className="relative">
                                    <Star size={20} className="text-yellow-500" />
                                    <div className="absolute top-0 left-0">
                                        <StarHalf size={20} className="fill-yellow-400 text-yellow-500" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-medium-text">7909 landing pages created</p>
                        </div>
                    </div>

                    <div className="relative mt-12 lg:mt-0 lg:col-span-6">
                        <div className="absolute -top-4 left-4 font-mono text-xs text-medium-text p-2 bg-gray-100 rounded-md shadow-sm">"Mobile App for a workout Program"</div>
                        <div className="bg-white rounded-xl shadow-2xl border border-border-color overflow-hidden">
                            <div className="h-8 bg-light-bg flex items-center px-4 gap-2 border-b border-border-color">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="p-4 bg-gray-50 aspect-video">
                                <img
                                    src={img}
                                    alt="AI generated mobile app landing page"
                                    className="w-full h-full object-cover rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
        </div>
    );
};

export default Hero;