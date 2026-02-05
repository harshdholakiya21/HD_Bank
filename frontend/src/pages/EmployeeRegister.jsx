import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Hash, CheckCircle, AlertCircle } from 'lucide-react';

const EmployeeRegister = () => {
    const [formData, setFormData] = useState({
        username: '', email: '', phone: '', password: '', ref_id: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('auth/employee-register/', formData);
            setSuccess('Employee Registered Successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Registration failed');
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Employee Registration</h2>
                    <p className="mt-2 text-sm text-gray-500">Restricted access for bank staff only</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex gap-2">
                            <AlertCircle size={18} className="shrink-0" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex gap-2">
                            <CheckCircle size={18} className="shrink-0" /> {success}
                        </div>
                    )}

                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input type="text" placeholder="Username" required
                            className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input type="email" placeholder="Email Address" required
                            className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input type="text" placeholder="Phone Number" required
                            className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <Hash className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input type="text" placeholder="Reference ID (Required)" required
                            className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.ref_id} onChange={e => setFormData({ ...formData, ref_id: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input type="password" placeholder="Set Password" required
                            className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
                        Register as Employee
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Not an employee? <Link to="/register" className="text-blue-600 hover:underline">One-Time Activation</Link> or <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default EmployeeRegister;
