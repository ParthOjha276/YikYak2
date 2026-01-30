'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import { POSTS, COMMUNITIES } from '@/lib/mockData';
import { ImagePlus, Send, X, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeCommunity, setActiveCommunity] = useState('all');

  const [localPosts, setLocalPosts] = useState<any[]>(POSTS);
  const [localCommunities, setLocalCommunities] = useState<any[]>(COMMUNITIES);
  const [sortBy, setSortBy] = useState<'new' | 'top'>('new');

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isNSFW, setIsNSFW] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('yak_user');
    if (!storedUser) router.push('/login');
    else setUser(JSON.parse(storedUser));
  }, [router]);

  if (!user) return null;

  // --- HANDLERS ---

  const handleCreateCommunity = () => {
    const name = prompt("Enter new Community Name:");
    if (name) {
      const newComm = {
        id: `c_${Date.now()}`,
        name: name,
        campus: user.campus,
        description: 'New community',
        isNSFW: false,
        creator: user.handle // <--- BACKEND FIELD: Stores ID of creator
      };
      // Backend: await fetch('/api/communities', { method: 'POST', body: ... })
      setLocalCommunities([...localCommunities, newComm]);
      setActiveCommunity(newComm.id);
    }
  };

  const handleDeleteCommunity = (id: string) => {
    if (confirm("Delete this community? This cannot be undone.")) {
      // Backend: await fetch(`/api/communities/${id}`, { method: 'DELETE' })
      setLocalCommunities(localCommunities.filter(c => c.id !== id));
      setActiveCommunity('all');
    }
  };

  const handleDelete = (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      setLocalPosts(localPosts.filter(p => p.id !== postId));
    }
  };

  const handleReport = (postId: string) => {
    alert("Post reported to moderation team.");
    setLocalPosts(localPosts.filter(p => p.id !== postId));
  };

  const handleBan = (author: string) => {
    if (confirm(`Are you sure you want to BAN @${author}?`)) {
      alert(`@${author} has been banned.`);
    }
  };

  const handleCreatePost = () => {
    if (!newPostContent) return;
    const newPost = {
      id: `new_${Date.now()}`,
      communityId: activeCommunity === 'all' ? 'c1' : activeCommunity,
      category: 'General',
      author: user.handle,
      content: newPostContent,
      upvotes: 0,
      isNSFW: isNSFW,
      image: newPostImage,
      timestamp: 'Just now'
    };
    setLocalPosts([newPost, ...localPosts]);
    setNewPostContent('');
    setNewPostImage(null);
    setIsNSFW(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPostImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  // --- FILTERING ---
  const myCampusCommunities = localCommunities.filter(c => c.campus === user.campus);

  let feedPosts = localPosts.filter(p => {
    const community = localCommunities.find(c => c.id === p.communityId);
    if (!community || community.campus !== user.campus) return false;
    if (activeCommunity !== 'all') return p.communityId === activeCommunity;
    if (user.role === 'MODERATOR' || user.role === 'OWNER') return true;
    return p.category === 'General' || (user.interests && user.interests.includes(p.category));
  });

  feedPosts = feedPosts.sort((a, b) => {
    if (sortBy === 'top') return b.upvotes - a.upvotes;
    if (a.id.startsWith('new_') && !b.id.startsWith('new_')) return -1;
    if (!a.id.startsWith('new_') && b.id.startsWith('new_')) return 1;
    return 0;
  });

  return (
    <main className="min-h-screen bg-[#F3F4F6] flex">
      <Sidebar
        user={user}
        communities={myCampusCommunities}
        activeId={activeCommunity}
        onSelect={setActiveCommunity}
        onCreate={handleCreateCommunity}
        onDelete={handleDeleteCommunity} // <--- Added Delete Prop
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

        {/* FEED HEADER + SORT */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            {activeCommunity === 'all' ? 'Live Feed' : `#${localCommunities.find(c => c.id === activeCommunity)?.name}`}
          </h1>
          <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            <button onClick={() => setSortBy('new')} className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${sortBy === 'new' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
              <Clock size={14} /> New
            </button>
            <button onClick={() => setSortBy('top')} className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${sortBy === 'top' ? 'bg-orange-50 text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>
              <TrendingUp size={14} /> Top
            </button>
          </div>
        </div>

        {/* POST LIST */}
        <div className="space-y-4">
          {feedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              onDelete={handleDelete}
              onReport={handleReport}
              onBan={handleBan}
            />
          ))}
          {feedPosts.length === 0 && <div className="text-center text-gray-400 mt-10">No posts here yet. Start the conversation!</div>}
        </div>
      </div>
    </main>
  );
}