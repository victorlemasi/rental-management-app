import React from 'react';
import { Bell, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface NotificationsProps {
    notifications: any[];
    onMarkAsRead?: (id: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onMarkAsRead }) => {
    // Deduplicate notifications
    const uniqueNotifications = Array.from(new Map(notifications.map(item => [item._id, item])).values());

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'urgent':
                return <AlertCircle className="w-6 h-6" />;
            case 'warning':
                return <AlertTriangle className="w-6 h-6" />;
            case 'success':
                return <CheckCircle className="w-6 h-6" />;
            case 'announcement':
                return <Info className="w-6 h-6" />;
            default:
                return <Bell className="w-6 h-6" />;
        }
    };

    const getNotificationStyle = (type: string) => {
        const styles = {
            urgent: {
                border: 'border-red-500',
                bg: 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30',
                badge: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
                icon: 'text-red-600 dark:text-red-400'
            },
            warning: {
                border: 'border-orange-500',
                bg: 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30',
                badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200',
                icon: 'text-orange-600 dark:text-orange-400'
            },
            success: {
                border: 'border-green-500',
                bg: 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30',
                badge: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
                icon: 'text-green-600 dark:text-green-400'
            },
            announcement: {
                border: 'border-blue-500',
                bg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
                badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
                icon: 'text-blue-600 dark:text-blue-400'
            },
            info: {
                border: 'border-gray-500',
                bg: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50',
                badge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
                icon: 'text-gray-600 dark:text-gray-400'
            }
        };
        return styles[type as keyof typeof styles] || styles.info;
    };

    // Statistics
    const urgentCount = uniqueNotifications.filter(n => n.type === 'urgent').length;
    const warningCount = uniqueNotifications.filter(n => n.type === 'warning').length;
    const totalUnread = uniqueNotifications.filter(n => !n.read).length;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{uniqueNotifications.length}</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-lg">
                            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-100 mb-1">Urgent</p>
                            <p className="text-3xl font-bold">{urgentCount}</p>
                        </div>
                        <AlertCircle className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-100 mb-1">Warnings</p>
                            <p className="text-3xl font-bold">{warningCount}</p>
                        </div>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-100 mb-1">Unread</p>
                            <p className="text-3xl font-bold">{totalUnread}</p>
                        </div>
                        <Bell className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
                <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-6 h-6 text-primary-600" />
                        All Notifications
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Stay updated with important messages</p>
                </div>
                <div className="p-6">
                    {uniqueNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No notifications yet</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {uniqueNotifications.map((notification) => {
                                const style = getNotificationStyle(notification.type);
                                return (
                                    <div
                                        key={notification._id}
                                        onClick={() => !notification.read && onMarkAsRead?.(notification._id)}
                                        className={`border-l-4 ${style.border} ${style.bg} rounded-lg p-5 shadow-sm hover:shadow-md transition-all ${!notification.read ? 'cursor-pointer hover:bg-opacity-80' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`${style.icon} mt-1`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                                        {notification.title}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.badge} whitespace-nowrap`}>
                                                        {notification.type.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                                                    {notification.message}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                        <span className="font-semibold">From:</span>
                                                        <span>{notification.senderName}</span>
                                                    </div>
                                                    <span className="text-gray-400 dark:text-gray-500">•</span>
                                                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>
                                                            {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    {!notification.read && (
                                                        <>
                                                            <span className="text-gray-400">•</span>
                                                            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                                CLICK TO MARK READ
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Filter (Future enhancement) */}
            {notifications.length > 0 && (
                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter by Type</h3>
                    <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                            All ({notifications.length})
                        </button>
                        <button className="px-4 py-2 bg-white dark:bg-slate-700 border-2 border-red-300 dark:border-red-800 rounded-lg text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors">
                            Urgent ({urgentCount})
                        </button>
                        <button className="px-4 py-2 bg-white dark:bg-slate-700 border-2 border-orange-300 dark:border-orange-800 rounded-lg text-sm font-semibold text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/40 transition-colors">
                            Warnings ({warningCount})
                        </button>
                        <button className="px-4 py-2 bg-white dark:bg-slate-700 border-2 border-blue-300 dark:border-blue-800 rounded-lg text-sm font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors">
                            Unread ({totalUnread})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
