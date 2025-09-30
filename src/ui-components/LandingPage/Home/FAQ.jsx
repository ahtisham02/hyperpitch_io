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
        <AnimatedSection id="faq" bg="bg-[#F9FAFB]">
            <div className="grid md:grid-cols-3 gap-12">
                <div className="md:col-span-1">
                    <p className="font-semibold text-brand-green mb-2">FAQ</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold">Frequently Asked Questions</h2>
                </div>
                <div className="md:col-span-2">
                    <FaqItem question="Is this just another email sender?">No. HyperPitch generates a unique, personalized landing page for every prospect and then plugs into your existing sending tools. Think of it as an intelligence layer that makes your emails convert better—not a replacement for your mailer.</FaqItem>
                    <FaqItem question="Will prospects actually care about a page?">Yes. Prospects click more when content reflects their role, industry and pain points. Our users see higher CTR and replies because each page speaks directly to the person receiving it.</FaqItem>
                    <FaqItem question="Do I need to rewrite all my outreach?">No. Keep your sequences. Drop in our smart links to personalized pages and optionally use our AI copy blocks to lightly tailor your existing templates.</FaqItem>
                    <FaqItem question="How does this play with my current stack?">It slots right in. Outreach, SalesLoft, HubSpot, Salesforce—we connect so you can keep your workflow.</FaqItem>
                </div>
            </div>
        </AnimatedSection>
    );
};

export default FAQ;