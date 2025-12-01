import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Building2, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authAPI.forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to process request');
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

                    {!success ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2 dark:text-white">
                                Forgot Password?
                            </h2>
                            <p className="text-gray-500 text-center mb-8 dark:text-gray-400">
                                Enter your email address and we'll send you instructions to reset your password
                            </p>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                                            placeholder="your@email.com"
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
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Instructions'
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">
                                Check Your Email
                            </h3>
                            <p className="text-gray-600 mb-6 dark:text-gray-400">
                                If an account exists with <strong className="text-gray-900 dark:text-white">{email}</strong>,
                                you will receive password reset instructions shortly.
                            </p>
                            <p className="text-sm text-gray-500 mb-6 dark:text-gray-500">
                                Didn't receive the email? Check your spam folder.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Return to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
