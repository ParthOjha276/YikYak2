'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import { ImagePlus, Send, X, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeCommunity, setActiveCommunity] = useState('all');

  // --- REAL DATA STATES ---
  const [posts, setPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);

  // UI States
  const [sortBy, setSortBy] = useState<'new' | 'top'>('new');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isNSFW, setIsNSFW] = useState(false);

  // 1. Load User on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem('yak_user');
    if (!storedUser) router.push('/login');
    else setUser(JSON.parse(storedUser));
  }, [router]);

  // 2. Fetcher Function (The Brains)
  const fetchData = useCallback(async () => {
    if (!user) return;

    // A. Fetch Communities (Filtered by Campus)
    const commRes = await fetch(`/api/communities?campus=${user.campus}`);
    const commData = await commRes.json();
    setCommunities(commData);

    // B. Fetch Posts
    // We pass 'sort' and 'userHandle' so the backend can sort AND tell us if we upvoted
    const postRes = await fetch(
      `/api/posts?campus=${user.campus}&communityId=${activeCommunity}&sort=${sortBy}&userHandle=${user.handle}`
    );
    const postData = await postRes.json();
    setPosts(postData);
  }, [user, activeCommunity, sortBy]);

  // Initial Fetch & Refetch when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- ACTIONS ---

  const handleCreatePost = async () => {
    if (!newPostContent) return;

    // 1. Optimistic Update (Instant Feedback)
    // We add a "fake" post to the top immediately so it feels fast
    const tempPost = {
      id: `temp_${Date.now()}`,
      communityId: activeCommunity === 'all' ? (communities[0]?.id || 'c1') : activeCommunity,
      category: 'General',
      author: user.handle,
      content: newPostContent,
      upvotes: 0,
      isNSFW: isNSFW,
      image: newPostImage,
      timestamp: 'Just now',
      hasUpvoted: false
    };
    setPosts([tempPost, ...posts]);
    setNewPostContent('');
    setNewPostImage(null);
    setIsNSFW(false);

    // 2. Real Backend Call
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newPostContent,
        author: user.handle,
        communityId: activeCommunity,
        isNSFW: isNSFW,
        image: newPostImage
      })
    });

    // 3. Refresh logic (Optional: Uncomment to get the Real ID immediately, but might flicker)
    // fetchData(); 
  };

  const handleCreateCommunity = async () => {
    const name = prompt("Enter new Community Name:");
    if (name) {
      await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, creatorHandle: user.handle })
      });
      // Refresh list so the new community appears in sidebar
      fetchData();
    }
  };

  const handleDelete = async (postId: string) => {
    if (confirm("Delete this post?")) {
      // Optimistic delete
      setPosts(posts.filter(p => p.id !== postId));
      // Backend delete
      await fetch(`/api/posts?id=${postId}`, { method: 'DELETE' });
    }
  };

  // Demo-Only Actions (Visual feedback)
  const handleReport = () => alert("Post reported to moderation team.");
  const handleBan = (author: string) => alert(`User @${author} has been BANNED.`);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPostImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#F3F4F6] flex">
      <Sidebar
        user={user}
        communities={communities}
        activeId={activeCommunity}
        onSelect={setActiveCommunity}
        onCreate={handleCreateCommunity}
        onDelete={() => { }} // Community delete skipped for speed
      />

      <div className="ml-64 flex-1 p-8 max-w-2xl">
        {/* CREATE POST BOX */}
        <div className={`bg-white p-4 rounded-xl border shadow-sm mb-6 transition-colors ${isNSFW ? 'border-red-200' : 'border-gray-200'}`}>
          <textarea
            className="w-full bg-gray-50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yak-teal/50 resize-none"
            placeholder={`What's happening in ${activeCommunity === 'all' ? 'your herd' : 'this community'}?`}
            rows={2}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
          {newPostImage && (
            <div className="relative mt-2 w-fit">
              <img src={newPostImage} className="h-20 rounded border border-gray-200" />
              <button onClick={() => setNewPostImage(null)} className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1"><X size={10} /></button>
            </div>
          )}
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer text-gray-400 hover:text-yak-teal flex items-center gap-2 text-xs font-bold transition-colors">
                <ImagePlus size={18} /> <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <label className={`flex items-center gap-2 cursor-pointer text-xs font-bold transition-colors select-none ${isNSFW ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isNSFW ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 bg-white'}`}>
                  {isNSFW && <AlertTriangle size={10} fill="currentColor" />}
                </div>
                <input type="checkbox" checked={isNSFW} onChange={(e) => setIsNSFW(e.target.checked)} className="hidden" /> NSFW Mode
              </label>
            </div>
            <button onClick={handleCreatePost} disabled={!newPostContent} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${isNSFW ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-yak-teal text-white hover:opacity-90'} disabled:opacity-50`}>
              <Send size={14} /> YAK IT
            </button>
          </div>
        </div>

        {/* FEED HEADER + SORT BUTTONS */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            {activeCommunity === 'all' ? 'Live Feed' : `#${communities.find(c => c.id === activeCommunity)?.name || 'Loading...'}`}
          </h1>
          <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setSortBy('new')}
              className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${sortBy === 'new' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Clock size={14} /> New
            </button>
            <button
              onClick={() => setSortBy('top')}
              className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${sortBy === 'top' ? 'bg-orange-50 text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <TrendingUp size={14} /> Top
            </button>
          </div>
        </div>

        {/* POST LIST */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              onDelete={handleDelete}
              onReport={handleReport}
              onBan={handleBan}
            />
          ))}
          {posts.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              {activeCommunity === 'all' ? 'Loading feed...' : 'No posts here yet. Start the conversation!'}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}