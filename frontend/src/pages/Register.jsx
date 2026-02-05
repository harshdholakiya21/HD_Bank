import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Phone, Mail, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        account_number: '', phone: '', email: '', otp: '', password: '', confirm_password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleStep1 = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Updated endpoint
            const res = await api.post('auth/client-init-activation/', {
                account_number: formData.account_number,
                phone: formData.phone,
                email: formData.email
            });
            setSuccess(res.data.message || 'OTP sent!');
            // Pre-fill mock OTP if provided (dev only)
            if (res.data.mock_otp) setFormData(prev => ({ ...prev, otp: res.data.mock_otp }));
            setTimeout(() => {
                setSuccess('');
                setStep(2);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Verification failed. details mismatch.');
        }
    };

    const handleStep2 = (e) => {
        e.preventDefault();
        setError('');
        // Identify valid OTP length/value if possible
        if (formData.otp.length < 4) {
            setError("Invalid OTP");
            return;
        }
        setStep(3);
    };

    const handleStep3 = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }
        try {
            await api.post('auth/client-complete-activation/', {
                account_number: formData.account_number,
                otp: formData.otp,
                password: formData.password,
                confirm_password: formData.confirm_password
            });
            setSuccess('Activation successful! You can now login.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.detail || 'Activation failed.');
        }
    };

    const renderStep1 = () => (
        <form onSubmit={handleStep1} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <CreditCard size={18} />
                    </div>
                    <input type="text" required
                        className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2"
                        placeholder="HD..."
                        value={formData.account_number}
                        onChange={e => setFormData({ ...formData, account_number: e.target.value })}
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Phone size={18} />
                    </div>
                    <input type="text" required
                        className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Mail size={18} />
                    </div>
                    <input type="email" required
                        className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
                Verify Account <ArrowRight size={16} className="ml-2" />
            </button>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleStep2} className="space-y-6">
            <div className="text-center mb-4">
                <p className="text-sm text-gray-600">Enter the OTP sent to your phone/email.</p>
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
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
                Verify OTP <ArrowRight size={16} className="ml-2" />
            </button>
            <button type='button' onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2">Back</button>
        </form>
    );

    const renderStep3 = () => (
        <form onSubmit={handleStep3} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Set New Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Lock size={18} />
                    </div>
                    <input type="password" required
                        className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2"
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
                        className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2"
                        value={formData.confirm_password}
                        onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                    />
                </div>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition">
                Complete Activation <CheckCircle size={16} className="ml-2" />
            </button>
        </form>
    );

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Activate Online Banking
                    </h2>
                    <div className="flex justify-center mt-4 mb-2">
                        <div className={`h-2 w-full rounded-full mr-1 ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className={`h-2 w-full rounded-full mr-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className={`h-2 w-full rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 1 && "Enter account details."}
                        {step === 2 && "Enter verification code."}
                        {step === 3 && "Secure your account."}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded text-sm flex items-start gap-2 mb-4">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 text-green-700 p-3 rounded text-sm flex items-center gap-2 mb-4">
                        <CheckCircle size={18} />
                        <span>{success}</span>
                    </div>
                )}

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                <div className="text-center mt-6 text-sm text-gray-600">
                    Already registered? <Link to="/login" className="text-blue-600 hover:underline font-medium">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
