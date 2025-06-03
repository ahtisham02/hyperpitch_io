// FeatureComparisonSection.js
import React from 'react';
import * as LucideIcons from 'lucide-react';

const ComparisonTick = ({ type = 'included' }) => {
    let bgColor = 'bg-slate-200';
    let iconColor = 'text-slate-500';
    let IconComponent = LucideIcons.X;

    if (type === 'included') {
        bgColor = 'bg-green-500';
        iconColor = 'text-white';
        IconComponent = LucideIcons.Check;
    } else if (type === 'limited') {
        bgColor = 'bg-yellow-400';
        iconColor = 'text-yellow-800';
        IconComponent = LucideIcons.Minus;
    }

    return (
        <div className={`w-5 h-5 rounded-full ${bgColor} flex items-center justify-center shadow-sm transition-transform duration-150 ease-in-out group-hover:scale-110`}>
            <IconComponent size={12} className={iconColor} strokeWidth={3}/>
        </div>
    );
};


export default function FeatureComparisonSection({ plans }) {
  const allFeaturesSet = new Set();
  Object.values(plans).forEach(cyclePlans => {
    cyclePlans.forEach(plan => {
      plan.features.forEach(feature => allFeaturesSet.add(feature.text));
    });
  });
  const uniqueFeatures = Array.from(allFeaturesSet);

  return (
    <section className="mt-16 md:mt-24 py-12 md:py-16 bg-white/60 backdrop-blur-sm border-y border-slate-200/50">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">Compare All Features</h2>
                <p className="mt-2 text-sm md:text-base text-slate-500 max-w-lg mx-auto">A detailed breakdown of what's included in each Hyperpitch.io plan.</p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200/70 shadow-md bg-white">
                <table className="min-w-full divide-y divide-slate-200/60">
                    <thead className="bg-slate-50/70">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider sm:pl-6">Feature</th>
                            {plans.monthly.map(plan => (
                                <th key={plan.id} scope="col" className="px-3 py-3.5 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">{plan.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50 bg-white">
                        {uniqueFeatures.map((featureText, index) => ( 
                            <tr 
                                key={index} 
                                className={`group transition-colors duration-150 ease-in-out ${index % 2 === 0 ? 'hover:bg-slate-50/70' : 'bg-slate-50/40 hover:bg-slate-100/70'}`}
                            >
                                <td className="whitespace-nowrap py-3.5 pl-4 pr-3 text-xs sm:text-sm font-medium text-slate-700 sm:pl-6 group-hover:text-slate-800">{featureText}</td>
                                {plans.monthly.map(plan => {
                                    const planFeature = plan.features.find(f => f.text === featureText);
                                    let tickType = 'excluded';
                                    if (planFeature?.included === true) tickType = 'included';
                                    else if (typeof planFeature?.included === 'string' && planFeature.included.toLowerCase().includes('limited')) tickType = 'limited';
                                    else if (typeof planFeature?.included === 'string') tickType = 'text';

                                    return (
                                        <td key={`${plan.id}-${featureText}`} className="whitespace-nowrap px-3 py-3.5 text-center text-sm text-slate-500">
                                            {tickType === 'text' && <span className="text-xs italic">{planFeature?.included}</span>}
                                            {tickType !== 'text' && <div className="flex justify-center"><ComparisonTick type={tickType} /></div>}
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
}