import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    // Clear old data (optional, prevents duplicates)
    try {
        await prisma.comment.deleteMany();
        await prisma.post.deleteMany();
        await prisma.community.deleteMany();
        await prisma.user.deleteMany();
    } catch (e) { }

    // 1. Create System User (Backstage owner)
    const system = await prisma.user.create({
        data: {
            email: 'system@yak.com',
            password: 'sys',
            handle: 'System',
            campus: 'school_a',
            role: 'ADMIN',
            interests: '[]'
        }
    });

    // 2. Create Default Communities
    const commGeneral = await prisma.community.create({
        data: { name: 'General', campus: 'school_a', description: 'Main Feed', creatorId: system.id }
    });
    const commGaming = await prisma.community.create({
        data: { name: 'Gaming', campus: 'school_a', description: 'Gamers Only', creatorId: system.id }
    });

    // School B Community
    await prisma.community.create({
        data: { name: 'General', campus: 'school_b', description: 'School B Main', creatorId: system.id }
    });

    // 3. Create DEMO USERS

    // The MOD (Gaming Warden)
    await prisma.user.create({
        data: {
            email: 'mod@a.edu.in',
            password: 'admin',
            handle: 'Gaming-Warden',
            campus: 'school_a',
            role: 'MODERATOR',
            interests: JSON.stringify(['Gaming']),
        }
    });

    // The STUDENT (You)
    await prisma.user.create({
        data: {
            email: 'student@a.edu.in',
            password: '123',
            handle: 'Chill-Guy',
            campus: 'school_a',
            role: 'STUDENT',
            interests: JSON.stringify(['Gaming', 'Food']),
        }
    });

    // The SPY (School B)
    await prisma.user.create({
        data: {
            email: 'spy@b.edu.in',
            password: '123',
            handle: 'Agent-007',
            campus: 'school_b',
            role: 'STUDENT',
            interests: JSON.stringify(['General']),
        }
    });

    return NextResponse.json({ message: "Database reset and seeded successfully!" });
}