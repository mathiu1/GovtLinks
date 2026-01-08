import React, { useEffect, useState } from 'react';
import API from '../../api';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area
} from 'recharts';
import { FiUsers, FiUserCheck, FiFilter, FiTrendingUp } from 'react-icons/fi';
import { FaUserAstronaut } from 'react-icons/fa';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [activeRange, setActiveRange] = useState('today');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const params = { range: activeRange };
                if (activeRange === 'custom' && startDate && endDate) {
                    params.start = startDate;
                    params.end = endDate;
                }

                const res = await API.get('/admin/stats', { params });
                setStats(res.data);

                // Transform real data for the composed chart
                if (res.data && res.data.growthData) {
                    const enhancedData = res.data.growthData.map(item => {
                        const dateObj = new Date(item.date);
                        const month = dateObj.toLocaleString('default', { month: 'short' });
                        const day = dateObj.getDate().toString().padStart(2, '0');
                        return {
                            fullDate: item.date,
                            displayDate: `${month} ${day}`, // e.g., "Jan 01"
                            newRegisters: item.newRegisters || 0,
                            guest: item.guest || 0,
                            member: item.member || 0
                        };
                    });

                    setChartData(enhancedData);
                } else {
                    setChartData([]);
                }
            } catch (error) {
                console.error(error);
            }
        };

        // Only fetch if not custom OR if custom and both dates picked
        if (activeRange !== 'custom' || (activeRange === 'custom' && startDate && endDate)) {
            fetchStats();
        }
    }, [activeRange, startDate, endDate]);

    if (!stats) return (
        <div className="flex justify-center items-center h-full min-h-[80vh]">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-blue-600">Loading</div>
            </div>
        </div>
    );

    const getTabClass = (range) => {
        return `px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeRange === range
            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:shadow-white/10'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`;
    };

    return (
        <div className="p-6 md:p-10 space-y-8">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time platform analytics and user growth</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Custom Date Pickers */}
                    {activeRange === 'custom' && (
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 animate-fade-in-up">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-1.5 bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none uppercase"
                            />
                            <span className="text-slate-400 font-bold">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-1.5 bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none uppercase"
                            />
                        </div>
                    )}

                    <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 overflow-x-auto max-w-full">
                        <button onClick={() => setActiveRange('today')} className={getTabClass('today')}>Today</button>
                        <button onClick={() => setActiveRange('week')} className={getTabClass('week')}>Week</button>
                        <button onClick={() => setActiveRange('month')} className={getTabClass('month')}>Month</button>
                        <button onClick={() => setActiveRange('year')} className={getTabClass('year')}>Year</button>
                        <button onClick={() => setActiveRange('custom')} className={getTabClass('custom')}>
                            <FiFilter className="inline mr-2 text-[10px]" /> Custom
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex items-center gap-5 transition-transform hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150 rotate-12 pointer-events-none">
                        <FiUsers className="text-9xl" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shadow-sm"><FiUsers /></div>
                    <div className="relative z-10">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Users</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</h3>
                        <p className="text-xs text-green-500 font-bold mt-1 flex items-center gap-1">
                            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] uppercase">New</span>
                            +{stats.periodNewUsers} in select period
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex items-center gap-5 transition-transform hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150 rotate-12 pointer-events-none">
                        <FiUserCheck className="text-9xl" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl shadow-sm"><FiUserCheck /></div>
                    <div className="relative z-10">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Member Activity</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.periodMemberVisits}</h3>
                        <p className="text-xs text-purple-500 font-bold mt-1 flex items-center gap-1">
                            Visits this period
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex items-center gap-5 transition-transform hover:-translate-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150 rotate-12 pointer-events-none">
                        <FaUserAstronaut className="text-9xl" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400 flex items-center justify-center text-2xl shadow-sm"><FaUserAstronaut /></div>
                    <div className="relative z-10">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Guest Activity</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.periodGuestVisits}</h3>
                        <p className="text-xs text-orange-500 font-bold mt-1 flex items-center gap-1">
                            Visits this period
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Chart Section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                <FiTrendingUp />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Growth & Activity</h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm pl-13">Tracking registrations and user engagement trends</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide">
                            Active Range: {activeRange}
                        </span>
                    </div>
                </div>

                <div className="w-full overflow-x-auto pb-4">
                    <div className="h-[300px] sm:h-[400px] min-w-[600px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 20, right: 0, bottom: 0, left: -20 }}>
                                <defs>
                                    <linearGradient id="colorNewReg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                                <XAxis
                                    dataKey="displayDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                    dy={10}
                                    minTickGap={30}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ fontWeight: 700, fontSize: '13px' }}
                                    cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                                />

                                {/* Guest Visits Bar */}
                                <Bar
                                    dataKey="guest"
                                    fill="#fb923c"
                                    barSize={12}
                                    radius={[4, 4, 4, 4]}
                                    name="Guest Visits"
                                    fillOpacity={0.8}
                                />

                                {/* Member Visits Bar */}
                                <Bar
                                    dataKey="member"
                                    fill="#0ea5e9"
                                    barSize={12}
                                    radius={[4, 4, 4, 4]}
                                    name="Member Visits"
                                    fillOpacity={0.8}
                                />

                                {/* New Registrations Area - using Area for the glow under curve */}
                                <Area
                                    type="monotone"
                                    dataKey="newRegisters"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorNewReg)"
                                    strokeWidth={3}
                                    name="New Registrations"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>

                        {/* Custom Legend */}
                        <div className="flex items-center justify-center gap-6 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Guest Visits</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Member Visits</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Registrations</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
