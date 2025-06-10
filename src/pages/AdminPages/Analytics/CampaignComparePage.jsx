import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCampaigns } from '../../../utils/localStorageHelper';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trophy, ArrowLeft, Scaling, Users, Target, MousePointerClick, CheckCircle } from 'lucide-react';

// --- SELF-CONTAINED COMPONENTS ---

const kpiConfig = [
    { key: 'totalViews', name: 'Total Views', icon: Scaling, format: 'number' },
    { key: 'uniqueVisitors', name: 'Unique Visitors', icon: Users, format: 'number' },
    { key: 'conversions', name: 'Conversions', icon: Target, format: 'number' },
    { key: 'ctr', name: 'Click-Through Rate', icon: MousePointerClick, format: 'percentage' }
];

const campaignColors = ['#2e8b57', '#0ea5e9', '#f97316', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-slate-200 text-sm">
                <p className="font-semibold text-slate-700 mb-2">{label}</p>
                {payload.map((p, i) => (
                    <div key={i} className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: p.fill }}></div>
                        <span className="text-slate-500 mr-2">{p.name}:</span>
                        <span className="text-slate-800 font-medium">{p.value.toLocaleString()}{label.includes('Rate') ? '%' : ''}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// --- MAIN PAGE COMPONENT ---
export default function CampaignComparePage() {
    const [allCampaigns] = useState(() => getCampaigns().filter(c => c.analyticsData));
    const [selectedCampaignIds, setSelectedCampaignIds] = useState([]);

    const handleSelectCampaign = (id) => {
        setSelectedCampaignIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(cid => cid !== id);
            }
            if (prev.length < 4) {
                return [...prev, id];
            }
            // Optional: Add a toast notification here if you want to inform the user about the 4-campaign limit.
            return prev;
        });
    };

    const selectedCampaigns = useMemo(() => {
        return selectedCampaignIds.map(id => allCampaigns.find(c => c.id === id));
    }, [allCampaigns, selectedCampaignIds]);

    const comparisonData = useMemo(() => {
        if (selectedCampaigns.length === 0) return [];
        return kpiConfig.map(kpi => {
            const dataPoint = { name: kpi.name };
            selectedCampaigns.forEach((campaign) => {
                const campaignName = campaign.campaignDetails.campaignName;
                const value = campaign.analyticsData.kpi[kpi.key]?.value || 0;
                dataPoint[campaignName] = value;
            });
            return dataPoint;
        });
    }, [selectedCampaigns]);

    const findBestPerformer = (kpiKey) => {
        if (selectedCampaigns.length < 2) return null;
        let bestCampaignId = null;
        let bestValue = -Infinity;
        selectedCampaigns.forEach(campaign => {
            const value = campaign.analyticsData.kpi[kpiKey]?.value || 0;
            if (value > bestValue) {
                bestValue = value;
                bestCampaignId = campaign.id;
            }
        });
        return bestCampaignId;
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-700 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
                <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-green-500/10 to-transparent rounded-full filter blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 -right-1/4 w-2/3 h-2/3 bg-gradient-to-tl from-sky-500/10 to-transparent rounded-full filter blur-3xl opacity-50"></div>
            </div>

            <main className="relative z-10 p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <Link to="/dashboard" className="text-sm text-green-600 hover:text-green-700 flex items-center mb-3 group">
                        <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Campaign Comparison</h1>
                    <p className="text-slate-500 mt-1">Select up to 4 campaigns to compare their performance side-by-side.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3">
                        <div className="bg-white/60 backdrop-blur-lg border border-slate-200/80 p-6 rounded-2xl shadow-lg h-full">
                            <h3 className="font-semibold text-slate-800 text-lg">Select Campaigns</h3>
                            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {allCampaigns.map((campaign, index) => (
                                    <button key={campaign.id} onClick={() => handleSelectCampaign(campaign.id)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group animate-fade-in-up`}
                                        style={{ animationDelay: `${index * 50}ms`,
                                                 ...(selectedCampaignIds.includes(campaign.id) 
                                                     ? { borderColor: campaignColors[selectedCampaignIds.indexOf(campaign.id)], backgroundColor: 'rgba(255,255,255,0.7)'} 
                                                     : { borderColor: '#e2e8f0', backgroundColor: 'rgba(255,255,255,0.4)' })
                                        }}>
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-sm text-slate-700">{campaign.campaignDetails.campaignName}</p>
                                            {selectedCampaignIds.includes(campaign.id) && <CheckCircle size={18} className="text-green-600" />}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">Created: {new Date(campaign.createdAt).toLocaleDateString()}</p>
                                    </button>
                                ))}
                                {allCampaigns.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No campaigns with analytics data found.</p>}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-9">
                        {selectedCampaigns.length < 2 ? (
                            <div className="flex items-center justify-center bg-white/60 backdrop-blur-lg border-2 border-dashed border-slate-300 rounded-2xl h-[calc(60vh+98px)]">
                                <div className="text-center p-4">
                                    <Trophy size={48} className="mx-auto text-slate-400 mb-4"/>
                                    <h3 className="font-semibold text-slate-700 text-lg">Ready to find a winner?</h3>
                                    <p className="text-slate-500 text-sm mt-1">Please select at least two campaigns from the list to compare them.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="bg-white/60 backdrop-blur-lg border border-slate-200/80 p-6 rounded-2xl shadow-lg animate-fade-in">
                                    <h3 className="font-semibold text-slate-800 mb-4 text-lg">Performance Chart</h3>
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                                <Legend wrapperStyle={{fontSize: "12px", paddingTop: "20px"}}/>
                                                {selectedCampaigns.map((campaign, index) => (
                                                    <Bar key={campaign.id} dataKey={campaign.campaignDetails.campaignName} fill={campaignColors[index]} barSize={25} radius={[5, 5, 0, 0]} />
                                                ))}
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                
                                <div className="bg-white/60 backdrop-blur-lg border border-slate-200/80 p-6 rounded-2xl shadow-lg animate-fade-in">
                                    <h3 className="font-semibold text-slate-800 mb-4 text-lg">Side-by-Side Comparison</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-slate-300">
                                                    <th className="text-left font-semibold text-slate-600 p-4">Metric</th>
                                                    {selectedCampaigns.map((campaign, index) => (
                                                        <th key={campaign.id} className="text-right font-semibold p-4" style={{color: campaignColors[index]}}>
                                                            {campaign.campaignDetails.campaignName}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {kpiConfig.map(kpi => {
                                                    const bestPerformerId = findBestPerformer(kpi.key);
                                                    return (
                                                        <tr key={kpi.key} className="border-b border-slate-200/80">
                                                            <td className="p-4 font-medium text-slate-600 flex items-center"><kpi.icon size={16} className="mr-2 text-slate-400"/> {kpi.name}</td>
                                                            {selectedCampaigns.map(campaign => (
                                                                <td key={campaign.id} className={`text-right p-4 font-mono text-base rounded-md ${bestPerformerId === campaign.id ? 'font-bold' : 'text-slate-800'}`}>
                                                                    <div className={`p-2 rounded-lg ${bestPerformerId === campaign.id ? 'bg-green-100' : ''}`}>
                                                                        {bestPerformerId === campaign.id && <Trophy size={14} className="inline-block -mt-1 mr-1.5 text-amber-500" />}
                                                                        {(campaign.analyticsData.kpi[kpi.key]?.value || 0).toLocaleString()}
                                                                        {kpi.format === 'percentage' ? '%' : ''}
                                                                    </div>
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <style jsx global>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; } 
                .custom-scrollbar::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; } 
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; } 
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}</style>
        </div>
    );
}