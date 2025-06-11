import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

const PricingHeader = ({ billingCycle, setBillingCycle }) => {
  return (
    <header className="relative pt-20 pb-12 bg-slate-100 text-slate-900 overflow-hidden border-b border-slate-200/80">
      <div className="relative container mx-auto px-5 text-center z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
          Find the <span className="text-emerald-600">Perfect Plan</span> For You
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Simple, transparent pricing for teams of all sizes. Start for free, and scale up as you grow. No hidden fees.
        </p>
        <div className="mt-8 flex justify-center">
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
        </div>
      </div>
    </header>
  );
};

const PlanFeature = ({ text, included = true }) => (
  <li className={`flex items-start space-x-3 py-1.5 ${included ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
    {included ? 
      <LucideIcons.CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" /> :
      <LucideIcons.XCircle size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
    }
    <span className="text-sm">{text}</span>
  </li>
);

const PricingTierCard = ({ plan, onChoosePlan, isPopular = false }) => (
  <div className={`relative flex flex-col bg-white rounded-2xl border ${isPopular ? 'border-emerald-500 shadow-2xl shadow-emerald-900/10' : 'border-slate-200/80 shadow-lg'} p-8 transition-all duration-300 ease-in-out transform hover:shadow-2xl hover:-translate-y-2 ${isPopular ? 'lg:scale-105' : ''}`}>
    {isPopular && (
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <span className="inline-block px-4 py-1 text-xs font-bold tracking-wider text-white uppercase bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg">
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
      <span className="text-base font-medium text-slate-500">/month</span>
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
  return (
    <section className="container mx-auto px-5 lg:px-8">
      <div className="p-8 sm:p-12">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Choose Your Plan</h2>
            <p className="mt-3 text-base text-slate-500 max-w-lg mx-auto">Select the perfect plan to fit your needs, with the flexibility to upgrade anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-12 items-stretch">
          {plans[billingCycle].map((plan) => (
            <PricingTierCard key={plan.id} plan={plan} onChoosePlan={onChoosePlan} isPopular={plan.isPopular} />
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
                                    const tickType = planFeature?.included === true ? 'included' : (planFeature?.included === false ? 'excluded' : 'limited');
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

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-200 py-5">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <span className="text-base font-semibold text-slate-800">{question}</span>
                <LucideIcons.ChevronDown size={20} className={`text-slate-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                <p className="text-slate-600 text-sm leading-relaxed pr-8">{answer}</p>
            </div>
        </div>
    );
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); 

  const plansData = {
    monthly: [
      { id: 'starter_monthly', name: 'Starter', price: 29, description: 'For individuals and small teams getting started.', billingNote: 'Billed monthly.', features: [{ text: '5 Active Pitches', included: true }, { text: 'Unlimited Viewers', included: true }, { text: 'Basic Analytics', included: true }, { text: 'Email Support', included: true }, { text: 'Custom Branding', included: false }, { text: 'AI Content Assistant', included: false } ]},
      { id: 'pro_monthly', name: 'Pro', price: 79, description: 'For growing businesses that need more power and scale.', billingNote: 'Billed monthly.', isPopular: true, features: [ { text: '25 Active Pitches', included: true }, { text: 'Unlimited Viewers', included: true }, { text: 'Advanced Analytics', included: true }, { text: 'Priority Support', included: true }, { text: 'Custom Branding', included: true }, { text: 'AI Content Assistant', included: true } ]},
      { id: 'enterprise_monthly', name: 'Enterprise', price: 149, description: 'For large organizations with specific needs.', billingNote: 'Contact us for a quote.', features: [{ text: 'Unlimited Pitches', included: true }, { text: 'Unlimited Viewers', included: true }, { text: 'Customizable Analytics', included: true }, { text: 'Dedicated Account Manager', included: true }, { text: 'Full White-labeling', included: true }, { text: 'Premium AI & API Access', included: true }] },
    ],
    annually: [
      { id: 'starter_annually', name: 'Starter', price: 24, description: 'For individuals and small teams getting started.', billingNote: 'Billed annually. Save 20%!', features: [{ text: '5 Active Pitches', included: true }, { text: 'Unlimited Viewers', included: true }, { text: 'Basic Analytics', included: true }, { text: 'Email Support', included: true }, { text: 'Custom Branding', included: false }, { text: 'AI Content Assistant', included: false }] },
      { id: 'pro_annually', name: 'Pro', price: 65, description: 'For growing businesses that need more power and scale.', billingNote: 'Billed annually. Save 20%!', isPopular: true, features: [{ text: '25 Active Pitches', included: true }, { text: 'Unlimited Viewers', included: true }, { text: 'Advanced Analytics', included: true }, { text: 'Priority Support', included: true }, { text: 'Custom Branding', included: true }, { text: 'AI Content Assistant', included: true }] },
      { id: 'enterprise_annually', name: 'Enterprise', price: 120, description: 'For large organizations with specific needs.', billingNote: 'Contact us for a quote.', features: [{ text: 'Unlimited Pitches', included: true }, { text: 'Unlimited Viewers', included: true }, { text: 'Customizable Analytics', included: true }, { text: 'Dedicated Account Manager', included: true }, { text: 'Full White-labeling', included: true }, { text: 'Premium AI & API Access', included: true }] },
    ]
  };

  const handleChoosePlan = (planId) => {
    console.log(`User chose plan: ${planId}. Redirecting to checkout...`);
    alert(`Redirecting to checkout for plan: ${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-sky-50 text-slate-800 overflow-x-hidden">
      <PricingHeader billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
      <main className="pt-10 pb-6">
          <div className="space-y-20">
            <PricingTiersSection plans={plansData} billingCycle={billingCycle} onChoosePlan={handleChoosePlan} />
            <FeatureComparisonSection plans={plansData} />
          </div>
      </main>
    </div>
  );
}