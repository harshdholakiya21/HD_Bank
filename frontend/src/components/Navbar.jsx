import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-primary text-white shadow-lg">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2 text-2xl font-bold tracking-wide">
                    <Building2 size={32} />
                    <span>HD Bank</span>
                </Link>
                <div className="flex items-center space-x-6">
                    {user ? (
                        <>
                            <span className="hidden md:flex items-center space-x-2 bg-blue-800 px-3 py-1 rounded-full text-sm">
                                <User size={16} />
                                <span className="capitalize">{user.role.toLowerCase()}</span>
                            </span>
                            {user.role === 'CLIENT' && (
                                <Link to="/client/dashboard" className="hover:text-accent transition">Dashboard</Link>
                            )}
                            {user.role === 'MANAGER' && (
                                <Link to="/manager/dashboard" className="hover:text-accent transition">Dashboard</Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 hover:text-red-300 transition"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-accent transition">Login</Link>
                            <Link to="/register" className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition shadow-md">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
