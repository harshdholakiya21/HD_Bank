import { useEffect, useState } from 'react';
import api from '../api';
import { CreditCard, DollarSign, Activity, Copy } from 'lucide-react';

const ClientDashboard = () => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await api.get('client/dashboard/');
                setAccount(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAccount();
    }, []);

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Account</h1>

            {account ? (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-primary to-blue-800 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <DollarSign size={128} />
                        </div>
                        <h2 className="text-xl font-medium mb-4 text-blue-200">Total Balance</h2>
                        <div className="text-5xl font-bold mb-8">
                            ${parseFloat(account.balance).toLocaleString()}
                        </div>
                        <div className="flex items-center space-x-2 text-blue-200">
                            <CreditCard size={20} />
                            <span>**** **** **** {account.account_number.slice(-4)}</span>
                            <button
                                onClick={() => navigator.clipboard.writeText(account.account_number)}
                                className="ml-2 p-1 hover:bg-white/10 rounded transition"
                                title="Copy full account number"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                            <Activity className="mr-2 text-primary" /> Recent Activity
                        </h2>
                        <p className="text-gray-500 italic">No recent transactions.</p>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-700 mb-2">Account Details</h3>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Account Number</span>
                                <span className="font-mono text-gray-900">{account.account_number}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Account Type</span>
                                <span className="text-gray-900">Savings</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl shadow">
                    <p className="text-gray-500 text-lg">No account found. Please contact support.</p>
                </div>
            )}
        </div>
    );
};

export default ClientDashboard;
