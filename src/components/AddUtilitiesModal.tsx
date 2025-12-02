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
        garbage: 0
    });

    const totalUtilities = values.water + values.electricity + values.garbage;
    const totalAmount = monthlyRent + totalUtilities;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) return;

        setSaving(true);
        try {
            await tenantsAPI.upsertCurrentMonthUtilities(tenantId, values);
            // Reset values
            setValues({ water: 0, electricity: 0, garbage: 0 });
            onClose();
        } catch (error) {
            console.error('Failed to update utilities:', error);
            alert('Failed to update utilities');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setValues({ water: 0, electricity: 0, garbage: 0 });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Add Utilities - ${tenantName}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-4 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Adding utilities for <strong>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>.
                        These amounts will be added to the base rent.
                    </p>
                </div>

                {/* Base Rent Display */}
                <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Base Rent:</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">KSh {monthlyRent.toLocaleString()}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Water Bill (KSh)</label>
                    <input
                        type="number"
                        min="0"
                        value={values.water}
                        onChange={(e) => setValues({ ...values, water: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Electricity Bill (KSh)</label>
                    <input
                        type="number"
                        min="0"
                        value={values.electricity}
                        onChange={(e) => setValues({ ...values, electricity: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Garbage Collection (KSh)</label>
                    <input
                        type="number"
                        min="0"
                        value={values.garbage}
                        onChange={(e) => setValues({ ...values, garbage: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                </div>

                {/* Summary Section */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Base Rent:</span>
                        <span className="font-medium text-gray-900 dark:text-white">KSh {monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Utilities:</span>
                        <span className="font-medium text-gray-900 dark:text-white">KSh {totalUtilities.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-gray-900 dark:text-white">Total Amount Due:</span>
                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">KSh {totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
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
