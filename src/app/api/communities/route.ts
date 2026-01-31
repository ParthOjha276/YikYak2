import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const campus = searchParams.get('campus');
    if (!campus) return NextResponse.json([]);

    const comms = await prisma.community.findMany({
        where: { campus: campus }
    });

    // Include creator handle if needed, for now just basic info
    return NextResponse.json(comms.map(c => ({
        id: c.id,
        name: c.name,
        campus: c.campus,
        creatorId: c.creatorId
    })));
}

export async function POST(request: Request) {
    const body = await request.json();
    const creator = await prisma.user.findFirst({ where: { handle: body.creatorHandle } });

    if (!creator) return NextResponse.json({ error: "No user" }, { status: 401 });

    const newComm = await prisma.community.create({
        data: {
            name: body.name,
            campus: creator.campus,
            creatorId: creator.id
        }
    });

    return NextResponse.json(newComm);
}