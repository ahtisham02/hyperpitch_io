import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import PricingHeader from './Header';
import PricingTiersSection from './TiersSection';
import FeatureComparisonSection from './ComparisonSection';

const STYLE_TAG_ID = "dashboard-billing-styles-v3";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "YOUR_STRIPE_PUBLISHABLE_KEY_HERE";

if (!STRIPE_PUBLISHABLE_KEY || !STRIPE_PUBLISHABLE_KEY.startsWith("pk_")) {
    console.warn(
        "Stripe Publishable Key is missing or invalid. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file (e.g., .env.local). Payment functionality will not work."
    );
}
const stripePromise = STRIPE_PUBLISHABLE_KEY.startsWith("pk_") ? loadStripe(STRIPE_PUBLISHABLE_KEY) : Promise.resolve(null);

const stripePaymentLinks = {
    starter: "https://buy.stripe.com/test_28E3cv32C1mi9HFd2A7wA02",
    pro: "https://buy.stripe.com/test_28E3cv32C1mi9HFd2A7wA02",
    enterprise: "https://buy.stripe.com/test_28E6oH6eO9SO4nl3s07wA01",
};

const plansData = {
  monthly: [
    {
      id: 'starter_monthly', name: 'Starter Spark', price: 9, description: 'Perfect for individuals & small teams launching their first pitches.', billingNote: 'Billed monthly, cancel anytime.',
      features: [
        { text: '5 Active Pitches', included: true }, { text: 'Unlimited Pitch Viewers', included: true }, { text: 'Basic Analytics Dashboard', included: true },
        { text: 'Standard Email Support', included: true }, { text: '1GB Document Storage', included: true }, { text: 'Limited Custom Branding', included: 'Limited' },
        { text: 'Basic AI Content Suggestions', included: false }, { text: '2 Team Members', included: false },
      ],
    },
    {
      id: 'pro_monthly', name: 'Pro Accelerator', price: 79, description: 'For growing businesses focused on scaling their outreach and impact.', billingNote: 'Billed monthly, cancel anytime.', isPopular: true,
      features: [
        { text: '25 Active Pitches', included: true }, { text: 'Unlimited Pitch Viewers', included: true }, { text: 'Advanced Analytics & Reporting', included: true },
        { text: 'Priority Email & Chat Support', included: true }, { text: '10GB Document Storage', included: true }, { text: 'Full Custom Branding Options', included: true },
        { text: 'Advanced AI Content Assistant', included: true }, { text: 'Up to 10 Team Members', included: true }, { text: 'CRM & Slack Integrations', included: true },
      ],
    },
    {
      id: 'enterprise_monthly', name: 'Enterprise Scale', price: 299, description: 'Tailored solutions for large organizations with specific requirements.', billingNote: 'Billed monthly, custom terms.',
      features: [
        { text: 'Unlimited Active Pitches', included: true }, { text: 'Unlimited Pitch Viewers', included: true }, { text: 'Customizable Analytics', included: true },
        { text: 'Dedicated Account Manager & SLA', included: true }, { text: '50GB+ Scalable Storage', included: true }, { text: 'White-labeling & Custom Domain', included: true },
        { text: 'Premium AI Content Suite', included: true }, { text: 'Unlimited Team Members & Roles', included: true }, { text: 'Advanced Security (SSO, Audit Logs)', included: true }, { text: 'Full API Access', included: true },
      ],
    },
  ],
  annually: [
      {
      id: 'starter_annually', name: 'Starter Spark', price: 24, description: 'Perfect for individuals & small teams launching their first pitches.', billingNote: 'Billed annually. Save 17%!',
      features: [
        { text: '5 Active Pitches', included: true }, { text: 'Unlimited Pitch Viewers', included: true }, { text: 'Basic Analytics Dashboard', included: true },
        { text: 'Standard Email Support', included: true }, { text: '1GB Document Storage', included: true }, { text: 'Limited Custom Branding', included: 'Limited' },
        { text: 'Basic AI Content Suggestions', included: false }, { text: '2 Team Members', included: false },
      ],
    },
    {
      id: 'pro_annually', name: 'Pro Accelerator', price: 65, description: 'For growing businesses focused on scaling their outreach and impact.', billingNote: 'Billed annually. Save 18%!', isPopular: true,
      features: [
        { text: '25 Active Pitches', included: true }, { text: 'Unlimited Pitch Viewers', included: true }, { text: 'Advanced Analytics & Reporting', included: true },
        { text: 'Priority Email & Chat Support', included: true }, { text: '10GB Document Storage', included: true }, { text: 'Full Custom Branding Options', included: true },
        { text: 'Advanced AI Content Assistant', included: true }, { text: 'Up to 10 Team Members', included: true }, { text: 'CRM & Slack Integrations', included: true },
      ],
    },
    {
      id: 'enterprise_annually', name: 'Enterprise Scale', price: 165, description: 'Tailored solutions for large organizations with specific requirements.', billingNote: 'Billed annually. Save 17%!',
      features: [
        { text: 'Unlimited Active Pitches', included: true }, { text: 'Unlimited Pitch Viewers', included: true }, { text: 'Customizable Analytics', included: true },
        { text: 'Dedicated Account Manager & SLA', included: true }, { text: '50GB+ Scalable Storage', included: true }, { text: 'White-labeling & Custom Domain', included: true },
        { text: 'Premium AI Content Suite', included: true }, { text: 'Unlimited Team Members & Roles', included: true }, { text: 'Advanced Security (SSO, Audit Logs)', included: true }, { text: 'Full API Access', included: true },
      ],
    },
  ]
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); 

  const handleChoosePlan = async (planId) => {
    if (!STRIPE_PUBLISHABLE_KEY || !STRIPE_PUBLISHABLE_KEY.startsWith("pk_")) {
        alert("Stripe is not configured. Payments are disabled. Please contact support.");
        console.error("Stripe redirection aborted: Stripe Publishable Key is missing or invalid.");
        return;
    }

    console.log(`Chosen plan: ${planId}`);
    
    let stripeLink = null;
    const planTier = planId.split('_')[0]; 

    if (planTier === 'starter') {
        stripeLink = stripePaymentLinks.starter;
    } else if (planTier === 'pro') {
        stripeLink = stripePaymentLinks.pro;
    } else if (planTier === 'enterprise') {
        stripeLink = stripePaymentLinks.enterprise;
    }

    if (stripeLink) {
        console.log(`Redirecting to Stripe Payment Link: ${stripeLink}`);
        window.location.href = stripeLink;
    } else {
        console.error(`No Stripe link found for plan ID: ${planId}. Plan tier: ${planTier}`);
        alert(`Configuration error: No payment link for your selected plan. Please contact support.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-teal-50/50 to-cyan-50/50 text-slate-800 overflow-x-hidden">
      <PricingHeader billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
      <main className="pt-12 md:pt-20">
        <PricingTiersSection 
            plans={plansData} 
            billingCycle={billingCycle} 
            onChoosePlan={handleChoosePlan} 
        />
        <FeatureComparisonSection plans={plansData} />
      </main>
    </div>
  );
}