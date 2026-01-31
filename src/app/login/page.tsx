'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Lock, AtSign, ChevronRight, Check } from 'lucide-react';

export default function AuthPage() {
    const router = useRouter();
    const [isLoginMode, setIsLoginMode] = useState(true);

    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass] = useState('');

    // Sign Up State
    const [signupStep, setSignupStep] = useState(1);
    const [signupData, setSignupData] = useState({
        email: '',
        password: '',
        handle: '',
        interests: [] as string[]
    });

    const INTEREST_OPTIONS = ['Gaming', 'Food', 'Startups', 'Rants', 'Sports', 'Anime'];

    // --- 1. REAL LOGIN LOGIC ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPass }),
            });

            if (res.ok) {
                const userData = await res.json();
                // Save session locally
                localStorage.setItem('yak_user', JSON.stringify(userData));
                router.push('/');
            } else {
                alert("Invalid credentials! (If this is a new account, did you Sign Up first?)");
            }
        } catch (err) {
            alert("Server connection failed. Is the terminal running?");
        }
    };

    // --- 2. SIGN UP WIZARD LOGIC ---
    const handleSignupNext = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        // Simple validation
        if (signupStep === 1 && !signupData.email.includes('.edu')) {
            return alert("You must use a valid .edu email address to join a campus!");
        }
        setSignupStep(prev => prev + 1);
    };

    const toggleInterest = (interest: string) => {
        if (signupData.interests.includes(interest)) {
            setSignupData({ ...signupData, interests: signupData.interests.filter(i => i !== interest) });
        } else {
            setSignupData({ ...signupData, interests: [...signupData.interests, interest] });
        }
    };

    // --- 3. REAL SIGN UP SUBMISSION ---
    const completeSignup = async () => {
        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupData)
            });

            if (res.ok) {
                alert("Account created successfully! Please login.");

                // Switch to Login Mode and pre-fill credentials for speed
                setIsLoginMode(true);
                setLoginEmail(signupData.email);
                setLoginPass(signupData.password);
            } else {
                const err = await res.json();
                alert("Error: " + err.error);
            }
        } catch (e) {
            alert("Server error during signup.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                {/* Header Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setIsLoginMode(true)}
                        className={`flex-1 py-4 font-bold text-sm ${isLoginMode ? 'text-yak-teal border-b-2 border-yak-teal bg-gray-50' : 'text-gray-400'}`}
                    >
                        LOGIN
                    </button>
                    <button
                        onClick={() => setIsLoginMode(false)}
                        className={`flex-1 py-4 font-bold text-sm ${!isLoginMode ? 'text-yak-teal border-b-2 border-yak-teal bg-gray-50' : 'text-gray-400'}`}
                    >
                        SIGN UP
                    </button>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <Shield className="w-12 h-12 text-yak-teal mx-auto mb-2" />
                        <h2 className="text-2xl font-black text-gray-800">
                            {isLoginMode ? 'Welcome Back' : 'Join the Herd'}
                        </h2>
                    </div>

                    {/* LOGIN FORM */}
                    {isLoginMode ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="relative">
                                <AtSign className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="email" placeholder="student@a.edu.in" required
                                    className="w-full pl-10 p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-yak-teal outline-none"
                                    value={loginEmail}
                                    onChange={e => setLoginEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="password" placeholder="Password" required
                                    className="w-full pl-10 p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-yak-teal outline-none"
                                    value={loginPass}
                                    onChange={e => setLoginPass(e.target.value)}
                                />
                            </div>
                            <button className="w-full bg-yak-teal text-white font-bold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-yak-teal/20">
                                Login
                            </button>

                            {/* Helper text for the demo */}
                            <div className="text-[10px] text-gray-400 text-center mt-4 bg-gray-50 p-2 rounded border border-gray-100">
                                <p><b>Mod:</b> mod@a.edu.in / admin</p>
                                <p><b>Student:</b> student@a.edu.in / 123</p>
                                <p><b>Spy:</b> spy@b.edu.in / 123</p>
                            </div>
                        </form>
                    ) : (
                        /* SIGNUP WIZARD */
                        <div className="space-y-6">
                            {signupStep === 1 && (
                                <form onSubmit={handleSignupNext} className="space-y-4">
                                    <div className="relative">
                                        <AtSign className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input type="email" placeholder="University Email (.edu)" required className="w-full pl-10 p-3 bg-gray-50 rounded-lg border outline-none" onChange={e => setSignupData({ ...signupData, email: e.target.value })} />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input type="password" placeholder="Create Password" required className="w-full pl-10 p-3 bg-gray-50 rounded-lg border outline-none" onChange={e => setSignupData({ ...signupData, password: e.target.value })} />
                                    </div>
                                    <button className="w-full bg-yak-teal text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition">
                                        Next Step <ChevronRight size={16} />
                                    </button>
                                </form>
                            )}

                            {signupStep === 2 && (
                                <form onSubmit={handleSignupNext} className="space-y-4">
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input type="text" placeholder="Pick a Handle" required className="w-full pl-10 p-3 bg-gray-50 rounded-lg border outline-none" onChange={e => setSignupData({ ...signupData, handle: e.target.value })} />
                                    </div>
                                    <button className="w-full bg-yak-teal text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition">
                                        Next Step <ChevronRight size={16} />
                                    </button>
                                </form>
                            )}

                            {signupStep === 3 && (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {INTEREST_OPTIONS.map(topic => (
                                            <button
                                                key={topic}
                                                onClick={() => toggleInterest(topic)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${signupData.interests.includes(topic) ? 'bg-yak-teal text-white' : 'bg-white text-gray-500'
                                                    }`}
                                            >
                                                {topic} {signupData.interests.includes(topic) && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={completeSignup} className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl mt-4 hover:bg-gray-900 transition">
                                        Finish & Enter Campus
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}