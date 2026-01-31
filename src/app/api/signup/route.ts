import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email: body.email }
        });
        if (existing) {
            return NextResponse.json({ error: "Email already taken" }, { status: 400 });
        }

        // 2. Determine Campus based on email domain
        // If email contains '@b.edu', they go to School B. Otherwise School A.
        const campus = body.email.includes('@b.edu') ? 'school_b' : 'school_a';

        // 3. Create User
        const newUser = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password,
                handle: body.handle,
                campus: campus,
                role: 'STUDENT', // Default role
                interests: JSON.stringify(body.interests)
            }
        });

        return NextResponse.json(newUser);

    } catch (e) {
        return NextResponse.json({ error: "Signup failed" }, { status: 500 });
    }
}