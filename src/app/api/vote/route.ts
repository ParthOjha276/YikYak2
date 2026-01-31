import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const body = await request.json();
    const { postId, userHandle, voteType } = body; // voteType: 1 (Up) or -1 (Down)

    const user = await prisma.user.findFirst({ where: { handle: userHandle } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if vote exists
    const existingVote = await prisma.vote.findUnique({
        where: { userId_postId: { userId: user.id, postId: postId } }
    });

    let scoreChange = 0;

    if (existingVote) {
        if (existingVote.value === voteType) {
            // 1. REMOVE VOTE (User clicked same button again)
            await prisma.vote.delete({ where: { id: existingVote.id } });
            scoreChange = -voteType; // Reverse the score
        } else {
            // 2. SWITCH VOTE (User went from Up to Down, or vice versa)
            await prisma.vote.update({
                where: { id: existingVote.id },
                data: { value: voteType }
            });
            scoreChange = 2 * voteType; // e.g., -1 to 1 is a change of +2
        }
    } else {
        // 3. NEW VOTE
        await prisma.vote.create({
            data: { userId: user.id, postId: postId, value: voteType }
        });
        scoreChange = voteType;
    }

    // Update Post Score
    const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { upvotes: { increment: scoreChange } }
    });

    // Return new state
    // If we deleted the vote, userVote is 0. Otherwise it's the new type.
    const newUserVote = (existingVote && existingVote.value === voteType) ? 0 : voteType;

    return NextResponse.json({ upvotes: updatedPost.upvotes, userVote: newUserVote });
}