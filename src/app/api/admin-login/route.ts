import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { email, senha } = await request.json();
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 401 });

  const isValid = await bcrypt.compare(senha, admin.password);
  if (!isValid) return NextResponse.json({ error: 'Invalid' }, { status: 401 });

  return NextResponse.json({ success: true });
}
