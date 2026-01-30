'use client';
import { useState, useEffect } from 'react';
import { ArrowBigUp, ArrowBigDown, Trash2, ShieldAlert, MessageSquare, Send, Flag, Gavel } from 'lucide-react';

export default function PostCard({ post, user, onDelete, onReport, onBan }: { post: any, user: any, onDelete: (id: string) => void, onReport: (id: string) => void, onBan: (author: string) => void }) {
    const [isBlur, setIsBlur] = useState(post.isNSFW);
    const [voteCount, setVoteCount] = useState(post.upvotes);

    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');

    // FIX: Start empty so new posts don't have fake replies
    const [comments, setComments] = useState<any[]>([]);

    // Load comments (Backend would be: fetch(`/api/comments/${post.id}`))
    useEffect(() => {
        const saved = localStorage.getItem(`yak_comments_${post.id}`);
        if (saved) {
            setComments(JSON.parse(saved));
        } else if (post.id === 'p1' || post.id === 'p2') {
            // OPTIONAL: Keep mock comments ONLY for the original 2 mock posts so the demo doesn't look empty
            setComments([
                { id: 1, author: 'Anon-Mouse', text: 'Bro this is so real 💀' },
                { id: 2, author: 'Campus-Cat', text: 'Skill issue tbh.' }
            ]);
        }
    }, [post.id]);

    // Permission Logic
    const safeUser = user || {};
    const isOwner = safeUser.role === 'OWNER';
    const myMods = safeUser.moderatedCommunities || [];
    const isModForThis = myMods.includes(post.communityId);
    const canDelete = isOwner || isModForThis;
    const canBan = canDelete;

    const handleAddComment = () => {
        if (!commentText.trim()) return;
        const newComment = { id: Date.now(), author: safeUser.handle || 'You', text: commentText };
        const updated = [...comments, newComment];
        setComments(updated);
        setCommentText('');
        // Backend: await fetch('/api/comments', { method: 'POST', body: ... })
        localStorage.setItem(`yak_comments_${post.id}`, JSON.stringify(updated));
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4 transition-all hover:border-gray-300 shadow-sm group">
            <div className="flex">
                {/* Vote Strip */}
                <div className="w-10 bg-gray-50 flex flex-col items-center p-2 gap-1 border-r border-gray-100">
                    <button onClick={() => setVoteCount(voteCount + 1)} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-yak-teal transition-colors"><ArrowBigUp size={24} /></button>
                    <span className="text-sm font-bold text-gray-700">{voteCount}</span>
                    <button onClick={() => setVoteCount(voteCount - 1)} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-blue-500 transition-colors"><ArrowBigDown size={24} /></button>
                </div>

                <div className="flex-1 p-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-bold text-gray-700">@{post.author}</span>
                            {post.author === user?.handle && <span className="text-[10px] bg-yak-teal/10 text-yak-teal px-1.5 rounded font-bold">YOU</span>}
                            <span>• {post.timestamp}</span>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onReport(post.id)} className="text-gray-300 hover:text-orange-500 p-1.5 rounded transition-all" title="Report Post"><Flag size={14} /></button>
                            {canBan && <button onClick={() => onBan(post.author)} className="text-gray-300 hover:text-gray-800 hover:bg-gray-200 p-1.5 rounded transition-all" title="Ban User"><Gavel size={14} /></button>}
                            {canDelete && <button onClick={() => onDelete(post.id)} className="text-gray-300 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-all" title="Delete Post"><Trash2 size={14} /></button>}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative">
                        <p onClick={() => setIsBlur(false)} className={`text-gray-800 font-medium mb-2 transition-all cursor-pointer ${isBlur ? 'blur-md select-none opacity-50' : ''}`}>{post.content}</p>
                        {isBlur && !post.image && <div onClick={() => setIsBlur(false)} className="absolute inset-0 flex items-center justify-center cursor-pointer"><div className="bg-red-50 border border-red-200 text-red-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm"><ShieldAlert size={14} /> NSFW • Click to Reveal</div></div>}
                        {post.image && (
                            <div className="rounded-lg overflow-hidden border border-gray-100 mb-2 relative group">
                                <img src={post.image} className={`w-full h-auto max-h-96 object-cover transition-all ${isBlur ? 'blur-xl scale-105' : ''}`} />
                                {isBlur && <div onClick={() => setIsBlur(false)} className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 group-hover:bg-black/30 transition-all"><div className="bg-white/90 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-md"><ShieldAlert size={14} /> NSFW IMAGE</div></div>}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2">
                        <div className="flex gap-2">
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold uppercase tracking-wide">{post.category}</span>
                            {post.isNSFW && <span className="text-[10px] border border-red-200 text-red-500 px-1.5 rounded font-bold uppercase pt-0.5">NSFW</span>}
                        </div>
                        <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded transition-all ${showComments ? 'text-yak-teal bg-yak-teal/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <MessageSquare size={16} /> {comments.length} Replies
                        </button>
                    </div>

                    {/* Comments Area */}
                    {showComments && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3 animate-in slide-in-from-top-2 duration-200">
                            {comments.length > 0 ? (
                                <div className="space-y-3 mb-3 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                    {comments.map(c => (
                                        <div key={c.id} className="text-sm"><span className="font-bold text-gray-700 text-xs">@{c.author}: </span><span className="text-gray-600">{c.text}</span></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 text-center mb-3 italic">No replies yet. Be the first!</div>
                            )}

                            <div className="flex gap-2">
                                <input type="text" placeholder="Add a reply..." className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-yak-teal" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
                                <button onClick={handleAddComment} disabled={!commentText} className="bg-yak-teal text-white p-1.5 rounded-md hover:opacity-90 disabled:opacity-50"><Send size={14} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}