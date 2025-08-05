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
        <AnimatedSection>
            {/* Responsive padding: smaller on mobile, larger on desktop */}
            <div className="bg-dark-bg rounded-2xl p-6 md:p-16 lg:p-24">
                <div className="text-center max-w-3xl mx-auto">
                    {/* Responsive typography */}
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                        Launch your project today!
                    </h2>
                    <p className="text-base md:text-lg text-gray-300 mb-8">
                        Just write about your idea to get an entire landing page generated
                    </p>

                    {/* 
                      Responsive Form Container:
                      - Mobile: A simple flex column with a gap between input and button.
                      - sm & up: Becomes a relative container for the absolute-positioned button.
                    */}
                    <div className="max-w-lg mx-auto flex flex-col sm:relative gap-4 sm:gap-0">
                        <input
                            type="text"
                            placeholder={placeholderText}
                            className="
                                w-full pl-6 py-3 rounded-full outline-none text-dark-text bg-white
                                placeholder:text-gray-500
                                transition-all duration-300
                                shadow-lg
                                hover:shadow-green-400/40
                                focus:shadow-lg focus:shadow-green-400/40 focus:ring-2 focus:ring-green-400
                                /* Responsive padding-right for the button on larger screens */
                                pr-6 sm:pr-40
                            "
                        />
                        <button
                            onClick={() => navigate('/login')}
                            className="
                                /* Base styles for the button */
                                w-full px-6 py-3 rounded-full font-semibold text-white bg-gradient-primary 
                                hover:opacity-90 transition-opacity flex items-center justify-center gap-2
                                
                                /* sm & up: Position absolutely inside the relative container */
                                sm:w-auto sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 sm:py-2.5
                            "
                        >
                            <Plus size={18} /> Get Started
                        </button>
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
};

export default CTA;