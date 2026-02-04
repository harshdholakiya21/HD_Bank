import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Key, Mail, Phone, Lock, FileDigit, CheckCircle } from 'lucide-react';

const Register = () => {
    const [role, setRole] = useState('CLIENT');
    const [step, setStep] = useState(1); // 1: Info, 2: OTP
    const [formData, setFormData] = useState({
        username: '', password: '', email: '', phone: '', ref_id: ''
    });
    const [otp, setOtp] = useState('');
    const [mockOtpDisplay, setMockOtpDisplay] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = { ...formData, role };
            if (role === 'CLIENT') delete payload.ref_id;

            const res = await api.post('auth/register/', payload);
            setMockOtpDisplay(res.data.mock_otp); // For testing
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Registration failed');
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('auth/verify-otp/', { username: formData.username, otp });
            navigate('/login');
        } catch (err) {
            setError('Invalid OTP');
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
                    Join HD Bank
                </h2>

                {step === 1 ? (
                    <>
                        <div className="flex justify-center mb-8 bg-gray-200 rounded-full p-1">
                            <button
                                onClick={() => setRole('CLIENT')}
                                className={`flex-1 py-2 px-6 rounded-full font-medium transition ${role === 'CLIENT' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                            >
                                Client
                            </button>
                            <button
                                onClick={() => setRole('EMPLOYEE')}
                                className={`flex-1 py-2 px-6 rounded-full font-medium transition ${role === 'EMPLOYEE' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                            >
                                Employee
                            </button>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            {error && <div className="bg-red-50 text-red-500 p-3 rounded text-sm break-words">{error}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Username</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User size={16} /></div>
                                        <input type="text" required className="block w-full pl-10 border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm py-2"
                                            value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Phone size={16} /></div>
                                        <input type="text" className="block w-full pl-10 border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm py-2"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail size={16} /></div>
                                    <input type="email" required className="block w-full pl-10 border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm py-2"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Lock size={16} /></div>
                                    <input type="password" required className="block w-full pl-10 border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm py-2"
                                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                            </div>

                            {role === 'EMPLOYEE' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reference ID</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FileDigit size={16} /></div>
                                        <input type="text" required className="block w-full pl-10 border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm py-2"
                                            placeholder="Ask your manager for a code"
                                            value={formData.ref_id} onChange={e => setFormData({ ...formData, ref_id: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                Register
                            </button>
                        </form>
                    </>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-6 text-center">
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">OTP Sent!</strong>
                            <span className="block sm:inline"> For demo purposes, your OTP is: <strong>{mockOtpDisplay}</strong></span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                            <input type="text" required className="block w-full text-center tracking-[1em] text-2xl font-mono border-gray-300 rounded-md focus:ring-primary focus:border-primary py-2"
                                maxLength={6}
                                value={otp} onChange={e => setOtp(e.target.value)} />
                        </div>

                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Verify
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Register;
