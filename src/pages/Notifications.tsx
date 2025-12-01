import React, { useState, useEffect } from 'react';
import { Send, Plus } from 'lucide-react';
import { notificationsAPI, tenantsAPI } from '../services/api';
import type { Tenant } from '../types';
import Modal from '../components/Modal';

const Notifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        recipientType: 'all',
        recipientIds: [] as string[]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [notificationsData, tenantsData] = await Promise.all([
                notificationsAPI.getAll(),
                tenantsAPI.getAll()
            ]);
            setNotifications(notificationsData);
            setTenants(tenantsData);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await notificationsAPI.create(formData);
            setIsModalOpen(false);
            fetchData();
            setFormData({
                title: '',
                message: '',
                type: 'info',
                recipientType: 'all',
                recipientIds: []
            });
            alert('Notification sent successfully!');
        } catch (error) {
            console.error('Failed to send notification', error);
            alert('Failed to send notification');
        }
    };

    const handleDeleteNotification = async (id: string) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;
        try {
            await notificationsAPI.delete(id);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    };

    if (loading) return <div className="p-8 text-center dark:text-white">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                    <p className="text-gray-500 mt-1 dark:text-gray-400">Send notifications to your tenants</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Notification
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sent Notifications</h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No notifications sent yet
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div key={notification._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${notification.type === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                notification.type === 'warning' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    notification.type === 'announcement' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {notification.type}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2 dark:text-gray-300">{notification.message}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span>
                                                Recipients: {notification.recipientType === 'all' ? 'All Tenants' : `${notification.recipientIds.length} Tenant(s)`}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteNotification(notification._id)}
                                        className="text-red-600 hover:text-red-900 text-sm font-medium dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Send Notification"
            >
                <form onSubmit={handleSendNotification} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="Notification title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Message</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            placeholder="Your message to tenants"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        >
                            <option value="info">Info</option>
                            <option value="announcement">Announcement</option>
                            <option value="warning">Warning</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Recipients</label>
                        <select
                            value={formData.recipientType}
                            onChange={(e) => setFormData({ ...formData, recipientType: e.target.value, recipientIds: [] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        >
                            <option value="all">All Tenants</option>
                            <option value="specific">Specific Tenants</option>
                        </select>
                    </div>

                    {formData.recipientType === 'specific' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Select Tenants</label>
                            <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto dark:border-gray-700">
                                {tenants.map((tenant) => (
                                    <label key={tenant._id} className="flex items-center gap-2 py-2 hover:bg-gray-50 px-2 rounded cursor-pointer dark:hover:bg-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={formData.recipientIds.includes(tenant._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({
                                                        ...formData,
                                                        recipientIds: [...formData.recipientIds, tenant._id]
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        recipientIds: formData.recipientIds.filter(id => id !== tenant._id)
                                                    });
                                                }
                                            }}
                                            className="rounded text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-900 dark:text-gray-300">{tenant.name} - Unit {tenant.unitNumber}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            Send Notification
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Notifications;
