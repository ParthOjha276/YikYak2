import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const body = await request.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({
        where: { email: email }
    });

    if (!user || user.password !== password) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Determine Mod Powers based on DB Role
    // If MODERATOR, they get power over 'Gaming' (for demo purposes)
    let moderatedCommunities: string[] = [];
    if (user.role === 'MODERATOR') {
        const gaming = await prisma.community.findFirst({ where: { name: 'Gaming', campus: 'school_a' } });
        if (gaming) moderatedCommunities.push(gaming.id);
    }
    if (user.role === 'OWNER') moderatedCommunities = ['ALL'];

    return NextResponse.json({
        email: user.email,
        handle: user.handle,
        campus: user.campus,
        role: user.role,
        interests: JSON.parse(user.interests),
        moderatedCommunities
    });
}