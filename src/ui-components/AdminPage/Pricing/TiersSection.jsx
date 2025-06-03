// PricingTiersSection.js
import React from 'react';
import * as LucideIcons from 'lucide-react';

const PlanFeature = ({ text, included = true }) => (
  <li className={`flex items-start space-x-2 py-1 ${included ? 'text-slate-600' : 'text-slate-400 line-through'}`}>
    {included ? 
      <LucideIcons.CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> :
      <LucideIcons.XCircle size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
    }
    <span className="text-xs sm:text-sm">{text}</span>
  </li>
);

const PricingTierCard = ({ plan, onChoosePlan, isPopular = false, ctaText = "Get Started" }) => (
  <div className={`relative flex flex-col bg-white rounded-xl border ${isPopular ? 'border-green-400 shadow-2xl shadow-green-500/15 ring-2 ring-green-500 ring-offset-2 ring-offset-transparent' : 'border-slate-200 shadow-lg'} p-6 transition-all duration-300 ease-in-out transform hover:shadow-2xl hover:-translate-y-1`}>
    {isPopular && (
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <span className="inline-block px-3.5 py-1 text-xs font-semibold tracking-wide text-white uppercase bg-gradient-to-r from-green-500 to-teal-600 rounded-full shadow-md">
          Popular
        </span>
      </div>
    )}
    <div className="text-center pt-2">
      <h3 className="text-xl font-semibold text-slate-800">{plan.name}</h3>
      <p className="mt-1 text-xs text-slate-500 h-10">{plan.description}</p>
    </div>
    <div className="my-5 text-center">
      <span className="text-4xl font-bold text-slate-800">${plan.price}</span>
      <span className="text-sm font-medium text-slate-500">/month</span>
    </div>
    <p className="text-xs text-slate-400 text-center mb-5">{plan.billingNote}</p>
    <ul className="space-y-1.5 flex-grow mb-6">
      {plan.features.map((feature, index) => (
        <PlanFeature key={index} text={feature.text} included={feature.included} />
      ))}
    </ul>
    <button
      onClick={() => onChoosePlan(plan.id)}
      className={`w-full py-2.5 px-5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
                  ${isPopular 
                    ? 'bg-[#2e8b57] text-white hover:bg-green-700 shadow-md shadow-green-500/20 transform hover:scale-[1.03]' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
    >
      {ctaText}
    </button>
  </div>
);

export default function PricingTiersSection({ plans, billingCycle, onChoosePlan }) {
  return (
    <section className="container mx-auto px-5 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 items-stretch">
        {plans[billingCycle].map((plan) => (
          <PricingTierCard key={plan.id} plan={plan} onChoosePlan={onChoosePlan} isPopular={plan.isPopular} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="text-xs sm:text-sm text-slate-500">Need an enterprise solution or have specific questions? <a href="mailto:sales@hyperpitch.io" className="font-medium text-[#2e8b57] hover:text-green-700 underline decoration-dotted underline-offset-2">Contact our sales team</a>.</p>
      </div>
    </section>
  );
}