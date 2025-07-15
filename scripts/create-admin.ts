import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('senha123', 10); 
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@mindness.com',
      name: 'Admin Master',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin criado com sucesso:', admin);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
