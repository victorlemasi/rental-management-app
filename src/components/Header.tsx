import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import ThemeToggle from './ThemeToggle';

const Header = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 dark:bg-gray-900 dark:border-gray-800">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search properties, tenants..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors dark:text-gray-400 dark:hover:bg-gray-800">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Manager'}</p>
                    </div>
                    <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                        <User className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
