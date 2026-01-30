export const COMMUNITIES = [
    { id: 'c1', name: 'General', campus: 'school_a', description: 'Chatter' },
    { id: 'c2', name: 'Gaming', campus: 'school_a', description: 'Valo/CS2' },
    { id: 'c3', name: 'Foodies', campus: 'school_a', description: 'Mess Rants' },
    { id: 'c4', name: 'General', campus: 'school_b', description: 'Chatter' },
];

export const POSTS = [
    {
        id: 'p1',
        communityId: 'c1',
        category: 'General',
        author: 'Red-Fox',
        content: 'Why is the library AC always broken? 😭',
        upvotes: 42,
        isNSFW: false,
        image: null,
        timestamp: '10m ago',
    },
    {
        id: 'p2',
        communityId: 'c2',
        category: 'Gaming',
        author: 'Blue-Owl',
        content: 'Ranked anyone? Gold 2.',
        upvotes: 12,
        isNSFW: false,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        timestamp: '1h ago',
    }
];