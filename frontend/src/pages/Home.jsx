import { ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)]">
            {/* Hero Section */}
            <header className="bg-gradient-to-r from-primary to-blue-900 text-white py-24">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                        Banking for the <span className="text-accent">Future</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
                        Secure, fast, and professional banking solutions for individuals and businesses. Join HD Bank today.
                    </p>
                    <Link to="/register" className="bg-accent hover:bg-yellow-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition transform hover:scale-105 inline-block">
                        Open an Account
                    </Link>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div className="p-8 rounded-2xl bg-gray-50 hover:shadow-xl transition duration-300">
                            <div className="flex justify-center mb-6 text-primary">
                                <ShieldCheck size={64} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Secure Transactions</h3>
                            <p className="text-gray-600">State-of-the-art encryption to keep your money and data safe.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gray-50 hover:shadow-xl transition duration-300">
                            <div className="flex justify-center mb-6 text-primary">
                                <TrendingUp size={64} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Invest & Grow</h3>
                            <p className="text-gray-600">Maximize your savings with our competitive interest rates.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gray-50 hover:shadow-xl transition duration-300">
                            <div className="flex justify-center mb-6 text-primary">
                                <Users size={64} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Dedicated Support</h3>
                            <p className="text-gray-600">Our support team is here for you 24/7 for all your banking needs.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
