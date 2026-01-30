'use client';
import { Hash, Trash2, Shield, Home, PlusCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation'; // <--- Import Router

export default function Sidebar({ user, communities, activeId, onSelect, onCreate, onDelete }: { user: any, communities: any[], activeId: string, onSelect: (id: string) => void, onCreate: () => void, onDelete: (id: string) => void }) {
    const router = useRouter(); // <--- Init Router

    if (!user) return null;

    const handleLogout = () => {
        if (confirm("Log out of YikYak?")) {
            localStorage.removeItem('yak_user');
            router.push('/login');
        }
    };

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-black text-yak-teal tracking-tighter">YikYak 2.0</h1>
                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-2">
                    {user.campus?.replace('_', ' ') || 'LOADING...'}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                <button
                    onClick={() => onSelect('all')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2 transition-all ${activeId === 'all' ? 'bg-yak-teal text-white font-bold shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Home size={18} /> <span>Home Feed</span>
                </button>

                <div className="flex items-center justify-between px-2 mt-6 mb-2">
                    <p className="text-xs font-semibold text-gray-400">YOUR HERD</p>
                    <button onClick={onCreate} className="text-yak-teal hover:bg-yak-teal/10 p-1 rounded transition-colors" title="Create Community">
                        <PlusCircle size={16} />
                    </button>
                </div>

                {communities.map((comm) => {
                    const canDelete = comm.creator === user.handle || user.role === 'OWNER';
                    return (
                        <button
                            key={comm.id}
                            onClick={() => onSelect(comm.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all ${activeId === comm.id
                                ? 'bg-yak-teal/10 text-yak-teal font-bold'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <Hash size={18} className="shrink-0" />
                                <span className="truncate">{comm.name}</span>
                            </div>

                            {canDelete && (
                                <div
                                    onClick={(e) => { e.stopPropagation(); onDelete(comm.id); }}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-all"
                                    title="Delete Community"
                                >
                                    <Trash2 size={14} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* FOOTER WITH LOGOUT */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-yak-teal flex items-center justify-center text-white font-bold shrink-0">
                        <Shield size={20} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-700 truncate">{user.handle}</p>
                        <p className="text-xs text-yak-teal font-bold bg-yak-teal/10 px-2 py-0.5 rounded-full inline-block">{user.role}</p>
                    </div>
                </div>

                {/* LOGOUT BUTTON */}
                <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                    title="Log Out"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    );
}