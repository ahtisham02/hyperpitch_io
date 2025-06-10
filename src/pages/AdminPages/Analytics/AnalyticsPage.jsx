import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCampaignById } from '../../../utils/localStorageHelper';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as LucideIcons from 'lucide-react';

const { Users, Target, Eye, ArrowUpRight, ArrowDownRight, ChevronLeft, Filter, TrendingUp, Calendar, FileCog, ServerCrash, Smartphone, Monitor, Tablet, Share2, ChevronDown, MousePointerClick, ChevronRight, ChevronFirst, ChevronLast, ArrowDown } = LucideIcons;

// --- SELF-CONTAINED COMPONENTS ---
const CampaignAnalyticsLoader = () => (
    <div className="fixed inset-0 bg-slate-100/80 backdrop-blur-md flex flex-col items-center justify-center z-[300] p-4 text-slate-800">
        <FileCog size={64} className="text-green-600 animate-spin-slow" /><h2 className="text-2xl font-semibold my-2">Generating Report</h2><p className="text-slate-500 mb-1 text-center max-w-sm">Crafting your analytics dashboard...</p><div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden mt-6"><div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 animate-progress-indeterminate"></div></div>
        <style jsx>{`@keyframes spin-slow {0% {transform:rotate(0deg);} 100% {transform:rotate(360deg);}} .animate-spin-slow {animation:spin-slow 2.5s linear infinite;} @keyframes progress-indeterminate {0% {transform:translateX(-100%) scaleX(0.5);} 50% {transform:translateX(0) scaleX(1);} 100% {transform:translateX(100%) scaleX(0.5);}} .animate-progress-indeterminate {transform-origin:left; animation:progress-indeterminate 1.8s ease-in-out infinite;}`}</style>
    </div>
);

const StatCard = ({ title, value, change, icon: Icon, format = 'number' }) => {
    const isPositive = change >= 0;
    const formattedValue = format === 'percentage' ? `${value.toFixed(1)}%` : value.toLocaleString();
    return (<div className="bg-white/60 backdrop-blur-lg border border-slate-200/80 p-5 rounded-2xl shadow-lg animate-fade-in-up"><div className="flex items-center justify-between text-slate-500"><p className="text-sm font-medium">{title}</p><Icon size={20} /></div><p className="mt-2 text-3xl font-bold text-slate-800">{formattedValue}</p><div className={`mt-1 flex items-center text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{isPositive ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}<span className="ml-1">{Math.abs(change)}% vs last period</span></div></div>);
};

const CustomComposedChartTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (<div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-slate-200 text-sm"><p className="label font-semibold text-slate-700 mb-2">{label}</p><div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-[#2e8b57] mr-2"></div><span className="text-slate-500 mr-2">Views:</span><span className="text-slate-800 font-medium">{payload[0].value.toLocaleString()}</span></div><div className="flex items-center mt-1"><div className="w-2.5 h-2.5 rounded-full bg-sky-500 mr-2"></div><span className="text-slate-500 mr-2">Conversions:</span><span className="text-slate-800 font-medium">{payload[1].value.toLocaleString()}</span></div></div>);
    } return null;
};

const TimeframeFilter = ({ timeframe, setTimeframe }) => {
    const [isOpen, setIsOpen] = useState(false); const dropdownRef = useRef(null);
    const options = {'7d':'Last 7 Days','14d':'Last 14 Days','30d':'Last 30 Days'};
    useEffect(() => { const handleClickOutside = (e) => {if(dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);}; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
    return (<div className="relative" ref={dropdownRef}><button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 bg-white/50 p-1 pl-3 rounded-lg border border-slate-200/80 shadow-sm hover:border-slate-300 transition-colors"><Filter className="w-5 h-5 text-slate-500"/><span className="text-sm font-medium text-slate-700">{options[timeframe]}</span><ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180':''}`} /></button>{isOpen && (<div className="absolute top-full right-0 mt-2 w-40 bg-white/80 backdrop-blur-lg border border-slate-200/80 rounded-lg shadow-2xl z-20 py-1 animate-fade-in-fast">{Object.entries(options).map(([k,v])=>(<button key={k} onClick={()=>{setTimeframe(k); setIsOpen(false);}} className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${timeframe===k ? 'bg-green-100 text-green-700 font-semibold':'text-slate-600 hover:bg-slate-100'}`}>{v}</button>))}</div>)}</div>);
};

const StatusChip = ({ status }) => {
    const styles = { Converted: 'bg-green-100 text-green-700', Clicked: 'bg-sky-100 text-sky-700', Viewed: 'bg-amber-100 text-amber-700', Sent: 'bg-slate-100 text-slate-600' };
    return <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || styles.Sent}`}>{status}</span>
};

// --- MAIN PAGE COMPONENT ---
export default function CampaignAnalyticsPage() {
    const { campaignId } = useParams();
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState(null);
    const [timeframe, setTimeframe] = useState('14d');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const campaignDetails = getCampaignById(campaignId);
            setCampaign(campaignDetails);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [campaignId]);

    const analyticsData = campaign?.analyticsData;
    const chartData = useMemo(() => {
        if (!analyticsData) return [];
        const days = parseInt(timeframe.replace('d', ''));
        return analyticsData.performanceChart.slice(-days).map(d => ({...d, conversions: Math.floor(d.clicks * 0.15)}));
    }, [analyticsData, timeframe]);
    
    const deviceData = useMemo(() => {
        if (!analyticsData) return [];
        return [{name:'Desktop',value:analyticsData.deviceData[0].value,Icon:Monitor,color:'#2e8b57'},{name:'Mobile',value:analyticsData.deviceData[1].value,Icon:Smartphone,color:'#3CB371'},{name:'Tablet',value:analyticsData.deviceData[2].value,Icon:Tablet,color:'#8FBC8F'}];
    }, [analyticsData]);
    
    const paginatedAudience = useMemo(() => {
        if (!analyticsData) return [];
        const startIndex = (currentPage - 1) * itemsPerPage;
        return analyticsData.detailedAudience.slice(startIndex, startIndex + itemsPerPage);
    }, [analyticsData, currentPage]);
    
    const totalPages = useMemo(() => {
        if (!analyticsData) return 0;
        return Math.ceil(analyticsData.detailedAudience.length / itemsPerPage);
    }, [analyticsData]);

    if (loading) {
        return <CampaignAnalyticsLoader />;
    }
    
    if (!campaign || !analyticsData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-600">
                <ServerCrash size={64} className="text-red-500 mb-4" /><h2 className="text-2xl font-semibold mb-2 text-slate-800">Analytics Data Not Found</h2><p className="mb-6 text-center max-w-md">This can happen if the campaign is old. Please try editing and re-saving the campaign to generate its analytics data.</p><Link to="/campaigns" className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center transition-colors shadow-md"><ChevronLeft className="w-4 h-4 mr-1" />Back to All Campaigns</Link>
            </div>
        );
    }
    
    return (
        <div className="bg-slate-50 min-h-screen text-slate-700 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden"><div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-green-500/10 to-transparent rounded-full filter blur-3xl opacity-50"></div><div className="absolute bottom-0 -right-1/4 w-2/3 h-2/3 bg-gradient-to-tl from-sky-500/10 to-transparent rounded-full filter blur-3xl opacity-50"></div></div>

            <main className="relative z-10 p-4 sm:p-6 lg:p-8">
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-start"><div><Link to="/campaigns" className="text-sm text-green-600 hover:text-green-700 flex items-center mb-3 group"><ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />Back to Campaigns</Link><h1 className="text-4xl font-bold text-slate-800 tracking-tight">{campaign.campaignDetails.campaignName}</h1><div className="flex items-center space-x-4 mt-2 text-sm text-slate-500"><div className="flex items-center"><Calendar size={14} className="mr-1.5"/><span>{new Date(campaign.campaignDetails.startTime).toLocaleDateString()} - {new Date(campaign.campaignDetails.endTime).toLocaleDateString()}</span></div></div></div><TimeframeFilter timeframe={timeframe} setTimeframe={setTimeframe} /></header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    <div className="lg:col-span-8"><div className="h-[450px] bg-white/60 backdrop-blur-lg border border-slate-200/80 p-6 rounded-2xl shadow-lg animate-fade-in"><h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-green-600" /> Performance Trend</h3><ResponsiveContainer width="100%" height="90%"><ComposedChart data={chartData} margin={{top:10,right:20,left:-10,bottom:0}}><defs><linearGradient id="views-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2e8b57" stopOpacity={0.4}/><stop offset="95%" stopColor="#2e8b57" stopOpacity={0.05}/></linearGradient></defs><XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/><YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/><YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/><Tooltip content={<CustomComposedChartTooltip />} cursor={{fill:'rgba(0,0,0,0.03)'}} /><Bar yAxisId="left" dataKey="views" name="Views" fill="url(#views-grad)" barSize={20} radius={[5,5,0,0]}/><Line yAxisId="right" type="monotone" dataKey="conversions" name="Conversions" stroke="#0ea5e9" strokeWidth={2.5} dot={false} activeDot={{r:6,fill:'#0ea5e9',stroke:'#fff',strokeWidth:2}} /></ComposedChart></ResponsiveContainer></div></div>
                    <div className="lg:col-span-4 space-y-6"><StatCard title="Total Views" value={analyticsData.kpi.totalViews.value} change={analyticsData.kpi.totalViews.change} icon={Eye}/><StatCard title="Unique Visitors" value={analyticsData.kpi.uniqueVisitors.value} change={analyticsData.kpi.uniqueVisitors.change} icon={Users}/><StatCard title="Total Conversions" value={analyticsData.kpi.conversions.value} change={analyticsData.kpi.conversions.change} icon={Target}/></div>
                </div>

                <div className="mt-12 animate-fade-in-up" style={{animationDelay:'0.3s'}}>
                    <div className="relative mb-8 text-center"><hr className="border-slate-200" /><span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-50 px-4 text-sm font-medium text-slate-500">Detailed Analysis</span></div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* --- NEW CONVERSION FUNNEL UI --- */}
                        <div className="bg-white/60 backdrop-blur-lg border border-slate-200/80 p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center"><Filter className="w-5 h-5 mr-2 text-green-600"/>Conversion Funnel</h3>
                            <div className="space-y-2">
                                {analyticsData.conversionFunnel.map((stage, index) => {
                                    const IconComponent = LucideIcons[stage.iconName] || LucideIcons.HelpCircle;
                                    const nextValue = analyticsData.conversionFunnel[index + 1]?.value || 0;
                                    const dropOff = stage.value > 0 ? ((stage.value - nextValue) / stage.value) * 100 : 0;
                                    return (
                                        <div key={stage.stage}>
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                                                    <IconComponent size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-slate-500">{stage.stage}</p>
                                                    <p className="text-2xl font-bold text-slate-800">{stage.value.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            {index < analyticsData.conversionFunnel.length - 1 && (
                                                <div className="ml-7 my-2 pl-3 border-l-2 border-dashed border-slate-300 h-10 flex items-center">
                                                    <div className="flex items-center text-xs text-red-600 bg-red-50 p-1 rounded-md">
                                                        <ArrowDown size={14} className="mr-1"/>
                                                        <span>{dropOff.toFixed(1)}% Drop-off</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-lg border border-slate-200/80 p-6 rounded-2xl shadow-lg"><h3 className="text-lg font-semibold text-slate-800 mb-4">Audience Activity</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200"><th className="text-left font-medium text-slate-500 p-2">Name</th><th className="text-left font-medium text-slate-500 p-2">Status</th><th className="text-right font-medium text-slate-500 p-2">Last Activity</th></tr></thead><tbody>{paginatedAudience.map(p=>(<tr key={p.id} className="border-b border-slate-100"><td className="p-2.5 font-medium">{p.name}</td><td><StatusChip status={p.status}/></td><td className="text-right text-slate-500 p-2">{p.lastActivity}</td></tr>))}</tbody></table></div><div className="flex justify-between items-center mt-4 text-sm"><p className="text-slate-500">Page {currentPage} of {totalPages}</p><div className="flex gap-1"><button onClick={()=>setCurrentPage(1)} disabled={currentPage===1} className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-50"><ChevronFirst size={18}/></button><button onClick={()=>setCurrentPage(c=>Math.max(1,c-1))} disabled={currentPage===1} className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-50"><ChevronLeft size={18}/></button><button onClick={()=>setCurrentPage(c=>Math.min(totalPages,c+1))} disabled={currentPage===totalPages} className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-50"><ChevronRight size={18}/></button><button onClick={()=>setCurrentPage(totalPages)} disabled={currentPage===totalPages} className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-50"><ChevronLast size={18}/></button></div></div></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white/60 backdrop-blur-lg border border-slate-200/80 p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center"><Share2 className="w-5 h-5 mr-2 text-green-600"/>Top Referrers</h3>
                            <div className="space-y-4 mt-6">{analyticsData.topReferrers.map(ref => (<div key={ref.source}><div className="flex items-center justify-between text-sm mb-1.5"><p className="font-medium text-slate-600">{ref.source}</p><p className="font-semibold text-slate-800">{ref.value}%</p></div><div className="w-full bg-slate-200 rounded-full h-2"><div className="h-2 rounded-full" style={{width:`${ref.value}%`,backgroundColor:ref.color}}></div></div></div>))}</div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-lg border border-slate-200/80 p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center"><Monitor className="w-5 h-5 mr-2 text-green-600"/>Audience by Device</h3>
                            <div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" fill="#8884d8" paddingAngle={5} cornerRadius={8}>{deviceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
                        </div>
                    </div>
                </div>
            </main>
            <style jsx global>{`@keyframes fade-in {0% {opacity:0;}} @keyframes fade-in-fast {0% {opacity:0; transform:translateY(-10px);}} @keyframes fade-in-up {0% {opacity:0; transform:translateY(20px);}} .animate-fade-in {animation:fade-in .6s ease-out forwards;} .animate-fade-in-fast {animation:fade-in-fast .2s ease-out forwards;} .animate-fade-in-up {animation:fade-in-up .5s ease-out forwards;} .custom-scrollbar::-webkit-scrollbar {width:5px;} .custom-scrollbar::-webkit-scrollbar-track {background:#e2e8f0; border-radius:10px;} .custom-scrollbar::-webkit-scrollbar-thumb {background:#94a3b8; border-radius:10px;} .custom-scrollbar::-webkit-scrollbar-thumb:hover {background:#64748b;}`}</style>
        </div>
    );
}