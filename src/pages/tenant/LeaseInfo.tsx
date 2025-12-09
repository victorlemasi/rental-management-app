import React from 'react';
import { Home, Calendar, DollarSign, FileText, MapPin } from 'lucide-react';
import type { Tenant } from '../../types';

interface LeaseInfoProps {
    tenant: Tenant | null;
}

const LeaseInfo: React.FC<LeaseInfoProps> = ({ tenant }) => {
    if (!tenant) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-lg">No lease information found. Please contact management.</p>
            </div>
        );
    }

    const leaseStart = new Date(tenant.leaseStart);
    const leaseEnd = new Date(tenant.leaseEnd);
    const today = new Date();
    const daysRemaining = Math.ceil((leaseEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.ceil((leaseEnd.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = totalDays - daysRemaining;
    const progressPercentage = (daysElapsed / totalDays) * 100;

    return (
        <div className="space-y-6">
            {/* Property Image */}
            {typeof tenant.propertyId === 'object' && tenant.propertyId.imageUrl && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="relative h-80 w-full">
                        <img
                            src={tenant.propertyId.imageUrl}
                            alt={tenant.propertyId.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h1 className="text-3xl font-bold mb-2">
                                {typeof tenant.propertyId === 'object' ? tenant.propertyId.name : 'Property'}
                            </h1>
                            <p className="text-lg flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Unit {tenant.unitNumber}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Lease Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <Home className="w-8 h-8" />
                        <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">STATUS</span>
                    </div>
                    <p className="text-blue-100 text-sm mb-1">Lease Status</p>
                    <p className="text-2xl font-bold capitalize">{tenant.status}</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-8 h-8" />
                        <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">RENT</span>
                    </div>
                    <p className="text-green-100 text-sm mb-1">Monthly Rent</p>
                    <p className="text-2xl font-bold">KSh {tenant.monthlyRent.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <Calendar className="w-8 h-8" />
                        <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">TIME</span>
                    </div>
                    <p className="text-purple-100 text-sm mb-1">Days Remaining</p>
                    <p className="text-2xl font-bold">{daysRemaining > 0 ? daysRemaining : 0}</p>
                </div>
            </div>

            {/* Lease Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary-600" />
                    Lease Timeline
                </h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Lease Progress</span>
                        <span className="font-semibold text-gray-900">
                            {Math.min(100, Math.max(0, progressPercentage)).toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <div>
                            <p className="text-xs text-gray-500">Start Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {leaseStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">End Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {leaseEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary-600" />
                        Lease Details
                    </h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Home className="w-5 h-5 text-gray-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Property</p>
                                    <p className="text-base font-semibold text-gray-900">
                                        {typeof tenant.propertyId === 'object' ? tenant.propertyId.name : 'Loading...'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Unit Number</p>
                                    <p className="text-base font-semibold text-gray-900">{tenant.unitNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lease Start</p>
                                    <p className="text-base font-semibold text-gray-900">
                                        {leaseStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lease End</p>
                                    <p className="text-base font-semibold text-gray-900">
                                        {leaseEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <DollarSign className="w-5 h-5 text-gray-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Monthly Rent</p>
                                    <p className="text-base font-semibold text-primary-600">
                                        KSh {tenant.monthlyRent.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 capitalize">
                                        {tenant.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Renewal Notice (if applicable) */}
            {daysRemaining > 0 && daysRemaining <= 60 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-yellow-500 p-3 rounded-full">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Lease Renewal Notice</h3>
                            <p className="text-gray-700 mb-4">
                                Your lease is expiring in <span className="font-bold text-orange-600">{daysRemaining} days</span>.
                                Please contact management to discuss renewal options.
                            </p>
                            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors">
                                Contact Management
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaseInfo;
