import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Replace with a real user from your auth.users table
const USER_ID = '7a549c76-6b66-4b20-986a-99a693ab0f16';

async function main() {
  await prisma.dives.createMany({
    data: [
      {
        user_id: USER_ID,
        location: 'Sesimbra',
        country: 'Portugal',
        date: new Date('2025-04-05'),
        depth: 18,
        duration: 42,
        notes: 'Calm seas, octopus spotted.',
      },
      {
        user_id: USER_ID,
        location: 'Berlengas',
        country: 'Portugal',
        date: new Date('2025-06-12'),
        depth: 27,
        duration: 38,
        notes: 'Thermocline at 22m.',
      },
    ],
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
