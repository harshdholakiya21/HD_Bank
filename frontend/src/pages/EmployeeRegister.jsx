import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Hash, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const EmployeeRegister = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '', email: '', phone: '', password: '', confirm_password: '', ref_id: '', otp_channel: 'email', otp: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match");
            return;
        }

        try {
            const res = await api.post('auth/employee-register/', {
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                confirm_password: formData.confirm_password,
                ref_id: formData.ref_id,
                otp_channel: formData.otp_channel
            });
            setSuccess(res.data.message || 'OTP Sent!');
            if (res.data.mock_otp) {
                // Dev helper
                setFormData(prev => ({ ...prev, otp: res.data.mock_otp }));
            }
            setTimeout(() => {
                setSuccess('');
                setStep(2);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Registration failed');
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('auth/employee-verify/', {
                username: formData.username,
                otp: formData.otp
            });
            setSuccess('Verification Successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed');
        }
    }

    const renderStep1_Register = () => (
        <form onSubmit={handleRegister} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input type="password" placeholder="Password" required
                        className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input type="password" placeholder="Confirm" required
                        className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.confirm_password} onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                    />
                </div>
            </div>

            <div className="relative">
                <label className="text-sm text-gray-600 block mb-1">Send OTP via:</label>
                <select
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.otp_channel} onChange={e => setFormData({ ...formData, otp_channel: e.target.value })}
                >
                    <option value="email">Email</option>
                    <option value="phone">Phone (SMS)</option>
                </select>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition flex justify-center items-center">
                Register & Send OTP <ArrowRight size={16} className="ml-2" />
            </button>
        </form>
    );

    const renderStep2_Verify = () => (
        <form onSubmit={handleVerify} className="space-y-6">
            <div className="text-center mb-4">
                <p className="text-sm text-gray-600">Enter the OTP sent to your {formData.otp_channel}.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">One-Time Password (OTP)</label>
                <input type="text" required
                    className="block w-full text-center tracking-widest text-2xl border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2 mt-1"
                    placeholder="123456"
                    value={formData.otp}
                    onChange={e => setFormData({ ...formData, otp: e.target.value })}
                />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition">
                Verify & Activate <CheckCircle size={16} className="ml-2" />
            </button>
            <button type='button' onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2">Back to Details</button>
        </form>
    );

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Employee Registration</h2>
                    <p className="mt-2 text-sm text-gray-500">Restricted access for bank staff only</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex gap-2 mb-4">
                        <AlertCircle size={18} className="shrink-0" /> {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex gap-2 mb-4">
                        <CheckCircle size={18} className="shrink-0" /> {success}
                    </div>
                )}

                {step === 1 && renderStep1_Register()}
                {step === 2 && renderStep2_Verify()}

                <div className="mt-6 text-center text-sm text-gray-600">
                    Not an employee? <Link to="/register" className="text-blue-600 hover:underline">One-Time Activation</Link> or <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default EmployeeRegister;
