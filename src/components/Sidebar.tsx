import { useNavigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Wrench, Wallet, Receipt, Settings, LogOut, CheckCircle, Bell, X, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const { user } = useAuth();

    // Admin Navigation Items
    const adminNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Building2, label: 'Properties', path: '/properties' },
        { icon: Users, label: 'Tenants', path: '/tenants' },
        { icon: Wrench, label: 'Maintenance', path: '/maintenance' },
        { icon: Wallet, label: 'Financials', path: '/financials' },
        { icon: Receipt, label: 'Payments', path: '/payments' },
        { icon: CheckCircle, label: 'Verify Transaction', path: '/verify-transaction' },
    ];

    // Tenant Navigation Items
    const tenantNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/tenant-dashboard' },
        { icon: FileText, label: 'Lease Info', path: '/tenant-dashboard/lease' },
        { icon: Wrench, label: 'Maintenance', path: '/tenant-dashboard/maintenance' },
        { icon: Wallet, label: 'Payments', path: '/tenant-dashboard/payments' },
        { icon: Bell, label: 'Notifications', path: '/tenant-dashboard/notifications' },
    ];

    const navItems = user?.role === 'tenant' ? tenantNavItems : adminNavItems;

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300",
                "lg:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-primary-600 flex items-center gap-2">
                        <Building2 className="w-8 h-8" />
                        RentFlow
                    </h1>
                    {/* Mobile Close Button */}
                    <button
                        onClick={closeMobileMenu}
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary-50 text-primary-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}

                    <NavLink
                        to="/notifications"
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )
                        }
                    >
                        <Bell className="w-5 h-5" />
                        <span className="font-medium">Notifications</span>
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <NavLink
                        to="/settings"
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors",
                                isActive
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )
                        }
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
