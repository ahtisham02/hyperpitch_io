import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import * as LucideIcons from 'lucide-react';

const { Users, Target, Eye, ArrowUpRight, ArrowDownRight, ChevronLeft, Filter, TrendingUp, Calendar, FileCog, ServerCrash, Smartphone, Monitor, Tablet, Share2, ChevronDown, MousePointerClick, ChevronFirst, ChevronLast, ArrowDown } = LucideIcons;

// Mock Data for demonstration
const getCampaignById = (id) => {
    return {
        id,
        campaignDetails: { campaignName: 'Summer Sale 2023', startTime: '2023-07-01T00:00:00Z', endTime: '2023-07-31T00:00:00Z' },
        analyticsData: {
            kpi: {
                totalViews: { value: 25830, change: 12.5 },
                uniqueVisitors: { value: 19210, change: 8.2 },
                conversions: { value: 1245, change: 15.1 },
            },
            performanceChart: Array.from({ length: 30 }, (_, i) => ({ date: `Day ${i + 1}`, views: 1000 + Math.random() * 1500, clicks: 100 + Math.random() * 150 })),
            conversionFunnel: [
                { stage: 'Emails Sent', value: 50000, iconName: 'Mail' },
                { stage: 'Pitch Viewed', value: 25830, iconName: 'Eye' },
                { stage: 'Clicked CTA', value: 8750, iconName: 'MousePointerClick' },
                { stage: 'Converted', value: 1245, iconName: 'Target' },
            ],
            topReferrers: [{ source: 'Organic Search', value: 45, color: '#10b981' }, { source: 'Social Media', value: 30, color: '#3b82f6' }, { source: 'Paid Ads', value: 15, color: '#f97316' }, { source: 'Direct', value: 10, color: '#64748b' }],
            deviceData: [{ name: 'Desktop', value: 65, Icon: Monitor, color: '#10b981' }, { name: 'Mobile', value: 28, Icon: Smartphone, color: '#3b82f6' }, { name: 'Tablet', value: 7, Icon: Tablet, color: '#f97316' }],
            detailedAudience: Array.from({ length: 50 }, (_, i) => ({ id: i, name: `User ${i + 1}`, status: ['Converted', 'Clicked', 'Viewed', 'Sent'][i % 4], lastActivity: `${i % 24} hours ago` })),
        },
    };
};

const CampaignAnalyticsLoader = () => (
    <div className="fixed inset-0 bg-slate-100/80 backdrop-blur-md flex flex-col items-center justify-center z-[300] p-4 text-slate-800">
        <FileCog size={64} className="text-emerald-600 animate-spin-slow" /><h2 className="text-2xl font-semibold my-2">Generating Report</h2><p className="text-slate-500 mb-1 text-center max-w-sm">Crafting your analytics dashboard...</p><div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden mt-6"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 animate-progress-indeterminate"></div></div>
    </div>
);

const StatCard = ({ title, value, change, icon: Icon, format = 'number' }) => {
    const isPositive = change >= 0;
    const formattedValue = format === 'percentage' ? `${value.toFixed(1)}%` : value.toLocaleString();
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500">
                <p className="text-sm font-medium">{title}</p>
                <div className="p-2 bg-slate-100 rounded-lg"><Icon size={20} className="text-slate-600" /></div>
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-800">{formattedValue}</p>
            <div className={`mt-1 flex items-center text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                <span className="ml-1">{Math.abs(change)}% vs last period</span>
            </div>
        </div>
    );
};

const CustomComposedChartTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-slate-200 text-sm">
                <p className="label font-bold text-slate-800 mb-2">{label}</p>
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2"></div><span className="text-slate-500 mr-2">Views:</span><span className="text-slate-800 font-semibold">{payload[0].value.toLocaleString()}</span></div>
                <div className="flex items-center mt-1"><div className="w-2.5 h-2.5 rounded-full bg-sky-500 mr-2"></div><span className="text-slate-500 mr-2">Conversions:</span><span className="text-slate-800 font-semibold">{payload[1].value.toLocaleString()}</span></div>
            </div>
        );
    }
    return null;
};

const TimeframeFilter = ({ timeframe, setTimeframe }) => {
    const [isOpen, setIsOpen] = useState(false); const dropdownRef = useRef(null);
    const options = {'7d':'Last 7 Days', '14d':'Last 14 Days', '30d':'Last 30 Days'};
    useEffect(() => { const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 bg-white p-2.5 px-4 rounded-lg border border-slate-300 shadow-sm hover:border-slate-400 transition-colors">
                <Filter className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">{options[timeframe]}</span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-2xl z-20 py-1 animate-fade-in-fast">
                    {Object.entries(options).map(([k, v]) => (
                        <button key={k} onClick={() => { setTimeframe(k); setIsOpen(false); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${timeframe === k ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}>{v}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

const StatusChip = ({ status }) => {
    const styles = { Converted: 'bg-emerald-100 text-emerald-800', Clicked: 'bg-sky-100 text-sky-800', Viewed: 'bg-amber-100 text-amber-800', Sent: 'bg-slate-100 text-slate-700' };
    return <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || styles.Sent}`}>{status}</span>;
};

export default function CampaignAnalyticsPage() {
    const { campaignId } = useParams();
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState(null);
    const [timeframe, setTimeframe] = useState('14d');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        setLoading(true);
        setTimeout(() => { setCampaign(getCampaignById(campaignId)); setLoading(false); }, 800);
    }, [campaignId]);

    const analyticsData = campaign?.analyticsData;
    const chartData = useMemo(() => {
        if (!analyticsData) return [];
        return analyticsData.performanceChart.slice(-parseInt(timeframe.replace('d', ''))).map(d => ({ ...d, conversions: Math.floor(d.clicks * 0.15) }));
    }, [analyticsData, timeframe]);

    const paginatedAudience = useMemo(() => {
        if (!analyticsData) return [];
        const startIndex = (currentPage - 1) * itemsPerPage;
        return analyticsData.detailedAudience.slice(startIndex, startIndex + itemsPerPage);
    }, [analyticsData, currentPage]);
    
    const totalPages = useMemo(() => Math.ceil((analyticsData?.detailedAudience.length || 0) / itemsPerPage), [analyticsData]);

    if (loading) return <CampaignAnalyticsLoader />;
    if (!campaign || !analyticsData) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-600 p-4">
            <ServerCrash size={64} className="text-rose-500 mb-4" /><h2 className="text-2xl font-semibold mb-2 text-slate-800">Analytics Not Found</h2><p className="mb-6 text-center max-w-md">We couldn't find any analytics data for this campaign. Please try again later.</p><Link to="/campaigns" className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg flex items-center shadow-md"><ChevronLeft className="w-4 h-4 mr-1" />Back to Campaigns</Link>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800">
            <main className="p-4 sm:p-6 lg:p-8">
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-start">
                    <div>
                        <Link to="/campaigns" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center mb-3 group font-semibold"><ChevronLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />Back to Campaigns</Link>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{campaign.campaignDetails.campaignName}</h1>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500"><div className="flex items-center"><Calendar size={14} className="mr-1.5"/><span>{new Date(campaign.campaignDetails.startTime).toLocaleDateString()} - {new Date(campaign.campaignDetails.endTime).toLocaleDateString()}</span></div></div>
                    </div>
                    <TimeframeFilter timeframe={timeframe} setTimeframe={setTimeframe} />
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Views" value={analyticsData.kpi.totalViews.value} change={analyticsData.kpi.totalViews.change} icon={Eye}/>
                    <StatCard title="Unique Visitors" value={analyticsData.kpi.uniqueVisitors.value} change={analyticsData.kpi.uniqueVisitors.change} icon={Users}/>
                    <StatCard title="Total Conversions" value={analyticsData.kpi.conversions.value} change={analyticsData.kpi.conversions.change} icon={Target}/>
                </section>
                
                <section className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/80 mb-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-emerald-600" /> Performance Trend</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{top:10, right:20, left:-10, bottom:0}}>
                                <defs><linearGradient id="views-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/></linearGradient></defs>
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                                <Tooltip content={<CustomComposedChartTooltip />} cursor={{fill:'rgba(0,0,0,0.03)'}} />
                                <Bar yAxisId="left" dataKey="views" name="Views" fill="url(#views-grad)" barSize={20} radius={[5,5,0,0]}/>
                                <Line yAxisId="right" type="monotone" dataKey="conversions" name="Conversions" stroke="#0ea5e9" strokeWidth={2.5} dot={false} activeDot={{r:6,fill:'#0ea5e9',stroke:'#fff',strokeWidth:2}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl border border-slate-200/80">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Conversion Funnel</h3>
                        <div className="space-y-4">
                            {analyticsData.conversionFunnel.map((stage, index) => {
                                const IconComponent = LucideIcons[stage.iconName] || LucideIcons.HelpCircle;
                                const nextValue = analyticsData.conversionFunnel[index + 1]?.value || 0;
                                const conversionRate = stage.value > 0 ? (nextValue / stage.value) * 100 : 0;
                                return (
                                    <div key={stage.stage}>
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl"><IconComponent size={24} /></div>
                                            <div className="flex-1"><p className="text-sm text-slate-500">{stage.stage}</p><p className="text-2xl font-bold text-slate-800">{stage.value.toLocaleString()}</p></div>
                                        </div>
                                        {index < analyticsData.conversionFunnel.length - 1 && (
                                            <div className="ml-7 my-2 pl-3 border-l-2 border-dashed border-slate-300 h-10 flex items-center">
                                                <div className="flex items-center text-xs text-emerald-700 bg-emerald-50 py-1 px-2 rounded-md font-semibold"><ArrowDown size={14} className="mr-1"/>{conversionRate.toFixed(1)}% Conversion</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-xl border border-slate-200/80 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Audience Activity</h3>
                        <div className="flex-grow overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-slate-200"><th className="text-left font-semibold text-slate-500 p-3">Name</th><th className="text-left font-semibold text-slate-500 p-3">Status</th><th className="text-right font-semibold text-slate-500 p-3">Last Activity</th></tr></thead>
                                <tbody>{paginatedAudience.map(p=>(<tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/70"><td className="p-3 font-medium text-slate-700">{p.name}</td><td><StatusChip status={p.status}/></td><td className="text-right text-slate-500 p-3">{p.lastActivity}</td></tr>))}</tbody>
                            </table>
                        </div>
                        <div className="flex justify-between items-center mt-4 text-sm pt-4 border-t border-slate-200">
                            <p className="text-slate-500">Page {currentPage} of {totalPages}</p>
                            <div className="flex gap-1"><button onClick={()=>setCurrentPage(1)} disabled={currentPage===1} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50"><LucideIcons.ChevronFirstIcon size={20}/></button><button onClick={()=>setCurrentPage(c=>Math.max(1,c-1))} disabled={currentPage===1} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50"><LucideIcons.ChevronLeftIcon size={20}/></button><button onClick={()=>setCurrentPage(c=>Math.min(totalPages,c+1))} disabled={currentPage===totalPages} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50"><LucideIcons.ChevronRightIcon size={20}/></button><button onClick={()=>setCurrentPage(totalPages)} disabled={currentPage===totalPages} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50"><LucideIcons.ChevronLastIcon size={20}/></button></div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/80">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><Share2 className="w-5 h-5 mr-2 text-emerald-600"/>Top Referrers</h3>
                        <div className="space-y-4 mt-6">{analyticsData.topReferrers.map(ref => (<div key={ref.source}><div className="flex items-center justify-between text-sm mb-1.5"><p className="font-semibold text-slate-700">{ref.source}</p><p className="font-semibold text-slate-800">{ref.value}%</p></div><div className="w-full bg-slate-200 rounded-full h-2.5"><div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2.5 rounded-full" style={{width:`${ref.value}%`}}></div></div></div>))}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/80">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><Monitor className="w-5 h-5 mr-2 text-emerald-600"/>Audience by Device</h3>
                        <div className="h-[250px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analyticsData.deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" fill="#8884d8" paddingAngle={5} cornerRadius={8}>{analyticsData.deviceData.map((entry) => <Cell key={entry.name} fill={entry.color} stroke={entry.color} />)}</Pie><Tooltip /><Legend iconType="circle" iconSize={8}/></PieChart></ResponsiveContainer>
                        </div>
                    </div>
                </section>
            </main>
            <style jsx global>{`@keyframes fade-in-fast{0%{opacity:0;transform:translateY(-10px)}100%{opacity:1;transform:translateY(0)}}.animate-fade-in-fast{animation:fade-in-fast .2s ease-out forwards}.animate-spin-slow{animation:spin 2s linear infinite}@keyframes progress-indeterminate{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}.animate-progress-indeterminate{animation:progress-indeterminate 1.5s ease-in-out infinite}`}</style>
        </div>
    );
}