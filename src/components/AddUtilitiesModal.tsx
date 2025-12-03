import React, { useState } from 'react';
import { tenantsAPI } from '../services/api';
import Modal from './Modal';

interface AddUtilitiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string | null;
    tenantName: string;
    monthlyRent: number;
}

const AddUtilitiesModal: React.FC<AddUtilitiesModalProps> = ({ isOpen, onClose, tenantId, tenantName, monthlyRent }) => {
    const [saving, setSaving] = useState(false);
    const [values, setValues] = useState({
        water: 0,
        electricity: 0,
        garbage: 0,
        security: 0
    });

    const totalUtilities = values.water + values.electricity + values.garbage + values.security;
    const totalAmount = monthlyRent + totalUtilities;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) return;

        setSaving(true);
        try {
            await tenantsAPI.upsertCurrentMonthUtilities(tenantId, values);
            // Reset values
            setValues({ water: 0, electricity: 0, garbage: 0, security: 0 });
            onClose();
        } catch (error) {
            console.error('Failed to update utilities:', error);
            alert('Failed to update utilities');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setValues({ water: 0, electricity: 0, garbage: 0, security: 0 });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Add Utilities - ${tenantName}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Month Indicator - Prominent */}
                <div className="bg-primary-50 border-2 border-primary-200 p-4 rounded-lg mb-4">
                    <p className="text-center">
                        <span className="text-sm text-primary-700 block mb-1">Adding Utilities For:</span>
                        <span className="text-xl font-bold text-primary-900">
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                    </p>
                    <p className="text-xs text-primary-600 text-center mt-2">
                        These utilities will be added to the base rent for this month.
                    </p>
                </div>

                {/* Base Rent Display */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Base Rent:</span>
                        <span className="text-lg font-semibold text-gray-900">KSh {monthlyRent.toLocaleString()}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Water Bill (KSh)</label>
                    <input
                        type="number"
                        min="0"
                        value={values.water}
                        onChange={(e) => setValues({ ...values, water: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Electricity Bill (KSh)</label>
                    <input
                        type="number"
                        min="0"
                        value={values.electricity}
                        onChange={(e) => setValues({ ...values, electricity: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Garbage Collection (KSh)</label>
                    <input
                        type="number"
                        min="0"
                        value={values.garbage}
                        onChange={(e) => setValues({ ...values, garbage: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security (KSh)</label>
                    <input
                        type="number"
                        min="0"
                        value={values.security}
                        onChange={(e) => setValues({ ...values, security: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {/* Summary Section */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Base Rent:</span>
                        <span className="font-medium text-gray-900">KSh {monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total Utilities:</span>
                        <span className="font-medium text-gray-900">KSh {totalUtilities.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-900">Total Amount Due:</span>
                        <span className="text-xl font-bold text-primary-600">KSh {totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Utilities'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddUtilitiesModal;
