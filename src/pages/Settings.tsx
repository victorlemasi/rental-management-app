import React, { useState } from 'react';
import { User, Lock, Bell, Moon, Sun, Monitor, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // Form states
    const [profileData, setProfileData] = useState({
        name: user?.name || 'Admin User',
        email: user?.email || 'admin@example.com',
        phone: '+254 712 345 678',
        role: user?.role || 'Administrator'
    });

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        monthlyReport: true
    });

    // Handlers
    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically call an API to update the profile
        alert('Profile updated successfully (Mock)');
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (securityData.newPassword !== securityData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        // Here you would typically call an API to update the password
        alert('Password updated successfully (Mock)');
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Navigation/Summary */}
                <div className="lg:col-span-1 space-y-6">
                    {/* User Profile Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-12 h-12 text-primary-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
                        <p className="text-sm text-gray-500 capitalize">{profileData.role}</p>
                        <div className="mt-4 flex justify-center gap-2">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Verified</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Member Since</span>
                                <span className="font-medium">Nov 2023</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Last Login</span>
                                <span className="font-medium">Today, 10:23 AM</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Security Level</span>
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                    <Shield className="w-4 h-4" /> High
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <User className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <input
                                        type="text"
                                        value={profileData.role}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Lock className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                        </div>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={securityData.currentPassword}
                                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={securityData.newPassword}
                                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={securityData.confirmPassword}
                                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Notification Preferences */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts' },
                                { id: 'push', label: 'Push Notifications', desc: 'Receive real-time alerts on your device' },
                                { id: 'sms', label: 'SMS Notifications', desc: 'Receive urgent tenants alerts via SMS' },
                                { id: 'monthlyReport', label: 'Monthly Reports', desc: 'Receive detailed monthly financial reports' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.label}</p>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notifications[item.id as keyof typeof notifications]}
                                            onChange={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* App Appearance */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Monitor className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => theme !== 'light' && toggleTheme()}
                                className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-primary-500 bg-primary-50 text-alert-700' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Sun className="w-6 h-6" />
                                <span className="text-sm font-medium">Light</span>
                            </button>
                            <button
                                onClick={() => theme !== 'dark' && toggleTheme()}
                                className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-primary-500 bg-primary-50 text-alert-700' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Moon className="w-6 h-6" />
                                <span className="text-sm font-medium">Dark</span>
                            </button>
                            <button
                                className="p-4 border border-gray-200 rounded-xl flex flex-col items-center gap-2 hover:border-gray-300"
                            >
                                <Monitor className="w-6 h-6" />
                                <span className="text-sm font-medium">System</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
