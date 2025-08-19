import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import getapiRequest from '../../../utils/getapiRequest';
import { useSelector } from 'react-redux';

const StatCard = ({ title, value, icon, color = 'emerald', description, trend }) => {
    const IconComponent = icon || LucideIcons.Activity;
    const colorPalette = {
        emerald: { text: 'text-emerald-600', iconBg: 'bg-emerald-100', border: 'border-emerald-200', valueText: 'text-emerald-700', shadow: 'hover:shadow-emerald-200/50' },
        sky: { text: 'text-sky-600', iconBg: 'bg-sky-100', border: 'border-sky-200', valueText: 'text-sky-700', shadow: 'hover:shadow-sky-200/50' },
        rose: { text: 'text-rose-600', iconBg: 'bg-rose-100', border: 'border-rose-200', valueText: 'text-rose-700', shadow: 'hover:shadow-rose-200/50' },
        violet: { text: 'text-violet-600', iconBg: 'bg-violet-100', border: 'border-violet-200', valueText: 'text-violet-700', shadow: 'hover:shadow-violet-200/50' }
    };
    const selectedColor = colorPalette[color] || colorPalette.emerald;

    return (
        <div className={`p-5 rounded-xl shadow-lg border ${selectedColor.border} bg-white ${selectedColor.shadow} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${selectedColor.iconBg}`}>
                    <IconComponent size={22} className={`${selectedColor.text}`} strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-semibold ${trend.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend.change >= 0 ? <LucideIcons.ArrowUpRight size={14} className="mr-0.5"/> : <LucideIcons.ArrowDownRight size={14} className="mr-0.5"/>}
                        {trend.change > 0 ? '+' : ''}{trend.change}%
                    </div>
                )}
            </div>
            <h3 className={`text-3xl font-bold ${selectedColor.valueText}`}>{value}</h3>
            <p className="text-sm text-slate-500 mt-1">{title}</p>
            {description && <p className="text-xs text-slate-400 mt-1.5">{description}</p>}
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 backdrop-blur-md p-3 rounded-lg shadow-xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
                {payload.map((pld, index) => (
                    <div key={index} style={{ color: pld.fill || pld.stroke }} className="text-xs font-medium">
                        {pld.name}: {pld.value.toLocaleString()}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const ChartContainer = ({ title, subtitle, children }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 h-full flex flex-col min-h-[400px] hover:shadow-xl transition-shadow duration-300">
            <div>
                <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                {subtitle && <p className="text-sm text-slate-500 mt-0.5 mb-5">{subtitle}</p>}
            </div>
            <div className="flex-grow mt-4">
                {children}
            </div>
        </div>
    );
};

const StylishBarChart = ({ data, title, subtitle, dataKey = "value" }) => {
    return (
        <ChartContainer title={title} subtitle={subtitle}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barCategoryGap="20%">
                    <defs>
                        <linearGradient id="barGradientGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#059669" stopOpacity={0.7}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} />
                    <Bar dataKey={dataKey} name="Engagement" fill="url(#barGradientGreen)" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

const StylishAreaChart = ({ data, title, subtitle, dataKey = "value", areaColor = "sky" }) => {
    const colorStops = {
        sky: { stop1: "#0ea5e9", stop2: "#38bdf8", stroke: "#0284c7" },
        violet: { stop1: "#8b5cf6", stop2: "#a78bfa", stroke: "#7c3aed" },
    };
    const selectedColors = colorStops[areaColor] || colorStops.sky;

    return (
        <ChartContainer title={title} subtitle={subtitle}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                        <linearGradient id={`areaGradient-${areaColor}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={selectedColors.stop1} stopOpacity={0.6}/>
                            <stop offset="95%" stopColor={selectedColors.stop2} stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: selectedColors.stroke, strokeWidth: 1, strokeDasharray: '3 3' }}/>
                    <Area type="monotone" dataKey={dataKey} name="Revenue" stroke={selectedColors.stroke} strokeWidth={2.5} fillOpacity={1} fill={`url(#areaGradient-${areaColor})`}
                          dot={{ stroke: selectedColors.stroke, strokeWidth: 2, r: 4, fill: 'white' }}
                          activeDot={{ r: 6, stroke: 'white', strokeWidth: 2, fill: selectedColors.stroke }} />
                </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

const StylishPieChart = ({ data, title, subtitle, dataKey = "value", nameKey = "name" }) => {
    const COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'];
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            percent * 100 > 5 &&
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px" fontWeight="600">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };
    
    return (
        <ChartContainer title={title} subtitle={subtitle}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius="85%"
                        fill="#8884d8"
                        dataKey={dataKey}
                        nameKey={nameKey}
                        paddingAngle={3}
                        animationDuration={800}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={3} stroke="#fff" />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: '12px', color: '#4b5563', paddingTop: '15px'}}/>
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}

const QuickActionButton = ({ to, icon, label, description, color = 'emerald' }) => {
    const IconComponent = icon || LucideIcons.Zap;
    const colorPalette = {
        emerald: { base: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-emerald-500/20", icon: "bg-emerald-100 text-emerald-600" },
        sky: { base: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 hover:border-sky-300 hover:shadow-sky-500/20", icon: "bg-sky-100 text-sky-600" },
        violet: { base: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 hover:border-violet-300 hover:shadow-violet-500/20", icon: "bg-violet-100 text-violet-600" },
    };
    const selectedStyle = colorPalette[color] || colorPalette.emerald;

    return (
        <Link to={to} className={`flex items-center p-4 rounded-xl border ${selectedStyle.base} transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.03] transform group`}>
            <div className={`p-3 rounded-lg mr-4 ${selectedStyle.icon} transition-colors`}>
                 <IconComponent size={20} strokeWidth={2}/>
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-sm group-hover:text-inherit">{label}</h4>
                <p className="text-xs text-slate-500 group-hover:text-slate-600 mt-0.5">{description}</p>
            </div>
            <LucideIcons.ChevronRight size={20} className="ml-auto text-slate-400 self-center group-hover:text-slate-500 transition-transform group-hover:translate-x-0.5" />
        </Link>
    );
};

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = useSelector((state) => state.auth.userToken);
    const username = useSelector((state) => state.auth.userInfo.profile.name);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const response = await getapiRequest("get", "/dashboard", null, token);
                setDashboardData(response.data);
            } catch (err) {
                const errorMessage = err?.response?.data?.message || "Could not load dashboard data.";
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 5) return "Working Late";
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-center">
                    <LucideIcons.Loader2 className="animate-spin text-emerald-500 h-12 w-12 mx-auto" />
                    <p className="mt-4 text-slate-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }
    
    if (error || !dashboardData) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-rose-200">
                    <LucideIcons.AlertTriangle className="text-rose-500 h-12 w-12 mx-auto" />
                    <h2 className="mt-4 text-xl font-bold text-slate-800">Oops! Something went wrong.</h2>
                    <p className="mt-2 text-slate-600">{error || "Could not retrieve dashboard data."}</p>
                </div>
            </div>
        );
    }
    
    const dashboardStats = [
        { title: "Active Campaigns", value: dashboardData.overview.activeCampaigns, icon: LucideIcons.Rocket, color: 'emerald'},
        { title: "Total Contacts", value: dashboardData.overview.totalContacts.toLocaleString(), icon: LucideIcons.Users2, color: 'sky' },
        { title: "Conversion Rate", value: `${dashboardData.overview.conversionRate}%`, icon: LucideIcons.Target, color: 'violet' },
        { title: "Total Campaigns", value: dashboardData.overview.totalCampaigns, icon: LucideIcons.ClipboardCheck, color: 'rose' },
    ];
    
    const campaignEngagementData = [
        { label: "Jan '24", value: 65 }, { label: "Feb '24", value: 59 },
        { label: "Mar '24", value: 80 }, { label: "Apr '24", value: 81 },
        { label: "May '24", value: 56 }, { label: "Jun '24", value: 72 },
        { label: "Jul '24", value: 95 },
    ];

    const contactSourceData = [
        { name: 'Organic Search', value: 450 }, { name: 'Referrals', value: 320 },
        { name: 'Social Media', value: 280 }, { name: 'Paid Ads', value: 180 },
        { name: 'Events', value: 120 },
    ];
    
    const monthlyRevenueData = [
        { label: "Jan", value: 2300 }, { label: "Feb", value: 2100 }, { label: "Mar", value: 2800 },
        { label: "Apr", value: 2500 }, { label: "May", value: 3100 }, { label: "Jun", value: 2900 },
        { label: "Jul", value: 3500 },
    ];

    const quickActions = [
        { to: "/contacts", icon: LucideIcons.Contact, label: "Manage Contacts", description: "View and organize lists.", color: "sky" },
        { to: "/campaigns/create", icon: LucideIcons.Wand2, label: "Launch New Campaign", description: "Start a fresh initiative.", color: "emerald" },
        { to: "/settings/general", icon: LucideIcons.SlidersHorizontal, label: "System Settings", description: "Configure application preferences.", color: "violet" },
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-screen-2xl mx-auto">
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
                            {getGreeting()}, <span className="text-emerald-600">{username}</span>!
                        </h1>
                        <p className="text-slate-600 mt-1.5 text-base">
                            Here's what's happening today. Let's make it a great one! 🚀
                        </p>
                    </div>
                    <Link to="/campaigns/create" className="mt-6 sm:mt-0 shrink-0">
                        <button className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-emerald-500/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-50">
                            <LucideIcons.PlusCircle size={20} className="mr-2.5"/>
                            Create Campaign
                        </button>
                    </Link>
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {dashboardStats.map((stat, index) => <StatCard key={index} {...stat} />)}
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                    <div className="xl:col-span-2">
                        <StylishBarChart title="Monthly Campaign Engagement" subtitle="Visual performance breakdown." data={campaignEngagementData} />
                    </div>
                    <div className="xl:col-span-1">
                        <StylishPieChart title="Contact Sources" subtitle="Segment distribution." data={contactSourceData} />
                    </div>
                </section>
                
                <section className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-8">
                    <div className="xl:col-span-3">
                        <StylishAreaChart title="Revenue Growth (USD)" subtitle="Growth and progression insights." data={monthlyRevenueData} areaColor="violet" />
                    </div>
                    <div className="xl:col-span-2 flex flex-col gap-y-8">
                         <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 flex-1 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-lg font-semibold text-slate-800 mb-5">Quick Actions</h3>
                            <div className="space-y-4">
                                {quickActions.map((action, index) => <QuickActionButton key={index} {...action} />)}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Recent Campaigns</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Campaign Name</th>
                                    <th scope="col" className="px-6 py-3">Views</th>
                                    <th scope="col" className="px-6 py-3">Conversions</th>
                                    <th scope="col" className="px-6 py-3">Start Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.recentCampaigns.length > 0 ? dashboardData.recentCampaigns.map((campaign) => (
                                    <tr key={campaign.id} className="bg-white border-b hover:bg-slate-50">
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{campaign.name}</th>
                                        <td className="px-6 py-4">{campaign.views}</td>
                                        <td className="px-6 py-4">{campaign.conversions}</td>
                                        <td className="px-6 py-4">{new Date(campaign.startTime).toLocaleDateString()}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-6">No recent campaigns to display.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}