import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function backup() {
  console.log('Iniciando extraccion de backup seguro...');
  
  const users = await prisma.user.findMany();
  const userProfiles = await prisma.userProfile.findMany();
  const gameProfiles = await prisma.gameProfile.findMany();
  const tournaments = await prisma.tournament.findMany();
  const posts = await prisma.post.findMany();
  const comments = await prisma.comment.findMany();

  const backupData = {
    timestamp: new Date().toISOString(),
    users,
    userProfiles,
    gameProfiles,
    tournaments,
    posts,
    comments,
  };

  fs.writeFileSync('apps/api/scripts/backup-campus-arena.json', JSON.stringify(backupData, null, 2), 'utf-8');
  console.log('Backup completado con exito:');
  console.log(`- ${users.length} Usuarios`);
  console.log(`- ${userProfiles.length} Perfiles`);
  console.log(`- ${gameProfiles.length} Game Profiles`);
  console.log(`- ${tournaments.length} Torneos`);
  console.log(`- ${posts.length} Posts`);
  console.log(`- ${comments.length} Comentarios`);
  process.exit(0);
}

backup().catch(err => {
  console.error('Error creando backup:', err);
  process.exit(1);
});
