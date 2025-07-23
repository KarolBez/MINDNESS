import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  return NextResponse.json({
    id: admin.id,
    name: admin.name,
    email: admin.email,
  });
}
