import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as LucideIcons from 'lucide-react';
import getapiRequest from '../../../utils/getapiRequest';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <LucideIcons.LoaderCircle className="w-12 h-12 animate-spin text-emerald-600" />
        <p className="mt-4 text-lg font-medium">Loading Plans...</p>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center text-red-600 bg-red-50 rounded-lg border border-red-200 mx-auto max-w-2xl">
        <LucideIcons.AlertTriangle className="w-12 h-12" />
        <h3 className="mt-4 text-xl font-semibold text-red-800">Oops! Something went wrong.</h3>
        <p className="mt-2 text-base">{message}</p>
    </div>
);

const PricingHeader = ({ billingCycle, setBillingCycle }) => {
  return (
    <header className="relative pt-20 pb-12 text-slate-900 overflow-hidden">
      <div className="relative container mx-auto px-5 text-center z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
          Find the <span className="text-emerald-600">Perfect Plan</span> For You
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Simple, transparent pricing for teams of all sizes. Start for free, and scale up as you grow. No hidden fees.
        </p>
        {/* <div className="mt-8 flex justify-center">
           <div className="inline-flex bg-slate-200 border border-slate-200/80 p-1 rounded-full shadow-sm">
              <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ease-in-out
                              ${billingCycle === 'monthly' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-800'}`}
              >
                  Monthly
              </button>
              <button
                  onClick={() => setBillingCycle('annually')}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ease-in-out relative
                              ${billingCycle === 'annually' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-800'}`}
              >
                  Annually
                  <span className="absolute -top-2.5 -right-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                      SAVE 20%
                  </span>
              </button>
          </div>
        </div> */}
      </div>
    </header>
  );
};

const PlanFeature = ({ text, included = true }) => (
  <li className={`flex items-start space-x-3 py-1.5 ${included ? 'text-slate-700' : 'text-slate-400'}`}>
    {included ?
      <LucideIcons.CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" /> :
      <LucideIcons.XCircle size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
    }
    <span className="text-sm">{text}</span>
  </li>
);

const PricingTierCard = ({ plan, billingCycle, onChoosePlan, isPopular = false }) => (
  <div className={`relative flex flex-col bg-white rounded-2xl border ${isPopular ? 'border-emerald-500 shadow-2xl shadow-emerald-900/10' : 'border-slate-200/80 shadow-lg'} p-8 transition-all duration-300 ease-in-out transform hover:shadow-2xl hover:-translate-y-2 ${isPopular ? 'lg:scale-105' : ''}`}>
    {isPopular && (
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <span className="inline-block text-nowrap px-4 py-1 text-xs font-bold tracking-wider text-white uppercase bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg">
          Most Popular
        </span>
      </div>
    )}
    <div className="text-center pt-4">
      <h3 className="text-2xl font-semibold text-slate-800">{plan.name}</h3>
      <p className="mt-2 text-sm text-slate-500 h-12">{plan.description}</p>
    </div>
    <div className="my-6 text-center">
      <span className="text-5xl font-bold text-slate-900">${plan.price}</span>
      <span className="text-base font-medium text-slate-500">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
    </div>
    <p className="text-xs text-slate-400 text-center mb-6">{plan.billingNote}</p>
    <ul className="space-y-2 flex-grow mb-8">
      {plan.features.map((feature, index) => (
        <PlanFeature key={index} text={feature.text} included={feature.included} />
      ))}
    </ul>
    <button
      onClick={() => onChoosePlan(plan.id)}
      className={`w-full py-3 px-5 text-base font-semibold rounded-lg transition-all duration-300 ease-in-out transform
                  ${isPopular
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 hover:scale-105'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
                  }`}
    >
      Choose Plan
    </button>
  </div>
);

const PricingTiersSection = ({ plans, billingCycle, onChoosePlan }) => {
    if (!plans || !plans[billingCycle]) {
        return null;
    }
    return (
        <section className="container mx-auto px-5 lg:px-8">
            <div className="p-8 sm:p-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Choose Your Plan</h2>
                    <p className="mt-3 text-base text-slate-500 max-w-lg mx-auto">Select the perfect plan to fit your needs, with the flexibility to upgrade anytime.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 xl:gap-8 items-stretch">
                {plans[billingCycle].map((plan) => (
                    <PricingTierCard key={plan.id} plan={plan} billingCycle={billingCycle} onChoosePlan={onChoosePlan} isPopular={plan.isPopular} />
                ))}
                </div>
                <div className="mt-16 text-center">
                    <p className="text-sm text-slate-500">Need a custom enterprise solution? <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-700 underline decoration-dotted underline-offset-2">Contact Sales</a>.</p>
                </div>
            </div>
        </section>
    );
};

const ComparisonTick = ({ type = 'included' }) => {
    let bgColor = 'bg-slate-200';
    let iconColor = 'text-slate-500';
    let IconComponent = LucideIcons.X;

    if (type === 'included') {
        bgColor = 'bg-emerald-100';
        iconColor = 'text-emerald-600';
        IconComponent = LucideIcons.Check;
    } else if (type === 'limited') {
        bgColor = 'bg-amber-100';
        iconColor = 'text-amber-600';
        IconComponent = LucideIcons.Minus;
    }

    return (
        <div className={`w-6 h-6 rounded-full ${bgColor} flex items-center justify-center shadow-sm transition-transform duration-150 ease-in-out group-hover:scale-110`}>
            <IconComponent size={14} className={iconColor} strokeWidth={3}/>
        </div>
    );
};

const FeatureComparisonSection = ({ plans }) => {
    if (!plans || !plans.monthly || plans.monthly.length === 0) {
        return null;
    }

    const allFeaturesSet = new Set(plans.monthly.flatMap(p => p.features.map(f => f.text)));
    const uniqueFeatures = Array.from(allFeaturesSet);

    return (
        <section className="container mx-auto px-5 lg:px-8">
            <div className="px-8 sm:px-12 sm:pb-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Compare All Features</h2>
                    <p className="mt-3 text-base text-slate-500 max-w-lg mx-auto">A detailed breakdown of what's included in each plan.</p>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-200/70 shadow-lg bg-white">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="py-4 pl-8 pr-3 text-left text-sm font-semibold text-slate-800 uppercase tracking-wider">Feature</th>
                                {plans.monthly.map(plan => (
                                    <th key={plan.id} scope="col" className="w-40 px-3 py-4 text-center text-sm font-semibold text-slate-800 uppercase tracking-wider">{plan.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {uniqueFeatures.map((featureText, index) => (
                                <tr key={index} className="group transition-colors duration-150 ease-in-out hover:bg-slate-50/70">
                                    <td className="whitespace-nowrap py-4 pl-8 pr-3 text-sm font-medium text-slate-700 group-hover:text-slate-900">{featureText}</td>
                                    {plans.monthly.map(plan => {
                                        const planFeature = plan.features.find(f => f.text === featureText);
                                        const tickType = planFeature?.included === true ? 'included' : 'excluded';
                                        return (
                                            <td key={`${plan.id}-${featureText}`} className="px-3 py-4 text-center">
                                                <div className="flex justify-center"><ComparisonTick type={tickType} /></div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};


export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [plans, setPlans] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const planDetails = {
    "Free": { description: "Perfect for individuals and small projects getting started.", isPopular: false },
    "Basic": { description: "Ideal for small teams and growing businesses.", isPopular: false },
    "Pro": { description: "For established businesses that need advanced features.", isPopular: true },
    "Enterprise": { description: "Custom solutions for large-scale organizations.", isPopular: false },
  };

  const allFeatures = [
    { text: "Email Support", includedIn: ["Free", "Basic", "Pro", "Enterprise"] },
    { text: "Campaign Analytics", includedIn: ["Basic", "Pro", "Enterprise"] },
    { text: "A/B Testing", includedIn: ["Basic", "Pro", "Enterprise"] },
    { text: "Marketing Automation", includedIn: ["Pro", "Enterprise"] },
    { text: "Priority Support", includedIn: ["Pro", "Enterprise"] },
    { text: "Dedicated Account Manager", includedIn: ["Enterprise"] },
  ];

  const transformApiData = (apiPlans) => {
    const monthly = apiPlans.map(plan => ({
      ...plan,
      description: planDetails[plan.name]?.description || "",
      isPopular: planDetails[plan.name]?.isPopular || false,
      billingNote: "Billed monthly. Cancel anytime.",
      features: [
        { text: `${plan.maxContacts.toLocaleString()} Contacts`, included: true },
        { text: `${plan.maxCampaigns} Campaigns/month`, included: true },
        ...allFeatures.map(f => ({ text: f.text, included: f.includedIn.includes(plan.name) }))
      ]
    }));

    const annually = monthly.map(plan => ({
      ...plan,
      price: plan.price > 0 ? Math.round((plan.price * 12 * 0.8)) : 0,
      billingNote: "Billed annually. Save 20%!",
    }));

    return { monthly, annually };
  };

  useEffect(() => {
    const fetchPricingData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getapiRequest("get", "/api/public/pricing");
        const transformedPlans = transformApiData(response.data);
        setPlans(transformedPlans);
      } catch (err) {
        const errorMessage = err?.response?.data?.message || "Could not load pricing plans. Please try refreshing the page.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  const handleChoosePlan = (planId) => {
    console.log(`User chose plan: ${planId} with ${billingCycle} billing. Redirecting to checkout...`);
    alert(`Redirecting to checkout for plan: ${planId}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <ErrorDisplay message={error} />;
    }
    return (
      <div className="space-y-20">
        <PricingTiersSection plans={plans} billingCycle={billingCycle} onChoosePlan={handleChoosePlan} />
        <FeatureComparisonSection plans={plans} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50 text-slate-800 overflow-x-hidden">
      <PricingHeader billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
      <main className="pt-10 pb-6">
        {renderContent()}
      </main>
    </div>
  );
}