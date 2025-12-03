import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tenantsAPI } from '../services/api';

const DebugTenantData = () => {
    const { user } = useAuth();
    const [tenant, setTenant] = useState<any>(null);
    const [rentHistory, setRentHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tenantData = await tenantsAPI.getMe();
                setTenant(tenantData);

                if (tenantData?._id) {
                    const history = await tenantsAPI.getRentHistory(tenantData._id);
                    setRentHistory(history);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchData();
        }
    }, [user]);

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Debug: Tenant Data</h1>

                {/* Tenant Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Tenant Information</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                        {JSON.stringify(tenant, null, 2)}
                    </pre>
                </div>

                {/* Rent History */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Rent History ({rentHistory.length} records)</h2>
                    <div className="space-y-4">
                        {rentHistory.map((record, index) => (
                            <div key={record._id} className="border border-gray-200 rounded p-4">
                                <h3 className="font-medium text-gray-900 mb-2">
                                    Record #{index + 1}: {record.month}
                                </h3>
                                <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                                    {JSON.stringify(record, null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current Month Check */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Current Month Analysis</h2>
                    <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Tenant Current Month:</span> {tenant?.currentMonth}</p>
                        <p><span className="font-medium">Calendar Current Month:</span> {new Date().toISOString().slice(0, 7)}</p>

                        {(() => {
                            const currentMonthRecord = rentHistory.find(r => r.month === tenant?.currentMonth);
                            if (currentMonthRecord) {
                                return (
                                    <div className="mt-4 p-4 bg-white rounded border">
                                        <p className="font-medium mb-2">Utilities for {tenant?.currentMonth}:</p>
                                        <p>Water: KSh {currentMonthRecord.water || 0}</p>
                                        <p>Electricity: KSh {currentMonthRecord.electricity || 0}</p>
                                        <p>Garbage: KSh {currentMonthRecord.garbage || 0}</p>
                                        <p>Security: KSh {currentMonthRecord.security || 0}</p>
                                        <p className="font-semibold mt-2">Total Amount: KSh {currentMonthRecord.amount}</p>
                                    </div>
                                );
                            } else {
                                return <p className="text-red-600 mt-2">⚠️ No rent history record found for {tenant?.currentMonth}</p>;
                            }
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebugTenantData;
