import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    label: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
    icon: LucideIcon;
    color: string;
}

const StatsCard = ({ label, value, trend, trendUp, icon: Icon, color }: StatsCardProps) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1 dark:text-white">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {trend}
                    </span>
                    <span className="text-gray-500 ml-2 dark:text-gray-400">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
