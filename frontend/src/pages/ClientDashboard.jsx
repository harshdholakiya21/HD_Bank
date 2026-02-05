import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Copy } from 'lucide-react';

const ClientDashboard = () => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('client/dashboard/');
                setUserData(res.data);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) navigate('/login');
            }
        };
        fetchDashboard();
    }, [navigate]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (!userData) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl shadow-xl text-white">
                    <div>
                        <h2 className="text-3xl font-bold">Hello, {userData.username}</h2>
                        <p className="text-blue-200 mt-1">Welcome back to HD Bank</p>
                    </div>
                </div>

                {/* Total Balance */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Balance</p>
                    <h3 className="text-4xl font-extrabold text-blue-900 mt-2">${userData.total_balance}</h3>
                </div>

                {/* Accounts List */}
                <h3 className="text-xl font-bold text-gray-800">Your Accounts</h3>
                <div className="grid gap-6 md:grid-cols-2">
                    {userData.accounts && userData.accounts.map((acc, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-blue-600 relative overflow-hidden group hover:shadow-lg transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <CreditCard size={24} />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Savings</span>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">Account Number</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-lg font-bold text-gray-800 tracking-wider">
                                        {acc.account_number}
                                    </span>
                                    <button onClick={() => copyToClipboard(acc.account_number)} className="text-gray-400 hover:text-blue-600 transition">
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Available Balance</p>
                                    <p className="text-2xl font-bold text-gray-900">${acc.balance}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
