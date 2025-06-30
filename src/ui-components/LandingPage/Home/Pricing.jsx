import React, { useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import AnimatedSection from '../Common/AnimatedSection';
import { Check } from 'lucide-react';
import { toast } from 'react-toastify';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const stripePromise = STRIPE_PUBLISHABLE_KEY?.startsWith("pk_")
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

const PricingCard = ({ plan, price, features, isFeatured = false, planId, onClick, isLoading }) => (
    <div className={`border rounded-xl p-8 flex flex-col h-full transition-transform duration-300 ${isFeatured ? 'border-brand-lime bg-white shadow-2xl lg:scale-105' : 'border-border-color bg-white/50'}`}>
        <h3 className="text-xl font-bold">{plan}</h3>
        <p className="mt-2 mb-6">
            <span className={`text-5xl font-extrabold ${isFeatured ? 'text-brand-lime' : 'text-dark-text'}`}>${price}</span>
            <span className="text-medium-text"> / MONTH</span>
        </p>
        <ul className="space-y-4 mb-8 flex-grow">
            {features.map((feature, i) => (
                <li key={i} className="flex items-center">
                    <Check className="text-brand-green mr-3" size={18} /> {feature}
                </li>
            ))}
        </ul>
        <button
            onClick={() => onClick(planId)}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-white ${isFeatured ? 'bg-gradient-pro' : 'bg-gradient-primary'} hover:opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {isLoading ? 'Redirecting...' : 'Make Landing Page Now'}
        </button>
        <p className="text-center text-sm text-medium-text mt-3">Cancel anytime.</p>
    </div>
);


const Pricing = () => {
    const [loadingPlanId, setLoadingPlanId] = useState(null);

    const starterFeatures = ["10 pages per month", "∞ logos", "∞ illustrations", "∞ copywriting", "Link to share", "Site editor"];
    const proFeatures = ["50 pages per month", ...starterFeatures.slice(1), "Analytics", "Custom Domain", "Customer Support"];
    const premiumFeatures = ["150 pages per month", ...proFeatures.slice(1), "API Access"];

    const planToStripeCheckoutLinkUrl = useMemo(
        () => ({
            plan_starter: "https://buy.stripe.com/test_9B66oHchoeUN2QR2XhbfO07",
            plan_pro: "https://buy.stripe.com/test_fZu4gz5T08wp4YZgO7bfO08",
            plan_premium: "https://buy.stripe.com/test_fZu6oH6X42818bbgO7bfO09",
        }),
        []
    );

    const handlePlanSelect = async (planId) => {
        if (planId === "plan_enterprise") return;

        const checkoutLinkUrl = planToStripeCheckoutLinkUrl[planId];

        if (!checkoutLinkUrl || checkoutLinkUrl.startsWith("YOUR_")) {
            toast.error("Stripe Checkout Link for this plan is not configured.");
            return;
        }

        setLoadingPlanId(planId);
        try {
            if (!stripePromise) {
                toast.error("Stripe configuration is missing. Payments are disabled.");
                throw new Error("Stripe is not initialized.");
            }
            window.location.href = checkoutLinkUrl;
        } catch (error) {
            console.error("Stripe redirect error:", error);
            toast.error("An unexpected error occurred while redirecting to payment.");
            setLoadingPlanId(null);
        }
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-pricing-glow z-0"></div>
            <AnimatedSection id="pricing">
                <p className="text-center font-semibold text-brand-green mb-2">Pricing</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">A landing page for 10x less than a designer price</h2>
                <p className="text-center text-lg text-medium-text mb-12">Build a professional landing page in seconds. Launch your project today!</p>
                <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
                    <PricingCard
                        plan="Starter"
                        price="9"
                        features={starterFeatures}
                        planId="plan_starter"
                        onClick={handlePlanSelect}
                        isLoading={loadingPlanId === 'plan_starter'}
                    />
                    <PricingCard
                        plan="Pro"
                        price="19"
                        features={proFeatures}
                        isFeatured={true}
                        planId="plan_pro"
                        onClick={handlePlanSelect}
                        isLoading={loadingPlanId === 'plan_pro'}
                    />
                    <PricingCard
                        plan="Premium"
                        price="29"
                        features={premiumFeatures}
                        planId="plan_premium"
                        onClick={handlePlanSelect}
                        isLoading={loadingPlanId === 'plan_premium'}
                    />
                </div>
            </AnimatedSection>
        </div>
    );
};

export default Pricing;