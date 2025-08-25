import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trophy, ArrowLeft, Scaling, Users, Target, MousePointerClick, CheckCircle2, Loader2 } from 'lucide-react';
import getapiRequest from '../../../utils/getapiRequest';

const kpiConfig = [
    { key: 'totalViews', name: 'Total Views', icon: Scaling, format: 'number' },
    { key: 'uniqueVisitors', name: 'Unique Visitors', icon: Users, format: 'number' },
    { key: 'conversions', name: 'Conversions', icon: Target, format: 'number' },
    { key: 'ctr', name: 'Click-Through Rate', icon: MousePointerClick, format: 'percentage' }
];

const campaignColors = ['#10b981', '#3b82f6', '#f97316', '#8b5cf6'];
const campaignGradients = campaignColors.map((color, i) => `url(#gradient-${i})`);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-xl border border-slate-200 text-sm">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                {payload.map((p, i) => (
                    <div key={i} className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: campaignColors[i] }}></div>
                        <span className="text-slate-500">{p.name}:</span>
                        <span className="text-slate-900 font-semibold">{p.value.toLocaleString()}{label.includes('Rate') ? '%' : ''}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function CampaignComparePage() {
    const [allCampaigns, setAllCampaigns] = useState([]);
    const [selectedCampaignIds, setSelectedCampaignIds] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);
    const [loadingComparison, setLoadingComparison] = useState(false);
    const token = useSelector((state) => state.auth.userToken);

    useEffect(() => {
        const fetchCampaigns = async () => {
            if (!token) return;
            setLoadingCampaigns(true);
            try {
                const response = await getapiRequest('get', '/campaigns', {}, token);
                setAllCampaigns(response.data);
            } catch (error) {
                toast.error("Failed to fetch campaigns list.");
            } finally {
                setLoadingCampaigns(false);
            }
        };
        fetchCampaigns();
    }, [token]);
    
    useEffect(() => {
        const fetchComparisonData = async () => {
            if (selectedCampaignIds.length < 2 || !token) {
                setComparisonData([]);
                return;
            }
            setLoadingComparison(true);
            try {
                const idsQuery = selectedCampaignIds.join(',');
                const response = await getapiRequest('get', '/campaigns/compare', { ids: idsQuery }, token);
                setComparisonData(response.data);
            } catch (error) {
                toast.error("Failed to fetch comparison data.");
            } finally {
                setLoadingComparison(false);
            }
        };
        fetchComparisonData();
    }, [selectedCampaignIds, token]);

    const handleSelectCampaign = (id) => {
        setSelectedCampaignIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(cid => cid !== id);
            }
            return prev.length < 4 ? [...prev, id] : prev;
        });
    };

    const selectedCampaigns = useMemo(() => {
        return selectedCampaignIds.map(id => allCampaigns.find(c => String(c.id) === String(id))).filter(Boolean);
    }, [allCampaigns, selectedCampaignIds]);

    const chartData = useMemo(() => {
        if (!comparisonData || comparisonData.length === 0 || selectedCampaigns.length === 0) return [];
        return kpiConfig.map(kpi => {
            const dataPoint = { name: kpi.name };
            selectedCampaigns.forEach((campaign) => {
                const campaignData = comparisonData.find(c => String(c.id) === String(campaign.id));
                dataPoint[campaign.campaignName] = campaignData?.kpi?.[kpi.key]?.value || 0;
            });
            return dataPoint;
        });
    }, [selectedCampaigns, comparisonData]);

    const findBestPerformer = (kpiKey) => {
        if (selectedCampaigns.length < 2 || !comparisonData) return null;
        let bestCampaignId = null;
        let bestValue = -Infinity;
        selectedCampaigns.forEach(campaign => {
            const campaignData = comparisonData.find(c => String(c.id) === String(campaign.id));
            const value = campaignData?.kpi?.[kpi.key]?.value || 0;
            if (value > bestValue) {
                bestValue = value;
                bestCampaignId = campaign.id;
            }
        });
        return bestCampaignId;
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800">
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <header className="mb-8">
                    <Link to="/dashboard" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center mb-4 group font-semibold">
                        <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl text-center sm:text-left sm:text-4xl font-bold text-slate-900 tracking-tight">Campaign Comparison</h1>
                    <p className="text-slate-500 text-center sm:text-left mt-2 text-base sm:text-lg">Select up to 4 campaigns to compare their performance.</p>
                </header>

                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-200/80">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        <aside className="lg:col-span-4 xl:col-span-3 mb-8 lg:mb-0">
                            <div className="sticky top-6">
                                <h3 className="font-bold text-slate-800 text-xl">Select Campaigns</h3>
                                <p className="text-sm text-slate-500 mt-1 mb-4">You have selected {selectedCampaignIds.length} of 4 campaigns.</p>
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {loadingCampaigns ? (<div className="flex justify-center items-center py-10"><Loader2 className="animate-spin text-emerald-500 w-8 h-8"/></div>) : 
                                        allCampaigns.map((campaign) => {
                                        const isSelected = selectedCampaignIds.includes(campaign.id);
                                        const colorIndex = isSelected ? selectedCampaignIds.indexOf(campaign.id) : -1;
                                        return (
                                            <button
                                                key={campaign.id}
                                                onClick={() => handleSelectCampaign(campaign.id)}
                                                className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 group ${isSelected ? 'bg-emerald-50 shadow-sm' : 'bg-slate-50 hover:border-emerald-300'}`}
                                                style={{ borderColor: isSelected ? campaignColors[colorIndex] : '#e2e8f0' }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full mr-3 shrink-0" style={{ backgroundColor: campaignColors[colorIndex] }}></div>}
                                                        <p className="font-semibold text-sm text-slate-800 truncate">{campaign.campaignName}</p>
                                                    </div>
                                                    <CheckCircle2 size={20} className={`text-emerald-600 shrink-0 ml-2 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                                                </div>
                                                <p className={`text-xs text-slate-500 mt-1 transition-all ${isSelected ? 'pl-[22px]' : ''}`}>
                                                    Created: {new Date(campaign.createdAt).toLocaleDateString()}
                                                </p>
                                            </button>
                                        );
                                    })}
                                    {!loadingCampaigns && allCampaigns.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No campaigns with analytics data found.</p>}
                                </div>
                            </div>
                        </aside>

                        <main className="lg:col-span-8 xl:col-span-9">
                            {loadingComparison ? (<div className="flex justify-center items-center h-full min-h-[500px]"><Loader2 className="animate-spin text-emerald-500 w-12 h-12"/></div>) :
                                selectedCampaigns.length < 2 ? (
                                <div className="flex items-center justify-center bg-slate-100/50 border-2 border-dashed border-slate-300 rounded-2xl h-full min-h-[60vh] lg:min-h-[500px]">
                                    <div className="text-center p-4">
                                        <Trophy className="mx-auto text-slate-400 mb-4 w-10 h-10 sm:w-12 sm:h-12" />
                                        <h3 className="font-semibold text-slate-800 text-md sm:text-lg">Ready to find a winner?</h3>
                                        <p className="text-slate-500 text-sm mt-1 max-w-xs">Please select at least two campaigns to see the comparison.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 sm:space-y-8">
                                    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800 mb-4 text-xl">Performance Chart</h3>
                                        <div className="h-[300px] sm:h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                                    <defs>
                                                        {campaignColors.map((color, i) => (
                                                            <linearGradient key={i} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                                                <stop offset="95%" stopColor={color} stopOpacity={0.4} />
                                                            </linearGradient>
                                                        ))}
                                                    </defs>
                                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                                                    {selectedCampaigns.map((campaign, index) => (
                                                        <Bar key={campaign.id} dataKey={campaign.campaignName} fill={campaignGradients[index]} barSize={25} radius={[6, 6, 0, 0]} />
                                                    ))}
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800 mb-4 text-xl">Side-by-Side Comparison</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="border-b-2 border-slate-200">
                                                    <tr>
                                                        <th className="text-left font-semibold text-slate-600 px-2 py-3 sm:p-4 whitespace-nowrap">Metric</th>
                                                        {selectedCampaigns.map((campaign, index) => (
                                                            <th key={campaign.id} className="text-center font-semibold px-2 py-3 sm:p-4" style={{ color: campaignColors[index] }}>
                                                                <span className="truncate block">{campaign.campaignName}</span>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {kpiConfig.map((kpi) => {
                                                        const bestPerformerId = findBestPerformer(kpi.key);
                                                        return (
                                                            <tr key={kpi.key} className="border-b border-slate-100 last:border-b-0">
                                                                <td className="px-2 py-3 sm:p-4 font-semibold text-slate-700 flex items-center whitespace-nowrap"><kpi.icon size={16} className="mr-3 text-slate-400 shrink-0" /> {kpi.name}</td>
                                                                {selectedCampaigns.map(campaign => {
                                                                    const campaignData = comparisonData.find(c => String(c.id) === String(campaign.id));
                                                                    const value = campaignData?.kpi?.[kpi.key]?.value || 0;
                                                                    return (
                                                                    <td key={campaign.id} className="text-center px-2 py-3 sm:p-4 font-mono text-sm sm:text-base">
                                                                        <div className={`p-2 rounded-lg transition-colors ${bestPerformerId === campaign.id ? 'bg-emerald-100' : 'bg-transparent'}`}>
                                                                            <span className={`inline-flex items-center ${bestPerformerId === campaign.id ? 'font-bold text-emerald-800' : 'text-slate-800'}`}>
                                                                                {bestPerformerId === campaign.id && <Trophy size={14} className="inline-block -mt-px mr-1.5 text-amber-500" />}
                                                                                {value.toLocaleString()}
                                                                                {kpi.format === 'percentage' ? '%' : ''}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                )})}
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </main>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; } 
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } 
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
}