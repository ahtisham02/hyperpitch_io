import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
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
                const typingSpeed = 80 + Math.random() * 50; // Randomized typing speed
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
        <AnimatedSection>
            <div className="bg-dark-bg rounded-2xl p-8 md:p-24">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Launch your project today!</h2>
                    <p className="text-lg text-gray-300 mb-8">Just write about your idea to get an entire landing page generated</p>
                    <div className="relative max-w-lg mx-auto p-1.5 rounded-full bg-white shadow-xl border border-gray-600">
                        <input
                            type="text"
                            placeholder={placeholderText}
                            className="w-full pl-6 pr-40 py-3 rounded-full outline-none text-dark-text bg-transparent 
                                       placeholder:text-gray-400 
                                       transition-shadow duration-300
                                       hover:shadow-lg hover:shadow-green-400/40
                                       focus:shadow-lg focus:shadow-green-400/40"
                        />
                        <button onClick={()=>{navigate('/login')}} className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-full font-semibold text-white bg-gradient-primary hover:opacity-90 transition-opacity flex items-center gap-2">
                            <Plus size={18} /> Get Started
                        </button>
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
};

export default CTA;