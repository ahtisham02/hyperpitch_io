// PricingHeader.js
import React from 'react';
import * as LucideIcons from 'lucide-react'; // Not strictly needed here but good for consistency if you add icons

export default function PricingHeader({ billingCycle, setBillingCycle }) {
  return (
    <header className="relative pt-16 pb-10 bg-slate-100 text-slate-900 overflow-hidden border-b border-slate-200/80">
      <div className="relative container mx-auto px-5 sm:px-6 lg:px-8 text-center z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
          {/* Find the <span className="text-[#2e8b57]">Perfect Pitch</span> Plan */}
        </h1>
        <p className="mt-3 md:mt-4 text-md md:text-lg text-slate-600 max-w-2xl mx-auto">
          Simple, transparent pricing for teams of all sizes. Elevate your presentations with Hyperpitch.io and close more deals, faster.
        </p>
        {/* <div className="mt-6 md:mt-8 flex justify-center">
           <div className="inline-flex bg-white border border-slate-300/80 p-1 rounded-xl shadow-sm">
              <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ease-in-out
                              ${billingCycle === 'monthly' ? 'bg-[#2e8b57] text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                  Monthly
              </button>
              <button
                  onClick={() => setBillingCycle('annually')}
                  className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ease-in-out relative
                              ${billingCycle === 'annually' ? 'bg-[#2e8b57] text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                  Annually
                  <span className="absolute -top-2.5 -right-2.5 bg-yellow-400 text-yellow-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-full transform scale-90 shadow-sm">
                      SAVE
                  </span>
              </button>
          </div>
        </div> */}
      </div>
    </header>
  );
}