import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { paymentsAPI } from '../services/api';
import type { Payment } from '../types';

interface MonthlyRevenue {
    name: string;
    revenue: number;
}

const RevenueChart = () => {
    const [data, setData] = useState<MonthlyRevenue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const payments = await paymentsAPI.getAll();

                // Get last 7 months
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const currentDate = new Date();
                const monthlyData: { [key: string]: number } = {};

                // Initialize last 7 months with 0
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    monthlyData[monthKey] = 0;
                }

                // Calculate revenue per month from completed payments
                payments.forEach((payment: Payment) => {
                    if (payment.status === 'completed') {
                        const paymentDate = new Date(payment.date);
                        const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;

                        if (monthlyData.hasOwnProperty(monthKey)) {
                            monthlyData[monthKey] += payment.amount;
                        }
                    }
                });

                // Convert to chart format
                const chartData: MonthlyRevenue[] = Object.keys(monthlyData).map(monthKey => {
                    const [_year, month] = monthKey.split('-');
                    const monthIndex = parseInt(month) - 1;
                    return {
                        name: months[monthIndex],
                        revenue: monthlyData[monthKey]
                    };
                });

                setData(chartData);
            } catch (error) {
                console.error('Failed to fetch revenue data:', error);
                // Fallback to empty data
                setData([
                    { name: 'Jan', revenue: 0 },
                    { name: 'Feb', revenue: 0 },
                    { name: 'Mar', revenue: 0 },
                    { name: 'Apr', revenue: 0 },
                    { name: 'May', revenue: 0 },
                    { name: 'Jun', revenue: 0 },
                    { name: 'Jul', revenue: 0 },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px] flex items-center justify-center">
                <p className="text-gray-500">Loading revenue data...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px]">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview</h3>
            <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.2} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af' }}
                            tickFormatter={(value) => `KSh ${value.toLocaleString()}`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#38bdf8' }}
                            formatter={(value: number) => [`KSh ${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;
