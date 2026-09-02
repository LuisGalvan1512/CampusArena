import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'luis.galvan@tecsup.edu.pe' }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    const profiles = await prisma.gameProfile.findMany({
      where: { user_id: user.id, game_code: 'CLASH_ROYALE' }
    });

    for (const p of profiles) {
      const deletedRegs = await prisma.registration.deleteMany({
        where: { game_profile_id: p.id }
      });
      console.log(`Borradas ${deletedRegs.count} inscripciones para el perfil ${p.id}`);
    }

    const deleted = await prisma.gameProfile.deleteMany({
      where: { 
        user_id: user.id,
        game_code: 'CLASH_ROYALE'
      }
    });
    console.log('Borrados:', deleted);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
