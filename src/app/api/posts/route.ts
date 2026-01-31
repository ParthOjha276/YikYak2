import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- 1. GET POSTS (Feed) ---
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const campus = searchParams.get('campus');
    const communityId = searchParams.get('communityId');
    const sort = searchParams.get('sort') || 'new'; // 'new' | 'top'
    const userHandle = searchParams.get('userHandle'); // Needed to check "userVote" status

    if (!campus) return NextResponse.json([], { status: 400 });

    // Filter Logic
    const whereClause: any = { community: { campus: campus } };
    if (communityId && communityId !== 'all') {
        whereClause.communityId = communityId;
    }

    // Sorting Logic
    const orderBy = sort === 'top'
        ? { upvotes: 'desc' }
        : { createdAt: 'desc' };

    // Get current User ID (to check if I voted)
    let currentUserId = null;
    if (userHandle) {
        const u = await prisma.user.findFirst({ where: { handle: userHandle } });
        if (u) currentUserId = u.id;
    }

    // Database Fetch
    const posts = await prisma.post.findMany({
        where: whereClause,
        include: {
            author: true,
            votes: true // Fetch votes so we can see if I am in the list
        },
        orderBy: orderBy as any
    });

    // Format for Frontend
    const formatted = posts.map(p => {
        // Find my vote in the list (if it exists)
        const myVote = currentUserId ? p.votes.find(v => v.userId === currentUserId) : null;

        return {
            id: p.id,
            communityId: p.communityId,
            category: p.category,
            author: p.author.handle,
            content: p.content,
            upvotes: p.upvotes,
            isNSFW: p.isNSFW,
            image: p.image,
            timestamp: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            userVote: myVote ? myVote.value : 0 // Returns 1 (Up), -1 (Down), or 0 (None)
        };
    });

    return NextResponse.json(formatted);
}

// --- 2. CREATE POST ---
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Find Author
        const author = await prisma.user.findFirst({ where: { handle: body.author } });
        if (!author) return NextResponse.json({ error: "User not found" }, { status: 401 });

        // Handle "All" selection -> Default to General community for that campus
        let targetCommId = body.communityId;
        if (targetCommId === 'all') {
            const general = await prisma.community.findFirst({
                where: { name: 'General', campus: author.campus }
            });
            targetCommId = general?.id;
        }

        // Create
        const newPost = await prisma.post.create({
            data: {
                content: body.content,
                image: body.image,
                isNSFW: body.isNSFW,
                category: 'General',
                authorId: author.id,
                communityId: targetCommId
            },
            include: { author: true }
        });

        return NextResponse.json(newPost);
    } catch (e) {
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}

// --- 3. DELETE POST ---
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
        // CRITICAL: Delete related data first (Cascade Delete manually)
        // 1. Delete Votes on this post
        await prisma.vote.deleteMany({ where: { postId: id } });
        // 2. Delete Comments on this post
        await prisma.comment.deleteMany({ where: { postId: id } });
        // 3. Delete the Post itself
        await prisma.post.delete({ where: { id } });

        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
}