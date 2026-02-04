import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
    Users, Home, Search, DollarSign, UserCog,
    ArrowUpCircle, ArrowDownCircle, Check, AlertCircle, Copy, UserPlus
} from 'lucide-react';

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(user.role === 'MANAGER' ? 'home' : 'clients');

    // Stats State
    const [stats, setStats] = useState({ total_balance: '0.00' });

    // Employee List State
    const [employees, setEmployees] = useState([]);
    const [generatedRef, setGeneratedRef] = useState(null);

    // Client Management State
    const [searchAccount, setSearchAccount] = useState('');
    const [clientData, setClientData] = useState(null);
    const [clientError, setClientError] = useState('');
    const [clientList, setClientList] = useState([]);

    // Forms
    const [detailsForm, setDetailsForm] = useState({ username: '', email: '', phone: '' });
    const [transForm, setTransForm] = useState({ amount: '', type: 'DEPOSIT' });
    const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

    // Create Client State
    const [createClientForm, setCreateClientForm] = useState({
        username: '', email: '', phone: '', password: '', initial_balance: ''
    });
    const [createSuccess, setCreateSuccess] = useState('');
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        if (activeTab === 'home') fetchStats();
        if (activeTab === 'employees') fetchEmployees();
        if (activeTab === 'client-list') fetchClientList();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await api.get('manager/stats/');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('manager/users/?role=EMPLOYEE');
            setEmployees(res.data);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    };

    const fetchClientList = async () => {
        try {
            const res = await api.get('manager/users/?role=CLIENT');
            setClientList(res.data);
        } catch (err) {
            console.error("Failed to fetch clients", err);
        }
    };

    const generateRef = async () => {
        try {
            const res = await api.post('manager/generate-ref/');
            setGeneratedRef(res.data.code);
        } catch (err) {
            console.error(err);
        }
    };

    const createClient = async (e) => {
        e.preventDefault();
        setCreateSuccess('');
        setCreateError('');
        try {
            const res = await api.post('manager/create-client/', createClientForm);
            setCreateSuccess(`Client created! Account: ${res.data.account}`);
            setCreateClientForm({ username: '', email: '', phone: '', password: '', initial_balance: '' });
        } catch (err) {
            setCreateError('Failed to create client. ' + JSON.stringify(err.response?.data || {}));
        }
    };

    const searchClient = async (e) => {
        e.preventDefault();
        setClientError('');
        setClientData(null);
        setActionMsg({ type: '', text: '' });
        try {
            const res = await api.get(`manager/client-detail/?account_number=${searchAccount}`);
            setClientData(res.data);
            setDetailsForm({
                username: res.data.username,
                email: res.data.email,
                phone: res.data.phone
            });
        } catch (err) {
            setClientError('Client not found or invalid account number.');
        }
    };

    const updateClient = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...detailsForm, account_number: clientData.account_number };
            const res = await api.post('manager/update-client-details/', payload);
            setClientData({ ...clientData, ...detailsForm }); // Optimistic update
            setActionMsg({ type: 'success', text: 'Client details updated successfully.' });
        } catch (err) {
            setActionMsg({ type: 'error', text: 'Failed to update details.' });
        }
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                account_number: clientData.account_number,
                amount: transForm.amount,
                transaction_type: transForm.type
            };
            const res = await api.post('manager/update-balance/', payload);
            setClientData({ ...clientData, balance: res.data.new_balance });
            setActionMsg({ type: 'success', text: `${transForm.type} successful. New Balance: ${res.data.new_balance}` });
            setTransForm({ amount: '', type: 'DEPOSIT' });
        } catch (err) {
            setActionMsg({ type: 'error', text: err.response?.data?.error || 'Transaction failed.' });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    {user.role === 'MANAGER' ? 'Manager Dashboard' : 'Employee Dashboard'}
                </h1>
                <p className="text-gray-500">Welcome, {user.username}</p>
            </header>

            {/* Navigation Tabs */}
            <div className="flex space-x-4 mb-8 border-b overflow-x-auto">
                {user.role === 'MANAGER' && (
                    <>
                        <button
                            onClick={() => setActiveTab('home')}
                            className={`pb-2 px-4 flex items-center space-x-2 ${activeTab === 'home' ? 'border-b-2 border-primary text-primary font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Home size={20} /> <span>Home</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('employees')}
                            className={`pb-2 px-4 flex items-center space-x-2 ${activeTab === 'employees' ? 'border-b-2 border-primary text-primary font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Users size={20} /> <span>Employees</span>
                        </button>
                    </>
                )}
                <button
                    onClick={() => setActiveTab('clients')}
                    className={`pb-2 px-4 flex items-center space-x-2 ${activeTab === 'clients' ? 'border-b-2 border-primary text-primary font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <UserCog size={20} /> <span>Client Management</span>
                </button>
                <button
                    onClick={() => setActiveTab('client-list')}
                    className={`pb-2 px-4 flex items-center space-x-2 ${activeTab === 'client-list' ? 'border-b-2 border-primary text-primary font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Users size={20} /> <span>Client List</span>
                </button>
                <button
                    onClick={() => setActiveTab('create-client')}
                    className={`pb-2 px-4 flex items-center space-x-2 ${activeTab === 'create-client' ? 'border-b-2 border-primary text-primary font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <UserPlus size={20} /> <span>New Client</span>
                </button>
            </div>

            {/* CONTENT AREA */}
            <div className="min-h-[400px]">

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-white/20 rounded-full">
                                    <DollarSign size={32} />
                                </div>
                                <div className="">
                                    <p className="text-blue-100 text-sm font-medium">Total Bank Holdings</p>
                                    <h2 className="text-3xl font-bold">${stats.total_balance}</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* EMPLOYEES TAB */}
                {activeTab === 'employees' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Employee Directory</h2>
                            <button onClick={generateRef} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                                <Users size={18} /> Generate Join Code
                            </button>
                        </div>

                        {generatedRef && (
                            <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg flex justify-between items-center animate-pulse">
                                <div>
                                    <p className="text-xs text-blue-600 uppercase font-bold">New Reference Code</p>
                                    <p className="text-2xl font-mono font-bold text-gray-800">{generatedRef}</p>
                                </div>
                                <button onClick={() => navigator.clipboard.writeText(generatedRef)} className="text-blue-500 hover:text-blue-700">
                                    <Copy size={20} />
                                </button>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm">
                                    <tr>
                                        <th className="p-3">Username</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Phone</th>
                                        <th className="p-3">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {employees.map(emp => (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            <td className="p-3 font-medium">{emp.username}</td>
                                            <td className="p-3 text-gray-600">{emp.email}</td>
                                            <td className="p-3 text-gray-600">{emp.phone || '-'}</td>
                                            <td className="p-3"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{emp.role}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CLIENTS TAB */}
                {activeTab === 'clients' && (
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Search Section */}
                        <div className="md:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Search size={20} className="text-gray-400" /> Find Client
                                </h3>
                                <form onSubmit={searchClient} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. HD12345678"
                                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                            value={searchAccount}
                                            onChange={e => setSearchAccount(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-gray-900 text-white py-2.5 rounded-lg hover:bg-black transition font-medium">
                                        Search
                                    </button>
                                </form>
                                {clientError && (
                                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm">
                                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                        {clientError}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Workspace Section */}
                        <div className="md:col-span-2">
                            {!clientData ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-12">
                                    <UserCog size={48} className="mb-4 opacity-50" />
                                    <p>Search for a client to manage their account</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Client Header */}
                                    <div className="bg-white rounded-xl shadow-sm border p-6 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-bold">{clientData.username}</h2>
                                            <p className="text-gray-500 font-mono text-sm">{clientData.account_number}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Current Balance</p>
                                            <p className="text-3xl font-bold text-green-600">${clientData.balance}</p>
                                        </div>
                                    </div>

                                    {/* Action Feedback */}
                                    {actionMsg.text && (
                                        <div className={`p-4 rounded-lg flex items-center gap-2 ${actionMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {actionMsg.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                                            {actionMsg.text}
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Edit Details */}
                                        <div className="bg-white rounded-xl shadow-sm border p-6">
                                            <h3 className="font-bold mb-4 border-b pb-2">Edit Details</h3>
                                            <form onSubmit={updateClient} className="space-y-4">
                                                <input
                                                    type="text" placeholder="Username"
                                                    value={detailsForm.username} onChange={e => setDetailsForm({ ...detailsForm, username: e.target.value })}
                                                    className="w-full border rounded p-2 text-sm"
                                                />
                                                <input
                                                    type="email" placeholder="Email"
                                                    value={detailsForm.email} onChange={e => setDetailsForm({ ...detailsForm, email: e.target.value })}
                                                    className="w-full border rounded p-2 text-sm"
                                                />
                                                <input
                                                    type="text" placeholder="Phone"
                                                    value={detailsForm.phone} onChange={e => setDetailsForm({ ...detailsForm, phone: e.target.value })}
                                                    className="w-full border rounded p-2 text-sm"
                                                />
                                                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">Update Profile</button>
                                            </form>
                                        </div>

                                        {/* Transactions */}
                                        <div className="bg-white rounded-xl shadow-sm border p-6">
                                            <h3 className="font-bold mb-4 border-b pb-2">Transactions</h3>
                                            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                                                <button
                                                    onClick={() => setTransForm({ ...transForm, type: 'DEPOSIT' })}
                                                    className={`flex-1 py-1.5 text-sm rounded-md font-medium transition ${transForm.type === 'DEPOSIT' ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}
                                                >
                                                    Deposit
                                                </button>
                                                <button
                                                    onClick={() => setTransForm({ ...transForm, type: 'WITHDRAW' })}
                                                    className={`flex-1 py-1.5 text-sm rounded-md font-medium transition ${transForm.type === 'WITHDRAW' ? 'bg-white shadow text-red-700' : 'text-gray-500'}`}
                                                >
                                                    Withdraw
                                                </button>
                                            </div>

                                            <form onSubmit={handleTransaction} className="space-y-4">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                                    <input
                                                        type="number" step="0.01" placeholder="0.00" required
                                                        value={transForm.amount} onChange={e => setTransForm({ ...transForm, amount: e.target.value })}
                                                        className="w-full border rounded p-2 pl-7"
                                                    />
                                                </div>
                                                <button
                                                    className={`w-full py-2 rounded text-white font-medium ${transForm.type === 'DEPOSIT' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                                >
                                                    {transForm.type === 'DEPOSIT' ? <span className="flex items-center justify-center gap-2"><ArrowDownCircle size={18} /> Deposit Funds</span> : <span className="flex items-center justify-center gap-2"><ArrowUpCircle size={18} /> Withdraw Funds</span>}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* CLIENT LIST TAB */}
                {activeTab === 'client-list' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold mb-6">Client Directory</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm">
                                    <tr>
                                        <th className="p-3">Account</th>
                                        <th className="p-3">Username</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Phone</th>
                                        <th className="p-3">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {clientList.map(client => (
                                        <tr key={client.id} className="hover:bg-gray-50">
                                            <td className="p-3 font-mono text-xs">
                                                {client.account_number ? (
                                                    <div className="flex items-center space-x-2">
                                                        <span>{client.account_number}</span>
                                                        <button
                                                            onClick={() => navigator.clipboard.writeText(client.account_number)}
                                                            className="text-gray-400 hover:text-blue-600"
                                                            title="Copy Account Number"
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                ) : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="p-3 font-medium">{client.username}</td>
                                            <td className="p-3 text-gray-600">{client.email}</td>
                                            <td className="p-3 text-gray-600">{client.phone || '-'}</td>
                                            <td className="p-3"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{client.role}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CREATE CLIENT TAB */}
                {activeTab === 'create-client' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl shadow-lg border p-8">
                            <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                    <UserPlus size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Register New Client</h2>
                            </div>

                            {createSuccess && (
                                <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2">
                                    <Check size={20} /> {createSuccess}
                                </div>
                            )}
                            {createError && (
                                <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
                                    <AlertCircle size={20} /> {createError}
                                </div>
                            )}

                            <form onSubmit={createClient} className="space-y-5">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                        <input type="text" required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={createClientForm.username} onChange={e => setCreateClientForm({ ...createClientForm, username: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={createClientForm.email} onChange={e => setCreateClientForm({ ...createClientForm, email: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input type="text" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={createClientForm.phone} onChange={e => setCreateClientForm({ ...createClientForm, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Initial Deposit ($)</label>
                                        <input type="number" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={createClientForm.initial_balance} onChange={e => setCreateClientForm({ ...createClientForm, initial_balance: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input type="password" required className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={createClientForm.password} onChange={e => setCreateClientForm({ ...createClientForm, password: e.target.value })} />
                                </div>

                                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md mt-4">
                                    Create Client Account
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;
