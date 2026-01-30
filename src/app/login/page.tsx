'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ChevronRight, Check, User, Lock, AtSign } from 'lucide-react';

// --- MOCK DATABASE ---
const MOCK_DB: Record<string, any> = {
    'owner@a.edu.in': {
        password: 'god',
        handle: 'The-Creator',
        campus: 'school_a',
        role: 'OWNER',
        interests: [],
        moderatedCommunities: ['ALL']
    },
    'mod@a.edu.in': {
        password: 'admin',
        handle: 'Gaming-Warden',
        campus: 'school_a',
        role: 'MODERATOR',
        interests: ['Gaming'],
        moderatedCommunities: ['c2'] // c2 is Gaming
    },
    'student@a.edu.in': {
        password: '123',
        handle: 'Chill-Guy',
        campus: 'school_a',
        role: 'STUDENT',
        interests: ['Gaming', 'Food'],
        moderatedCommunities: []
    }
};

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

    // --- LOGIN LOGIC ---
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = MOCK_DB[loginEmail];

        if (user && user.password === loginPass) {
            // FIX IS HERE: We were missing the 'moderatedCommunities' line!
            localStorage.setItem('yak_user', JSON.stringify({
                email: loginEmail,
                handle: user.handle,
                campus: user.campus,
                role: user.role,
                interests: user.interests,
                moderatedCommunities: user.moderatedCommunities // <--- THE MISSING LINK
            }));
            router.push('/');
        } else {
            alert("Invalid credentials!");
        }
    };

    // --- SIGN UP LOGIC ---
    const handleSignupNext = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!signupData.email.includes('.edu')) return alert("Must use .edu email!");
        setSignupStep(prev => prev + 1);
    };

    const toggleInterest = (interest: string) => {
        if (signupData.interests.includes(interest)) {
            setSignupData({ ...signupData, interests: signupData.interests.filter(i => i !== interest) });
        } else {
            setSignupData({ ...signupData, interests: [...signupData.interests, interest] });
        }
    };

    const completeSignup = () => {
        const campus = signupData.email.includes('@b.edu') ? 'school_b' : 'school_a';
        const newUser = {
            email: signupData.email,
            handle: signupData.handle || 'Anonymous',
            campus: campus,
            role: 'STUDENT',
            interests: ['General', ...signupData.interests],
            moderatedCommunities: [] // Students have no power
        };

        localStorage.setItem('yak_user', JSON.stringify(newUser));
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                {/* Toggle Header */}
                <div className="flex border-b border-gray-100">
                    <button onClick={() => setIsLoginMode(true)} className={`flex-1 py-4 font-bold text-sm ${isLoginMode ? 'text-yak-teal border-b-2 border-yak-teal' : 'text-gray-400'}`}>LOGIN</button>
                    <button onClick={() => setIsLoginMode(false)} className={`flex-1 py-4 font-bold text-sm ${!isLoginMode ? 'text-yak-teal border-b-2 border-yak-teal' : 'text-gray-400'}`}>SIGN UP</button>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <Shield className="w-12 h-12 text-yak-teal mx-auto mb-2" />
                        <h2 className="text-2xl font-black text-gray-800">{isLoginMode ? 'Welcome Back' : 'Join the Herd'}</h2>
                    </div>

                    {/* LOGIN FORM */}
                    {isLoginMode ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="email" placeholder="Email" required className="w-full p-3 bg-gray-50 rounded-lg border focus:border-yak-teal outline-none" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                            <input type="password" placeholder="Password" required className="w-full p-3 bg-gray-50 rounded-lg border focus:border-yak-teal outline-none" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
                            <button className="w-full bg-yak-teal text-white font-bold py-3 rounded-xl hover:opacity-90 transition">Login</button>
                        </form>
                    ) : (
                        /* SIGNUP WIZARD */
                        <div className="space-y-6">
                            {signupStep === 1 && (
                                <form onSubmit={handleSignupNext} className="space-y-4">
                                    <input type="email" placeholder="Email (.edu)" required className="w-full p-3 bg-gray-50 rounded-lg border focus:border-yak-teal outline-none" onChange={e => setSignupData({ ...signupData, email: e.target.value })} />
                                    <input type="password" placeholder="Password" required className="w-full p-3 bg-gray-50 rounded-lg border focus:border-yak-teal outline-none" onChange={e => setSignupData({ ...signupData, password: e.target.value })} />
                                    <button className="w-full bg-yak-teal text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">Next <ChevronRight size={16} /></button>
                                </form>
                            )}
                            {signupStep === 2 && (
                                <form onSubmit={handleSignupNext} className="space-y-4">
                                    <input type="text" placeholder="Handle (e.g. Sneaky-Ninja)" required className="w-full p-3 bg-gray-50 rounded-lg border focus:border-yak-teal outline-none" onChange={e => setSignupData({ ...signupData, handle: e.target.value })} />
                                    <button className="w-full bg-yak-teal text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">Next <ChevronRight size={16} /></button>
                                </form>
                            )}
                            {signupStep === 3 && (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {INTEREST_OPTIONS.map(topic => (
                                            <button key={topic} onClick={() => toggleInterest(topic)} className={`px-4 py-2 rounded-full text-xs font-bold border ${signupData.interests.includes(topic) ? 'bg-yak-teal text-white border-yak-teal' : 'bg-white text-gray-500 border-gray-200'}`}>{topic}</button>
                                        ))}
                                    </div>
                                    <button onClick={completeSignup} className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl">Finish</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}