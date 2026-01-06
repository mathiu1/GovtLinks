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
    ResponsiveContainer
} from 'recharts';
import { FaUsers, FaUserTag, FaUserSecret, FaFilter } from 'react-icons/fa';

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
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    const getTabClass = (range) => {
        return `px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeRange === range
            ? 'bg-slate-900 text-white shadow-md'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Overview</h1>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Custom Date Pickers */}
                    {activeRange === 'custom' && (
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 animate-fade-in">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-1 bg-transparent text-xs font-medium text-slate-600 dark:text-slate-300 outline-none"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-1 bg-transparent text-xs font-medium text-slate-600 dark:text-slate-300 outline-none"
                            />
                        </div>
                    )}

                    <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
                        <button onClick={() => setActiveRange('today')} className={getTabClass('today')}>Today</button>
                        <button onClick={() => setActiveRange('week')} className={getTabClass('week')}>This Week</button>
                        <button onClick={() => setActiveRange('month')} className={getTabClass('month')}>This Month</button>
                        <button onClick={() => setActiveRange('year')} className={getTabClass('year')}>Yearly</button>
                        <button onClick={() => setActiveRange('custom')} className={getTabClass('custom')}>
                            <FaFilter className="inline mr-2 text-xs" /> Custom
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-5 transition-transform hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl"><FaUsers /></div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total System Users</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</h3>
                        <p className="text-xs text-green-500 font-semibold mt-1">+{stats.periodNewUsers} in period</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-5 transition-transform hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl"><FaUserTag /></div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Period Member Visits</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.periodMemberVisits}</h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Total Members: {stats.totalMembers}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-5 transition-transform hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400 flex items-center justify-center text-2xl"><FaUserSecret /></div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Period Guest Visits</p>
                        <h3 className="3xl font-black text-slate-900 dark:text-white">{stats.periodGuestVisits}</h3>
                    </div>
                </div>
            </div>

            {/* Main Chart Section */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">User Growth</h2>
                            <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                Active: {activeRange}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">Tracking new registrations across the platform.</p>
                    </div>

                    <div className="flex bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                        <button className="px-5 py-2 rounded-lg text-slate-500 dark:text-slate-400 text-xs font-bold uppercase hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all">Sales Metrics</button>
                        <button className="px-5 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm text-xs font-bold uppercase transition-all">User Metrics</button>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                            <XAxis
                                dataKey="displayDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    padding: '12px 16px'
                                }}
                                itemStyle={{ fontWeight: 600, fontSize: '13px' }}
                                cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                            />

                            {/* Guest Visits Bar */}
                            <Bar
                                dataKey="guest"
                                fill="#fb923c"
                                barSize={12}
                                radius={[4, 4, 4, 4]}
                                name="Guest Visits"
                            />

                            {/* Member Visits Bar */}
                            <Bar
                                dataKey="member"
                                fill="#0ea5e9"
                                barSize={12}
                                radius={[4, 4, 4, 4]}
                                name="Member Visits"
                            />

                            {/* New Registrations Area/Line */}
                            {/* Using Area with gradient for that glow effect at bottom properly */}
                            <defs>
                                <linearGradient id="colorNewReg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Line
                                type="monotone"
                                dataKey="newRegisters"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
                                name="New Registrations"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Custom Legend */}
                <div className="flex justify-center items-center gap-8 mt-4">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Guest Visits</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Member Visits</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">New Registrations</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
