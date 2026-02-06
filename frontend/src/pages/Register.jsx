import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Phone, Mail, Lock, CheckCircle, AlertCircle, ArrowRight, User as UserIcon } from 'lucide-react';

const Register = () => {
    // Step 1: Register (Get Account Num)
    // Step 2: Show Account Number (Confirmation)
    // Step 3: Init Activation (Send OTP)
    // Step 4: Complete Activation (Set Password)
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '', account_number: '', phone: '', email: '', otp: '', password: '', confirm_password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Step 1: Register New Client
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('auth/register/', {
                username: formData.username,
                email: formData.email,
                phone: formData.phone
            });
            // Success: We get account_number
            setSuccess(res.data.message);
            if (res.data.account_number) {
                setFormData(prev => ({ ...prev, account_number: res.data.account_number }));
            }
            setTimeout(() => {
                setSuccess('');
                setStep(2); // Move to Account Display
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Registration failed.');
        }
    };

    // Step 3: Trigger Activation (OTP)
    const handleInitActivation = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('auth/client-init-activation/', {
                account_number: formData.account_number,
                phone: formData.phone,
                email: formData.email
            });
            setSuccess(res.data.message || 'OTP sent!');
            if (res.data.mock_otp) setFormData(prev => ({ ...prev, otp: res.data.mock_otp }));
            setTimeout(() => {
                setSuccess('');
                setStep(4); // Move to Set Password (skipping manual OTP step if we merge them, but let's keep logic distinct)
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Verification failed.');
        }
    };

    // Step 4: Set Password
    const handleCompleteActivation = async (e) => {
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

    const renderStep1_Register = () => (
        <form onSubmit={handleRegister} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <UserIcon size={18} />
                    </div>
                    <input type="text" required
                        className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2"
                        placeholder="Your Name"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
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
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
                Register <ArrowRight size={16} className="ml-2" />
            </button>
        </form>
    );

    const renderStep2_Confirmation = () => (
        <div className="text-center space-y-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Registration Successful!</h3>
                <p className="mt-2 text-sm text-gray-500">Your specific Account Number is:</p>
                <p className="mt-4 text-3xl font-bold text-blue-600 tracking-wider font-mono select-all">
                    {formData.account_number}
                </p>
                <p className="mt-4 text-xs text-gray-400">Please save this number. You will need it to login.</p>
            </div>
            <button onClick={() => setStep(3)} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
                Proceed to Activation <ArrowRight size={16} className="ml-2" />
            </button>
        </div>
    );

    const renderStep3_InitActivation = () => (
        <form onSubmit={handleInitActivation} className="space-y-6">
            <div className="text-center mb-4">
                <p className="text-sm text-gray-600">Verify your details to set up security.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input type="text" readOnly
                    className="block w-full bg-gray-50 border-gray-300 rounded-md sm:text-sm py-2 px-3 text-gray-500 cursor-not-allowed"
                    value={formData.account_number}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Verify Email</label>
                <input type="email" required readOnly
                    className="block w-full bg-gray-50 border-gray-300 rounded-md sm:text-sm py-2 px-3 text-gray-500"
                    value={formData.email}
                />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
                Send OTP <ArrowRight size={16} className="ml-2" />
            </button>
        </form>
    );

    const renderStep4_SetPassword = () => (
        <form onSubmit={handleCompleteActivation} className="space-y-6">
            <div className="text-center mb-4">
                <p className="text-sm text-gray-600">Enter the OTP sent to your phone/email.</p>
                <p className="text-xs text-gray-400">(Mock OTP: 123456)</p>
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
            <div>
                <label className="block text-sm font-medium text-gray-700">Set Password</label>
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
                Complete Registration <CheckCircle size={16} className="ml-2" />
            </button>
        </form>
    );

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Open an Account
                    </h2>
                    <div className="flex justify-center mt-4 mb-2">
                        {/* Simple dots indicator */}
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`h-2 w-full rounded-full mr-1 ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 1 && "Start your journey."}
                        {step === 2 && "Save your details."}
                        {step === 3 && "Verify identity."}
                        {step === 4 && "Secure account."}
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

                {step === 1 && renderStep1_Register()}
                {step === 2 && renderStep2_Confirmation()}
                {step === 3 && renderStep3_InitActivation()}
                {step === 4 && renderStep4_SetPassword()}

                <div className="text-center mt-6 text-sm text-gray-600">
                    Already registered? <Link to="/login" className="text-blue-600 hover:underline font-medium">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
