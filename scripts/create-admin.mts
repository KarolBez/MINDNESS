// scripts/create-admin.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@mindness.com';
  const existing = await prisma.admin.findUnique({ where: { email } });

  if (existing) {
    console.log('⚠️ Admin já existe:', existing.email);
    return;
  }

  const hashedPassword = await bcrypt.hash('senha123', 10);

  const admin = await prisma.admin.create({
    data: {
      email,
      name: 'Admin Master',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin criado com sucesso:', admin);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar admin:', e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
