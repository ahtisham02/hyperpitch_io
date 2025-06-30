import React from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { Rocket, Phone, Mail, MapPin } from 'lucide-react';

const FooterLogo = () => (
    <div className="flex items-center gap-3">
        <Rocket className="text-brand-green" size={40} />
        <div>
            <span className="text-2xl font-extrabold text-dark-text">HyperPitch.io</span>
        </div>
    </div>
);

const Footer = () => {
    const quickLinks = [
        { to: 'home', label: 'Home' },
        { to: 'examples', label: 'Examples' },
        { to: 'how-it-works', label: 'How it works' },
        { to: 'features', label: 'Features' },
        { to: 'pricing', label: 'Pricing' },
    ];
    
    const legalLinks = [
        { type: 'scroll', to: 'reviews', label: 'Reviews' },
        { type: 'scroll', to: 'faq', label: 'FAQ' },
        { type: 'route', to: '/terms-and-conditions', label: 'Terms & Conditions' },
        { type: 'route', to: '/privacy-policy', label: 'Privacy Policy' },
    ];

    return (
        <footer className="bg-footer-bg text-gray-700 pt-20 pb-16">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[34fr_19fr_19fr_28fr] gap-12">
                    <div className="lg:col-span-1">
                        <FooterLogo />
                        <p className="mt-4 text-sm leading-relaxed">Powering the next generation of beautiful, AI-driven landing pages.</p>
                        <p className="mt-8 text-xs text-gray-500">© 2025 HyperPitch.io All rights reserved.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-dark-text mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            {quickLinks.map(link => (
                                <li key={link.to}>
                                    <ScrollLink to={link.to} smooth={true} offset={-80} duration={500} className="text-sm text-medium-text hover:text-brand-green-light transition-colors cursor-pointer">{link.label}</ScrollLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-dark-text mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {legalLinks.map(link => (
                                <li key={link.label}>
                                    {link.type === 'scroll' ? (
                                        <ScrollLink to={link.to} smooth={true} offset={-80} duration={500} className="text-sm text-medium-text hover:text-brand-green-light transition-colors cursor-pointer">
                                            {link.label}
                                        </ScrollLink>
                                    ) : (
                                        <RouterLink to={link.to} className="text-sm text-medium-text hover:text-brand-green-light transition-colors">
                                            {link.label}
                                        </RouterLink>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-dark-text mb-4">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3"><Phone size={16} className="text-brand-green"/> <a href="tel:+18773335540" className="text-sm hover:text-brand-green-light transition-colors">+1 (877) 333-5540</a></li>
                            <li className="flex items-center gap-3"><Mail size={16} className="text-brand-green"/> <a href="mailto:contact@hyperpitch.io" className="text-sm hover:text-brand-green-light transition-colors">contact@hyperpitch.io</a></li>
                            <li className="flex items-start gap-3"><MapPin size={16} className="text-brand-green mt-1"/> <span className="text-sm">2117 Lake Ave, Altadena 91001</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;