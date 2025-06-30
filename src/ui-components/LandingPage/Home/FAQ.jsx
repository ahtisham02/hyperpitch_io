import React ,{ useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import AnimatedSection from '../Common/AnimatedSection';

const FaqItem = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="border-b border-border-color py-5">
            <button
                onClick={toggleOpen}
                className="flex justify-between items-center w-full font-semibold cursor-pointer list-none text-left"
            >
                <span className="text-lg">{question}</span>
                <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Plus className="text-medium-text" />
                </motion.span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="text-medium-text leading-relaxed">
                            {children}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => {
    return (
        <AnimatedSection id="faq" bg="bg-light-bg">
            <div className="grid md:grid-cols-3 gap-12">
                <div className="md:col-span-1">
                    <p className="font-semibold text-brand-green mb-2">FAQ</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold">Frequently Asked Questions</h2>
                </div>
                <div className="md:col-span-2">
                    <FaqItem question="What do I get exactly?">You get a fully functional, responsive, and SEO-friendly landing page with AI-generated copy, logo, and illustrations.</FaqItem>
                    <FaqItem question="I don't want to pay upfront, can I try it first?">Absolutely! You can generate a preview of your landing page completely for free. You only need to subscribe when you're ready to publish.</FaqItem>
                    <FaqItem question="Can I get a refund if I'm not satisfied?">Yes, we offer a 7-day money-back guarantee. If you're not happy with the result, just contact our support for a full refund.</FaqItem>
                    <FaqItem question="Can I still keep my landing pages after I cancel?">Yes, you retain full ownership of any pages you've created and exported. You'll just need to export your site before the subscription ends.</FaqItem>
                </div>
            </div>
        </AnimatedSection>
    );
};

export default FAQ;