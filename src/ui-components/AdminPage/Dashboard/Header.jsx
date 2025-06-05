import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
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

const mockUser = {
    name: "Jane Doe",
};

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
                        {trend.change >= 0 ? '+' : ''}{trend.change}%
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
                <p className="text-xs font-semibold text-slate-700 mb-1">{label}</p>
                {payload.map((pld, index) => (
                    <div key={index} style={{ color: pld.fill || pld.stroke }} className="text-xs">
                        {pld.name}: {pld.value}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const StylishBarChart = ({ data, title, dataKey = "value", barFill = "url(#barGradientGreen)" }) => {
    if (!data || data.length === 0) return <div className="text-center py-10 text-slate-400 text-xs">No data for chart.</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-200 h-full flex flex-col min-h-[350px] md:min-h-[400px] hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 mb-5">Visual performance breakdown.</p>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barCategoryGap="20%">
                        <defs>
                            <linearGradient id="barGradientGreen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#059669" stopOpacity={0.7}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4b5563' }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} />
                        <Bar dataKey={dataKey} fill={barFill} radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const StylishAreaChart = ({ data, title, dataKey = "value", areaColor = "sky" }) => {
    if (!data || data.length === 0) return <div className="text-center py-10 text-slate-400 text-xs">No data for chart.</div>;

    const colorStops = {
        sky: { stop1: "#0ea5e9", stop2: "#38bdf8", stroke: "#0284c7" },
        violet: { stop1: "#8b5cf6", stop2: "#a78bfa", stroke: "#7c3aed" },
    };
    const selectedColors = colorStops[areaColor] || colorStops.sky;

    return (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-200 h-full flex flex-col min-h-[350px] md:min-h-[400px] hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 mb-5">Growth and progression insights.</p>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                            <linearGradient id={`areaGradient-${areaColor}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={selectedColors.stop1} stopOpacity={0.6}/>
                                <stop offset="95%" stopColor={selectedColors.stop2} stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4b5563' }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#4b5563' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: selectedColors.stroke, strokeWidth: 1, strokeDasharray: '3 3' }}/>
                        <Area type="monotone" dataKey={dataKey} stroke={selectedColors.stroke} strokeWidth={2.5} fillOpacity={1} fill={`url(#areaGradient-${areaColor})`}
                              dot={{ stroke: selectedColors.stroke, strokeWidth: 2, r: 4, fill: 'white' }}
                              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2, fill: selectedColors.stroke }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const StylishPieChart = ({ data, title, dataKey = "value", nameKey = "name" }) => {
    if (!data || data.length === 0) return <div className="text-center py-10 text-slate-400 text-xs">No data for pie chart.</div>;
    const COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + (radius + (percent > 0.1 ? 15 : 5)) * Math.cos(-midAngle * RADIAN);
        const y = cy + (radius + (percent > 0.1 ? 15 : 5)) * Math.sin(-midAngle * RADIAN);

        return (
            percent * 100 > 3 &&
            <text x={x} y={y} fill="#374151" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px" fontWeight="500">
                {`${payload[nameKey]} (${(percent * 100).toFixed(0)}%)`}
            </text>
        );
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-200 h-full flex flex-col min-h-[350px] md:min-h-[400px] hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 mb-5">Segment distribution.</p>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius="80%"
                            fill="#8884d8"
                            dataKey={dataKey}
                            nameKey={nameKey}
                            paddingAngle={2}
                            animationDuration={800}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} stroke="#fff" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: '11px', color: '#4b5563', paddingTop: '15px'}}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
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
        <Link
            to={to}
            className={`flex items-center p-4 rounded-xl border ${selectedStyle.base} transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.03] transform group`}
        >
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

const ActivityItem = ({ icon, text, time, userInitials, userColor }) => {
    const IconComponent = icon || LucideIcons.Info;
    const initialsColors = {
        emerald: 'bg-emerald-500', sky: 'bg-sky-500', violet: 'bg-violet-500', rose: 'bg-rose-500', amber: 'bg-amber-500'
    };
    const selectedUserColor = initialsColors[userColor] || initialsColors.emerald;

    return (
        <li className="flex items-start py-4 px-2 group transition-colors hover:bg-slate-50/70 rounded-lg -mx-2">
             {userInitials ? (
                <div className={`w-8 h-8 rounded-full ${selectedUserColor} text-white text-xs font-semibold flex items-center justify-center mr-3.5 shrink-0 ring-2 ring-white shadow-sm`}>
                    {userInitials}
                </div>
             ) : (
                <div className="p-2 bg-slate-100 rounded-full mr-3.5 group-hover:bg-emerald-100 transition-colors shrink-0">
                    <IconComponent size={16} className="text-slate-500 group-hover:text-emerald-600 transition-colors" />
                </div>
             )}
            <div className="flex-1">
                <p className="text-sm text-slate-700 group-hover:text-slate-800 leading-snug">{text}</p>
                <p className="text-xs text-slate-400 group-hover:text-slate-500 mt-1">{time}</p>
            </div>
        </li>
    );
};


export default function Dashboard() {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 5) return "Working Late";
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const dashboardStats = [
        { title: "Active Campaigns", value: "7", icon: LucideIcons.Rocket, color: 'emerald', description: "Engaging your audience now.", trend: { change: 3.1 } },
        { title: "Total Contacts", value: "2,450", icon: LucideIcons.Users2, color: 'sky', description: "Across all contact lists.", trend: { change: 12.5 } },
        { title: "Conversion Rate", value: "4.8%", icon: LucideIcons.Target, color: 'violet', description: "From recent campaigns.", trend: { change: 0.5 } },
        { title: "Pending Approvals", value: "2", icon: LucideIcons.ClipboardCheck, color: 'rose', description: "Awaiting your review.", trend: { change: 0 } },
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

    const recentActivities = [
        { icon: LucideIcons.MailCheck, text: "Campaign 'Product Hunt Launch' emails sent successfully to 850 contacts.", time: "15 minutes ago", userInitials: "JD" , userColor: 'emerald'},
        { icon: LucideIcons.UserPlus, text: "New contact list 'Beta Signups Q3' imported with 78 contacts.", time: "2 hours ago", userInitials: "MK", userColor: 'sky' },
        { icon: LucideIcons.FileEdit, text: "Landing page template 'SaaS Offer' was updated by Michael.", time: "Yesterday, 4:30 PM", userInitials: "MK", userColor: 'sky' },
    ];

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-screen-2xl mx-auto">
                <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800">
                            {getGreeting()}, <span className="text-emerald-600">{mockUser.name}</span>!
                        </h1>
                        <p className="text-slate-600 mt-1.5 text-base">
                            Here's what's happening with your campaigns today. Keep up the great work! 🚀
                        </p>
                    </div>
                    <Link to="/campaigns/create" className="mt-6 sm:mt-0 shrink-0">
                        <button className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-emerald-500/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-50">
                            <LucideIcons.PlusCircle size={20} className="mr-2.5"/>
                            Create Campaign
                        </button>
                    </Link>
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {dashboardStats.map((stat, index) => (
                        <StatCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            description={stat.description}
                            trend={stat.trend}
                        />
                    ))}
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
                    <div className="xl:col-span-2">
                        <StylishBarChart title="Monthly Campaign Engagement" data={campaignEngagementData} />
                    </div>
                     <div className="xl:col-span-1">
                        <StylishPieChart title="Contact Sources Breakdown" data={contactSourceData} />
                    </div>
                </section>
                
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                         <StylishAreaChart title="Revenue Growth (USD)" data={monthlyRevenueData} areaColor="violet" dataKey="value"/>
                    </div>

                    <div className="xl:col-span-1 flex flex-col space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-200 flex-1 hover:shadow-2xl transition-shadow duration-300">
                            <h3 className="text-lg font-semibold text-slate-800 mb-5">Quick Actions</h3>
                            <div className="space-y-4">
                                {quickActions.map((action, index) => (
                                    <QuickActionButton
                                        key={index}
                                        to={action.to}
                                        icon={action.icon}
                                        label={action.label}
                                        description={action.description}
                                        color={action.color}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-200 flex-1 hover:shadow-2xl transition-shadow duration-300">
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Recent Activity</h3>
                            <ul className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto  overflow-x-hidden custom-scrollbar pr-1">
                                {recentActivities.length > 0 ? recentActivities.slice(0, 3).map((activity, index) => (
                                    <ActivityItem
                                        key={index}
                                        icon={activity.icon}
                                        text={activity.text}
                                        time={activity.time}
                                        userInitials={activity.userInitials}
                                        userColor={activity.userColor}
                                    />
                                )) : (
                                    <p className="text-sm text-slate-500 py-6 text-center">No recent activity.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </section>
                 <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                    .recharts-default-legend { padding-top: 15px !important; }
                    .recharts-tooltip-cursor { stroke-dasharray: 3 3; }
                `}</style>
            </div>
        </div>
    );
}