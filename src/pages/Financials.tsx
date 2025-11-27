import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Download, Trash2, Plus, Calendar } from 'lucide-react';
import { paymentsAPI, tenantsAPI } from '../services/api';
import type { Payment, Tenant } from '../types';
import StatsCard from '../components/StatsCard';
import Modal from '../components/Modal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Financials = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        tenantId: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        method: 'bank-transfer',
        status: 'completed'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [paymentsData, tenantsData] = await Promise.all([
                paymentsAPI.getAll(),
                tenantsAPI.getAll()
            ]);
            setPayments(paymentsData);
            setTenants(tenantsData);
            processAnalytics(paymentsData);
        } catch (error) {
            console.error('Failed to fetch financial data', error);
        } finally {
            setLoading(false);
        }
    };

    const processAnalytics = (data: Payment[]) => {
        // Revenue Trends (Last 6 months)
        const months: { [key: string]: number } = {};
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short' });
            months[key] = 0;
        }

        data.forEach(p => {
            const d = new Date(p.date);
            const key = d.toLocaleString('default', { month: 'short' });
            if (months[key] !== undefined) {
                months[key] += p.amount;
            }
        });

        setRevenueData(Object.entries(months).map(([name, value]) => ({ name, value })));

        // Payment Methods
        const methods: { [key: string]: number } = {};
        data.forEach(p => {
            methods[p.method] = (methods[p.method] || 0) + 1;
        });

        setPaymentMethodData(Object.entries(methods).map(([name, value]) => ({
            name: name.replace('-', ' '),
            value
        })));
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await paymentsAPI.create(formData);
            setIsModalOpen(false);
            fetchData();
            setFormData({
                tenantId: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                method: 'bank-transfer',
                status: 'completed'
            });
        } catch (error) {
            console.error('Failed to create payment', error);
        }
    };

    const handleDeletePayment = async (id: string) => {
        if (!confirm('Are you sure you want to delete this payment?')) return;
        try {
            await paymentsAPI.delete(id);
            setPayments(payments.filter(p => p._id !== id));
            processAnalytics(payments.filter(p => p._id !== id));
        } catch (error) {
            console.error('Failed to delete payment', error);
        }
    };

    const generateReceipt = (payment: Payment) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('Rent Receipt', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.text(`Receipt #: ${payment._id.slice(-6).toUpperCase()}`, 20, 40);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);

        // Details
        const details = [
            ['Tenant', payment.tenantName],
            ['Property', payment.propertyName],
            ['Payment Date', new Date(payment.date).toLocaleDateString()],
            ['Amount', `$${payment.amount.toLocaleString()}`],
            ['Method', payment.method.replace('-', ' ').toUpperCase()],
            ['Status', payment.status.toUpperCase()]
        ];

        (doc as any).autoTable({
            startY: 60,
            head: [['Description', 'Details']],
            body: details,
            theme: 'grid',
            headStyles: { fillColor: [66, 139, 202] }
        });

        // Footer
        const finalY = (doc as any).lastAutoTable.finalY || 150;
        doc.text('Thank you for your payment.', 105, finalY + 20, { align: 'center' });

        doc.save(`receipt-${payment._id}.pdf`);
    };

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    if (loading) return <div className="p-8 text-center">Loading financials...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
                    <p className="text-gray-500 mt-1">Manage payments and view financial reports</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Record Payment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    label="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    trend="+12%"
                    trendUp={true}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <StatsCard
                    label="Pending Payments"
                    value={pendingPayments.toString()}
                    trend="-2"
                    trendUp={true}
                    icon={Calendar}
                    color="bg-yellow-500"
                />
                <StatsCard
                    label="Average Rent"
                    value="$1,250"
                    trend="+5%"
                    trendUp={true}
                    icon={TrendingUp}
                    color="bg-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                        Revenue Trends
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Methods Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary-600" />
                        Payment Methods
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentMethodData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {paymentMethodData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payments.map((payment) => (
                                <tr key={payment._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(payment.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {payment.tenantName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {payment.propertyName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ${payment.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {payment.method.replace('-', ' ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                        <button
                                            onClick={() => generateReceipt(payment)}
                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Download Receipt"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePayment(payment._id)}
                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                                            title="Delete Payment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Record New Payment"
            >
                <form onSubmit={handleAddPayment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
                        <select
                            required
                            value={formData.tenantId}
                            onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Select Tenant</option>
                            {tenants.map(t => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                        <input
                            type="number"
                            required
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                        <select
                            value={formData.method}
                            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="bank-transfer">Bank Transfer</option>
                            <option value="credit-card">Credit Card</option>
                            <option value="cash">Cash</option>
                            <option value="check">Check</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Record Payment
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Financials;
