import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function restore() {
  console.log('Iniciando restauracion en la nueva base de datos...');

  if (!fs.existsSync('apps/api/scripts/backup-campus-arena.json')) {
    throw new Error('No se encontro el archivo backup-campus-arena.json');
  }

  const raw = fs.readFileSync('apps/api/scripts/backup-campus-arena.json', 'utf-8');
  const backup = JSON.parse(raw);

  // 1. Restaurar Usuarios
  console.log(`Restaurando ${backup.users.length} usuarios...`);
  for (const u of backup.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        email_verified: u.email_verified,
        status: u.status,
        role: u.role,
        avatar_url: u.avatar_url,
        first_name: u.first_name,
        last_name: u.last_name,
        created_at: new Date(u.created_at),
        updated_at: new Date(u.updated_at),
        last_login_at: u.last_login_at ? new Date(u.last_login_at) : null,
      },
    });
  }

  // 2. Restaurar Perfiles de Usuario
  console.log(`Restaurando ${backup.userProfiles.length} perfiles...`);
  for (const p of backup.userProfiles) {
    await prisma.userProfile.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        user_id: p.user_id,
        nickname: p.nickname,
        biography: p.biography,
        career: p.career,
        cycle: p.cycle,
        campus: p.campus,
        avatar_url: p.avatar_url,
      },
    });
  }

  // 3. Restaurar Game Profiles
  console.log(`Restaurando ${backup.gameProfiles.length} game profiles...`);
  for (const gp of backup.gameProfiles) {
    await prisma.gameProfile.upsert({
      where: { id: gp.id },
      update: {},
      create: {
        id: gp.id,
        user_id: gp.user_id,
        game_code: gp.game_code,
        player_tag: gp.player_tag,
        in_game_name: gp.in_game_name,
        trophies: gp.trophies,
        level: gp.level,
        extra_data: gp.extra_data,
        synced_at: new Date(gp.synced_at),
      },
    });
  }

  // 4. Restaurar Torneos
  console.log(`Restaurando ${backup.tournaments.length} torneos...`);
  for (const t of backup.tournaments) {
    await prisma.tournament.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        name: t.name,
        slug: t.slug,
        game_code: t.game_code,
        organization_name: t.organization_name,
        campus_name: t.campus_name,
        description_short: t.description_short,
        description_full: t.description_full,
        banner_url: t.banner_url,
        rules_text: t.rules_text,
        status: t.status,
        max_slots: t.max_slots,
        min_slots: t.min_slots,
        current_participants: t.current_participants,
        cost: t.cost,
        currency: t.currency,
        prize_pool: t.prize_pool,
        format: t.format,
        team_size: t.team_size || 1,
        stream_url: t.stream_url,
        stream_platform: t.stream_platform,
        registration_open_at: new Date(t.registration_open_at),
        registration_close_at: new Date(t.registration_close_at),
        tournament_start_at: new Date(t.tournament_start_at),
        is_online: t.is_online,
        contact_email: t.contact_email,
        created_at: new Date(t.created_at),
        updated_at: new Date(t.updated_at),
      },
    });
  }

  // 5. Restaurar Posts de Comunidad
  console.log(`Restaurando ${backup.posts.length} posts...`);
  for (const post of backup.posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {},
      create: {
        id: post.id,
        user_id: post.user_id,
        category: post.category,
        title: post.title,
        description: post.description,
        media_url: post.media_url,
        created_at: new Date(post.created_at),
        updated_at: new Date(post.updated_at),
      },
    });
  }

  // 6. Restaurar Comentarios
  console.log(`Restaurando ${backup.comments.length} comentarios...`);
  for (const c of backup.comments) {
    await prisma.comment.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        post_id: c.post_id,
        user_id: c.user_id,
        parent_id: c.parent_id,
        content: c.content,
        media_url: c.media_url,
        created_at: new Date(c.created_at),
      },
    });
  }

  console.log('Restauracion completada con exito al 100%!');
  process.exit(0);
}

restore().catch(err => {
  console.error('Error restaurando datos:', err);
  process.exit(1);
});
