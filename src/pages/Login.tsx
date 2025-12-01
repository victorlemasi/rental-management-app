import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Building2, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginType, setLoginType] = useState<'manager' | 'tenant'>('manager');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authAPI.login({ email, password });

            // Verify role matches login type (optional UX enforcement)
            if (loginType === 'tenant' && data.user.role !== 'tenant') {
                throw new Error('Please use the Landlord login for manager accounts');
            }
            if (loginType === 'manager' && data.user.role === 'tenant') {
                throw new Error('Please use the Tenant login for tenant accounts');
            }

            login(data.token, data.user);

            if (data.user.role === 'tenant') {
                navigate('/tenant-dashboard');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 dark:bg-gray-950">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden dark:bg-gray-900">
                <div className="p-8">
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                            <Building2 className="w-8 h-8" />
                            <span className="text-2xl font-bold">PropManage</span>
                        </div>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg mb-8 dark:bg-gray-800">
                        <button
                            onClick={() => setLoginType('manager')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginType === 'manager'
                                ? 'bg-white text-primary-600 shadow-sm dark:bg-gray-700 dark:text-primary-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Landlord
                        </button>
                        <button
                            onClick={() => setLoginType('tenant')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginType === 'tenant'
                                ? 'bg-white text-primary-600 shadow-sm dark:bg-gray-700 dark:text-primary-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Tenant
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2 dark:text-white">
                        {loginType === 'manager' ? 'Landlord Login' : 'Tenant Portal'}
                    </h2>
                    <p className="text-gray-500 text-center mb-8 dark:text-gray-400">
                        {loginType === 'manager'
                            ? 'Manage your properties and tenants'
                            : 'View your lease and submit requests'}
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                                    placeholder={loginType === 'manager' ? "admin@example.com" : "tenant@example.com"}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-300">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
