import { User, Wrench, DollarSign } from 'lucide-react';

const activities = [
    {
        id: 1,
        type: 'payment',
        title: 'Rent Payment Received',
        description: 'Unit 4B paid $1,200',
        time: '2 hours ago',
        icon: DollarSign,
        color: 'bg-green-100 text-green-600',
    },
    {
        id: 2,
        type: 'maintenance',
        title: 'New Maintenance Request',
        description: 'Leaking faucet in Unit 2A',
        time: '4 hours ago',
        icon: Wrench,
        color: 'bg-orange-100 text-orange-600',
    },
    {
        id: 3,
        type: 'tenant',
        title: 'New Tenant Registered',
        description: 'Sarah Wilson - Unit 3C',
        time: '1 day ago',
        icon: User,
        color: 'bg-blue-100 text-blue-600',
    },
    {
        id: 4,
        type: 'payment',
        title: 'Rent Payment Received',
        description: 'Unit 1A paid $1,500',
        time: '1 day ago',
        icon: DollarSign,
        color: 'bg-green-100 text-green-600',
    },
];

const RecentActivity = () => {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-6">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.color}`}>
                            <activity.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;
