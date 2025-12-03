import React, { useState, useEffect } from 'react';
import { Edit2, X, Check } from 'lucide-react';
import Modal from './Modal';
import { tenantsAPI } from '../services/api';

interface RentHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string | null;
    tenantName: string;
}

const RentHistoryModal: React.FC<RentHistoryModalProps> = ({ isOpen, onClose, tenantId, tenantName }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState({
        water: 0,
        electricity: 0,
        garbage: 0
    });

    useEffect(() => {
        if (isOpen && tenantId) {
            fetchHistory();
        }
    }, [isOpen, tenantId]);

    const fetchHistory = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const data = await tenantsAPI.getRentHistory(tenantId);
            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch rent history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: any) => {
        setEditingId(record._id);
        setEditValues({
            water: record.water || 0,
            electricity: record.electricity || 0,
            garbage: record.garbage || 0
        });
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!tenantId || !editingId) return;
        try {
            await tenantsAPI.updateRentHistory(tenantId, editingId, editValues);
            await fetchHistory(); // Refresh data
            setEditingId(null);
        } catch (error) {
            console.error('Failed to update utilities:', error);
            alert('Failed to update utilities');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Rent History - ${tenantName}`}
        >
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="text-center py-4">Loading history...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Rent</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Water</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elec</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garbage</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-4 text-center text-sm text-gray-500">
                                        No payment history found.
                                    </td>
                                </tr>
                            ) : (
                                history.map((record) => {
                                    const isEditing = editingId === record._id;
                                    const baseRent = record.amount - (record.water || 0) - (record.electricity || 0) - (record.garbage || 0) - (record.security || 0);

                                    return (
                                        <tr key={record._id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(record.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {baseRent.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editValues.water}
                                                        onChange={(e) => setEditValues({ ...editValues, water: Number(e.target.value) })}
                                                        className="w-20 px-2 py-1 border rounded"
                                                    />
                                                ) : (
                                                    (record.water || 0).toLocaleString()
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editValues.electricity}
                                                        onChange={(e) => setEditValues({ ...editValues, electricity: Number(e.target.value) })}
                                                        className="w-20 px-2 py-1 border rounded"
                                                    />
                                                ) : (
                                                    (record.electricity || 0).toLocaleString()
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editValues.garbage}
                                                        onChange={(e) => setEditValues({ ...editValues, garbage: Number(e.target.value) })}
                                                        className="w-20 px-2 py-1 border rounded"
                                                    />
                                                ) : (
                                                    (record.garbage || 0).toLocaleString()
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {(record.security || 0).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {record.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                                                {record.amountPaid.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    record.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                        record.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                {isEditing ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={handleSave} className="text-green-600 hover:text-green-900">
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={handleCancel} className="text-red-600 hover:text-red-900">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-900">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

export default RentHistoryModal;
