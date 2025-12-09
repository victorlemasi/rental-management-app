import React, { useState, useEffect } from 'react';
import { X, Send, Users, Building2 } from 'lucide-react';
import { tenantsAPI, propertiesAPI } from '../services/api';
import type { Tenant, Property } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
    const [target, setTarget] = useState<'all' | 'property' | 'selected'>('all');
    const [selectedProperty, setSelectedProperty] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const [properties, setProperties] = useState<Property[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            const [propsData, tenantsData] = await Promise.all([
                propertiesAPI.getAll(),
                tenantsAPI.getAll()
            ]);
            setProperties(propsData);
            setTenants(tenantsData);
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            // Determine recipients
            let recipients: Tenant[] = [];
            if (target === 'all') {
                recipients = tenants;
            } else if (target === 'property') {
                recipients = tenants.filter(t => {
                    const pId = typeof t.propertyId === 'object' ? t.propertyId._id : t.propertyId;
                    return pId === selectedProperty;
                });
            }

            // Send to backend
            const response = await fetch(`${API_BASE_URL}/notifications/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients: recipients.map(t => t.email),
                    subject,
                    message,
                    type: 'email'
                })
            });

            if (response.ok) {
                alert(`Successfully sent to ${recipients.length} recipients`);
                onClose();
                setSubject('');
                setMessage('');
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            alert('Failed to send notifications');
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Send className="w-5 h-5 text-primary-600" />
                        Send Bulk Notification
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSend} className="p-6 space-y-6">
                    {/* Target Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipients</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                type="button"
                                onClick={() => setTarget('all')}
                                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all
                                    ${target === 'all' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-gray-400'}`}
                            >
                                <Users className="w-6 h-6" />
                                <span className="font-medium">All Tenants</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTarget('property')}
                                className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all
                                    ${target === 'property' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-gray-400'}`}
                            >
                                <Building2 className="w-6 h-6" />
                                <span className="font-medium">By Property</span>
                            </button>
                        </div>
                    </div>

                    {target === 'property' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Property</label>
                            <select
                                required
                                value={selectedProperty}
                                onChange={(e) => setSelectedProperty(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            >
                                <option value="">Choose a property...</option>
                                {properties.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Message Content */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                            <input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Important Announcement"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={6}
                                placeholder="Type your message here..."
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {sending ? 'Sending...' : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Notification
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NotificationModal;
