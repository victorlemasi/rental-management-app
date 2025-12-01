import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />
            <div className="ml-64 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
