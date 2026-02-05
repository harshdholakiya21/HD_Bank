import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Phone, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        account_number: '', phone: '', password: '', confirm_password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        try {
            await api.post('auth/register/', formData);
            setSuccess('Registration successful! You can now login.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || 'Registration failed. Please check your details.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Activate Online Banking
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your account details to set up access.
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded text-sm flex items-start gap-2">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 text-green-700 p-3 rounded text-sm flex items-center gap-2">
                            <CheckCircle size={18} />
                            <span>{success}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Number</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <CreditCard size={18} />
                            </div>
                            <input type="text" required
                                className="block w-full pl-10 border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm py-2"
                                placeholder="HD..."
                                value={formData.account_number}
                                onChange={e => setFormData({ ...formData, account_number: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Registered Phone Number</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Phone size={18} />
                            </div>
                            <input type="text" required
                                className="block w-full pl-10 border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm py-2"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Set Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input type="password" required
                                className="block w-full pl-10 border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm py-2"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input type="password" required
                                className="block w-full pl-10 border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm py-2"
                                value={formData.confirm_password}
                                onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition">
                        Register Account
                    </button>

                    <div className="text-center mt-4 text-sm text-gray-600">
                        Already registered? <Link to="/login" className="text-primary hover:underline font-medium">Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
